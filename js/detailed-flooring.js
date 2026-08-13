"use strict";

const DATA_URL = "../../data/flooring.json";
const SPEC_STORAGE_KEY = "woodstockDetailedSpecification";
const Core = window.WoodstockFlooringCore;

const form = {
  materialType: document.querySelector("#materialTypeSelect"),
  species: document.querySelector("#speciesInput"),
  topLayer: document.querySelector("#topLayerSelect"),
  baseThicknessToggle: document.querySelector("#baseThicknessToggle"),
  baseThickness: document.querySelector("#baseThicknessInput"),
  clientType: document.querySelector("#clientTypeSelect"),
  loyalty: document.querySelector("#loyaltySelect"),
  customPriceToggle: document.querySelector("#customPriceToggle"),
  customPrice: document.querySelector("#customPriceInput"),
  resetCustomPrice: document.querySelector("#resetCustomPriceButton"),
  finalUnitPrice: document.querySelector("#finalUnitPriceInput"),
  sorting: document.querySelector("#sortingSelect"),
  pattern: document.querySelector("#patternSelect"),
  angle: document.querySelector("#angleSelect"),
  width: document.querySelector("#widthInput"),
  length: document.querySelector("#lengthInput"),
  customPattern: document.querySelector("#customPatternInput"),
  customPatternFile: document.querySelector("#customPatternFileInput"),
  boardArea: document.querySelector("#boardAreaInput"),
  waste: document.querySelector("#wasteInput"),
  coating: document.querySelector("#coatingSelect"),
  gloss: document.querySelector("#glossInput"),
  unitPrice: document.querySelector("#unitPriceInput"),
  speciesClear: document.querySelector("#speciesClearButton"),
  discount: document.querySelector("#discountInput"),
  markup: document.querySelector("#markupInput"),
  comment: document.querySelector("#commentInput"),
  files: document.querySelector("#filesInput")
};

const ui = Object.fromEntries([
  "speciesSuggestions",
  "topLayerHint",
  "baseSummary",
  "customBaseThicknessField",
  "selectionSurchargeBlock",
  "selectionSurchargeOptions",
  "loyaltyField",
  "retailPriceValue",
  "customPriceField",
  "priceAdjustmentsBlock",
  "priceAdjustmentsList",
  "finalUnitPriceValue",
  "angleField",
  "lengthLabel",
  "customPatternField",
  "customPatternWarning",
  "customPatternFileName",
  "widthWarning",
  "wasteHint",
  "areaSummary",
  "areaWithWasteValue",
  "areaWithWasteFormula",
  "coatingHint",
  "glossField",
  "glossLabel",
  "glossHint",
  "selectedFiles",
  "saveStatus",
  "priceStatus",
  "addToSpecButton",
  "specBase",
  "specBaseThickness",
  "specBaseThicknessNoteRow",
  "specTopLayer",
  "specThickness",
  "specSpecies",
  "specMaterialType",
  "specConnection",
  "specSorting",
  "specPatternType",
  "specPattern",
  "specAngleRow",
  "specAngle",
  "specWidth",
  "specLength",
  "specCustomPatternRow",
  "specCustomPattern",
  "specCustomPatternFileRow",
  "specCustomPatternFile",
  "specCoating",
  "specGlossRow",
  "specGloss",
  "specBaseArea",
  "specWaste",
  "specAreaWithWaste",
  "specComment",
  "specFilesRow",
  "specFiles",
  "specFinalUnitPrice",
  "specTotal",
  "specVat"
].map((id) => [
  id,
  document.querySelector(`#${id}`)
]));

const validation = {
  pattern: [
    document.querySelector("#patternField"),
    document.querySelector("#patternError")
  ],
  species: [
    document.querySelector("#speciesField"),
    document.querySelector("#speciesError")
  ],
  topLayer: [
    document.querySelector("#topLayerField"),
    document.querySelector("#topLayerError")
  ],
  angle: [
    document.querySelector("#angleField"),
    document.querySelector("#angleError")
  ],
  width: [
    document.querySelector("#widthField"),
    document.querySelector("#widthError")
  ],
  length: [
    document.querySelector("#lengthField"),
    document.querySelector("#lengthError")
  ],
  customPattern: [
    document.querySelector("#customPatternField"),
    document.querySelector("#customPatternError")
  ],
  boardArea: [
    document.querySelector("#boardAreaField"),
    document.querySelector("#boardAreaError")
  ],
  waste: [
    document.querySelector("#wasteField"),
    document.querySelector("#wasteError")
  ],
  coating: [
    document.querySelector("#coatingField"),
    document.querySelector("#coatingError")
  ],
  gloss: [
    document.querySelector("#glossField"),
    document.querySelector("#glossError")
  ],
  unitPrice: [null, null],
  discount: [null, null],
  markup: [null, null],
  baseThickness: [
    document.querySelector("#customBaseThicknessField"),
    document.querySelector("#baseThicknessInputError")
  ],
  customPrice: [
    document.querySelector("#customPriceField"),
    document.querySelector("#customPriceError")
  ],
  finalUnitPrice: [
    document.querySelector("#finalUnitPriceField"),
    document.querySelector("#finalUnitPriceError")
  ]
};

let flooringData = null;
let currentItem = null;
let discountWasEdited = false;
let markupWasEdited = false;
let currentAdjustmentMode = null;
let customBaseEnabled = false;
let selectedSurcharges = new Set();
let customPriceEnabled = false;
let tierDiscountOverride = null;
let activeTierKey = "";
const markupOverrides = new Map();
let addAttempted = false;
let selectedSpeciesName = "";
let selectedTopLayerValue = "";

const uploadedFilesState = new WeakMap();
const touchedFields = new Set();

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const number = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2
});

function shouldShowError(key) {
  return addAttempted || touchedFields.has(key);
}

function markFieldTouched(key) {
  touchedFields.add(key);
}

function round(value, digits = 2) {
  const factor = 10 ** digits;

  return (
    Math.round(
      (value + Number.EPSILON) * factor
    ) / factor
  );
}

function setFieldError(key, message = "") {
  const [field, error] = validation[key] || [];

  field?.classList.toggle(
    "field--invalid",
    Boolean(message)
  );

  if (error) {
    error.textContent = message;
  }
}

function clampOnBlur(
  input,
  key,
  min,
  max,
  label
) {
  markFieldTouched(key);

  const raw = input.value.trim();

  if (!raw) {
    renderAll();
    return;
  }

  const value = Number(raw);

  if (!Number.isFinite(value)) {
    input.value = "";

    renderAll();

    setFieldError(
      key,
      `${label}: введите числовое значение.`
    );

    return;
  }

  const belowMinimum =
    value < min;

  const aboveMaximum =
    Number.isFinite(max) &&
    value > max;

  if (
    belowMinimum ||
    aboveMaximum
  ) {
    input.value = "";

    renderAll();

    setFieldError(
      key,
      Number.isFinite(max)
        ? `${label}: допустимо от ${min} до ${max}.`
        : `${label}: значение не меньше ${min}.`
    );
  }
}

function patternAllowedForTopLayer(pattern) {
  const allowedTopLayers =
    pattern?.allowedTopLayers || [];

  return (
    !allowedTopLayers.length ||
    !form.topLayer.value ||
    allowedTopLayers.includes(
      form.topLayer.value
    )
  );
}

function availablePatterns() {
  return (
    flooringData?.patterns || []
  ).filter(
    patternAllowedForTopLayer
  );
}

function selectedPattern() {
  const pattern =
    flooringData?.patterns.find(
      (item) =>
        item.id === form.pattern.value
    ) || null;

  return patternAllowedForTopLayer(
    pattern
  )
    ? pattern
    : null;
}

function selectedCoating() {
  return (
    flooringData?.coatings.find(
      (item) =>
        item.id === form.coating.value
    ) || null
  );
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("ru-RU");
}

function speciesItems() {
  const type = form.materialType.value;
  const topLayer = form.topLayer.value;

  return flooringData.items.filter((item) => (
    (!type || item.materialType === type) &&
    (!topLayer || item.topLayer === topLayer)
  ));
}

function exactSpeciesItem() {
  const name = normalizeText(
    form.species.value
  );

  if (!name) {
    return null;
  }

  return (
    speciesItems().find(
      (item) =>
        normalizeText(item.species) ===
        name
    ) || null
  );
}

function speciesProducts() {
  const species = normalizeText(
    form.species.value
  );

  if (!species) {
    return [];
  }

  return speciesItems().filter(
    (item) =>
      normalizeText(item.species) ===
      species
  );
}

function topLayerProducts() {
  if (!form.topLayer.value) {
    return [];
  }

  return speciesProducts().filter(
    (item) =>
      item.topLayer ===
      form.topLayer.value
  );
}

function exactProductItem() {
  const products =
    topLayerProducts();

  if (!products.length) {
    return null;
  }

  const sorting = "Select+";

  if (sorting) {
    return (
      products.find(
        (item) =>
          item.sorting === sorting
      ) || null
    );
  }

  return products.length === 1
    ? products[0]
    : null;
}

function fixedPrice(item) {
  const value = Number(
    item?.pricePerM2
  );

  return item?.priceStatus !== "onRequest" &&
    Number.isFinite(value) &&
    value > 0;
}

function productPriceLabel(item) {
  if (!fixedPrice(item)) {
    return item?.priceLabel ||
      "По запросу";
  }

  return `${money.format(
    Number(item.pricePerM2)
  )}/м²`;
}

function topLayerOptionLabel(
  topLayer,
  items
) {
  const sortings = [
    ...new Set(
      items
        .map((item) => item.sorting)
        .filter(Boolean)
    )
  ];

  const priceLabels = [
    ...new Set(
      items.map(productPriceLabel)
    )
  ];

  if (
    sortings.length > 1 &&
    priceLabels.length > 1
  ) {
    return `${topLayer} — цена зависит от сортировки`;
  }

  return `${topLayer} — ${priceLabels[0] || "цена по запросу"}`;
}

function fillOptions(
  select,
  placeholder,
  items,
  value,
  label
) {
  select.innerHTML = "";

  select.append(
    new Option(
      placeholder,
      ""
    )
  );

  items.forEach((item) => {
    select.append(
      new Option(
        label(item),
        value(item)
      )
    );
  });
}

function fillMaterialTypes() {
  const map = new Map();

  flooringData.items.forEach(
    (item) => {
      map.set(
        item.materialType,
        item.materialTypeName
      );
    }
  );

  [...map.entries()].forEach(
    ([value, label]) => {
      form.materialType.append(
        new Option(
          label,
          value
        )
      );
    }
  );
}

function availableSpeciesNames() {
  return [
    ...new Set(
      speciesItems().map(
        (item) => item.species
      )
    )
  ].sort(
    (a, b) =>
      a.localeCompare(b, "ru")
  );
}

function closeSpeciesSuggestions() {
  ui.speciesSuggestions.classList.add("is-hidden");
  ui.speciesSuggestions.innerHTML = "";
  form.species.setAttribute("aria-expanded", "false");
}

function selectSpeciesSuggestion(name) {
  form.species.value = name;
  closeSpeciesSuggestions();
  applySpeciesSelection();
  form.topLayer.focus();
}

function renderSpeciesSuggestions() {
  const query = normalizeText(form.species.value);
  const names = availableSpeciesNames().filter((name) =>
    !query || normalizeText(name).includes(query)
  );

  ui.speciesSuggestions.innerHTML = "";

  if (!names.length) {
    const empty = document.createElement("div");
    empty.className = "autocomplete-empty";
    empty.textContent = "Совпадений не найдено";
    ui.speciesSuggestions.append(empty);
  } else {
    names.forEach((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "autocomplete-option";
      button.setAttribute("role", "option");
      button.textContent = name;
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        selectSpeciesSuggestion(name);
      });
      ui.speciesSuggestions.append(button);
    });
  }

  ui.speciesSuggestions.classList.remove("is-hidden");
  form.species.setAttribute("aria-expanded", "true");
}

function refreshSpeciesOptions() {
  if (document.activeElement === form.species) {
    renderSpeciesSuggestions();
  }
}

function updateSpeciesClearButton() {
  form.speciesClear.classList.toggle(
    "is-hidden",
    !form.species.value
  );
}

function fillTopLayerOptions() {
  const currentValue = form.topLayer.value;
  const species = normalizeText(form.species.value);
  let sourceItems = flooringData?.items || [];

  if (form.materialType.value) {
    sourceItems = sourceItems.filter((item) => item.materialType === form.materialType.value);
  }

  if (species) {
    const exact = sourceItems.filter((item) => normalizeText(item.species) === species);
    if (exact.length) sourceItems = exact;
  }

  const layers = [...new Set(sourceItems.map((item) => item.topLayer).filter(Boolean))];
  const fallback = Object.keys(flooringData?.meta?.thicknessByTopLayer || {});
  const availableLayers = layers.length ? layers : fallback;

  form.topLayer.innerHTML = "";
  form.topLayer.append(new Option("Выберите толщину лицевого шпона", ""));
  availableLayers.forEach((topLayer) => form.topLayer.append(new Option(topLayer, topLayer)));
  form.topLayer.disabled = false;

  if (availableLayers.includes(currentValue)) {
    form.topLayer.value = currentValue;
  } else if (currentValue) {
    form.topLayer.value = "";
    selectedTopLayerValue = "";
  }
}

function clearSpeciesSelection() {
  form.species.value = "";
  form.materialType.value = "";
  selectedSpeciesName = "";
  currentItem = null;
  fillTopLayerOptions();
  ui.topLayerHint.textContent = "";
  resetSortingSelection();
  resetProductPrice();
  closeSpeciesSuggestions();
  touchedFields.delete("species");
  touchedFields.delete("topLayer");
  touchedFields.delete("unitPrice");
  setFieldError("species", "");
  setFieldError("topLayer", "");
  updateSpeciesClearButton();
  renderAll();
}

function resetSortingSelection() {
  form.sorting.value = "Select+";
  touchedFields.delete("sorting");
}

function standardBaseThickness() {
  return Number(flooringData?.meta?.baseThicknessMm || 12);
}

function currentBaseThickness() {
  if (!customBaseEnabled) return standardBaseThickness();
  const value = Number(form.baseThickness.value);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function baseMaterialLabel(value = flooringData?.meta?.baseMaterial) {
  return String(value || "Влагостойкая фанера из берёзы")
    .replace(/берёзы/g, "берёзы");
}

function renderBaseSummary() {
  const thickness = currentBaseThickness() ?? standardBaseThickness();
  ui.baseSummary.textContent = `${baseMaterialLabel()} · ${number.format(thickness)} мм`;
}

function retailPrice() {
  return currentItem ? Core.catalogPrice(currentItem) : null;
}

function parseCustomPrice() {
  return Core.parseLocalizedNumber(form.customPrice.value);
}

function pricingBasePrice() {
  if (!customPriceEnabled) return retailPrice();
  const value = parseCustomPrice();
  return Number.isFinite(value) && value > 0 ? value : null;
}

function setCustomPriceValue(value) {
  form.customPrice.value = value === null || value === undefined
    ? ""
    : Core.formatEditableMoney(value);
}

function resetPriceOverrides() {
  tierDiscountOverride = null;
  activeTierKey = "";
  markupOverrides.clear();
}

function selectedSelectionMarkupRows() {
  const options = Core.selectionSurchargeOptions(flooringData, currentItem);
  return options.filter((option) => selectedSurcharges.has(option.id));
}

function selectionMarkupKey(id) {
  return `selection:${id}`;
}

function renderSelectionSurcharges() {
  const options = Core.selectionSurchargeOptions(flooringData, currentItem);
  ui.selectionSurchargeBlock.classList.toggle("is-hidden", !options.length);
  ui.selectionSurchargeOptions.replaceChildren();

  if (!options.length) {
    selectedSurcharges.clear();
    [...markupOverrides.keys()]
      .filter((key) => key.startsWith("selection:"))
      .forEach((key) => markupOverrides.delete(key));
    return;
  }

  options.forEach((option) => {
    const label = document.createElement("label");
    label.className = "selection-option";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedSurcharges.has(option.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedSurcharges.add(option.id);
      } else {
        selectedSurcharges.delete(option.id);
        markupOverrides.delete(selectionMarkupKey(option.id));
      }
      updateAutomaticPricingAdjustments();
      renderSpecification();
    });
    const text = document.createElement("span");
    text.innerHTML = `<strong>${option.name}</strong><small>Надбавка +${number.format(option.percent)}% по прайс-листу</small>`;
    label.append(checkbox, text);
    ui.selectionSurchargeOptions.append(label);
  });
}

function resetProductPrice() {
  currentItem = null;
  form.unitPrice.value = "";
  form.finalUnitPrice.value = "";
  form.customPrice.value = "";
  customPriceEnabled = false;
  form.customPriceToggle.setAttribute("aria-expanded", "false");
  form.customPriceToggle.classList.add("is-hidden");
  ui.customPriceField.classList.add("is-hidden");
  ui.retailPriceValue.textContent = "—";
  ui.finalUnitPriceValue.textContent = "—";
  ui.priceAdjustmentsBlock.classList.add("is-hidden");
  ui.priceAdjustmentsList.replaceChildren();
  selectedSurcharges.clear();
  resetPriceOverrides();
  renderSelectionSurcharges();
  touchedFields.delete("unitPrice");
  touchedFields.delete("customPrice");
  touchedFields.delete("finalUnitPrice");
  setFieldError("unitPrice", "");
  setFieldError("customPrice", "");
  setFieldError("finalUnitPrice", "");
}

function applySpeciesSelection() {
  updateSpeciesClearButton();

  const speciesMatch =
    exactSpeciesItem();

  const nextSpeciesName =
    speciesMatch?.species || "";

  const speciesChanged =
    nextSpeciesName !==
    selectedSpeciesName;

  if (speciesChanged) {
    selectedSpeciesName =
      nextSpeciesName;

    selectedTopLayerValue = "";

    touchedFields.delete("topLayer");
    touchedFields.delete("sorting");
    touchedFields.delete("unitPrice");

    setFieldError(
      "topLayer",
      ""
    );

    setFieldError(
      "sorting",
      ""
    );
  }

  if (!speciesMatch) {
    currentItem = null;

    fillTopLayerOptions();

    ui.topLayerHint.textContent = "";

    resetSortingSelection();
    resetProductPrice();

    const speciesError =
      form.species.value.trim() &&
      shouldShowError("species")
        ? "Выберите точное наименование из справочника."
        : "";

    setFieldError(
      "species",
      speciesError
    );

    renderAll();
    return;
  }

  if (
    form.materialType.value !==
    speciesMatch.materialType
  ) {
    form.materialType.value =
      speciesMatch.materialType;

    refreshSpeciesOptions();
  }

  setFieldError(
    "species",
    ""
  );

  fillTopLayerOptions();

  applyTopLayerSelection();
}

function applyTopLayerSelection() {
  const nextTopLayer =
    form.topLayer.value;

  const patternWasReset =
    fillPatternOptions();

  if (patternWasReset) {
    applyPattern();
  }

  const topLayerChanged =
    nextTopLayer !==
    selectedTopLayerValue;

  if (topLayerChanged) {
    selectedTopLayerValue =
      nextTopLayer;

    touchedFields.delete("sorting");
    touchedFields.delete("unitPrice");

    setFieldError(
      "sorting",
      ""
    );

    resetSortingSelection();
    resetProductPrice();
  }

  if (!nextTopLayer) {
    ui.topLayerHint.textContent = "";

    resetSortingSelection();
    resetProductPrice();

    renderAll();
    return;
  }

  const products =
    topLayerProducts();

  form.sorting.value = "Select+";

  const containsOnRequest =
    products.some(
      (item) =>
        !fixedPrice(item)
    );

  ui.topLayerHint.textContent =
    containsOnRequest
      ? "Для выбранной толщины цена указана «По запросу». Введите согласованную цену за м² в блоке «Цена»."
      : "";

  applyProduct();
}

function updateUnitPriceHint() {
  const retail = retailPrice();
  ui.retailPriceValue.textContent = retail ? `${Core.formatMoney(retail)}/м²` : "—";

  const hasItem = Boolean(currentItem);
  form.customPriceToggle.classList.toggle("is-hidden", !hasItem || customPriceEnabled);
  ui.customPriceField.classList.toggle("is-hidden", !hasItem || !customPriceEnabled);
  form.customPriceToggle.setAttribute("aria-expanded", String(hasItem && customPriceEnabled));

  if (!hasItem) {
    setFieldError("customPrice", "");
    return;
  }

  if (customPriceEnabled) {
    const custom = parseCustomPrice();
    const valid = Number.isFinite(custom) && custom > 0;
    setFieldError(
      "customPrice",
      shouldShowError("customPrice") && !valid
        ? "Цена для расчёта: укажите значение больше 0."
        : ""
    );
  } else {
    setFieldError("customPrice", "");
  }
}

function applyProduct() {
  const previousItemId = currentItem?.id || null;
  currentItem = exactProductItem();

  if (!currentItem) {
    resetProductPrice();
    renderAll();
    return;
  }

  setFieldError("topLayer", "");
  setFieldError("sorting", "");

  const retail = Core.catalogPrice(currentItem);

  if (previousItemId !== currentItem.id) {
    selectedSurcharges.clear();
    customPriceEnabled = false;
    form.customPrice.value = "";
    resetPriceOverrides();
    touchedFields.delete("unitPrice");
    touchedFields.delete("customPrice");
    touchedFields.delete("finalUnitPrice");
    setFieldError("unitPrice", "");
    setFieldError("customPrice", "");
    setFieldError("finalUnitPrice", "");
  }

  form.unitPrice.value = retail || "";
  renderSelectionSurcharges();
  updateAutomaticPricingAdjustments();
  updateUnitPriceHint();
  renderAll();
}

function fillPatternOptions() {
  const currentValue =
    form.pattern.value;

  const patterns =
    availablePatterns();

  fillOptions(
    form.pattern,
    "Выберите раскладку",
    patterns,
    (item) => item.id,
    (item) => item.name
  );

  if (
    patterns.some(
      (pattern) =>
        pattern.id === currentValue
    )
  ) {
    form.pattern.value =
      currentValue;

    return false;
  }

  return Boolean(
    currentValue
  );
}

function fillPatternsAndCoatings() {
  fillPatternOptions();

  fillOptions(
    form.coating,
    "Выберите покрытие",
    flooringData.coatings,
    (item) => item.id,
    (item) => item.name
  );
}

function applyPattern() {
  const pattern = selectedPattern();

  ui.angleField.classList.add("is-hidden");
  ui.customPatternField.classList.add("is-hidden");
  ui.customPatternWarning.classList.add("is-hidden");

  form.angle.innerHTML = `
    <option value="">
      Выберите угол
    </option>
  `;

  form.angle.value = "";
  form.customPattern.value = "";
  setUploadedFiles(form.customPatternFile, []);
  ui.customPatternFileName.textContent = "Файлы не выбраны";
  ui.customPatternFileName.classList.add("is-hidden");

  [
    "angle",
    "width",
    "length",
    "customPattern",
    "waste"
  ].forEach((key) => touchedFields.delete(key));

  [
    "angle",
    "width",
    "length",
    "customPattern",
    "waste"
  ].forEach((key) => setFieldError(key, ""));

  if (!pattern) {
    form.width.disabled = true;
    form.length.disabled = true;
    form.waste.disabled = true;

    form.width.value = "";
    form.length.value = "";
    form.waste.value = "";

    form.width.placeholder = "Сначала выберите раскладку";
    form.length.placeholder = "Сначала выберите раскладку";
    form.waste.placeholder = "Сначала выберите раскладку";

    ui.wasteHint.textContent =
      "Сначала выберите раскладку.";

    discountWasEdited = false;
    markupWasEdited = false;

    renderAll();
    return;
  }

  const {
    minWidth,
    maxWidth,
    minLength,
    maxLength
  } = pattern.limits;

  form.width.disabled = false;
  form.length.disabled = false;
  form.waste.disabled = false;

  form.width.min = minWidth;
  form.width.max = maxWidth;
  form.length.min = minLength;
  form.length.max = maxLength;

  form.width.placeholder = `${minWidth}–${maxWidth}`;
  form.length.placeholder = `${minLength}–${maxLength}`;
  form.waste.placeholder = "Укажите процент";

  const currentWidth = Number(form.width.value);
  const currentLength = Number(form.length.value);

  if (
    form.width.value &&
    (
      !Number.isFinite(currentWidth) ||
      currentWidth < minWidth ||
      currentWidth > maxWidth
    )
  ) {
    form.width.value = "";
  }

  if (
    form.length.value &&
    (
      !Number.isFinite(currentLength) ||
      currentLength < minLength ||
      currentLength > maxLength
    )
  ) {
    form.length.value = "";
  }

  ui.lengthLabel.textContent =
    pattern.id === "equal_length"
      ? "Длина ламелей, мм"
      : "Длина ламелей, мм";

  if (pattern.angles?.length) {
    ui.angleField.classList.remove("is-hidden");

    pattern.angles.forEach((angle) => {
      form.angle.append(
        new Option(`${angle}°`, String(angle))
      );
    });
  }

  if (pattern.requiresDescription) {
    ui.customPatternField.classList.remove("is-hidden");
    ui.customPatternWarning.classList.remove("is-hidden");
  }

  if (
    pattern.defaultWastePercent !== null &&
    pattern.defaultWastePercent !== undefined
  ) {
    form.waste.value = pattern.defaultWastePercent;
  } else {
    form.waste.value = "";
  }

  const normalizedWasteHint = String(pattern.wasteHint || "")
    .replace("Рекомендуемый диапазон запаса:", "Рекомендуемый запас:")
    .replace(/\s+$/, "");

  ui.wasteHint.textContent = pattern.requiresDescription
    ? "Запас указывается по проекту. Точное значение зависит от геометрии помещения и проекта."
    : `${normalizedWasteHint} Точное значение зависит от геометрии помещения и проекта.`;
  discountWasEdited = false;
  markupWasEdited = false;

  updateAutomaticPricingAdjustments();
  renderAll();
}

function applyCoating() {
  const coating = selectedCoating();
  const needsGloss = Boolean(coating?.glossRequired);

  setFieldError("coating", "");

  if (ui.coatingHint) {
    ui.coatingHint.textContent = coating?.description
      ? `${coating.description} `
      : "";
  }

  ui.glossField.classList.toggle("is-hidden", !needsGloss);

  if (needsGloss) {
    form.gloss.min = coating.minGloss;
    form.gloss.max = coating.maxGloss;
    form.gloss.placeholder = `${coating.minGloss}–${coating.maxGloss}`;
    form.gloss.value = String(coating.defaultGloss ?? 10);

    if (ui.glossLabel) {
      ui.glossLabel.textContent = "Степень блеска, %";
    }

    if (ui.glossHint) {
      ui.glossHint.textContent =
        `Допустимый диапазон: от ${coating.minGloss} до ${coating.maxGloss}%. ` +
        "";
    }
  } else {
    form.gloss.value = "";
    form.gloss.removeAttribute("min");
    form.gloss.removeAttribute("max");
    form.gloss.removeAttribute("placeholder");
    setFieldError("gloss", "");
  }

  touchedFields.delete("gloss");
  renderAll();
}

function priceArea() {
  const area = Number(
    form.boardArea.value
  );

  const waste = Number(
    form.waste.value
  );

  if (
    !(area > 0) ||
    !(waste >= 0)
  ) {
    return null;
  }

  return round(
    area *
      (1 + waste / 100),
    2
  );
}

function automaticDiscountPercent(area) {
  if (area === null) {
    return 0;
  }

  const tier =
    flooringData.meta.pricing.discountScale.find(
      (row) =>
        area >= row.minArea &&
        (
          row.maxArea === null ||
          area <= row.maxArea
        )
    );

  return tier?.percent ?? 0;
}

function pricingTierKey(tier, clientType, loyalty) {
  if (!tier) return "";
  return [
    clientType,
    loyalty,
    tier.id || "",
    tier.source || "",
    Number(tier.discountPercent || 0)
  ].join("|");
}

function effectivePricingTier(area) {
  if (area === null) {
    tierDiscountOverride = null;
    activeTierKey = "";
    return null;
  }

  const clientType = form.clientType.value || "client";
  const loyalty = form.loyalty.value || "retail";
  const automaticTier = Core.pricingTier(flooringData, area, clientType, loyalty);
  const key = pricingTierKey(automaticTier, clientType, loyalty);

  if (activeTierKey && activeTierKey !== key) {
    tierDiscountOverride = null;
  }
  activeTierKey = key;

  const automaticPercent = Number(automaticTier?.discountPercent || 0);
  if (!(automaticPercent > 0)) {
    tierDiscountOverride = null;
  }

  const maxClientDiscount = Number(flooringData?.meta?.pricing?.maxDiscountPercent || 20);
  const maxAllowed = clientType === "dealer" ? 99.9 : maxClientDiscount;
  let discountPercent = tierDiscountOverride === null
    ? automaticPercent
    : Number(tierDiscountOverride);

  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > maxAllowed
  ) {
    tierDiscountOverride = null;
    discountPercent = automaticPercent;
  }

  return {
    ...automaticTier,
    automaticDiscountPercent: automaticPercent,
    discountPercent,
    coefficient: 1 - discountPercent / 100
  };
}

function selectionMarkupName(row) {
  if (row.id === "length") return "Наценка за отбор по длине";
  if (row.id === "visual") return "Наценка за дополнительный отбор";
  return `Наценка: ${row.name}`;
}

function effectiveMarkupRows(area) {
  const definitions = [];
  const smallAuto = area === null
    ? 0
    : Core.smallOrderMarkup(flooringData, area);

  if (smallAuto > 0) {
    definitions.push({
      id: "smallOrder",
      name: "Наценка за малый объём",
      automaticPercent: Number(smallAuto)
    });
  }

  if (customBaseEnabled) {
    definitions.push({
      id: "baseThickness",
      name: "Наценка за нестандартную основу",
      automaticPercent: Number(flooringData?.meta?.pricing?.customBaseThickness?.defaultMarkupPercent || 10)
    });
  }

  selectedSelectionMarkupRows().forEach((row) => {
    definitions.push({
      id: selectionMarkupKey(row.id),
      name: selectionMarkupName(row),
      automaticPercent: Number(row.percent || 0)
    });
  });

  const activeIds = new Set(definitions.map((row) => row.id));
  [...markupOverrides.keys()].forEach((id) => {
    if (!activeIds.has(id)) markupOverrides.delete(id);
  });

  return definitions.map((row) => {
    const override = markupOverrides.has(row.id)
      ? Number(markupOverrides.get(row.id))
      : null;
    const percent = Number.isFinite(override) && override >= 0
      ? override
      : row.automaticPercent;
    return {
      ...row,
      percent
    };
  });
}

function discountRowName(tier) {
  if (!tier) return "Скидка";
  if ((form.clientType.value || "client") === "dealer") {
    return tier.name || "Дилерская категория";
  }

  if (tier.source === "volume") return "Скидка по объёму";
  if (tier.source === "volumeAndLoyalty") return "Скидка по объёму / категории клиента";
  if (tier.source === "loyalty") {
    const id = form.loyalty.value || "retail";
    if (id === "loyalty") return "Скидка лояльного клиента";
    if (id === "regular") return "Скидка постоянного клиента";
    if (id === "vip") return "Скидка VIP-клиента";
    return tier.loyaltyName ? `Скидка: ${tier.loyaltyName}` : "Скидка клиента";
  }
  return tier.name || "Скидка";
}

function renderAdjustmentControlRow({
  id,
  name,
  percent,
  automaticPercent,
  type
}) {
  const wrapper = document.createElement("div");
  wrapper.className = "dynamic-adjustment-row";

  const label = document.createElement("span");
  label.className = "dynamic-adjustment-row__label";
  label.textContent = name;

  const right = document.createElement("div");
  right.className = "dynamic-adjustment-row__right";

  const control = document.createElement("span");
  control.className = "inline-percent-control";

  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";

  const dealerDiscount =
    type === "discount" &&
    (form.clientType.value || "client") === "dealer";

  input.step = dealerDiscount ? "0.01" : "0.1";
  input.value = String(dealerDiscount ? round(percent, 2) : percent);
  input.setAttribute("aria-label", `${name}, %`);

  if (type === "discount" && (form.clientType.value || "client") !== "dealer") {
    input.max = String(Number(flooringData?.meta?.pricing?.maxDiscountPercent || 20));
  } else if (type === "discount") {
    input.max = "99.9";
  }

  input.addEventListener("change", () => {
    const value = Number(input.value);
    const max = input.max ? Number(input.max) : Infinity;
    if (!Number.isFinite(value) || value < 0 || value > max) {
      input.value = String(percent);
      return;
    }

    if (type === "discount") {
      tierDiscountOverride = Math.abs(value - automaticPercent) < 0.000001
        ? null
        : value;
    } else {
      if (Math.abs(value - automaticPercent) < 0.000001) {
        markupOverrides.delete(id);
      } else {
        markupOverrides.set(id, value);
      }
    }

    updateAutomaticPricingAdjustments();
    renderSpecification();
  });

  const percentSign = document.createElement("strong");
  percentSign.textContent = "%";
  control.append(input, percentSign);
  right.append(control);

  const manuallyChanged = type === "discount"
    ? tierDiscountOverride !== null && Math.abs(percent - automaticPercent) > 0.000001
    : markupOverrides.has(id) && Math.abs(percent - automaticPercent) > 0.000001;

  if (manuallyChanged) {
    const meta = document.createElement("span");
    meta.className = "adjustment-manual";
    meta.append("Изменено вручную · ");

    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "adjustment-reset";
    reset.textContent = "Вернуть";
    let resetHandled = false;
    const resetAdjustment = () => {
      if (resetHandled) return;
      resetHandled = true;
      if (type === "discount") tierDiscountOverride = null;
      else markupOverrides.delete(id);
      updateAutomaticPricingAdjustments();
      renderSpecification();
    };

    // Срабатываем до blur/change активного числового поля: его обработчик
    // перерисовывает список условий и раньше мог удалить кнопку до события click.
    reset.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      resetAdjustment();
    });
    // Оставляем click для клавиатурной активации кнопки (Enter / Space).
    reset.addEventListener("click", (event) => {
      event.preventDefault();
      resetAdjustment();
    });

    meta.append(reset);
    right.append(meta);
  }

  wrapper.append(label, right);
  ui.priceAdjustmentsList.append(wrapper);
}

function updateAutomaticPricingAdjustments() {
  const area = priceArea();
  const basePrice = pricingBasePrice();
  const clientType = form.clientType.value || "client";

  ui.loyaltyField.classList.toggle("is-hidden", clientType === "dealer");
  updateUnitPriceHint();

  ui.priceAdjustmentsList.replaceChildren();

  // Скидки и надбавки имеют смысл только после определения базовой цены
  // выбранной товарной позиции. До этого блок условий не показываем.
  if (!currentItem || !(basePrice > 0)) {
    form.discount.value = "0";
    form.markup.value = "0";
    form.unitPrice.value = basePrice || "";
    ui.priceAdjustmentsBlock.classList.add("is-hidden");
    form.finalUnitPrice.value = "";
    ui.finalUnitPriceValue.textContent = "—";
    setFieldError("finalUnitPrice", "");
    return;
  }

  const tier = effectivePricingTier(area);
  const markups = effectiveMarkupRows(area);

  form.discount.value = String(Number(tier?.discountPercent || 0));
  form.markup.value = String(markups.reduce((sum, row) => sum + Number(row.percent || 0), 0));
  form.unitPrice.value = basePrice || "";

  if (tier && Number(tier.automaticDiscountPercent || 0) > 0) {
    renderAdjustmentControlRow({
      id: "pricingTier",
      name: discountRowName(tier),
      percent: Number(tier.discountPercent || 0),
      automaticPercent: Number(tier.automaticDiscountPercent || 0),
      type: "discount"
    });
  }

  markups.forEach((row) => {
    renderAdjustmentControlRow({
      ...row,
      type: "markup"
    });
  });

  ui.priceAdjustmentsBlock.classList.toggle(
    "is-hidden",
    !ui.priceAdjustmentsList.children.length
  );

  const calc = currentPricingCalculation(tier, markups);
  if (calc) {
    form.finalUnitPrice.value = Core.formatEditableMoney(calc.finalUnitPriceRaw);
    ui.finalUnitPriceValue.textContent = `${Core.formatMoney(calc.finalUnitPriceRaw)}/м²`;
    setFieldError("finalUnitPrice", "");
  } else {
    form.finalUnitPrice.value = "";
    ui.finalUnitPriceValue.textContent = "—";
  }
}

function currentPricingCalculation(tier = null, markups = null) {
  const area = priceArea();
  const basePrice = pricingBasePrice();
  if (!currentItem || !(area > 0) || !(basePrice > 0)) return null;

  const effectiveTier = tier || effectivePricingTier(area);
  const effectiveMarkups = markups || effectiveMarkupRows(area);
  if (!effectiveTier || !(effectiveTier.coefficient > 0)) return null;

  return Core.calculatePricing({
    data: flooringData,
    retailPrice: basePrice,
    areaWithWaste: area,
    tierCoefficient: effectiveTier.coefficient,
    markups: effectiveMarkups
  });
}

function validateNumber(
  input,
  key,
  min,
  max,
  label,
  requiredForPrice = false
) {
  const rawValue =
    input.value.trim();

  const showError =
    shouldShowError(key);

  if (!rawValue) {
    setFieldError(
      key,
      showError &&
      requiredForPrice
        ? `${label}: заполните поле.`
        : ""
    );

    return false;
  }

  const value =
    Number(rawValue);

  const valid =
    Number.isFinite(value) &&
    value >= min &&
    (
      !Number.isFinite(max) ||
      value <= max
    );

  if (
    !valid &&
    showError
  ) {
    setFieldError(
      key,
      Number.isFinite(max)
        ? `${label}: допустимо от ${min} до ${max}.`
        : `${label}: значение не меньше ${min}.`
    );
  } else {
    setFieldError(
      key,
      ""
    );
  }

  return valid;
}

function pricingState() {
  const item = exactProductItem();
  const patternState = validateNonPriceFields();

  const areaValid = validateNumber(form.boardArea, "boardArea", 0.01, Infinity, "Количество доски без отходов", true);
  const wasteValid = validateNumber(form.waste, "waste", 0, Infinity, "Процент отходов", true);

  let baseValid = true;
  if (customBaseEnabled) {
    baseValid = validateNumber(form.baseThickness, "baseThickness", 0.1, Infinity, "Толщина основы", true);
  } else {
    setFieldError("baseThickness", "");
  }

  let priceBaseValid = Boolean(retailPrice());
  if (customPriceEnabled) {
    const custom = parseCustomPrice();
    priceBaseValid = Number.isFinite(custom) && custom > 0;
    setFieldError(
      "customPrice",
      shouldShowError("customPrice") && !priceBaseValid
        ? "Цена для расчёта: укажите значение больше 0."
        : ""
    );
  } else {
    setFieldError("customPrice", "");
  }

  const calc = currentPricingCalculation();
  const finalPriceValid = Boolean(calc && calc.finalUnitPriceRaw > 0);
  setFieldError("finalUnitPrice", "");

  return {
    item,
    ready: Boolean(
      item && patternState.patternValid && patternState.widthValid && patternState.lengthValid &&
      patternState.angleValid && patternState.customPatternValid && patternState.coatingValid && patternState.glossValid &&
      areaValid && wasteValid && baseValid && priceBaseValid && finalPriceValid
    )
  };
}

function calculatePricePreview() {
  const item = exactProductItem();
  const areaWithWaste = priceArea();
  const basePrice = pricingBasePrice();

  if (!item || areaWithWaste === null || !(basePrice > 0)) {
    return null;
  }

  // Если включена нестандартная основа, сначала должна быть задана её толщина.
  if (customBaseEnabled && currentBaseThickness() === null) {
    return null;
  }

  const tier = effectivePricingTier(areaWithWaste);
  const markups = effectiveMarkupRows(areaWithWaste);
  const calc = currentPricingCalculation(tier, markups);
  if (!calc) return null;

  return {
    item,
    areaWithWaste,
    unitPrice: basePrice,
    catalogPrice: retailPrice(),
    discountPercent: Number(tier?.discountPercent || 0),
    markupPercent: calc.markupPercent,
    baseCost: calc.retailCostRaw,
    discountAmount: Math.max(calc.retailCostRaw - calc.priceAfterTierCostRaw, 0),
    markupAmount: Math.max(calc.automaticTotalRaw - calc.priceAfterTierCostRaw, 0),
    finalUnitPrice: calc.finalUnitPriceRaw,
    automaticFinalUnitPrice: calc.automaticFinalUnitPriceRaw,
    total: calc.totalRaw,
    vat: calc.vatRaw,
    tier,
    markups,
    manualPrice: customPriceEnabled
  };
}

function calculatePrice() {
  const state = pricingState();
  if (!state.ready) return null;

  return calculatePricePreview();
}

function valueOrDash(
  value,
  suffix = ""
) {
  return (
    value === null ||
    value === undefined ||
    value === ""
  )
    ? "—"
    : `${value}${suffix}`;
}

function renderSpecification() {
  const item = exactProductItem();
  const pattern = selectedPattern();
  const coating = selectedCoating();
  // Цена и итог могут быть рассчитаны раньше, чем позиция полностью готова
  // к добавлению в спецификацию: для превью нужны только поля, влияющие на расчёт.
  const calc = calculatePricePreview();
  const files = [...form.files.files].map((file) => file.name);
  const baseThickness = currentBaseThickness();
  const totalThickness = item && baseThickness !== null
    ? Core.totalThickness(flooringData, item, baseThickness)
    : null;

  ui.specBase.textContent = baseMaterialLabel(item?.baseMaterial || flooringData?.meta?.baseMaterial);
  ui.specBaseThickness.textContent = baseThickness !== null
    ? `${number.format(baseThickness)} мм${customBaseEnabled ? "*" : ""}`
    : "—";
  ui.specBaseThicknessNoteRow.classList.toggle("is-hidden", !customBaseEnabled);
  ui.specMaterialType.textContent = item?.materialTypeName || (form.materialType.value ? form.materialType.options[form.materialType.selectedIndex].text : "—");
  ui.specSpecies.textContent = form.species.value.trim() || "—";
  ui.specTopLayer.textContent = form.topLayer.value || "—";
  ui.specThickness.textContent = totalThickness !== null ? `${number.format(totalThickness)} мм` : "—";
  ui.specConnection.textContent = item?.connection || flooringData?.meta?.connection || "Шип-паз";
  ui.specSorting.textContent = item?.sorting || flooringData?.meta?.sorting || "Select+";
  ui.specPatternType.textContent = item?.patternType || "—";
  ui.specPattern.textContent = pattern?.name || "—";

  ui.specAngleRow.classList.toggle("is-hidden", !pattern?.angles?.length);
  ui.specAngle.textContent = form.angle.value ? `${form.angle.value}°` : "—";
  ui.specWidth.textContent = form.width.value ? `${number.format(Number(form.width.value))} мм` : "—";
  ui.specLength.textContent = form.length.value ? `${number.format(Number(form.length.value))} мм` : "—";

  ui.specCustomPatternRow.classList.toggle("is-hidden", !pattern?.requiresDescription);
  ui.specCustomPattern.textContent = form.customPattern.value.trim() || "—";
  const customPatternFiles = getUploadedFiles(form.customPatternFile);
  ui.specCustomPatternFileRow.classList.toggle("is-hidden", !pattern?.requiresDescription || !customPatternFiles.length);
  ui.specCustomPatternFile.textContent = customPatternFiles.length ? customPatternFiles.map((file) => file.name).join(", ") : "—";

  ui.specCoating.textContent = coating?.name || "—";
  const showGloss = Boolean(coating?.glossRequired);
  ui.specGlossRow.classList.toggle("is-hidden", !showGloss);
  ui.specGloss.textContent = showGloss && form.gloss.value ? `${number.format(Number(form.gloss.value))}%` : "—";

  ui.specBaseArea.textContent = form.boardArea.value ? `${number.format(Number(form.boardArea.value))} м²` : "—";
  ui.specWaste.textContent = form.waste.value ? `${number.format(Number(form.waste.value))}%` : form.waste.value === "0" ? "0%" : "—";
  ui.specAreaWithWaste.textContent = calc
    ? `${number.format(calc.areaWithWaste)} м²`
    : priceArea() !== null ? `${number.format(priceArea())} м²` : "—";

  ui.specComment.textContent = form.comment.value.trim() || "—";
  ui.specFilesRow.classList.toggle("is-hidden", !files.length);
  ui.specFiles.textContent = files.length ? files.join(", ") : "—";

  ui.specFinalUnitPrice.textContent = calc ? `${Core.formatMoney(calc.finalUnitPrice)}/м²` : "—";

  ui.specTotal.textContent = calc ? Core.formatMoney(calc.total) : "—";
  ui.specVat.textContent = calc ? `В том числе НДС 22%: ${Core.formatMoney(calc.vat)}` : "В том числе НДС 22%: —";

  ui.priceStatus.textContent = "";
  ui.priceStatus.classList.add("is-hidden");

  ui.addToSpecButton.disabled = false;
}

function validateMaterialFields() {
  const speciesMatch =
    exactSpeciesItem();

  const speciesError =
    !speciesMatch &&
    shouldShowError("species")
      ? form.species.value.trim()
        ? "Выберите точное наименование из справочника."
        : "Выберите наименование шпона."
      : "";

  setFieldError(
    "species",
    speciesError
  );

  const topLayerError =
    speciesMatch &&
    !form.topLayer.value &&
    shouldShowError("topLayer")
      ? "Выберите толщину лицевого шпона."
      : "";

  setFieldError(
    "topLayer",
    topLayerError
  );

}

function validateNonPriceFields() {
  const pattern = selectedPattern();

  const patternError =
    !pattern && shouldShowError("pattern")
      ? "Выберите раскладку."
      : "";

  setFieldError("pattern", patternError);

  let widthValid = false;
  let lengthValid = false;
  let angleValid = true;
  let customPatternValid = true;

  if (pattern) {
    widthValid = validateNumber(
      form.width,
      "width",
      pattern.limits.minWidth,
      pattern.limits.maxWidth,
      "Ширина",
      true
    );

    lengthValid = validateNumber(
      form.length,
      "length",
      pattern.limits.minLength,
      pattern.limits.maxLength,
      "Длина",
      true
    );

    if (pattern.angles?.length) {
      angleValid =
        pattern.angles.includes(Number(form.angle.value));

      const angleError =
        !angleValid && shouldShowError("angle")
          ? `Выберите угол: ${pattern.angles.join("°, ")}°.`
          : "";

      setFieldError("angle", angleError);
    } else {
      setFieldError("angle", "");
    }

    if (pattern.requiresDescription) {
      customPatternValid =
        Boolean(form.customPattern.value.trim()) || getUploadedFiles(form.customPatternFile).length > 0;

      const descriptionError =
        !customPatternValid &&
        shouldShowError("customPattern")
          ? "Добавьте описание раскладки или приложите файл."
          : "";

      setFieldError("customPattern", descriptionError);
    } else {
      setFieldError("customPattern", "");
    }
  } else {
    ["width", "length", "angle", "customPattern"].forEach(
      (key) => setFieldError(key, "")
    );
  }

  const coating = selectedCoating();

  const coatingValid = Boolean(coating);
  const coatingError =
    !coatingValid && shouldShowError("coating")
      ? "Выберите покрытие."
      : "";

  setFieldError("coating", coatingError);

  let glossValid = true;

  if (coating?.glossRequired) {
    glossValid = validateNumber(
      form.gloss,
      "gloss",
      coating.minGloss,
      coating.maxGloss,
      "Степень блеска",
      true
    );
  } else {
    setFieldError("gloss", "");
  }

  return {
    patternValid: Boolean(pattern),
    widthValid,
    lengthValid,
    angleValid,
    customPatternValid,
    coatingValid,
    glossValid
  };
}

function fileIdentity(file) {
  return [
    file.name,
    file.size,
    file.type,
    file.lastModified
  ].join("::");
}

function getUploadedFiles(input) {
  const stored = uploadedFilesState.get(input);
  return stored ? [...stored] : [...input.files];
}

function setUploadedFiles(input, files) {
  const nextFiles = [...files];
  uploadedFilesState.set(input, nextFiles);

  try {
    const transfer = new DataTransfer();
    nextFiles.forEach((file) => transfer.items.add(file));
    input.files = transfer.files;
  } catch {
    // Состояние всё равно хранится в uploadedFilesState.
  }
}

function appendUploadedFiles(input, files) {
  const current = getUploadedFiles(input);
  const existing = new Set(current.map(fileIdentity));

  files.forEach((file) => {
    const key = fileIdentity(file);
    if (existing.has(key)) return;
    existing.add(key);
    current.push(file);
  });

  setUploadedFiles(input, current);
}

function removeUploadedFile(input, index) {
  const nextFiles = getUploadedFiles(input).filter((_, fileIndex) => fileIndex !== index);
  setUploadedFiles(input, nextFiles);
}

function serializeUploadedFiles(input) {
  return getUploadedFiles(input).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type
  }));
}

function renderUploadedFiles(
  input,
  output,
  emptyText = "Файлы не выбраны",
  hideWhenEmpty = false
) {
  const files = getUploadedFiles(input);

  output.innerHTML = "";
  output.classList.toggle("is-hidden", hideWhenEmpty && !files.length);

  if (!files.length) {
    output.textContent = emptyText;
    return;
  }

  files.forEach((file, index) => {
    const tag = document.createElement("span");
    tag.className = "uploaded-file";

    const name = document.createElement("span");
    name.className = "uploaded-file__name";
    name.textContent = file.name;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "uploaded-file__remove";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `Удалить файл ${file.name}`);
    removeButton.addEventListener("click", () => {
      removeUploadedFile(input, index);
      if (input === form.customPatternFile) {
        markFieldTouched("customPattern");
      }
      renderUploadedFiles(input, output, emptyText, hideWhenEmpty);
      renderAll();
    });

    tag.append(name, removeButton);
    output.append(tag);
  });
}

function bindFileInput(input, output, hideWhenEmpty = false) {
  setUploadedFiles(input, getUploadedFiles(input));
  renderUploadedFiles(input, output, "Файлы не выбраны", hideWhenEmpty);

  input.addEventListener("change", () => {
    const selectedNow = [...input.files];
    appendUploadedFiles(input, selectedNow);
    renderUploadedFiles(input, output, "Файлы не выбраны", hideWhenEmpty);
    renderAll();
  });
}

function renderAll() {
  if (!flooringData) {
    return;
  }

  renderBaseSummary();
  updateAutomaticPricingAdjustments();
  validateMaterialFields();
  validateNonPriceFields();
  updateUnitPriceHint();
  renderSpecification();

  const width = Number(form.width.value);

  ui.widthWarning.classList.toggle(
    "is-hidden",
    !width ||
      width <= flooringData.meta
        .generalDimensions
        .managerCheckWidth
  );

  const area = Number(form.boardArea.value);
  const waste = Number(form.waste.value);
  const totalArea = priceArea();

  if (totalArea !== null) {
    ui.areaWithWasteValue.textContent =
      `${number.format(totalArea)} м²`;

    ui.areaWithWasteFormula.textContent =
      `${number.format(area)} м² + ${number.format(waste)}% отходов`;
  } else {
    ui.areaWithWasteValue.textContent = "—";
    ui.areaWithWasteFormula.textContent =
      selectedPattern()
        ? "Заполните количество доски и процент отходов."
        : "Сначала выберите раскладку.";
  }
}

function buildSavedPosition(calc) {
  const item = calc.item;
  const pattern = selectedPattern();
  const coating = selectedCoating();
  const baseThickness = currentBaseThickness();
  const totalThickness = Core.totalThickness(flooringData, item, baseThickness);

  return {
    productType: "flooring",
    itemId: item.id,
    materialCode: item.id,
    materialType: item.materialTypeName,
    species: item.species,
    topLayer: item.topLayer,
    base: item.baseMaterial || flooringData.meta.baseMaterial,
    baseThickness,
    totalThickness,
    connection: item.connection || "Шип-паз",
    sorting: item.sorting || "Select+",
    patternType: item.patternType || null,
    patternId: pattern?.id || null,
    patternName: pattern?.name || null,
    angle: form.angle.value ? Number(form.angle.value) : null,
    width: form.width.value ? Number(form.width.value) : null,
    length: form.length.value ? Number(form.length.value) : null,
    customPatternDescription: form.customPattern.value.trim() || null,
    customPatternFile: serializeUploadedFiles(form.customPatternFile),
    coatingId: coating?.id || null,
    coatingName: coating?.name || null,
    gloss: form.gloss.value ? Number(form.gloss.value) : null,
    baseArea: Number(form.boardArea.value),
    wastePercent: Number(form.waste.value),
    areaWithWaste: calc.areaWithWaste,
    catalogPrice: Core.catalogPrice(item),
    unitPrice: calc.unitPrice,
    priceStatus: item.priceStatus || "fixed",
    priceChangedManually: customPriceEnabled || tierDiscountOverride !== null || markupOverrides.size > 0,
    basePriceChangedManually: customPriceEnabled,
    clientType: form.clientType.value,
    loyaltyTier: form.clientType.value === "dealer" ? null : form.loyalty.value,
    pricingTier: calc.tier,
    markups: calc.markups,
    discountPercent: calc.discountPercent,
    markupPercent: calc.markupPercent,
    baseCost: calc.baseCost,
    discountAmount: calc.discountAmount,
    markupAmount: calc.markupAmount,
    automaticFinalUnitPrice: calc.automaticFinalUnitPrice,
    finalUnitPrice: calc.finalUnitPrice,
    total: calc.total,
    vat: calc.vat,
    comment: form.comment.value.trim(),
    files: serializeUploadedFiles(form.files),
    createdAt: new Date().toISOString()
  };
}

function validNumberValue(input, min, max = Infinity) {
  const value = Number(input.value);

  return (
    input.value.trim() !== "" &&
    Number.isFinite(value) &&
    value >= min &&
    (
      !Number.isFinite(max) ||
      value <= max
    )
  );
}

function requiredFieldIssues() {
  const issues = [];
  const species = exactSpeciesItem();
  const pattern = selectedPattern();
  const coating = selectedCoating();

  if (!species) {
    issues.push({ key: "species", label: "наименование шпона", input: form.species });
  } else if (!form.topLayer.value || !exactProductItem()) {
    issues.push({ key: "topLayer", label: "толщину лицевого шпона", input: form.topLayer });
  }

  if (customBaseEnabled && !validNumberValue(form.baseThickness, 0.1)) {
    issues.push({ key: "baseThickness", label: "толщину основы", input: form.baseThickness });
  }

  if (!pattern) {
    issues.push({ key: "pattern", label: "раскладку", input: form.pattern });
  } else {
    if (pattern.angles?.length && !pattern.angles.includes(Number(form.angle.value))) {
      issues.push({ key: "angle", label: "угол торцевого реза", input: form.angle });
    }
    if (pattern.requiresDescription && !form.customPattern.value.trim() && getUploadedFiles(form.customPatternFile).length === 0) {
      issues.push({ key: "customPattern", label: "описание раскладки или файл", input: form.customPattern });
    }
    if (!validNumberValue(form.width, pattern.limits.minWidth, pattern.limits.maxWidth)) {
      issues.push({ key: "width", label: "ширину доски", input: form.width });
    }
    if (!validNumberValue(form.length, pattern.limits.minLength, pattern.limits.maxLength)) {
      issues.push({ key: "length", label: "длину ламелей", input: form.length });
    }
  }

  if (!validNumberValue(form.boardArea, 0.01)) {
    issues.push({ key: "boardArea", label: "количество доски", input: form.boardArea });
  }
  if (!validNumberValue(form.waste, 0)) {
    issues.push({ key: "waste", label: "процент отходов", input: form.waste });
  }

  if (!coating) {
    issues.push({ key: "coating", label: "покрытие", input: form.coating });
  } else if (coating.glossRequired && !validNumberValue(form.gloss, coating.minGloss, coating.maxGloss)) {
    issues.push({ key: "gloss", label: "степень блеска", input: form.gloss });
  }

  if (customPriceEnabled) {
    const custom = parseCustomPrice();
    if (!Number.isFinite(custom) || custom <= 0) {
      issues.push({ key: "customPrice", label: "цену для расчёта", input: form.customPrice });
    }
  } else if (!pricingBasePrice()) {
    issues.push({ key: "customPrice", label: "цену для расчёта", input: form.customPrice });
  }

  return issues;
}

function focusFirstIssue(issue) {
  const [field] = validation[issue.key] || [];
  const target = field || issue.input;

  target?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  window.setTimeout(() => {
    if (!issue.input?.disabled) {
      issue.input?.focus({
        preventScroll: true
      });
    }
  }, 350);
}

function addToSpecification() {
  addAttempted = true;

  [
    "species",
    "topLayer",
    "sorting",
    "pattern",
    "angle",
    "width",
    "length",
    "customPattern",
    "boardArea",
    "waste",
    "coating",
    "gloss",
    "baseThickness",
    "customPrice"
  ].forEach((key) => {
    touchedFields.add(key);
  });

  renderAll();

  const issues =
    requiredFieldIssues();

  const calc =
    calculatePrice();

  if (!calc || issues.length) {
    ui.saveStatus.textContent =
      issues.length
        ? `Заполните: ${issues.map((issue) => issue.label).join(", ")}.`
        : "Проверьте обязательные поля расчёта.";

    if (issues[0]) {
      focusFirstIssue(issues[0]);
    }

    return;
  }

  addAttempted = false;

  let current = [];

  try {
    current = JSON.parse(
      sessionStorage.getItem(
        SPEC_STORAGE_KEY
      ) || "[]"
    );
  } catch {
    current = [];
  }

  current.push(
    buildSavedPosition(calc)
  );

  sessionStorage.setItem(
    SPEC_STORAGE_KEY,
    JSON.stringify(current)
  );

  ui.saveStatus.textContent =
    "Позиция добавлена в спецификацию.";

  ui.addToSpecButton.textContent =
    "Добавлено";

  setTimeout(() => {
    ui.addToSpecButton.textContent =
      "Добавить в спецификацию";
  }, 1200);
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Не удалось загрузить данные: ${response.status}`);
  flooringData = await response.json();

  fillMaterialTypes();
  fillTopLayerOptions();
  refreshSpeciesOptions();
  fillPatternsAndCoatings();
  resetSortingSelection();
  updateSpeciesClearButton();
  renderBaseSummary();

  form.materialType.addEventListener("change", () => {
    const enteredSpecies = form.species.value.trim();
    const matchingSpecies = exactSpeciesItem();
    if (!form.materialType.value && enteredSpecies) {
      form.species.value = "";
      selectedSpeciesName = "";
      currentItem = null;
    } else if (enteredSpecies && !matchingSpecies) {
      form.species.value = "";
      selectedSpeciesName = "";
      currentItem = null;
    }
    selectedTopLayerValue = form.topLayer.value;
    touchedFields.delete("species");
    touchedFields.delete("topLayer");
    touchedFields.delete("unitPrice");
    touchedFields.delete("finalUnitPrice");
    refreshSpeciesOptions();
    fillTopLayerOptions();
    applySpeciesSelection();
  });

  form.species.addEventListener("input", () => {
    renderSpeciesSuggestions();
    applySpeciesSelection();
  });
  form.speciesClear.addEventListener("click", clearSpeciesSelection);
  form.species.addEventListener("focus", renderSpeciesSuggestions);
  form.species.addEventListener("change", applySpeciesSelection);
  form.topLayer.addEventListener("change", () => {
    refreshSpeciesOptions();
    applyTopLayerSelection();
  });

  form.baseThicknessToggle.addEventListener("click", () => {
    customBaseEnabled = !customBaseEnabled;
    ui.customBaseThicknessField.classList.toggle("is-hidden", !customBaseEnabled);
    form.baseThicknessToggle.setAttribute("aria-expanded", String(customBaseEnabled));
    form.baseThicknessToggle.textContent = customBaseEnabled ? "Вернуть стандартную основу 12 мм" : "Указать другую толщину основы";
    if (!customBaseEnabled) {
      form.baseThickness.value = "";
      markupOverrides.delete("baseThickness");
      touchedFields.delete("baseThickness");
      setFieldError("baseThickness", "");
    }
    renderAll();
    if (customBaseEnabled) form.baseThickness.focus();
  });

  form.clientType.addEventListener("change", () => {
    tierDiscountOverride = null;
    activeTierKey = "";
    renderAll();
  });
  form.loyalty.addEventListener("change", () => {
    tierDiscountOverride = null;
    activeTierKey = "";
    renderAll();
  });

  form.customPriceToggle.addEventListener("click", () => {
    if (!currentItem) return;
    customPriceEnabled = true;
    touchedFields.delete("customPrice");
    setFieldError("customPrice", "");
    renderAll();
    form.customPrice.focus();
  });

  form.customPrice.addEventListener("input", () => {
    renderAll();
  });
  form.customPrice.addEventListener("blur", () => {
    markFieldTouched("customPrice");
    const value = parseCustomPrice();
    if (Number.isFinite(value) && value > 0) setCustomPriceValue(value);
    renderAll();
  });
  form.resetCustomPrice.addEventListener("click", () => {
    customPriceEnabled = false;
    form.customPrice.value = "";
    touchedFields.delete("customPrice");
    setFieldError("customPrice", "");
    renderAll();
  });

  form.baseThickness.addEventListener("input", renderAll);

  form.pattern.addEventListener("change", () => {
    markFieldTouched("pattern");
    applyPattern();
  });
  form.coating.addEventListener("change", applyCoating);

  bindFileInput(form.customPatternFile, ui.customPatternFileName, true);
  form.customPatternFile.addEventListener("change", () => {
    markFieldTouched("customPattern");
    renderAll();
  });
  bindFileInput(form.files, ui.selectedFiles, true);
  ui.addToSpecButton.addEventListener("click", addToSpecification);

  [
    form.width,
    form.length,
    form.customPattern,
    form.boardArea,
    form.waste,
    form.gloss,
    form.comment,
    form.angle
  ].forEach((input) => {
    input.addEventListener("input", renderAll);
    input.addEventListener("change", renderAll);
  });

  form.species.addEventListener("blur", () => {
    window.setTimeout(closeSpeciesSuggestions, 100);
    markFieldTouched("species");
    applySpeciesSelection();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#speciesField")) closeSpeciesSuggestions();
  });
  form.topLayer.addEventListener("blur", () => {
    markFieldTouched("topLayer");
    applyTopLayerSelection();
  });
  form.angle.addEventListener("blur", () => {
    markFieldTouched("angle");
    renderAll();
  });
  form.customPattern.addEventListener("blur", () => {
    markFieldTouched("customPattern");
    renderAll();
  });

  form.width.addEventListener("blur", () => {
    const pattern = selectedPattern();
    if (pattern) clampOnBlur(form.width, "width", pattern.limits.minWidth, pattern.limits.maxWidth, "Ширина");
  });
  form.length.addEventListener("blur", () => {
    const pattern = selectedPattern();
    if (pattern) clampOnBlur(form.length, "length", pattern.limits.minLength, pattern.limits.maxLength, "Длина");
  });
  form.gloss.addEventListener("blur", () => {
    const coating = selectedCoating();
    if (coating?.glossRequired) clampOnBlur(form.gloss, "gloss", coating.minGloss, coating.maxGloss, "Блеск УФ-лака");
  });
  form.boardArea.addEventListener("blur", () => clampOnBlur(form.boardArea, "boardArea", 0.01, Infinity, "Метраж"));
  form.waste.addEventListener("blur", () => clampOnBlur(form.waste, "waste", 0, Infinity, "Процент отходов"));
  form.baseThickness.addEventListener("blur", () => {
    if (customBaseEnabled) clampOnBlur(form.baseThickness, "baseThickness", 0.1, Infinity, "Толщина основы");
  });

  renderAll();
}


init().catch((error) => {
  console.error(error);
  ui.priceStatus.classList.remove("is-hidden");
  ui.priceStatus.textContent = "Не удалось загрузить данные расчёта. Обновите страницу или обратитесь к менеджеру.";
});