"use strict";

const Core = window.WoodstockFlooringCore;

const form = {
  root: document.querySelector("#quickFlooringForm"),
  materialType: document.querySelector("#materialTypeSelect"),
  species: document.querySelector("#speciesInput"),
  speciesClear: document.querySelector("#speciesClearButton"),
  topLayer: document.querySelector("#topLayerSelect"),
  pattern: document.querySelector("#patternSelect"),
  customPattern: document.querySelector("#customPatternInput"),
  customPatternFile: document.querySelector("#customPatternFileInput"),
  boardSizeToggle: document.querySelector("#boardSizeToggle"),
  boardWidth: document.querySelector("#boardWidthInput"),
  boardLength: document.querySelector("#boardLengthInput"),
  roomArea: document.querySelector("#roomAreaInput"),
  waste: document.querySelector("#wasteInput"),
  finish: document.querySelector("#finishSelect"),
  name: document.querySelector("#nameInput"),
  phone: document.querySelector("#phoneInput"),
  city: document.querySelector("#cityInput"),
  email: document.querySelector("#emailInput"),
  comment: document.querySelector("#commentInput"),
  files: document.querySelector("#filesInput"),
  managerContact: document.querySelector("#managerContactInput"),
  privacy: document.querySelector("#privacyInput")
};

const ui = Object.fromEntries([
  "speciesSuggestions",
  "speciesHint",
  "topLayerHint",
  "customPatternField",
  "customPatternWarning",
  "customPatternFileName",
  "quickWasteHint",
  "finishHint",
  "boardSizeFields",
  "boardWidthWarning",
  "areaWithWasteValue",
  "areaWithWasteFormula",
  "selectedFiles",
  "resultTotal",
  "getCalculationButton",
  "saveStatus",
  "downloadModal",
  "downloadModalClose"
].map((id) => [id, document.querySelector(`#${id}`)]));

const validation = {
  species: [document.querySelector("#speciesField"), document.querySelector("#speciesError")],
  topLayer: [document.querySelector("#topLayerField"), document.querySelector("#topLayerError")],
  pattern: [document.querySelector("#patternField"), document.querySelector("#patternError")],
  customPattern: [document.querySelector("#customPatternField"), document.querySelector("#customPatternError")],
  boardWidth: [document.querySelector("#boardWidthField"), document.querySelector("#boardWidthError")],
  boardLength: [document.querySelector("#boardLengthField"), document.querySelector("#boardLengthError")],
  roomArea: [document.querySelector("#roomAreaField"), document.querySelector("#roomAreaError")],
  finish: [document.querySelector("#finishField"), document.querySelector("#finishError")],
  name: [document.querySelector("#nameField"), document.querySelector("#nameError")],
  phone: [document.querySelector("#phoneField"), document.querySelector("#phoneError")],
  city: [document.querySelector("#cityField"), document.querySelector("#cityError")],
  email: [document.querySelector("#emailField"), document.querySelector("#emailError")],
  privacy: [document.querySelector("#privacyField"), document.querySelector("#privacyError")]
};

const finishLabels = {};

const money = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const number = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2
});

let flooringData = null;
let currentItem = null;
let submitAttempted = false;
const uploadedFilesState = new WeakMap();
const touchedFields = new Set();

function normalizeText(value) {
  return String(value || "").trim().toLocaleLowerCase("ru-RU");
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function shouldShowError(key) {
  return submitAttempted || touchedFields.has(key);
}

function markFieldTouched(key) {
  touchedFields.add(key);
}

function setFieldError(key, message = "") {
  const [field, error] = validation[key] || [];
  field?.classList.toggle("field--invalid", Boolean(message));
  if (error) error.textContent = message;
}

function fillOptions(select, options, placeholder) {
  select.replaceChildren();

  const first = document.createElement("option");
  first.value = "";
  first.textContent = placeholder;
  select.append(first);

  options.forEach(({ value, label }) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.append(option);
  });
}

function patternAllowedForTopLayer(pattern) {
  const allowedTopLayers = pattern?.allowedTopLayers || [];

  return (
    !allowedTopLayers.length ||
    !form.topLayer.value ||
    allowedTopLayers.includes(form.topLayer.value)
  );
}

function availablePatterns() {
  return (flooringData?.patterns || []).filter(patternAllowedForTopLayer);
}

function selectedPattern() {
  const pattern = flooringData?.patterns.find((item) => item.id === form.pattern.value) || null;
  return patternAllowedForTopLayer(pattern) ? pattern : null;
}

function speciesItems() {
  const topLayer = form.topLayer.value;
  return (flooringData?.items || []).filter((item) => !topLayer || item.topLayer === topLayer);
}

function availableSpeciesNames() {
  return [...new Set(speciesItems().map((item) => item.species))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "ru"));
}

function exactSpeciesItem() {
  const name = normalizeText(form.species.value);

  if (!name) {
    return null;
  }

  return speciesItems().find(
    (item) => normalizeText(item.species) === name
  ) || null;
}

function speciesProducts() {
  const species = normalizeText(form.species.value);

  if (!species) {
    return [];
  }

  return speciesItems().filter((item) => (
    normalizeText(item.species) === species
    && (!form.materialType.value || item.materialType === form.materialType.value)
  ));
}

function exactSpeciesExists() {
  return Boolean(exactSpeciesItem());
}

function exactProductItem() {
  if (!form.topLayer.value) return null;

  return speciesProducts().find((item) => (
    item.topLayer === form.topLayer.value && item.sorting === "Select+"
  )) || null;
}

function closeSpeciesSuggestions() {
  ui.speciesSuggestions.classList.add("is-hidden");
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
  const names = availableSpeciesNames();
  const filtered = names.filter((name) => normalizeText(name).includes(query));

  ui.speciesSuggestions.replaceChildren();

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "autocomplete-empty";
    empty.textContent = "Ничего не найдено";
    ui.speciesSuggestions.append(empty);
  } else {
    filtered.forEach((name) => {
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
  form.speciesClear.classList.toggle("is-hidden", !form.species.value.trim());
}

function fillTopLayerOptions() {
  const currentValue = form.topLayer.value;
  const productLayers = [
    ...new Set(
      speciesProducts()
        .map((item) => item.topLayer)
        .filter(Boolean)
    )
  ];

  const layers = productLayers.length
    ? productLayers
    : Object.keys(
        flooringData?.meta?.thicknessByTopLayer || {}
      );

  fillOptions(
    form.topLayer,
    layers.map((layer) => ({ value: layer, label: layer })),
    "Выберите толщину"
  );

  form.topLayer.disabled = false;

  if (layers.includes(currentValue)) {
    form.topLayer.value = currentValue;
  }
}

function clearProductSelection() {
  currentItem = null;
  fillTopLayerOptions();
  ui.topLayerHint.textContent = "";
}

function applySpeciesSelection() {
  updateSpeciesClearButton();
  currentItem = null;

  const speciesMatch = exactSpeciesItem();

  if (!speciesMatch) {
    form.materialType.value = "";
    clearProductSelection();
    ui.speciesHint.textContent = form.species.value.trim()
      ? "Выберите наименование из списка."
      : "";
    renderAll();
    return;
  }

  if (form.materialType.value !== speciesMatch.materialType) {
    form.materialType.value = speciesMatch.materialType;
    refreshSpeciesOptions();
  }

  fillTopLayerOptions();
  ui.speciesHint.textContent = "";
  applyTopLayerSelection();
}

function applyTopLayerSelection() {
  currentItem = exactProductItem();
  const patternWasReset = fillPatterns();

  if (patternWasReset) {
    applyPattern();
  }

  if (!form.topLayer.value) {
    ui.topLayerHint.textContent = "";
  } else if (currentItem?.priceStatus === "onRequest") {
    ui.topLayerHint.textContent = "Стоимость этой позиции рассчитывается по запросу.";
  } else {
    ui.topLayerHint.textContent = "";
  }

  renderAll();
}

function fillPatterns() {
  const currentValue = form.pattern.value;
  const patterns = availablePatterns();

  fillOptions(
    form.pattern,
    patterns.map((pattern) => ({ value: pattern.id, label: pattern.name })),
    "Выберите раскладку"
  );

  if (patterns.some((pattern) => pattern.id === currentValue)) {
    form.pattern.value = currentValue;
    return false;
  }

  return Boolean(currentValue);
}

function boardSizesVisible() {
  return !ui.boardSizeFields.classList.contains("is-hidden");
}

function valueWithinLimits(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function clampOnBlur(input, key, min, max, label) {
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
    setFieldError(key, `${label}: введите числовое значение.`);
    return;
  }

  const belowMinimum = value < min;
  const aboveMaximum = Number.isFinite(max) && value > max;

  if (belowMinimum || aboveMaximum) {
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

function validateBoardSizeFields() {
  const pattern = selectedPattern();
  const sizesOpen = boardSizesVisible();

  if (!sizesOpen || !pattern) {
    setFieldError("boardWidth");
    setFieldError("boardLength");
    return { widthValid: true, lengthValid: true };
  }

  const { minWidth, maxWidth, minLength, maxLength } = pattern.limits;
  const widthRaw = form.boardWidth.value.trim();
  const lengthRaw = form.boardLength.value.trim();
  const width = Number(widthRaw);
  const length = Number(lengthRaw);
  const widthValid = valueWithinLimits(width, minWidth, maxWidth) && widthRaw !== "";
  const lengthValid = valueWithinLimits(length, minLength, maxLength) && lengthRaw !== "";

  setFieldError(
    "boardWidth",
    !widthValid && shouldShowError("boardWidth")
      ? widthRaw
        ? `Ширина: допустимо от ${minWidth} до ${maxWidth}.`
        : "Ширина: заполните поле."
      : ""
  );

  setFieldError(
    "boardLength",
    !lengthValid && shouldShowError("boardLength")
      ? lengthRaw
        ? `Длина: допустимо от ${minLength} до ${maxLength}.`
        : "Длина: заполните поле."
      : ""
  );

  return { widthValid, lengthValid };
}

function updateBoardSizeLimits({ clearInvalid = false } = {}) {
  const limits = selectedPattern()?.limits;

  form.boardSizeToggle.classList.toggle("is-hidden", !limits);

  if (!limits) {
    ui.boardSizeFields.classList.add("is-hidden");
    form.boardSizeToggle.setAttribute("aria-expanded", "false");
    form.boardWidth.value = "";
    form.boardLength.value = "";
    touchedFields.delete("boardWidth");
    touchedFields.delete("boardLength");
    setFieldError("boardWidth");
    setFieldError("boardLength");
    return;
  }

  form.boardWidth.min = String(limits.minWidth);
  form.boardWidth.max = String(limits.maxWidth);
  form.boardLength.min = String(limits.minLength);
  form.boardLength.max = String(limits.maxLength);
  form.boardWidth.placeholder = `${limits.minWidth}–${limits.maxWidth}`;
  form.boardLength.placeholder = `${limits.minLength}–${limits.maxLength}`;

  if (clearInvalid) {
    const width = Number(form.boardWidth.value);
    const length = Number(form.boardLength.value);

    if (form.boardWidth.value && !valueWithinLimits(width, limits.minWidth, limits.maxWidth)) {
      form.boardWidth.value = "";
    }
    if (form.boardLength.value && !valueWithinLimits(length, limits.minLength, limits.maxLength)) {
      form.boardLength.value = "";
    }
  }
}

function toggleBoardSizes() {
  const shouldOpen = !boardSizesVisible();
  ui.boardSizeFields.classList.toggle("is-hidden", !shouldOpen);
  form.boardSizeToggle.setAttribute("aria-expanded", String(shouldOpen));
  form.boardSizeToggle.textContent = shouldOpen
    ? "Не указывать размеры досок"
    : "Я знаю размеры досок";

  if (shouldOpen) {
    updateBoardSizeLimits();
    form.boardWidth.focus();
  } else {
    form.boardWidth.value = "";
    form.boardLength.value = "";
    touchedFields.delete("boardWidth");
    touchedFields.delete("boardLength");
    setFieldError("boardWidth");
    setFieldError("boardLength");
  }

  renderAll();
}

function quickWasteHintText(pattern) {
  if (!pattern || pattern.id === "custom") return "";

  if (pattern.id === "deck" || pattern.id === "equal_length") {
    return "Рекомендуемый запас: 5–10%. Точное значение зависит от геометрии помещения и проекта.";
  }

  if (pattern.id === "french_herringbone" || pattern.id === "hungarian_herringbone") {
    return "Рекомендуемый запас: не менее 15%. Точное значение зависит от геометрии помещения и проекта.";
  }

  return pattern.wasteHint
    ? `${pattern.wasteHint} Точное значение зависит от геометрии помещения и проекта.`
    : "";
}

function applyPattern() {
  const pattern = selectedPattern();
  const quickCustomWaste = Number(flooringData?.meta?.quickCalculation?.customPatternWastePercent ?? 15);
  const configuredWaste = pattern?.id === "custom" ? quickCustomWaste : pattern?.defaultWastePercent;
  const waste = configuredWaste === null || configuredWaste === undefined ? NaN : Number(configuredWaste);

  form.waste.value = Number.isFinite(waste) ? String(waste) : "";
  const customPatternSelected = pattern?.id === "custom";
  ui.customPatternField.classList.toggle("is-hidden", !customPatternSelected);
  ui.customPatternWarning.classList.toggle("is-hidden", !customPatternSelected);

  const wasteHintText = quickWasteHintText(pattern);
  ui.quickWasteHint.textContent = wasteHintText;
  ui.quickWasteHint.classList.toggle("is-hidden", !wasteHintText);

  if (!customPatternSelected) {
    form.customPattern.value = "";
    setUploadedFiles(form.customPatternFile, []);
    ui.customPatternFileName.textContent = "Файлы не выбраны";
    touchedFields.delete("customPattern");
    setFieldError("customPattern");
  }

  touchedFields.delete("boardWidth");
  touchedFields.delete("boardLength");
  updateBoardSizeLimits({ clearInvalid: true });
  renderAll();
}

function priceArea() {
  const roomArea = Number(form.roomArea.value);
  const waste = Number(form.waste.value);

  if (!Number.isFinite(roomArea) || roomArea <= 0 || !Number.isFinite(waste) || waste < 0) {
    return null;
  }

  return round(roomArea * (1 + waste / 100), 2);
}

function automaticDiscountPercent(area) {
  const scale = flooringData?.meta?.pricing?.discountScale || [];
  const row = scale.find((item) => (
    area >= Number(item.minArea || 0) &&
    (item.maxArea === null || area <= Number(item.maxArea))
  ));

  return Number(row?.percent || 0);
}

function pricingState() {
  const area = priceArea();
  const retail = currentItem ? Core.catalogPrice(currentItem) : null;
  const fixedPrice = Number.isFinite(retail) && retail > 0;

  if (!area || !currentItem || !fixedPrice) {
    return {
      area,
      fixedPrice,
      catalogPrice: fixedPrice ? retail : null,
      discount: 0,
      markup: 0,
      finalUnitPrice: null,
      total: null,
      vat: null,
      requiresManagerCalculation: false
    };
  }

  const threshold = Number(flooringData.meta.pricing.smallOrderThresholdM2 || 20);
  const markup = area < threshold ? Number(flooringData.meta.pricing.defaultSmallOrderMarkupPercent || 0) : 0;
  const discount = area >= threshold ? Core.automaticVolumeDiscountPercent(flooringData, area) : 0;
  const calc = Core.calculatePricing({
    data: flooringData,
    retailPrice: retail,
    areaWithWaste: area,
    tierCoefficient: 1 - discount / 100,
    markups: markup > 0 ? [{ id: "smallOrder", name: "Малый объём", percent: markup }] : []
  });

  return {
    area,
    fixedPrice,
    catalogPrice: retail,
    discount,
    markup,
    finalUnitPrice: calc?.finalUnitPriceRaw ?? null,
    total: calc?.totalRaw ?? null,
    vat: calc?.vatRaw ?? null,
    requiresManagerCalculation: false
  };
}

function renderArea() {
  const pattern = selectedPattern();
  const area = priceArea();
  const roomArea = Number(form.roomArea.value);
  const waste = Number(form.waste.value);

  if (area !== null) {
    ui.areaWithWasteValue.textContent = `${number.format(area)} м²`;
    ui.areaWithWasteFormula.textContent =
      `${number.format(roomArea)} м² + ${number.format(waste)}% запаса`;
    return;
  }

  ui.areaWithWasteValue.textContent = "—";
  ui.areaWithWasteFormula.textContent = pattern
    ? "Укажите площадь помещения"
    : "Сначала выберите раскладку.";
}

function renderResult() {
  const calc = pricingState();

  if (currentItem?.priceStatus === "onRequest") {
    ui.resultTotal.textContent = "По запросу";
    return;
  }

  ui.resultTotal.textContent = calc.total ? money.format(calc.total) : "—";
}

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 15);
}

function formatPhone(value) {
  const rawValue = String(value || "");
  const hasLeadingPlus = rawValue.trimStart().startsWith("+");
  const digits = phoneDigits(rawValue);

  if (!digits) return hasLeadingPlus ? "+" : "";

  // Не навязываем код страны: пользователь может ввести российский,
  // белорусский или любой другой международный номер.
  return `${hasLeadingPlus ? "+" : ""}${digits}`;
}

function applyPhoneMask() {
  form.phone.value = formatPhone(form.phone.value);
}

function normalizeEmail(value) {
  const compactValue = String(value || "").replace(/\s+/g, "");
  const separatorIndex = compactValue.indexOf("@");

  if (separatorIndex < 0) return compactValue;

  const localPart = compactValue.slice(0, separatorIndex);
  const domainPart = compactValue
    .slice(separatorIndex + 1)
    .replaceAll(",", ".")
    .toLowerCase();

  return `${localPart}@${domainPart}`;
}

function applyEmailMask() {
  form.email.value = normalizeEmail(form.email.value);
}

function validateEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateAll() {
  const issues = [];
  const roomArea = Number(form.roomArea.value);
  const enteredPhoneDigits = phoneDigits(form.phone.value);
  const limits = selectedPattern()?.limits;
  const width = Number(form.boardWidth.value);
  const length = Number(form.boardLength.value);
  const sizesOpen = boardSizesVisible();
  const pattern = selectedPattern();
  const hasCustomPatternDetails = Boolean(form.customPattern.value.trim()) || fileNames(form.customPatternFile).length > 0;
  const customPatternMessage = pattern?.requiresDescription && !hasCustomPatternDetails
    ? "Добавьте описание раскладки или приложите файл."
    : "";
  const widthMessage = sizesOpen
    ? (!form.boardWidth.value
      ? "Ширина: заполните поле."
      : valueWithinLimits(width, limits.minWidth, limits.maxWidth)
        ? ""
        : `Ширина: допустимо от ${limits.minWidth} до ${limits.maxWidth}.`)
    : "";
  const lengthMessage = sizesOpen
    ? (!form.boardLength.value
      ? "Длина: заполните поле."
      : valueWithinLimits(length, limits.minLength, limits.maxLength)
        ? ""
        : `Длина: допустимо от ${limits.minLength} до ${limits.maxLength}.`)
    : "";

  const checks = [
    ["species", exactSpeciesExists() ? "" : "Выберите наименование шпона из списка.", form.species],
    ["topLayer", currentItem ? "" : "Выберите толщину лицевого шпона.", form.topLayer],
    ["pattern", form.pattern.value ? "" : "Выберите раскладку.", form.pattern],
    ["customPattern", customPatternMessage, form.customPattern],
    ["boardWidth", widthMessage, form.boardWidth],
    ["boardLength", lengthMessage, form.boardLength],
    ["roomArea", Number.isFinite(roomArea) && roomArea > 0 ? "" : "Укажите площадь помещения больше 0.", form.roomArea],
    ["finish", form.finish.value ? "" : "Выберите покрытие.", form.finish],
    ["name", form.name.value.trim() ? "" : "Укажите имя.", form.name],
    ["phone", enteredPhoneDigits.length >= 10 && enteredPhoneDigits.length <= 15 ? "" : "Укажите номер телефона: от 10 до 15 цифр.", form.phone],
    ["city", form.city.value.trim() ? "" : "Укажите город.", form.city],
    ["email", validateEmail(normalizeEmail(form.email.value)) ? "" : "Проверьте адрес электронной почты.", form.email],
    ["privacy", form.privacy.checked ? "" : "Необходимо согласие на обработку данных.", form.privacy]
  ];

  checks.forEach(([key, message, input]) => {
    setFieldError(key, message);
    if (message) issues.push({ key, input });
  });

  return issues;
}

function focusFirstIssue(issue) {
  if (!issue?.input) return;
  issue.input.focus({ preventScroll: true });
  issue.input.scrollIntoView({ behavior: "smooth", block: "center" });
}

function fileIdentity(file) {
  return [file.name, file.size, file.type, file.lastModified].join("::");
}

function getUploadedFiles(input = form.files) {
  const stored = uploadedFilesState.get(input);
  return stored ? [...stored] : [...(input.files || [])];
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

function fileNames(input = form.files) {
  return getUploadedFiles(input).map((file) => file.name);
}

function renderUploadedFiles(input, container) {
  const files = getUploadedFiles(input);
  container.replaceChildren();
  container.classList.toggle("is-hidden", !files.length);

  if (!files.length) {
    container.textContent = "Файлы не выбраны";
    return;
  }

  files.forEach((file, index) => {
    const badge = document.createElement("span");
    badge.className = "uploaded-file";

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
      if (input === form.customPatternFile) markFieldTouched("customPattern");
      renderUploadedFiles(input, container);
      renderAll();
    });

    badge.append(name, removeButton);
    container.append(badge);
  });
}

function addSelectedFiles(input, container) {
  const selectedNow = [...input.files];
  appendUploadedFiles(input, selectedNow);
  renderUploadedFiles(input, container);
}

function renderFiles() {
  addSelectedFiles(form.files, ui.selectedFiles);
}

function renderCustomPatternFiles() {
  addSelectedFiles(form.customPatternFile, ui.customPatternFileName);
  markFieldTouched("customPattern");
  renderAll();
}

function buildPayload() {
  const pattern = selectedPattern();
  const calc = pricingState();
  const coating = (flooringData?.coatings || []).find((item) => item.id === form.finish.value) || null;
  const fixedGloss = Number(flooringData?.meta?.quickCalculation?.fixedGlossPercent || 10);
  const customPattern = pattern?.id === "custom";
  const standardBaseThickness = Number(flooringData?.meta?.baseThicknessMm || 12);

  return {
    createdAt: new Date().toISOString(),
    productType: "Инженерная доска",
    calculationMode: "quick",
    material: {
      id: currentItem.id,
      typeId: currentItem.materialType,
      typeName: currentItem.materialTypeName,
      species: currentItem.species,
      topLayer: currentItem.topLayer,
      patternType: currentItem.patternType || null,
      baseMaterial: currentItem.baseMaterial || flooringData?.meta?.baseMaterial || "Влагостойкая фанера из берёзы",
      baseThicknessMm: standardBaseThickness,
      totalThicknessMm: Core.totalThickness(flooringData, currentItem, standardBaseThickness)
    },
    layout: {
      id: pattern.id,
      name: pattern.name,
      roomArea: Number(form.roomArea.value),
      wastePercent: Number(form.waste.value),
      areaWithWaste: calc.area,
      boardWidth: boardSizesVisible() && form.boardWidth.value ? Number(form.boardWidth.value) : null,
      boardLength: boardSizesVisible() && form.boardLength.value ? Number(form.boardLength.value) : null,
      customPatternDescription: customPattern ? form.customPattern.value.trim() : null,
      customPatternFiles: customPattern ? fileNames(form.customPatternFile) : []
    },
    finish: {
      id: form.finish.value,
      name: finishLabels[form.finish.value] || coating?.name || "—",
      gloss: coating?.glossRequired ? fixedGloss : null
    },
    pricing: {
      catalogPricePerM2: calc.catalogPrice,
      finalPricePerM2: calc.finalUnitPrice,
      total: calc.total,
      vat: calc.vat,
      priceStatus: currentItem.priceStatus,
      discountPercent: calc.discount,
      markupPercent: calc.markup,
      requiresManagerCalculation: false
    },
    contact: {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      city: form.city.value.trim(),
      email: normalizeEmail(form.email.value),
      comment: form.comment.value.trim(),
      callbackRequested: form.managerContact.checked,
      privacyAccepted: form.privacy.checked,
      files: fileNames()
    }
  };
}

function pdfTableLayout() {
  return {
    hLineColor: "#CFCFCB",
    vLineColor: "#CFCFCB",
    hLineWidth: () => 0.7,
    vLineWidth: () => 0.7,
    paddingLeft: () => 3,
    paddingRight: () => 3,
    paddingTop: () => 3,
    paddingBottom: () => 3
  };
}

const PDF_TABLE_OUTER_WIDTH = 555;

function fitPdfTableWidths(baseWidths, horizontalPadding, verticalLineWidth = 0.7) {
  const columnCount = baseWidths.length;
  const fixedWidth = columnCount * horizontalPadding * 2
    + (columnCount + 1) * verticalLineWidth;
  const targetColumnsWidth = PDF_TABLE_OUTER_WIDTH - fixedWidth;
  const baseTotal = baseWidths.reduce((sum, width) => sum + width, 0);
  const scale = targetColumnsWidth / baseTotal;
  const result = [];

  for (let index = 0; index < columnCount - 1; index += 1) {
    result.push(Math.round(baseWidths[index] * scale * 100) / 100);
  }

  const used = result.reduce((sum, width) => sum + width, 0);
  result.push(Math.round((targetColumnsWidth - used) * 100) / 100);
  return result;
}

function pdfDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value));
}

function calculationNumber(payload) {
  const date = new Date(payload.createdAt);
  const pad = (value) => String(value).padStart(2, "0");
  return `КР-ИД-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function pdfValue(value, fallback = "—") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function pdfBaseMaterial(value) {
  return pdfValue(value).replace(/берёзы/g, "берёзы");
}

function pdfFinishLabel(finish) {
  const name = pdfValue(finish?.name);
  return finish?.gloss === null || finish?.gloss === undefined
    ? name
    : `${name}, блеск ${number.format(finish.gloss)}%`;
}

function compoundPdfCell(mainValue, details = []) {
  const visibleDetails = details.filter((item) => {
    const value = String(item?.value ?? "").trim();
    return value && value !== "—";
  });

  const stack = [
    { text: pdfValue(mainValue), bold: true, fontSize: 5.3, lineHeight: 1.03 }
  ];

  if (visibleDetails.length) {
    stack.push({
      canvas: [{ type: "line", x1: 0, y1: 0, x2: 32, y2: 0, lineWidth: 0.6, lineColor: "#BEBEBA" }],
      margin: [0, 2, 0, 2]
    });

    visibleDetails.forEach((item) => {
      stack.push({
        text: [
          { text: `${item.label}: `, color: "#6B6B68" },
          { text: String(item.value), color: "#202020" }
        ],
        fontSize: 4.5,
        lineHeight: 1.03,
        margin: [0, 0, 0, 1]
      });
    });
  }

  return { stack };
}

function createPdfDocument(payload) {
  const baseThickness = Number(payload.material.baseThicknessMm);
  const overallThickness = Number(payload.material.totalThicknessMm);
  const pricePerM2 = payload.pricing.finalPricePerM2 ? money.format(payload.pricing.finalPricePerM2) : "По запросу";
  const total = payload.pricing.total ? money.format(payload.pricing.total) : "По запросу";
  const vat = payload.pricing.vat ? money.format(payload.pricing.vat) : "—";
  const clientFiles = payload.contact.files.length ? payload.contact.files.join(", ") : "";
  const customLayout = payload.layout.id === "custom";
  const angle = payload.layout.id === "french_herringbone" ? "Уточняется менеджером" : "";
  const layoutFiles = customLayout ? payload.layout.customPatternFiles.join(", ") : "";
  const layoutDescription = customLayout ? payload.layout.customPatternDescription : "";
  const calcNumber = calculationNumber(payload);

  const clientBody = [[
    {
      stack: [
        { text: "Имя", color: "#666663" },
        { text: pdfValue(payload.contact.name), bold: true, margin: [0, 4, 0, 0] }
      ]
    },
    {
      stack: [
        { text: "Телефон", color: "#666663" },
        { text: pdfValue(payload.contact.phone), bold: true, margin: [0, 4, 0, 0] }
      ]
    },
    {
      stack: [
        { text: "Город", color: "#666663" },
        { text: pdfValue(payload.contact.city), bold: true, margin: [0, 4, 0, 0] }
      ]
    },
    {
      stack: [
        { text: "Email", color: "#666663" },
        { text: pdfValue(payload.contact.email), bold: true, margin: [0, 4, 0, 0] }
      ]
    },
    {
      stack: [
        { text: "Комментарий", color: "#666663" },
        { text: pdfValue(payload.contact.comment), bold: true, margin: [0, 4, 0, 0] }
      ]
    },
    {
      stack: [
        { text: "Приложенные файлы", color: "#666663" },
        { text: pdfValue(clientFiles), bold: true, margin: [0, 4, 0, 0] }
      ]
    }
  ]];

  const productHeader = [
    "№ П/П",
    "Основа",
    "Толщина основы",
    "Толщина лицевого шпона",
    "Общая толщина доски",
    "Наименование шпона",
    "Ширина доски",
    "Длина ламелей",
    "Итого к расчёту — количество м²",
    "Раскладка доски",
    "Покрытие"
  ].map((text) => ({ text, style: "tableHeader", alignment: "center" }));

  const productRow = [
    { text: "1", bold: true, alignment: "center", fontSize: 5.2 },
    compoundPdfCell(pdfBaseMaterial(payload.material.baseMaterial || flooringData?.meta?.baseMaterial || "Влагостойкая фанера из берёзы")),
    compoundPdfCell(Number.isFinite(baseThickness) ? `${number.format(baseThickness)} мм` : "—"),
    compoundPdfCell(payload.material.topLayer),
    compoundPdfCell(Number.isFinite(overallThickness) ? `${number.format(overallThickness)} мм` : "—"),
    compoundPdfCell(payload.material.species, [
      { label: "Тип шпона", value: payload.material.typeName },
      { label: "Тип рисунка", value: payload.material.patternType },
      { label: "Сортировка", value: currentItem?.sorting || flooringData?.meta?.sorting },
      { label: "Тип соединения", value: currentItem?.connection || flooringData?.meta?.connection }
    ]),
    compoundPdfCell(payload.layout.boardWidth ? `${number.format(payload.layout.boardWidth)} мм` : "—"),
    compoundPdfCell(payload.layout.boardLength ? `${number.format(payload.layout.boardLength)} мм` : "—"),
    compoundPdfCell(`${number.format(payload.layout.areaWithWaste)} м²`, [
      { label: "Доска без отходов", value: `${number.format(payload.layout.roomArea)} м²` },
      { label: "Процент отходов", value: `${number.format(payload.layout.wastePercent)}%` }
    ]),
    compoundPdfCell(payload.layout.name, [
      { label: "Угол торцевого реза", value: angle },
      { label: "Описание по ТЗ", value: layoutDescription },
      { label: "Файлы раскладки по ТЗ", value: layoutFiles }
    ]),
    compoundPdfCell(pdfFinishLabel(payload.finish))
  ];

  return {
    pageSize: "A4",
    pageOrientation: "portrait",
    pageMargins: [20, 18, 20, 24],
    defaultStyle: {
      font: "Roboto",
      fontSize: 6.2,
      color: "#202020"
    },
    styles: {
      logo: { fontSize: 11.5, bold: true, characterSpacing: 1.2 },
      requisites: { fontSize: 5.2, color: "#555552", lineHeight: 1.05 },
      documentType: { fontSize: 12.5, bold: true, alignment: "center", margin: [0, 4, 0, 1] },
      documentSubtitle: { fontSize: 7.2, alignment: "center", color: "#5D5D5A", margin: [0, 0, 0, 5] },
      meta: { fontSize: 5.6, color: "#555552" },
      sectionTitle: { fontSize: 8, bold: true, margin: [0, 6, 0, 3] },
      tableHeader: { fontSize: 4.4, bold: true, color: "#202020" },
      priceLabel: { fontSize: 5.7, color: "#666663" },
      priceValue: { fontSize: 8.2, bold: true },
      totalValue: { fontSize: 11.5, bold: true },
      disclaimer: { fontSize: 5.3, color: "#5F5F5C", lineHeight: 1.08 },
      infoTitle: { fontSize: 8.2, bold: true, margin: [0, 7, 0, 4] },
      infoText: { fontSize: 5.4, lineHeight: 1.08, color: "#202020" },
      infoSmall: { fontSize: 5.2, lineHeight: 1.06, color: "#353533" },
      infoLead: { fontSize: 5.8, bold: true, lineHeight: 1.08 }
    },
    footer(currentPage, pageCount) {
      return {
        columns: [
          { text: "WOODSTOCK · Предварительная спецификация", alignment: "left" },
          { text: `${currentPage} / ${pageCount}`, alignment: "right" }
        ],
        margin: [20, 5, 20, 0],
        fontSize: 5,
        color: "#777774"
      };
    },
    content: [
      {
        columnGap: 8,
        columns: [
          {
            width: 78,
            text: "WOODSTOCK",
            style: "logo",
            noWrap: true
          },
          {
            width: "*",
            text: [
              "АО «Вудсток»\n",
              "141044, Московская область, г.о. Мытищи, д. Грибки, Дмитровское ш., стр. 63А\n",
              "ИНН 7714659391 · КПП 502901001 · ОГРН 5067746131130\n",
              "+7 (495) 617-17-99 · info@wood-s.com · woodstock.su"
            ],
            style: "requisites"
          },
          {
            width: 105,
            stack: [
              { text: `Дата: ${pdfDate(payload.createdAt)}`, style: "meta", alignment: "right" },
              { text: `Номер расчёта: ${calcNumber}`, style: "meta", alignment: "right", margin: [0, 3, 0, 0] }
            ]
          }
        ]
      },
      { text: "ПРЕДВАРИТЕЛЬНАЯ СПЕЦИФИКАЦИЯ", style: "documentType" },
      { text: "Краткий расчёт инженерной доски", style: "documentSubtitle" },
      { text: "Клиент", style: "sectionTitle" },
      {
        table: {
          widths: fitPdfTableWidths([70, 74, 51, 80, 128, 109], 3),
          body: clientBody
        },
        layout: pdfTableLayout()
      },
      { text: "Изделие", style: "sectionTitle" },
      {
        table: {
          headerRows: 1,
          widths: fitPdfTableWidths([15, 41, 32, 35, 36, 75, 32, 35, 62, 72, 65], 2.2),
          body: [productHeader, productRow],
          dontBreakRows: true
        },
        layout: {
          ...pdfTableLayout(),
          paddingLeft: () => 2.2,
          paddingRight: () => 2.2,
          fillColor(rowIndex) {
            return rowIndex === 0 ? "#F0F0ED" : null;
          }
        }
      },
      { text: "Ориентировочная стоимость", style: "sectionTitle" },
      {
        table: {
          widths: fitPdfTableWidths([251, 123, 138], 6),
          body: [[
            {
              stack: [
                { text: "Расчётная цена за м² с НДС", style: "priceLabel" },
                { text: pricePerM2, style: "priceValue", margin: [0, 4, 0, 0] }
              ]
            },
            {
              stack: [
                { text: "Итого с НДС", style: "priceLabel", alignment: "right" },
                { text: total, style: "totalValue", alignment: "right", margin: [0, 3, 0, 0] }
              ]
            },
            {
              stack: [
                { text: "В том числе НДС 22%", style: "priceLabel", alignment: "right" },
                { text: vat, style: "priceValue", alignment: "right", margin: [0, 4, 0, 0] }
              ]
            }
          ]]
        },
        layout: {
          hLineColor: "#CFCFCB",
          vLineColor: "#CFCFCB",
          hLineWidth: () => 0.7,
          vLineWidth: () => 0.7,
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 6,
          paddingBottom: () => 6
        }
      },
      {
        text: "Расчёт является предварительным и не является публичной офертой.",
        style: "disclaimer",
        margin: [0, 6, 0, 0]
      },
      {
        text: "ИНФОРМАЦИЯ ОБ ИНЖЕНЕРНОЙ ДОСКЕ WOODSTOCK",
        style: "infoTitle"
      },
      {
        table: {
          widths: ["*"],
          body: [[{
            text: "Срок поставки: 1,5 месяца с момента 100% предоплаты и утверждения спецификации.",
            style: "infoLead",
            margin: [8, 6, 8, 6]
          }]]
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          fillColor: () => "#FFF6A6",
          paddingLeft: () => 0,
          paddingRight: () => 0,
          paddingTop: () => 0,
          paddingBottom: () => 0
        },
        margin: [0, 0, 0, 2]
      },
      {
        ul: [
          {
            text: [
              { text: "Сортировка Select+. ", bold: true },
              "Заказчику предоставляем возможность выбрать пачки шпона и цвет, которые будут на напольном покрытии."
            ]
          },
          "Дерево — это натуральный материал, поэтому некоторые вариации в цвете, тоне и текстуре допустимы. Их интенсивность зависит от природных характеристик определенных пород древесины, выбранных пачек шпона заказчиком и дополнительно подчеркивает натуральность материала.",
          "Лицевой шпон инженерной доски WOODSTOCK изготавливается из ценных пород древесины, выбранных заказчиком, и дополнен внутренними слоями пород, гармонично сочетающихся по цвету и обладающих необходимой твердостью для применения в напольных покрытиях.",
          { text: "Инструкция по монтажу и эксплуатации инженерной доски WOODSTOCK", bold: true }
        ],
        style: "infoText",
        margin: [7, 0, 0, 5]
      },
      {
        stack: [
          { text: "Инженерная доска WOODSTOCK: Пол, который не требует циклёвки!", bold: true, margin: [0, 0, 0, 2] },
          { text: "Её уникальность — в лицевом слое из натурального шпона, который имеет однородный цвет на всю глубину, в отличие от полов с поверхностной тонировкой, которые со временем стираются.", margin: [0, 0, 0, 2] },
          { text: "Царапины на инженерной доске WOODSTOCK малозаметны. Их легко замаскировать, не прибегая к сложному ремонту и реставрации.", margin: [0, 0, 0, 2] },
          { text: "Запатентованная многослойная структура лицевого шпона не только обеспечивает идеальный внешний вид, но и гарантирует высочайшую устойчивость к деформациям, влаге и перепадам температур.", margin: [0, 0, 0, 2] },
          { text: "Срок службы инженерной доски WOODSTOCK — не менее 25 лет!", bold: true }
        ],
        style: "infoText",
        margin: [0, 0, 0, 6]
      },
      {
        columns: [
          {
            width: "*",
            stack: [
              { text: "С уважением,", margin: [0, 0, 0, 3] },
              { text: "Кудрявцев Николай", bold: true },
              { text: "Руководитель направления" },
              { text: "АО «Вудсток»", margin: [0, 0, 0, 5] },
              { text: "+7 (495) 617-17-99 доб. 1367" },
              { text: "+7 (926) 776-00-91" },
              { text: "kudryavcev@wood-s.com" },
              { text: "woodstock.su" }
            ],
            style: "infoSmall"
          },
          {
            width: 165,
            stack: [
              { text: "WOODSTOCK Москва-Север", bold: true },
              { text: "141044, Московская обл., г.о. Мытищи, д. Грибки, Дмитровское ш., стр. 63А", margin: [0, 3, 0, 0] }
            ],
            style: "infoSmall"
          }
        ]
      }
    ]
  };
}

function downloadSpecification(payload) {
  if (typeof window.pdfMake === "undefined") {
    ui.saveStatus.textContent = "Не удалось загрузить библиотеку PDF. Проверьте подключение к интернету и обновите страницу.";
    return false;
  }

  window.pdfMake
    .createPdf(createPdfDocument(payload))
    .download("woodstock-flooring-specification.pdf");

  return true;
}

function openDownloadModal() {
  if (!ui.downloadModal) return;

  if (typeof ui.downloadModal.showModal === "function") {
    ui.downloadModal.showModal();
  } else {
    ui.downloadModal.setAttribute("open", "");
  }
}

function closeDownloadModal() {
  if (!ui.downloadModal) return;

  if (typeof ui.downloadModal.close === "function") {
    ui.downloadModal.close();
  } else {
    ui.downloadModal.removeAttribute("open");
  }
}

function submitCalculation() {
  submitAttempted = true;
  const issues = validateAll();

  if (issues.length) {
    ui.saveStatus.textContent = `Заполните обязательные поля: ${issues.map((issue) => {
      const labels = {
        species: "наименование шпона",
        topLayer: "толщина лицевого шпона",
        pattern: "раскладка",
        customPattern: "описание раскладки или файл",
        boardWidth: "ширина доски",
        boardLength: "длина ламелей",
        roomArea: "площадь помещения",
        finish: "покрытие",
        name: "имя",
        phone: "телефон",
        city: "город",
        email: "email",
        privacy: "согласие"
      };
      return labels[issue.key];
    }).join(", ")}.`;
    focusFirstIssue(issues[0]);
    return;
  }

  const payload = buildPayload();
  try {
    localStorage.setItem("woodstockQuickFlooringCalculation", JSON.stringify(payload));
  } catch (error) {
    console.warn("Не удалось сохранить расчёт локально:", error);
  }

  const downloaded = downloadSpecification(payload);
  ui.saveStatus.textContent = downloaded
    ? "Спецификация и расчёт скачаны в PDF."
    : ui.saveStatus.textContent;

  if (downloaded) openDownloadModal();
}

function renderAll() {
  renderArea();
  renderResult();
  ui.finishHint?.classList.toggle("is-hidden", form.finish.value !== "uv_lacquer");
  validateBoardSizeFields();

  const width = Number(form.boardWidth.value);
  const managerCheckWidth = Number(
    flooringData?.meta?.generalDimensions?.managerCheckWidth
  );

  ui.boardWidthWarning.classList.toggle(
    "is-hidden",
    !boardSizesVisible() ||
      !width ||
      !Number.isFinite(managerCheckWidth) ||
      width <= managerCheckWidth
  );

  if (submitAttempted) validateAll();
}

async function init() {
  setUploadedFiles(form.customPatternFile, getUploadedFiles(form.customPatternFile));
  setUploadedFiles(form.files, getUploadedFiles(form.files));
  try {
    const response = await fetch("../../data/flooring.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    flooringData = await response.json();
    const quickCoatings = Core.quickCoatingOptions(flooringData);
    fillOptions(
      form.finish,
      quickCoatings.map((item) => ({ value: item.id, label: item.name })),
      "Выберите покрытие"
    );
    quickCoatings.forEach((item) => { finishLabels[item.id] = item.name; });
    fillTopLayerOptions();
    fillPatterns();
    renderAll();
  } catch (error) {
    console.error("Не удалось загрузить данные инженерной доски:", error);
    ui.saveStatus.textContent = "Не удалось загрузить каталог. Обновите страницу или обратитесь к менеджеру.";
    ui.getCalculationButton.disabled = true;
  }

  form.species.addEventListener("input", () => {
    currentItem = null;
    updateSpeciesClearButton();
    renderSpeciesSuggestions();

    if (exactSpeciesExists()) {
      applySpeciesSelection();
    } else {
      clearProductSelection();
      renderAll();
    }
  });

  form.species.addEventListener("focus", renderSpeciesSuggestions);
  form.species.addEventListener("blur", () => setTimeout(closeSpeciesSuggestions, 120));

  form.speciesClear.addEventListener("click", () => {
    form.species.value = "";
    form.materialType.value = "";
    clearProductSelection();
    updateSpeciesClearButton();
    closeSpeciesSuggestions();
    form.species.focus();
    renderAll();
  });

  form.topLayer.addEventListener("change", () => {
    if (document.activeElement === form.species) renderSpeciesSuggestions();
    applyTopLayerSelection();
  });
  form.pattern.addEventListener("change", applyPattern);
  form.customPattern.addEventListener("input", () => {
    markFieldTouched("customPattern");
    renderAll();
  });
  form.customPatternFile.addEventListener("change", renderCustomPatternFiles);
  form.boardSizeToggle.addEventListener("click", toggleBoardSizes);
  form.boardWidth.addEventListener("input", renderAll);
  form.boardLength.addEventListener("input", renderAll);

  form.boardWidth.addEventListener("blur", () => {
    const limits = selectedPattern()?.limits;

    if (limits) {
      clampOnBlur(
        form.boardWidth,
        "boardWidth",
        limits.minWidth,
        limits.maxWidth,
        "Ширина"
      );
    }
  });

  form.boardLength.addEventListener("blur", () => {
    const limits = selectedPattern()?.limits;

    if (limits) {
      clampOnBlur(
        form.boardLength,
        "boardLength",
        limits.minLength,
        limits.maxLength,
        "Длина"
      );
    }
  });
  form.roomArea.addEventListener("input", renderAll);
  form.finish.addEventListener("change", renderAll);
  form.files.addEventListener("change", renderFiles);
  form.phone.addEventListener("input", applyPhoneMask);
  form.phone.addEventListener("blur", applyPhoneMask);
  form.email.addEventListener("input", applyEmailMask);
  form.email.addEventListener("blur", applyEmailMask);
  ui.getCalculationButton.addEventListener("click", submitCalculation);
  ui.downloadModalClose?.addEventListener("click", closeDownloadModal);
  ui.downloadModal?.addEventListener("click", (event) => {
    if (event.target === ui.downloadModal) closeDownloadModal();
  });

  [
    form.species,
    form.topLayer,
    form.pattern,
    form.boardWidth,
    form.boardLength,
    form.roomArea,
    form.finish,
    form.name,
    form.phone,
    form.city,
    form.email,
    form.privacy
  ].forEach((input) => {
    input.addEventListener("change", () => {
      if (submitAttempted) validateAll();
    });
    input.addEventListener("input", () => {
      if (submitAttempted) validateAll();
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#speciesField")) closeSpeciesSuggestions();
  });
}

init();