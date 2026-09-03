(() => {
  "use strict";

  const DATA_URL = "../../data/panels.json";
  const Core = window.WoodstockPanelsCore;
  // Общая спецификация: инженерная доска уже сохраняется в этот же ключ.
  const SPEC_STORAGE_KEY = "woodstockDetailedSpecification";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const el = (id) => document.getElementById(id);

  const form = {
    root: el("panelForm"),
    baseSelect: el("baseSelect"), baseThicknessSelect: el("baseThicknessSelect"),
    manualBasePriceFields: el("manualBasePriceFields"), manualBasePriceInput: el("manualBasePriceInput"), manualBasePriceError: el("manualBasePriceError"),
    heavyPlateWarning: el("heavyPlateWarning"),

    veneerTypeSelect: el("veneerTypeSelect"), veneerAInput: el("veneerAInput"), veneerASuggestions: el("veneerASuggestions"), veneerAClear: el("veneerAClear"), veneerAError: el("veneerAError"),
    veneerThicknessField: el("veneerThicknessField"), veneerThicknessSelect: el("veneerThicknessSelect"), veneerThicknessInput: el("veneerThicknessInput"), veneerThicknessError: el("veneerThicknessError"),
    selectionSurchargeBlock: el("selectionSurchargeBlock"), selectionSurchargeOptions: el("selectionSurchargeOptions"),
    veneeredSidesSelect: el("veneeredSidesSelect"), reverseSideField: el("reverseSideField"), reverseSideSelect: el("reverseSideSelect"), reverseSideHint: el("reverseSideHint"),
    veneerBFields: el("veneerBFields"), veneerBModeSelect: el("veneerBModeSelect"), veneerBSearchField: el("veneerBSearchField"), veneerBInput: el("veneerBInput"), veneerBSuggestions: el("veneerBSuggestions"), veneerBClear: el("veneerBClear"), veneerBError: el("veneerBError"), veneerBCutField: el("veneerBCutField"), veneerBCutSelect: el("veneerBCutSelect"),
    layoutSelect: el("layoutSelect"), layoutError: el("layoutError"), veneerCutField: el("veneerCutField"), veneerCutSelect: el("veneerCutSelect"), mixMatchWarning: el("mixMatchWarning"), layoutTzFields: el("layoutTzFields"), layoutTzComment: el("layoutTzComment"), layoutTzFiles: el("layoutTzFiles"), layoutTzFileNames: el("layoutTzFileNames"), layoutTzError: el("layoutTzError"),

    sizeRows: el("sizeRows"), sizeBlockError: el("sizeBlockError"), addSizeRowBtn: el("addSizeRowBtn"),

    edgeModeSelect: el("edgeModeSelect"), attachedEdgeFields: el("attachedEdgeFields"), separateEdgeFields: el("separateEdgeFields"), edgeCommentField: el("edgeCommentField"), edgeCommentInput: el("edgeCommentInput"), edgeSidesSelect: el("edgeSidesSelect"), edgeThicknessSelect: el("edgeThicknessSelect"), edgeMaterialInput: el("edgeMaterialInput"), edgeMaterialSuggestions: el("edgeMaterialSuggestions"), edgeMaterialClear: el("edgeMaterialClear"), edgeMaterialError: el("edgeMaterialError"), edgeBevelSelect: el("edgeBevelSelect"), attachedEdgeMetersSummary: el("attachedEdgeMetersSummary"), separateEdgeMetersInput: el("separateEdgeMetersInput"), separateEdgeMetersError: el("separateEdgeMetersError"), separateEdgeThicknessSelect: el("separateEdgeThicknessSelect"), separateEdgeMaterialInput: el("separateEdgeMaterialInput"), separateEdgeMaterialSuggestions: el("separateEdgeMaterialSuggestions"), separateEdgeMaterialClear: el("separateEdgeMaterialClear"), separateEdgeMaterialError: el("separateEdgeMaterialError"),

    calibrationFields: el("calibrationFields"), calibrationSelect: el("calibrationSelect"), calibrationTargetField: el("calibrationTargetField"), calibrationTargetInput: el("calibrationTargetInput"), calibrationTargetError: el("calibrationTargetError"), calibrationDepthField: el("calibrationDepthField"), calibrationDepthInput: el("calibrationDepthInput"), calibrationDepthError: el("calibrationDepthError"),
    techVeneeringSummary: el("techVeneeringSummary"), techSandingSummary: el("techSandingSummary"), techCuttingSummary: el("techCuttingSummary"), techGluingRow: el("techGluingRow"), techGluingSummary: el("techGluingSummary"), techCalibrationRow: el("techCalibrationRow"), techCalibrationSummary: el("techCalibrationSummary"),
    finishSelect: el("finishSelect"), toningField: el("toningField"), toningSelect: el("toningSelect"), toningSidesField: el("toningSidesField"), toningSidesSelect: el("toningSidesSelect"), finishParameterFields: el("finishParameterFields"), lacquerParameterFields: el("lacquerParameterFields"), lacquerTypeSelect: el("lacquerTypeSelect"), lacquerGlossSelect: el("lacquerGlossSelect"), lacquerProcessField: el("lacquerProcessField"), lacquerProcessSelect: el("lacquerProcessSelect"), enamelParameterFields: el("enamelParameterFields"), enamelVariantSelect: el("enamelVariantSelect"), finishCommonFields: el("finishCommonFields"), finishSidesField: el("finishSidesField"), finishSidesSelect: el("finishSidesSelect"), isolatorField: el("isolatorField"), isolatorSelect: el("isolatorSelect"), finishDetailsToggle: el("finishDetailsToggle"), finishDetailsFields: el("finishDetailsFields"), finishParamsInput: el("finishParamsInput"), finishFilesInput: el("finishFilesInput"), finishFileNames: el("finishFileNames"), positionFinishToggle: el("positionFinishToggle"), positionFinishOverrides: el("positionFinishOverrides"),

    clientConditionSelect: el("clientConditionSelect"), clientConditionNote: el("clientConditionNote"), mdfPriceOptions: el("mdfPriceOptions"), mdfSelectionField: el("mdfSelectionField"), mdfSelectionCheckbox: el("mdfSelectionCheckbox"), mdfVolumeConditionField: el("mdfVolumeConditionField"), mdfVolumeConditionSelect: el("mdfVolumeConditionSelect"), manualDiscountInput: el("manualDiscountInput"),
    finalPriceValue: el("finalPriceValue"), finalPriceNote: el("finalPriceNote"), finalPricePerM2Label: el("finalPricePerM2Label"), finalPricePerM2Value: el("finalPricePerM2Value"), finalPricePerPieceLabel: el("finalPricePerPieceLabel"), finalPricePerPieceValue: el("finalPricePerPieceValue"), finalVatValue: el("finalVatValue"), priceAdjustmentsBlock: el("priceAdjustmentsBlock"), priceAdjustmentsList: el("priceAdjustmentsList"), manualBasePriceSummary: el("manualBasePriceSummary"), manualBasePriceSummaryValue: el("manualBasePriceSummaryValue"),
    veneerManualPriceBlock: el("veneerManualPriceBlock"), veneerAAutoPriceValue: el("veneerAAutoPriceValue"), veneerAPriceToggle: el("veneerAPriceToggle"), veneerAPriceField: el("veneerAPriceField"), veneerAPriceLabel: el("veneerAPriceLabel"), veneerPriceInput: el("veneerPriceInput"), veneerAPriceReset: el("veneerAPriceReset"), veneerAPriceError: el("veneerAPriceError"), veneerAConditionField: el("veneerAConditionField"), veneerAConditionSelect: el("veneerAConditionSelect"), veneerAConditionError: el("veneerAConditionError"), veneerAFinalPriceField: el("veneerAFinalPriceField"), veneerAFinalPriceValue: el("veneerAFinalPriceValue"), veneerBManualPriceControl: el("veneerBManualPriceControl"), veneerBAutoPriceValue: el("veneerBAutoPriceValue"), veneerBPriceToggle: el("veneerBPriceToggle"), veneerBPriceField: el("veneerBPriceField"), veneerBPriceLabel: el("veneerBPriceLabel"), veneerBPriceInput: el("veneerBPriceInput"), veneerBPriceReset: el("veneerBPriceReset"), veneerBPriceError: el("veneerBPriceError"), veneerBConditionField: el("veneerBConditionField"), veneerBConditionSelect: el("veneerBConditionSelect"), veneerBConditionError: el("veneerBConditionError"), veneerBFinalPriceField: el("veneerBFinalPriceField"), veneerBFinalPriceValue: el("veneerBFinalPriceValue"),

    commentInput: el("commentInput"), filesInput: el("filesInput"), selectedFiles: el("selectedFiles"),
    specCharacteristics: el("specCharacteristics"), specSizes: el("specSizes"), specPricePerM2Label: el("specPricePerM2Label"), specPricePerM2: el("specPricePerM2"), specPricePerPieceLabel: el("specPricePerPieceLabel"), specPricePerPiece: el("specPricePerPiece"), specTotal: el("specTotal"), specVat: el("specVat"), addToSpecButton: el("addToSpecButton"), saveStatus: el("saveStatus")
  };

  let data = null;
  let selectedVeneerAGroup = null;
  let selectedVeneerA = null;
  let selectedVeneerBGroup = null;
  let selectedVeneerB = null;
  let selectedAttachedEdgeVeneer = null;
  let selectedSeparateEdgeVeneer = null;
  let attachedEdgeMaterialAuto = true;
  let separateEdgeMaterialAuto = true;
  let veneerAPriceAuto = true;
  let veneerBPriceAuto = true;
  const veneerConditionChoices = { A: "", B: "" };
  let activeSizeRow = null;
  let lastCalculation = null;
  let positionFinishOverridesEnabled = false;
  let globalFinishSidesManual = false;
  const positionFinishState = new Map();
  const uploadedFilesState = new WeakMap();
  const selectedVeneerSelectionKeys = new Set();
  const priceAdjustmentOverrides = new Map();

  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const num = Core.parseNumber;
  const round = Core.round;
  const money = Core.formatMoney;
  const qty = (value, unit) => Number.isFinite(value) ? `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value)} ${unit}` : "—";
  const parseThicknessComposition = Core.parseThicknessComposition;

  function selectedBase() { return data?.bases.find((x) => x.id === form.baseSelect.value) || null; }
  function currentBaseThicknessRaw() {
    return form.baseThicknessSelect.value;
  }

  function baseThicknessOptions(base) {
    if (!base) return [];
    const own = data?.thicknesses?.[base.id];
    return Array.isArray(own) ? own : [];
  }

  function normalizeThicknessKey(raw) {
    return String(raw ?? "").trim().replace(/\s+/g, "").replace(/,/g, ".");
  }

  function selectedBasePriceMode() {
    const base = selectedBase();
    const key = normalizeThicknessKey(currentBaseThicknessRaw());
    if (!base || !key) return null;
    return data?.baseThicknessPriceModes?.[base.id]?.[key] || "production";
  }

  function manualBasePriceRequired() {
    return selectedBasePriceMode() === "production";
  }

  function sanitizeManualBasePriceValue(raw) {
    let result = "";
    let hasSeparator = false;
    for (const char of String(raw ?? "")) {
      if (/\d/.test(char)) {
        result += char;
        continue;
      }
      if ((char === "," || char === ".") && !hasSeparator) {
        result += char;
        hasSeparator = true;
      }
    }
    return result;
  }

  function manualBasePriceValue() {
    const raw = String(form.manualBasePriceInput.value || "").trim();
    if (!raw || !/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(raw)) return null;
    const value = Number(raw.replace(",", "."));
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function setManualBasePriceError(show) {
    form.manualBasePriceError.classList.toggle("is-hidden", !show);
    form.manualBasePriceInput.setAttribute("aria-invalid", show ? "true" : "false");
  }

  function resetManualBasePricingInputs() {
    form.manualBasePriceInput.value = "";
    setManualBasePriceError(false);
  }

  function updateManualBasePriceUI() {
    const show = manualBasePriceRequired();
    form.manualBasePriceFields.classList.toggle("is-hidden", !show);
    if (!show) resetManualBasePricingInputs();
  }

  function selectedLayout() { return data?.layouts.find((x) => x.id === form.layoutSelect.value) || null; }
  function selectedFinish() { return data?.finishOptions.find((x) => x.id === form.finishSelect.value) || null; }

  const ALLOWED_FINISH_IDS = ["none", "lacquer", "enamel", "custom"];

  function allowedFinishOptions() {
    return (data?.finishOptions || []).filter((item) => ALLOWED_FINISH_IDS.includes(item.id));
  }

  function finishOption(id) {
    return (data?.finishOptions || []).find((item) => item.id === id) || null;
  }

  function finishAllowsIsolator(id) {
    return ["lacquer", "enamel"].includes(id);
  }

  function defaultFinishSides() {
    return Number(form.veneeredSidesSelect?.value) === 2 ? "2 стороны" : "1 сторона";
  }

  function finishSideCount(value) {
    if (String(value || "").startsWith("2")) return 2;
    if (String(value || "").startsWith("1")) return 1;
    return 0;
  }

  function availableLacquerProcesses(sides) {
    return (data?.finishParameters?.lacquerProcesses || []).filter((item) => Number.isFinite(num(item?.rates?.[sides])));
  }

  function syncGlobalFinishSidesWithVeneer() {
    if (globalFinishSidesManual || !form.finishSidesSelect) return;
    const value = defaultFinishSides();
    if ([...form.finishSidesSelect.options].some((option) => option.value === value)) form.finishSidesSelect.value = value;
  }

  function syncPositionFinishSidesWithVeneer() {
    const value = defaultFinishSides();
    positionFinishState.forEach((state, rowId) => {
      if (!state?.sidesManual) positionFinishState.set(rowId, { ...state, sides: value });
    });
  }

  function finishNeedsDetails(id) {
    return id === "custom";
  }

  function finishSummary(config) {
    if (!config || config.finishId === "none") return "Без покрытия";
    const option = finishOption(config.finishId);
    const parts = [option?.name || "Финиш"];
    if (config.finishId === "lacquer") {
      const type = data?.finishParameters?.lacquerTypes?.find((item) => item.id === config.lacquerType);
      if (type?.name) parts.push(type.name);
      if (config.lacquerGloss) parts.push(config.lacquerGloss);
      if (config.lacquerType === "acrylic") {
        const process = data?.finishParameters?.lacquerProcesses?.find((item) => item.id === config.lacquerProcess);
        if (process?.name) parts.push(process.name);
      }
    }
    if (config.finishId === "enamel" && config.enamelVariant) parts.push(config.enamelVariant);
    if (config.sides && finishAllowsIsolator(config.finishId)) parts.push(config.sides);
    if (config.toning === "yes") parts.push(`тонировка: ${config.toningSides || "1 сторона"}`);
    if (config.isolator && config.isolator !== "no" && finishAllowsIsolator(config.finishId)) parts.push(`изолятор: ${config.isolator}`);
    return parts.join(" · ");
  }

  function finishRateInfo(config) {
    if (!config || config.finishId === "none") return { rate: 0, note: "" };
    if (config.finishId === "lacquer") {
      if (config.lacquerType !== "acrylic") return null;
      const process = data?.finishParameters?.lacquerProcesses?.find((item) => item.id === config.lacquerProcess);
      const rate = num(process?.rates?.[config.sides]);
      if (!Number.isFinite(rate)) return null;
      return { rate, note: `Акрил · ${process.name} · ${config.sides}` };
    }
    if (config.finishId === "enamel") {
      const rate = num(data?.finishRates?.enamel?.[config.enamelVariant]?.[config.sides]);
      if (!Number.isFinite(rate)) return null;
      return { rate, note: `${config.enamelVariant} · ${config.sides}` };
    }
    return null;
  }

  function currentGlobalFinishConfig() {
    return {
      finishId: form.finishSelect.value || "none",
      toning: form.toningSelect?.value || "no",
      toningSides: form.toningSidesSelect?.value || "1 сторона",
      lacquerType: form.lacquerTypeSelect.value || "",
      lacquerGloss: form.lacquerGlossSelect.value || "",
      lacquerProcess: form.lacquerProcessSelect?.value || "",
      enamelVariant: form.enamelVariantSelect.value || "",
      sides: form.finishSidesSelect.value || "",
      isolator: form.isolatorSelect.value || "no",
      comment: form.finishParamsInput.value.trim(),
      files: uploadedFileNames(form.finishFilesInput)
    };
  }

  function priceOverride(id, automaticPercent = 0) {
    const stored = priceAdjustmentOverrides.get(id);
    return Number.isFinite(stored) && stored >= 0 ? stored : automaticPercent;
  }

  function clearPriceOverrides(prefix) {
    [...priceAdjustmentOverrides.keys()].forEach((key) => {
      if (String(key).startsWith(prefix)) priceAdjustmentOverrides.delete(key);
    });
  }

  function currentSelectionMarkupRows() {
    const sel = selectedVeneerA?.selection || {};
    const labelMap = {
      length2800: "Отбор по длине 2800 мм+",
      widthQuality: "Отбор по ширине и качеству",
      length: "Отбор по длине",
      widthQualityPattern: "Отбор по ширине / качеству / рисунку"
    };
    return Object.entries(sel)
      .map(([key, value]) => ({
        key,
        automaticPercent: (num(value) || 0) * 100,
        label: labelMap[key] || key
      }))
      .filter((row) => selectedVeneerSelectionKeys.has(row.key) && row.automaticPercent > 0)
      .map((row) => ({
        ...row,
        id: `veneer-selection:${row.key}`,
        percent: priceOverride(`veneer-selection:${row.key}`, row.automaticPercent)
      }));
  }

  function currentSelectionMarkup() {
    const rows = currentSelectionMarkupRows();
    return rows.reduce((sum, row) => sum + (num(row.percent) || 0), 0) / 100;
  }

  const MAX_FACE_VENEER_THICKNESS_MM = 4.5;

  function manualVeneerThicknessValue() {
    const raw = String(form.veneerThicknessInput?.value || "").trim();
    if (!raw || !/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(raw)) return null;
    const value = Number(raw.replace(",", "."));
    return Number.isFinite(value) && value > 0 && value <= MAX_FACE_VENEER_THICKNESS_MM ? value : null;
  }

  function selectedVeneerThickness() {
    const selectValue = num(form.veneerThicknessSelect?.value);
    if (Number.isFinite(selectValue) && selectValue > 0 && selectValue <= MAX_FACE_VENEER_THICKNESS_MM) return selectValue;
    if (!form.veneerThicknessInput?.classList.contains("is-hidden") && form.veneerThicknessInput.getAttribute("aria-invalid") === "true") return null;
    return manualVeneerThicknessValue();
  }

  function sanitizeVeneerThicknessValue(raw) {
    let result = "";
    let hasSeparator = false;
    for (const char of String(raw ?? "")) {
      if (/\d/.test(char)) {
        result += char;
        continue;
      }
      if ((char === "," || char === ".") && !hasSeparator) {
        result += char;
        hasSeparator = true;
      }
    }
    return result;
  }

  function setVeneerThicknessError(message = "") {
    const field = form.veneerThicknessInput?.closest(".field");
    field?.classList.toggle("field--invalid", Boolean(message));
    form.veneerThicknessInput?.setAttribute("aria-invalid", message ? "true" : "false");
    if (form.veneerThicknessError) form.veneerThicknessError.textContent = message;
  }

  function validateManualVeneerThickness({ showEmpty = false, invalidCharactersRemoved = false } = {}) {
    if (form.veneerThicknessInput.classList.contains("is-hidden")) {
      delete form.veneerThicknessInput.dataset.invalidEntry;
      setVeneerThicknessError("");
      return true;
    }
    const invalidEntry = invalidCharactersRemoved || form.veneerThicknessInput.dataset.invalidEntry === "true";
    if (invalidEntry) {
      setVeneerThicknessError("Введите толщину числом больше 0");
      return false;
    }
    const raw = String(form.veneerThicknessInput.value || "").trim();
    if (!raw) {
      setVeneerThicknessError(showEmpty ? "Введите толщину числом больше 0" : "");
      return false;
    }
    if (!/^(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(raw)) {
      setVeneerThicknessError("Введите толщину числом больше 0");
      return false;
    }
    const value = Number(raw.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setVeneerThicknessError("Введите толщину числом больше 0");
      return false;
    }
    if (value > MAX_FACE_VENEER_THICKNESS_MM) {
      setVeneerThicknessError("Максимальная толщина лицевого шпона — 4,5 мм");
      return false;
    }
    setVeneerThicknessError("");
    return true;
  }

  const VENEER_TYPE_ORDER = { natural: 0, multi: 1, design: 2 };

  function veneerDisplayName(item) {
    return String(item?.displayName || item?.name || "").trim();
  }

  function veneerGroupKey(item) {
    return `${item?.type || ""}::${veneerDisplayName(item).toLocaleLowerCase("ru")}`;
  }

  function veneerVariants(item) {
    if (!item) return [];
    const key = veneerGroupKey(item);
    return data.veneers.filter((x) => veneerGroupKey(x) === key);
  }

  function itemThickness(item) {
    return Core.veneerThicknessFromItem(item);
  }

  function bestVeneerVariant(items) {
    return [...items].sort((a, b) => {
      const priceDiff = (num(b?.prices?.retail) || 0) - (num(a?.prices?.retail) || 0);
      if (priceDiff) return priceDiff;
      return String(a?.id || "").localeCompare(String(b?.id || ""), "ru");
    })[0] || null;
  }

  const VENEER_CUT_ORDER = { radial: 0, tangential: 1, mixed: 2 };

  function veneerCutLabel(cutId) {
    return data?.veneerCuts?.find((x) => x.id === cutId)?.name || cutId || "";
  }

  function veneerVariantsAtThickness(groupItem, thickness = selectedVeneerThickness()) {
    const variants = veneerVariants(groupItem);
    if (!Number.isFinite(thickness)) return variants;
    return variants.filter((x) => {
      const t = itemThickness(x);
      return Number.isFinite(t) && Math.abs(t - thickness) < 0.001;
    });
  }

  function bestVeneerVariantForCut(items, cutId = "") {
    if (!cutId) return bestVeneerVariant(items);
    const exact = items.filter((x) => x.veneerCut === cutId);
    if (exact.length) return bestVeneerVariant(exact);
    const cutNeutral = items.filter((x) => !x.veneerCut);
    return bestVeneerVariant(cutNeutral.length ? cutNeutral : items);
  }

  function naturalCutOptions(items) {
    return [...new Set(items.map((x) => x.veneerCut).filter(Boolean))]
      .sort((a, b) => (VENEER_CUT_ORDER[a] ?? 99) - (VENEER_CUT_ORDER[b] ?? 99));
  }

  function syncVeneerCutUI(preserve = true) {
    const group = selectedVeneerAGroup;
    const isNatural = group?.type === "natural";
    const variants = isNatural ? veneerVariantsAtThickness(group) : [];
    const cuts = naturalCutOptions(variants);
    const manualCuts = cuts.filter((cutId) => ["radial", "tangential"].includes(cutId));
    const previous = preserve ? form.veneerCutSelect.value : "";
    const layout = form.layoutSelect.value;

    form.veneerCutSelect.innerHTML = '<option value="">Выберите распил</option>';
    manualCuts.forEach((cutId) => form.veneerCutSelect.add(new Option(veneerCutLabel(cutId), cutId)));

    // MixMatch по технологии смешивает радиальный и тангенциальный распил.
    // Если в прайсе есть отдельная строка «микс», используем её; иначе берём
    // максимальную цену среди доступных вариантов, не придумывая среднюю цену.
    if (isNatural && layout === "mixmatch") {
      form.veneerCutField.classList.add("is-hidden");
      if (cuts.includes("mixed")) {
        form.veneerCutSelect.add(new Option(veneerCutLabel("mixed"), "mixed"));
        form.veneerCutSelect.value = "mixed";
        selectedVeneerA = bestVeneerVariantForCut(variants, "mixed");
      } else {
        form.veneerCutSelect.value = "";
        selectedVeneerA = bestVeneerVariant(variants);
      }
      return;
    }

    if (!isNatural || manualCuts.length < 2) {
      form.veneerCutField.classList.add("is-hidden");
      const onlyCut = manualCuts[0] || "";
      form.veneerCutSelect.value = onlyCut;
      selectedVeneerA = onlyCut ? bestVeneerVariantForCut(variants, onlyCut) : bestVeneerVariant(variants);
      return;
    }

    form.veneerCutField.classList.remove("is-hidden");
    const next = manualCuts.includes(previous) ? previous : "";
    form.veneerCutSelect.value = next;
    selectedVeneerA = next ? bestVeneerVariantForCut(variants, next) : null;
  }

  function onVeneerCutChanged() {
    const variants = veneerVariantsAtThickness(selectedVeneerAGroup);
    selectedVeneerA = bestVeneerVariantForCut(variants, form.veneerCutSelect.value);
    updateVeneerBModeLabel();
    renderSelectionSurcharges();
    syncEdgeVeneerDefaults();
    renderStandardSizes();
    recalc();
  }

  function syncVeneerBCutUI(preserve = true) {
    const group = selectedVeneerBGroup;
    const isNatural = group?.type === "natural";
    const variants = group ? veneerVariantsAtThickness(group, selectedVeneerThickness()) : [];
    const cuts = isNatural ? naturalCutOptions(variants) : [];
    const manualCuts = cuts.filter((cutId) => ["radial", "tangential"].includes(cutId));
    const previous = preserve ? form.veneerBCutSelect.value : "";

    form.veneerBCutSelect.innerHTML = '<option value="">Выберите распил</option>';
    manualCuts.forEach((cutId) => form.veneerBCutSelect.add(new Option(veneerCutLabel(cutId), cutId)));

    if (!group) {
      form.veneerBCutField.classList.add("is-hidden");
      form.veneerBCutSelect.value = "";
      selectedVeneerB = null;
      return;
    }

    if (!isNatural || manualCuts.length < 2) {
      form.veneerBCutField.classList.add("is-hidden");
      const onlyCut = manualCuts[0] || "";
      form.veneerBCutSelect.value = onlyCut;
      selectedVeneerB = onlyCut ? bestVeneerVariantForCut(variants, onlyCut) : bestVeneerVariant(variants);
      return;
    }

    form.veneerBCutField.classList.remove("is-hidden");
    const next = manualCuts.includes(previous) ? previous : "";
    form.veneerBCutSelect.value = next;
    selectedVeneerB = next ? bestVeneerVariantForCut(variants, next) : null;
  }

  function onVeneerBCutChanged() {
    const variants = veneerVariantsAtThickness(selectedVeneerBGroup, selectedVeneerThickness());
    selectedVeneerB = bestVeneerVariantForCut(variants, form.veneerBCutSelect.value);
    veneerBPriceAuto = true;
    veneerConditionChoices.B = "";
    clearPriceOverrides("veneer:B:");
    recalc();
  }

  function normalizeVeneerCategoryText(item) {
    const text = typeof item === "string"
      ? item
      : `${item?.sourceRawName || ""} ${item?.name || ""}`;
    return String(text)
      .normalize("NFKC")
      .replace(/(^|[^A-Za-zА-Яа-яЁё])([AАaа]{2})(?=$|[^A-Za-zА-Яа-яЁё])/g, (match, prefix, category) =>
        `${prefix}${category.replace(/[Аа]/g, (char) => char === "А" ? "A" : "a")}`
      );
  }

  function isFaceOnlyExtraVeneer(item) {
    const text = normalizeVeneerCategoryText(item);
    return /(?:\bAA\b|extra|экстра)/i.test(text);
  }

  function updateVeneerBModeLabel() {
    const sameOption = form.veneerBModeSelect?.querySelector('option[value="same"]');
    if (!sameOption) return;
    sameOption.textContent = isFaceOnlyExtraVeneer(selectedVeneerA || selectedVeneerAGroup)
      ? "Та же порода, категория B"
      : "Такой же, как сторона А";
  }

  function backsideBVariantFor(item) {
    if (!item || !selectedVeneerAGroup) return null;
    const thickness = itemThickness(item) ?? selectedVeneerThickness();
    const variants = veneerVariantsAtThickness(selectedVeneerAGroup, thickness);
    const bGrade = variants.filter((variant) => {
      const text = String(variant?.sourceRawName || variant?.name || "");
      return /(?:^|[\s/])B(?:[\s/]|$)/i.test(text) && !/\bAB\b/i.test(text);
    });
    return bestVeneerVariant(bGrade);
  }

  function availableVeneers(which = "A") {
    const aThickness = selectedVeneerThickness();
    const typeFilter = which === "A" ? form.veneerTypeSelect.value : "";
    const grouped = new Map();

    data.veneers.forEach((item) => {
      if (typeFilter && item.type !== typeFilter) return;
      if (which === "B" && Number.isFinite(aThickness)) {
        const t = itemThickness(item);
        if (!Number.isFinite(t) || Math.abs(t - aThickness) >= 0.001) return;
      }
      const key = veneerGroupKey(item);
      const current = grouped.get(key);
      if (!current) grouped.set(key, item);
      else {
        const preferred = bestVeneerVariant([current, item]);
        grouped.set(key, preferred);
      }
    });

    return [...grouped.values()].sort((a, b) => {
      const typeDiff = (VENEER_TYPE_ORDER[a.type] ?? 99) - (VENEER_TYPE_ORDER[b.type] ?? 99);
      if (typeDiff) return typeDiff;
      return veneerDisplayName(a).localeCompare(veneerDisplayName(b), "ru", { sensitivity: "base" });
    });
  }

  function normalizeVeneerLookup(value) {
    return String(value || "").trim().toLocaleLowerCase("ru-RU");
  }

  function exactVeneerMatch(items, value) {
    const normalized = normalizeVeneerLookup(value);
    if (!normalized) return null;
    return items.find((item) => normalizeVeneerLookup(veneerDisplayName(item)) === normalized) || null;
  }

  function setAutocompleteError(input, error, message = "") {
    const field = input.closest(".field");
    field?.classList.toggle("field--invalid", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message;
  }

  function setupAutocomplete({ input, menu, clear, error, getItems, getSelected, onSelect, onClear, onInput }) {
    const render = () => {
      const q = normalizeVeneerLookup(input.value);
      const items = getItems().filter((x) => !q || normalizeVeneerLookup(veneerDisplayName(x)).includes(q));
      menu.innerHTML = items.length
        ? items.map((item) => `<button class="autocomplete-option" type="button" data-id="${esc(item.id)}" role="option">${esc(veneerDisplayName(item))}</button>`).join("")
        : '<div class="autocomplete-empty">Ничего не найдено</div>';
      menu.classList.remove("is-hidden");
      input.setAttribute("aria-expanded", "true");
    };

    const commitExactMatch = () => {
      const items = getItems();
      const exact = exactVeneerMatch(items, input.value);
      if (!exact) return false;
      const selected = getSelected ? getSelected() : null;
      const selectedName = normalizeVeneerLookup(veneerDisplayName(selected));
      const exactName = normalizeVeneerLookup(veneerDisplayName(exact));
      input.value = veneerDisplayName(exact);
      clear.classList.remove("is-hidden");
      setAutocompleteError(input, error, "");
      if (!selected || selectedName !== exactName) onSelect(exact);
      return true;
    };

    const validateExact = () => {
      const raw = input.value.trim();
      if (!raw) {
        setAutocompleteError(input, error, "");
        return true;
      }
      if (commitExactMatch()) return true;
      setAutocompleteError(input, error, "Выберите точное наименование из справочника.");
      return false;
    };

    input.addEventListener("focus", render);
    input.addEventListener("input", () => {
      clear.classList.toggle("is-hidden", !input.value);
      if (onInput) onInput(input.value);
      setAutocompleteError(input, error, "");
      if (commitExactMatch()) {
        menu.classList.add("is-hidden");
        input.setAttribute("aria-expanded", "false");
      } else {
        render();
      }
    });
    menu.addEventListener("mousedown", (e) => e.preventDefault());
    menu.addEventListener("click", (e) => {
      const button = e.target.closest("[data-id]");
      if (!button) return;
      const item = getItems().find((x) => x.id === button.dataset.id);
      if (!item) return;
      input.value = veneerDisplayName(item);
      clear.classList.remove("is-hidden");
      menu.classList.add("is-hidden");
      input.setAttribute("aria-expanded", "false");
      setAutocompleteError(input, error, "");
      onSelect(item);
    });
    clear.addEventListener("click", () => {
      input.value = "";
      clear.classList.add("is-hidden");
      menu.classList.add("is-hidden");
      setAutocompleteError(input, error, "");
      onClear();
      input.focus();
    });
    input.addEventListener("blur", () => setTimeout(() => {
      menu.classList.add("is-hidden");
      input.setAttribute("aria-expanded", "false");
      validateExact();
    }, 120));
  }

  function edgeDefaultVeneer() {
    return selectedVeneerA || selectedVeneerAGroup || null;
  }

  function syncEdgeVeneerDefaults() {
    const item = edgeDefaultVeneer();
    const name = veneerDisplayName(item);

    if (attachedEdgeMaterialAuto) {
      selectedAttachedEdgeVeneer = item;
      form.edgeMaterialInput.value = name;
      form.edgeMaterialClear.classList.toggle("is-hidden", !name);
    }

    if (separateEdgeMaterialAuto) {
      selectedSeparateEdgeVeneer = item;
      form.separateEdgeMaterialInput.value = name;
      form.separateEdgeMaterialClear.classList.toggle("is-hidden", !name);
    }
  }

  function setSeparateEdgeMetersError(message = "") {
    const field = form.separateEdgeMetersInput?.closest(".field");
    field?.classList.toggle("field--invalid", Boolean(message));
    if (form.separateEdgeMetersError) form.separateEdgeMetersError.textContent = message;
  }

  function validateSeparateEdgeMetersOnBlur() {
    if (form.edgeModeSelect.value !== "separate") return true;
    const raw = form.separateEdgeMetersInput.value.trim();
    if (!raw) {
      setSeparateEdgeMetersError("");
      recalc();
      return true;
    }

    const value = Number(raw);
    if (!Number.isFinite(value)) {
      form.separateEdgeMetersInput.value = "";
      recalc();
      setSeparateEdgeMetersError("Кромка, пог. м: введите числовое значение.");
      return false;
    }

    if (value < data.meta.edgeSeparateMinimumRunningM) {
      form.separateEdgeMetersInput.value = "";
      recalc();
      setSeparateEdgeMetersError(`Кромка, пог. м: значение не меньше ${data.meta.edgeSeparateMinimumRunningM}.`);
      return false;
    }

    setSeparateEdgeMetersError("");
    recalc();
    return true;
  }

  function updateAttachedEdgeAvailability() {
    const thickness = parseThicknessComposition(currentBaseThicknessRaw()).total;
    const option = form.edgeModeSelect.querySelector('option[value="attached"]');
    const minThickness = num(data?.meta?.edgeMinBaseThicknessMm);
    const maxThickness = num(data?.meta?.edgeMaxBaseThicknessMm);
    const unavailable = Number.isFinite(thickness) && (
      (Number.isFinite(minThickness) && thickness < minThickness) ||
      (Number.isFinite(maxThickness) && thickness > maxThickness)
    );
    if (option) option.disabled = unavailable;
    if (unavailable && form.edgeModeSelect.value === "attached") form.edgeModeSelect.value = "none";
  }

  function setVeneerThicknessUI(item) {
    selectedVeneerAGroup = item || null;
    selectedVeneerA = null;
    form.veneerThicknessField.classList.toggle("is-hidden", !item);
    setVeneerThicknessError("");
    form.veneerThicknessSelect.classList.remove("is-hidden");
    form.veneerThicknessInput.classList.add("is-hidden");
    form.veneerThicknessSelect.innerHTML = "";
    form.veneerThicknessInput.value = "";
    delete form.veneerThicknessInput.dataset.invalidEntry;
    if (!item) return;

    const variants = veneerVariants(item);
    const allValues = [...new Set(variants.map(itemThickness).filter(Number.isFinite))].sort((a, b) => a - b);
    const values = allValues.filter((value) => value > 0 && value <= MAX_FACE_VENEER_THICKNESS_MM);
    if (allValues.length) {
      form.veneerThicknessSelect.add(new Option("Выберите толщину лицевого шпона", ""));
      values.forEach((value) => form.veneerThicknessSelect.add(new Option(`${String(value).replace(".", ",")} мм`, String(value))));
      if (values.length === 1) {
        form.veneerThicknessSelect.value = String(values[0]);
        selectedVeneerA = bestVeneerVariant(variants.filter((x) => Math.abs((itemThickness(x) ?? -999) - values[0]) < 0.001));
      } else if (!values.length) {
        setVeneerThicknessError("Для выбранного шпона нет доступной толщины до 4,5 мм.");
      }
    } else {
      form.veneerThicknessSelect.classList.add("is-hidden");
      form.veneerThicknessInput.classList.remove("is-hidden");
      selectedVeneerA = item;
    }
  }

  function selectVeneerVariantByThickness() {
    if (!selectedVeneerAGroup) return;
    const thickness = num(form.veneerThicknessSelect.value);
    if (!Number.isFinite(thickness)) {
      selectedVeneerA = null;
      syncVeneerCutUI(false);
      renderSelectionSurcharges();
      applyVeneerThicknessRules();
      renderStandardSizes();
      recalc();
      return;
    }

    syncVeneerCutUI(false);
    updateVeneerBModeLabel();
    renderSelectionSurcharges();
    if (selectedVeneerB) {
      const bThickness = itemThickness(selectedVeneerB);
      if (Number.isFinite(bThickness) && Math.abs(bThickness - thickness) > 0.001) {
        selectedVeneerBGroup = null;
        selectedVeneerB = null;
        form.veneerBInput.value = "";
        form.veneerBError.textContent = `Для стороны Б нужен шпон той же толщины: ${String(thickness).replace(".", ",")} мм.`;
        syncVeneerBCutUI(false);
      }
    }
    applyVeneerThicknessRules();
    renderStandardSizes();
    recalc();
  }

  function veneerSheetAreaM2(item) {
    if (item?.priceUnit !== "sheet") return null;
    const dim = item?.sheetDimensionsMm;
    if (!dim || dim.range) return null;
    const width = num(dim.width ?? dim.widthMin);
    const length = num(dim.length);
    if (!Number.isFinite(width) || !Number.isFinite(length) || width <= 0 || length <= 0) return null;
    return width * length / 1_000_000;
  }

  function veneerPricePerM2(item, sourcePrice) {
    const price = num(sourcePrice);
    if (!Number.isFinite(price)) return null;
    if (item?.priceUnit !== "sheet") return price;
    const area = veneerSheetAreaM2(item);
    return Number.isFinite(area) && area > 0 ? price / area : null;
  }

  function veneerPriceFromPerM2(item, pricePerM2) {
    const price = num(pricePerM2);
    if (!Number.isFinite(price) || price <= 0) return null;
    if (item?.priceUnit !== "sheet") return price;
    const area = veneerSheetAreaM2(item);
    return Number.isFinite(area) && area > 0 ? price * area : null;
  }

  function veneerConditionCandidates(item, basis, pricingMode = "standard") {
    if (!item || pricingMode === "nonstandard") return [];
    const candidates = [];
    const condition = form.clientConditionSelect.value || "retail";
    if (condition !== "retail") {
      const clientPrice = num(item.prices?.[condition]);
      if (Number.isFinite(clientPrice)) {
        candidates.push({
          id: `client:${condition}`,
          source: "client",
          levelId: condition,
          levelName: data.plateClientConditions.find((x) => x.id === condition)?.name || condition,
          targetPrice: clientPrice
        });
      }
    }

    const volumeLevel = Core.automaticVeneerLevel(item, basis.area, basis.sheets);
    if (volumeLevel?.id && volumeLevel.id !== "retail" && Number.isFinite(volumeLevel.price)) {
      candidates.push({
        id: `volume:${volumeLevel.id}`,
        source: "volume",
        levelId: volumeLevel.id,
        levelName: volumeLevel.name,
        targetPrice: volumeLevel.price
      });
    }
    return candidates;
  }

  function automaticVeneerPricing(item, requiredArea, which, pricingMode = "standard") {
    if (!item || !Number.isFinite(requiredArea) || requiredArea <= 0) return null;
    const basis = Core.veneerVolumeBasis(item, requiredArea);
    const retailPrice = num(item.prices?.retail);
    const retailPricePerM2 = veneerPricePerM2(item, retailPrice);
    const conditionCandidates = veneerConditionCandidates(item, basis, pricingMode);
    let selectedCondition = null;
    let conditionUnresolved = false;

    if (conditionCandidates.length === 1) {
      selectedCondition = conditionCandidates[0];
    } else if (conditionCandidates.length > 1) {
      const sameAsSelectedA = which === "B" && selectedVeneerA && (
        (item.id && selectedVeneerA.id && item.id === selectedVeneerA.id) ||
        veneerDisplayName(item) === veneerDisplayName(selectedVeneerA)
      );
      const sharedChoice = sameAsSelectedA ? veneerConditionChoices.A : "";
      const choice = veneerConditionChoices[which] || sharedChoice || "";
      selectedCondition = conditionCandidates.find((candidate) => candidate.id === choice) || null;
      conditionUnresolved = !selectedCondition;
    }

    const levelId = selectedCondition?.levelId || "retail";
    const levelName = selectedCondition?.levelName || "Розничная цена";
    const conditionSource = selectedCondition?.source || "retail";
    const targetPrice = selectedCondition?.targetPrice ?? retailPrice;
    const automaticDiscountPercent = Number.isFinite(retailPrice) && retailPrice > 0 && Number.isFinite(targetPrice)
      ? Math.max((1 - targetPrice / retailPrice) * 100, 0)
      : 0;
    const adjustmentId = `veneer:${which}:${item.id || veneerDisplayName(item)}:${levelId}:discount`;
    const discountPercent = priceOverride(adjustmentId, automaticDiscountPercent);

    const manual = which === "A" ? !veneerAPriceAuto : !veneerBPriceAuto;
    const manualInput = which === "A" ? form.veneerPriceInput : form.veneerBPriceInput;
    const manualPricePerM2 = manual ? num(manualInput.value) : null;
    const manualPriceValid = !manual || (Number.isFinite(manualPricePerM2) && manualPricePerM2 > 0);
    const manualSourcePrice = manual && manualPriceValid ? veneerPriceFromPerM2(item, manualPricePerM2) : null;
    const baseSourcePrice = manual ? manualSourcePrice : retailPrice;
    const basePricePerM2 = manual ? manualPricePerM2 : retailPricePerM2;
    const automaticPrice = Number.isFinite(baseSourcePrice)
      ? baseSourcePrice * (1 - automaticDiscountPercent / 100)
      : null;
    const adjustedPrice = Number.isFinite(baseSourcePrice)
      ? baseSourcePrice * (1 - discountPercent / 100)
      : null;
    const finalPrice = conditionUnresolved || !manualPriceValid ? null : adjustedPrice;
    const finalPricePerM2 = veneerPricePerM2(item, finalPrice);

    return {
      item, requiredArea, basis,
      retailPrice, retailPricePerM2,
      manual, manualPricePerM2: manual ? manualPricePerM2 : null,
      manualPriceValid,
      priceSource: manual ? "manual" : "price_list",
      basePricePerM2,
      automaticPrice, finalPrice, finalPricePerM2,
      levelId, levelName, conditionSource, conditionCandidates, conditionUnresolved,
      selectedConditionId: selectedCondition?.id || "",
      adjustmentId, automaticDiscountPercent, discountPercent
    };
  }

  function automaticMdfSelectionId(thickness, pieces) {
    if (!form.mdfSelectionCheckbox?.checked) return "none";
    if (!Number.isFinite(thickness) || !Number.isFinite(pieces) || pieces <= 0) return "none";
    if (thickness <= 16) return pieces <= 10 ? "selectionSmall" : "selectionLarge";
    if (thickness >= 18) return pieces <= 5 ? "selectionSmall" : "selectionLarge";
    return "none";
  }

  function updateVeneerConditionControl(which, pricing) {
    const field = which === "A" ? form.veneerAConditionField : form.veneerBConditionField;
    const select = which === "A" ? form.veneerAConditionSelect : form.veneerBConditionSelect;
    const error = which === "A" ? form.veneerAConditionError : form.veneerBConditionError;
    if (!field || !select || !error) return;
    const candidates = pricing?.conditionCandidates || [];
    const show = candidates.length > 1;
    field.classList.toggle("is-hidden", !show);
    error.textContent = "";
    if (!show) return;

    const previous = veneerConditionChoices[which] || pricing?.selectedConditionId || "";
    select.replaceChildren();
    select.add(new Option("Выберите ценовое условие", ""));
    candidates.forEach((candidate) => {
      const prefix = candidate.source === "volume" ? "Объёмная цена" : "Цена по статусу клиента";
      select.add(new Option(`${prefix} — ${candidate.levelName}`, candidate.id));
    });
    if (candidates.some((candidate) => candidate.id === previous)) select.value = previous;
    else select.value = "";
    if (pricing?.conditionUnresolved) error.textContent = "Выберите, какое ценовое условие шпона применять.";
  }

  function veneerPricingFallback(item, which) {
    if (!item) return null;
    const retailPrice = num(item.prices?.retail);
    const manual = which === "A" ? !veneerAPriceAuto : !veneerBPriceAuto;
    const manualInput = which === "A" ? form.veneerPriceInput : form.veneerBPriceInput;
    const manualPricePerM2 = manual ? num(manualInput.value) : null;
    return {
      which,
      item,
      retailPrice,
      retailPricePerM2: veneerPricePerM2(item, retailPrice),
      manual,
      manualPricePerM2,
      manualPriceValid: !manual || (Number.isFinite(manualPricePerM2) && manualPricePerM2 > 0),
      conditionCandidates: [],
      conditionUnresolved: false,
      pricingMode: "preview",
      sameAsA: false
    };
  }

  function veneerPricingsEquivalent(a, b) {
    if (!a || !b) return false;
    const sameItem = (a.item?.id && b.item?.id)
      ? a.item.id === b.item.id
      : veneerDisplayName(a.item) === veneerDisplayName(b.item);
    if (!sameItem) return false;
    const aRetail = num(a.retailPricePerM2);
    const bRetail = num(b.retailPricePerM2);
    const retailSame = Number.isFinite(aRetail) && Number.isFinite(bRetail) && Math.abs(aRetail - bRetail) < 0.000001;
    const manualSame = Boolean(a.manual) === Boolean(b.manual) && (!a.manual || Math.abs(num(a.manualPricePerM2) - num(b.manualPricePerM2)) < 0.000001);
    const conditionSame = (a.levelId || "retail") === (b.levelId || "retail") && Math.abs(num(a.discountPercent) - num(b.discountPercent)) < 0.000001;
    return retailSame && manualSame && conditionSame;
  }

  function effectiveVeneerPricePerM2(pricing) {
    const conditioned = num(pricing?.finalPricePerM2);
    if (!Number.isFinite(conditioned) || conditioned <= 0) return null;
    const selectionMarkup = num(pricing?.selectionMarkup) || 0;
    return conditioned * (1 + selectionMarkup);
  }

  function updateManualVeneerPriceControls(result = lastCalculation) {
    const pricings = result?.veneerPricings || [];
    const a = pricings.find((x) => x.which === "A" && x.pricingMode !== "nonstandard") || pricings.find((x) => x.which === "A") || veneerPricingFallback(selectedVeneerA, "A");
    const b = pricings.find((x) => x.which === "B" && x.pricingMode !== "nonstandard") || pricings.find((x) => x.which === "B") || veneerPricingFallback(selectedVeneerB, "B");
    const bDuplicate = Boolean(b && (b.sameAsA || veneerPricingsEquivalent(a, b)));
    form.veneerManualPriceBlock.classList.toggle("is-hidden", !a && !b);
    form.veneerBManualPriceControl.classList.toggle("is-hidden", !b || bDuplicate);

    if (a) {
      form.veneerAAutoPriceValue.textContent = Number.isFinite(a.retailPricePerM2) ? `${money(a.retailPricePerM2)} / м²` : "—";
      form.veneerAPriceToggle.classList.toggle("is-hidden", !veneerAPriceAuto);
      form.veneerAPriceField.classList.toggle("is-hidden", veneerAPriceAuto);
      form.veneerAPriceError.textContent = !veneerAPriceAuto && !a.manualPriceValid ? "Введите цену числом больше 0." : "";
      updateVeneerConditionControl("A", a);
      const aEffectivePrice = effectiveVeneerPricePerM2(a);
      form.veneerAFinalPriceValue.textContent = Number.isFinite(aEffectivePrice) ? `${money(aEffectivePrice)} / м²` : "—";
    } else {
      form.veneerAConditionField?.classList.add("is-hidden");
      form.veneerAPriceError.textContent = "";
      form.veneerAFinalPriceValue.textContent = "—";
    }

    if (b && !bDuplicate) {
      form.veneerBAutoPriceValue.textContent = Number.isFinite(b.retailPricePerM2) ? `${money(b.retailPricePerM2)} / м²` : "—";
      form.veneerBPriceToggle.classList.toggle("is-hidden", !veneerBPriceAuto);
      form.veneerBPriceField.classList.toggle("is-hidden", veneerBPriceAuto);
      form.veneerBPriceError.textContent = !veneerBPriceAuto && !b.manualPriceValid ? "Введите цену числом больше 0." : "";
      updateVeneerConditionControl("B", b);
      const bEffectivePrice = effectiveVeneerPricePerM2(b);
      form.veneerBFinalPriceValue.textContent = Number.isFinite(bEffectivePrice) ? `${money(bEffectivePrice)} / м²` : "—";
    } else {
      form.veneerBConditionField?.classList.add("is-hidden");
      form.veneerBPriceError.textContent = "";
      form.veneerBFinalPriceValue.textContent = "—";
    }
  }

  function renderSelectionSurcharges() {
    const sel = selectedVeneerA?.selection || {};
    const labelMap = { length2800: "Отбор по длине 2800 мм+", widthQuality: "Отбор по ширине и качеству", length: "Отбор по длине", widthQualityPattern: "Отбор по ширине / качеству / рисунку" };
    const options = Object.entries(sel).map(([key, value]) => ({ key, rate: num(value), label: labelMap[key] || key })).filter((x) => Number.isFinite(x.rate) && x.rate > 0);
    const validKeys = new Set(options.map((x) => x.key));
    [...selectedVeneerSelectionKeys].forEach((key) => {
      if (!validKeys.has(key)) {
        selectedVeneerSelectionKeys.delete(key);
        priceAdjustmentOverrides.delete(`veneer-selection:${key}`);
      }
    });
    form.selectionSurchargeBlock.classList.toggle("is-hidden", !options.length);
    form.selectionSurchargeOptions.innerHTML = options.map((x) => `<label class="selection-option"><input type="checkbox" data-selection-surcharge data-rate="${x.rate}" value="${esc(x.key)}" ${selectedVeneerSelectionKeys.has(x.key) ? "checked" : ""} /><span><strong>${esc(x.label)}</strong><small>Наценка ${round(x.rate * 100, 1)}%</small></span></label>`).join("");
  }

  function onVeneerASelected(item) {
    form.veneerTypeSelect.value = item.type || "";
    selectedVeneerAGroup = item;
    selectedVeneerBGroup = null;
    selectedVeneerB = null;
    selectedVeneerSelectionKeys.clear();
    clearPriceOverrides("veneer-selection:");
    clearPriceOverrides("veneer:A:");
    clearPriceOverrides("veneer:B:");
    veneerAPriceAuto = true;
    veneerBPriceAuto = true;
    veneerConditionChoices.A = "";
    veneerConditionChoices.B = "";
    form.veneerBInput.value = "";
    form.veneerBError.textContent = "";
    syncVeneerBCutUI(false);
    setVeneerThicknessUI(item);
    syncVeneerCutUI(false);
    updateVeneerBModeLabel();
    syncEdgeVeneerDefaults();
    renderSelectionSurcharges();
    applyVeneerThicknessRules();
    renderStandardSizes();
    recalc();
  }

  function onVeneerBSelected(item) {
    const aThickness = selectedVeneerThickness();
    const bThickness = itemThickness(item);
    if (Number.isFinite(aThickness) && Number.isFinite(bThickness) && Math.abs(aThickness - bThickness) > 0.001) {
      selectedVeneerBGroup = null;
      selectedVeneerB = null;
      form.veneerBInput.value = "";
      form.veneerBError.textContent = `Для стороны Б нужен шпон той же толщины: ${String(aThickness).replace(".", ",")} мм.`;
      syncVeneerBCutUI(false);
      recalc();
      return;
    }
    selectedVeneerBGroup = item;
    veneerBPriceAuto = true;
    veneerConditionChoices.B = "";
    form.veneerBError.textContent = "";
    syncVeneerBCutUI(false);
    recalc();
  }

  function updateCalibrationUI() {
    const available = selectedBase()?.id === "mdf";
    form.calibrationFields?.classList.toggle("is-hidden", !available);
    if (!available) {
      form.calibrationSelect.value = "no";
      form.calibrationTargetInput.value = "";
      if (form.calibrationDepthInput) form.calibrationDepthInput.value = "1";
    }
    const active = available && form.calibrationSelect.value === "yes";
    form.calibrationTargetField.classList.toggle("is-hidden", !active);
    form.calibrationDepthField?.classList.toggle("is-hidden", !active);
  }

  function updateBaseUI() {
    const base = selectedBase();
    const options = baseThicknessOptions(base);

    form.baseThicknessSelect.innerHTML = "";

    if (!base) {
      form.baseThicknessSelect.disabled = true;
      form.baseThicknessSelect.innerHTML = '<option value="">Сначала выберите основу</option>';
    } else {
      form.baseThicknessSelect.disabled = false;
      form.baseThicknessSelect.innerHTML = '<option value="">Выберите толщину</option>' + options.map((value) => {
        const raw = String(value);
        const parsed = parseThicknessComposition(raw);
        const label = parsed.composite && Number.isFinite(parsed.total) ? `${parsed.total} мм (${raw})` : `${raw} мм`;
        return `<option value="${esc(raw)}">${esc(label)}</option>`;
      }).join("");
      if (options.length === 1) form.baseThicknessSelect.value = String(options[0]);
    }

    updateManualBasePriceUI();

    const showMdfPricing = base?.id === "mdf";
    form.mdfPriceOptions.classList.toggle("is-hidden", !showMdfPricing);
    if (!showMdfPricing) {
      form.mdfSelectionCheckbox.checked = false;
      form.mdfVolumeConditionSelect.value = "none";
      clearPriceOverrides("mdf:");
    }

    updateThicknessWarnings(); updateEdgeUI(); updateCalibrationUI(); renderStandardSizes(); revalidateCustomSizeRows(); recalc();
  }

  function updateThicknessWarnings() {
    const t = parseThicknessComposition(currentBaseThicknessRaw());
    const heavy = Boolean(t.composite) && Number.isFinite(t.total) && t.total >= data.meta.thickPlateSplitFromMm;
    form.heavyPlateWarning.classList.toggle("is-hidden", !heavy);
    if (heavy) form.heavyPlateWarning.textContent = "Для составных плит толщиной 32 мм и более размер ограничивается по весу. Ориентир по массе одной детали — 100–120 кг.";
  }

  function applyVeneerThicknessRules() {
    const thickness = selectedVeneerThickness();
    form.reverseSideHint.textContent = "";

    if (Number.isFinite(thickness) && thickness > 1.5) {
      form.veneeredSidesSelect.value = "2";
      form.veneeredSidesSelect.disabled = true;
      // Источник запрещает разные ТОЛЩИНЫ на сторонах, но не требует одну и ту же породу.
      // Поэтому второй шпон можно заменить на другой при той же толщине.
      form.veneerBModeSelect.disabled = false;
    } else {
      form.veneeredSidesSelect.disabled = false;
      form.veneerBModeSelect.disabled = false;
    }

    form.reverseSideSelect.innerHTML = "";
    if (Number.isFinite(thickness) && Math.abs(thickness - 1.5) < 0.001) {
      form.reverseSideSelect.add(new Option("Такой же шпон 1,5 мм", "same"));
      form.reverseSideSelect.add(new Option("Черновой шпон", "rough"));
    } else {
      form.reverseSideSelect.add(new Option("Черновой шпон", "rough"));
      form.reverseSideSelect.add(new Option("Бумага", "paper"));
    }
    updateSidesUI();
  }

  function updateSidesUI() {
    updateVeneerBModeLabel();
    const two = Number(form.veneeredSidesSelect.value) === 2;
    form.reverseSideField.classList.toggle("is-hidden", two);
    form.veneerBFields.classList.toggle("is-hidden", !two);
    const other = two && form.veneerBModeSelect.value === "other";
    form.veneerBSearchField.classList.toggle("is-hidden", !other);
    if (!other) {
      selectedVeneerBGroup = null;
      selectedVeneerB = null;
      form.veneerBInput.value = "";
      form.veneerBError.textContent = "";
      veneerBPriceAuto = true;
      veneerConditionChoices.B = "";
      syncVeneerBCutUI(false);
    }
    if (positionFinishOverridesEnabled) capturePositionFinishStateFromDom();
    syncGlobalFinishSidesWithVeneer();
    syncPositionFinishSidesWithVeneer();
    if (positionFinishOverridesEnabled) renderPositionFinishOverrides(false);
    updateLacquerProcessOptions();
    renderStandardSizes();
    recalc();
  }

  function layoutNeedsTz(layout) {
    return layout === "diagonal45" || layout === "herringbone" || layout === "custom";
  }

  function layoutHasDescriptionOrFile() {
    return Boolean(form.layoutTzComment.value.trim() || getUploadedFiles(form.layoutTzFiles).length);
  }

  function setLayoutTzError(show) {
    if (!form.layoutTzError) return;
    form.layoutTzError.textContent = show ? "Добавьте описание раскладки или приложите файл." : "";
    form.layoutTzError.classList.toggle("is-hidden", !show);
  }

  function diagonalSizeFits(length, width) {
    const maxLength = num(data?.meta?.diagonal45MaxLengthMm) || 2800;
    const maxWidth = num(data?.meta?.diagonal45MaxWidthMm) || 2070;
    return (length <= maxLength && width <= maxWidth) || (length <= maxWidth && width <= maxLength);
  }

  function updateLayoutUI() {
    const layout = form.layoutSelect.value;
    syncVeneerCutUI(true);

    const needsTz = layoutNeedsTz(layout);
    form.layoutTzFields.classList.toggle("is-hidden", !needsTz);
    if (!needsTz) {
      form.layoutTzComment.value = "";
      form.layoutTzFiles.value = "";
      setUploadedFiles(form.layoutTzFiles, []);
      form.layoutTzFileNames.textContent = "Файлы не выбраны";
      form.layoutTzFileNames.classList.add("is-hidden");
      setLayoutTzError(false);
    }

    renderStandardSizes();
    recalc();
  }

  function rawStandardSizesForBase() {
    const base = selectedBase();
    if (!base) return [];
    const rawThickness = currentBaseThicknessRaw();
    const thickness = parseThicknessComposition(rawThickness);
    const byThickness = data?.standardSizesByBaseThickness?.[base.id];
    if (byThickness) {
      if (!Number.isFinite(thickness.total)) return [];
      const normalizedRaw = String(rawThickness ?? "").trim().replace(/\s+/g, "").replace(/,/g, ".");
      // Здесь храним физически ранее подтверждённые форматы для проверки, можно ли изготовить свой размер.
      // Новая таблица стандартов ограничивает статус «стандарт», но отсутствие формата в её списке само по себе
      // не является подтверждённым запретом на изготовление нестандарта.
      const productionFormats = Array.isArray(byThickness[normalizedRaw]) ? byThickness[normalizedRaw] : [];
      const warehouseFormats = base.id === "mdf" && !thickness.composite
        ? data?.warehouseFormatsByThickness?.[String(thickness.total)]
        : null;
      const combined = [
        ...productionFormats,
        ...(Array.isArray(warehouseFormats) ? warehouseFormats : [])
      ];
      const seen = new Set();
      return combined.filter((item) => {
        const key = `${Number(item.length)}x${Number(item.width)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return Array.isArray(data?.standardSizesByBase?.[base.id]) ? data.standardSizesByBase[base.id] : [];
  }

  function detailWeightKg(length, width) {
    const base = selectedBase();
    const thickness = parseThicknessComposition(currentBaseThicknessRaw());
    const density = base?.weightDensityKgM3?.max;
    if (!Number.isFinite(density) || !Number.isFinite(thickness.total)) return null;
    return (Number(length) / 1000) * (Number(width) / 1000) * (thickness.total / 1000) * density;
  }

  function standardSizesForBase() {
    const thickness = parseThicknessComposition(currentBaseThicknessRaw());
    const base = selectedBase();
    const normalizedRaw = String(currentBaseThicknessRaw() ?? "").trim().replace(/\s+/g, "").replace(/,/g, ".");
    const authoritative = base ? data?.authoritativeStandardFormatsByBaseThickness?.[base.id] : null;
    const hasAuthoritativeBase = Boolean(authoritative && typeof authoritative === "object");
    const hasAuthoritativeThickness = hasAuthoritativeBase && Object.prototype.hasOwnProperty.call(authoritative, normalizedRaw);
    // Актуальная матрица задаёт именно те форматы, которые показываем как стандартные в калькуляторе.
    // Исторические/дополнительные форматы остаются в standardSizesByBaseThickness для справочных и производственных проверок.
    const sizes = hasAuthoritativeThickness
      ? (Array.isArray(authoritative[normalizedRaw]) ? authoritative[normalizedRaw] : [])
      : (hasAuthoritativeBase ? [] : rawStandardSizesForBase());
    if (!thickness.composite || !Number.isFinite(thickness.total) || thickness.total < data.meta.thickPlateSplitFromMm) return sizes;
    // Ограничение по весу применяется только к составным/переклеенным основам толщиной 32 мм и более.
    // Поэтому полный формат не предлагается, если расчётная масса превышает верхнюю подтверждённую границу.
    return sizes.filter((size) => {
      const kg = detailWeightKg(size.length, size.width);
      return !Number.isFinite(kg) || kg <= data.meta.heavyPlateTargetKgMax;
    });
  }

  function physicalStandardSizes() {
    const seen = new Set();
    return standardSizesForBase().filter((size) => {
      const key = `${Number(size.length)}x${Number(size.width)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Длина — направление волокон. Не переставляем длину и ширину местами автоматически.
  function orientedStandardSizes() {
    return physicalStandardSizes();
  }

  function heavySizeAllowed(length, width) {
    const thickness = parseThicknessComposition(currentBaseThicknessRaw());
    if (!thickness.composite || !Number.isFinite(thickness.total) || thickness.total < data.meta.thickPlateSplitFromMm) return true;
    const kg = detailWeightKg(length, width);
    return !Number.isFinite(kg) || kg <= data.meta.heavyPlateTargetKgMax;
  }

  function strictSizeFitsFormats(length, width, formats, allowanceMm = 0) {
    const requiredLength = Number(length) + Number(allowanceMm || 0);
    const requiredWidth = Number(width) + Number(allowanceMm || 0);
    if (!Number.isFinite(requiredLength) || !Number.isFinite(requiredWidth)) return false;
    return formats.some((format) =>
      requiredLength <= Number(format.length) && requiredWidth <= Number(format.width)
    );
  }

  function strictMaxDimensionForFormats(formats, key, allowanceMm = 0) {
    if (!formats.length) return null;
    const max = Math.max(...formats.map((format) => Number(format[key])).filter(Number.isFinite));
    return Number.isFinite(max) ? Math.max(max - Number(allowanceMm || 0), 0) : null;
  }

  function strictMaxCompanionDimension(otherValue, formats, key, allowanceMm = 0) {
    const otherKey = key === "length" ? "width" : "length";
    const requiredOther = Number(otherValue) + Number(allowanceMm || 0);
    const compatible = formats.filter((format) => requiredOther <= Number(format[otherKey]));
    return strictMaxDimensionForFormats(compatible, key, allowanceMm);
  }

  function sizeFitsProduction(length, width, allowanceMm = 0) {
    const formats = rawStandardSizesForBase();
    const physicalFits = !formats.length || strictSizeFitsFormats(length, width, formats, allowanceMm);
    const weightedLength = Number(length) + Number(allowanceMm || 0);
    const weightedWidth = Number(width) + Number(allowanceMm || 0);
    return physicalFits && heavySizeAllowed(weightedLength, weightedWidth);
  }

  function finishedDetailTechnologicalLimit(size) {
    if (!size || size.resultMode !== "exact") return null;
    if (classifySize(size).id !== "nonstandard") return null;
    if (form.edgeModeSelect.value !== "attached") return null;

    const finish = effectiveFinishForSize(size);
    if (finish?.finishId !== "lacquer") return null;

    const thickness = parseThicknessComposition(currentBaseThicknessRaw()).total;
    if (!Number.isFinite(thickness)) return null;

    const limits = Array.isArray(data?.meta?.finishedDetailLimits) ? data.meta.finishedDetailLimits : [];
    return limits.find((limit) => (
      thickness >= num(limit?.minThicknessMm) &&
      thickness <= num(limit?.maxThicknessMm)
    )) || null;
  }

  function finishedDetailTechnologicalSizeState(size) {
    const limit = finishedDetailTechnologicalLimit(size);
    if (!limit) return { valid: true, limit: null };

    const biggerSide = Math.max(Number(size.length) || 0, Number(size.width) || 0);
    const smallerSide = Math.min(Number(size.length) || 0, Number(size.width) || 0);
    const maxLength = num(limit.maxLengthMm);
    const maxWidth = num(limit.maxWidthMm);
    const valid = (!Number.isFinite(maxLength) || biggerSide <= maxLength) &&
      (!Number.isFinite(maxWidth) || smallerSide <= maxWidth);
    return { valid, limit };
  }

  function sizeRowTemplate(values = {}) {
    const id = `size_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return `<div class="size-row" data-size-row data-row-id="${id}" data-size-mode="">
      <div class="size-row__header">
        <strong data-size-title>Позиция</strong>
        <span>
          <button class="size-row__remove" data-duplicate-size-row type="button">Дублировать</button>
          <button class="size-row__remove" data-remove-size-row type="button">Удалить</button>
        </span>
      </div>

      <div class="standard-size-list standard-size-list--row">
        <span class="field__label">Стандартные размеры</span>
        <div class="standard-size-values" data-standard-size-values></div>
        <button class="field-action size-row__custom-toggle" data-custom-size-toggle type="button">Указать свой размер</button>
      </div>

      <label class="field is-hidden" data-size-standard-order-field>
        <span class="field__label">Что заказывает клиент?</span>
        <select data-size-standard-order>
          <option value="standard_panel">Стандартная панель</option>
          <option value="exact_detail">В точный размер — готовая деталь</option>
        </select>
      </label>

      <div class="field-grid field-grid--size-row is-hidden" data-size-fields>
        <label class="field">
          <span class="field__label">Длина, мм — направление волокон</span>
          <input data-size-length type="number" min="1" step="1" value="${esc(values.length || "")}" />
          <span class="field__error" data-size-length-error></span>
        </label>
        <label class="field">
          <span class="field__label">Ширина, мм</span>
          <input data-size-width type="number" min="1" step="1" value="${esc(values.width || "")}" />
          <span class="field__error" data-size-width-error></span>
        </label>
        <label class="field">
          <span class="field__label">Количество, шт.</span>
          <input data-size-quantity type="number" min="1" step="1" inputmode="numeric" value="${esc(values.quantity || "")}" />
          <span class="field__error" data-size-quantity-error></span>
        </label>
      </div>

      <label class="field is-hidden size-row__result" data-size-result-field>
        <span class="field__label">Как изготовить размер?</span>
        <select data-size-result>
          <option value="exact">В точный размер</option>
          <option value="allowance20">С припуском +20 мм — полуфабрикат</option>
        </select>
      </label>

      <div class="field-grid is-hidden" data-size-allowance-fields>
        <label class="field">
          <span class="field__label">Отход основы, %</span>
          <input data-size-base-waste-percent type="number" min="0" step="0.1" inputmode="decimal" value="${esc(data?.meta?.allowance20DefaultBaseWastePercent ?? 25)}" />
          <span class="field__note">По умолчанию: ${esc(data?.meta?.allowance20DefaultBaseWastePercent ?? 25)}%</span>
          <span class="field__error" data-size-base-waste-error></span>
        </label>
      </div>

      <div class="size-row__extra" data-size-extra>
        <label class="toggle-line">
          <input data-size-transition type="checkbox" />
          <span>Переход рисунка</span>
        </label>
        <p class="field__error" data-size-transition-quantity-error></p>

        <div class="size-row__details" data-size-details>
          <label class="field">
            <span class="field__label">Комментарий</span>
            <textarea data-size-comment rows="2" placeholder="Комментарий к этой позиции"></textarea>
          </label>
          <label class="field file-upload-box">
            <span class="field__label">Файлы</span>
            <input data-size-files type="file" multiple accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" />
            <div class="uploaded-files is-hidden" data-size-file-names>Файлы не выбраны</div>
          </label>
          <p class="field__error" data-size-transition-details-error></p>
        </div>
      </div>
    </div>`;
  }

  function updateSizeRowIndexes() {
    $$('[data-size-row]', form.sizeRows).forEach((row, index) => {
      const title = $('[data-size-title]', row);
      if (title) title.textContent = `Позиция ${index + 1}`;
      row.dataset.position = String(index + 1);
    });
    updatePositionFinishLabels();
  }

  function updateSizeRemoveButtons() {
    const rows = $$('[data-size-row]', form.sizeRows);
    rows.forEach((row) => {
      const button = $('[data-remove-size-row]', row);
      if (button) button.disabled = rows.length === 1;
    });
    updateSizeRowIndexes();
  }

  function setActiveSizeRow(row) {
    if (!row) return;
    activeSizeRow = row;
    $$('[data-size-row]', form.sizeRows).forEach((x) => x.classList.toggle("is-active", x === row));
  }

  function quantityValueState(row) {
    const input = $('[data-size-quantity]', row);
    const raw = String(input?.value || "").trim();
    const valid = /^\d+$/.test(raw) && Number(raw) >= 1 && Number.isInteger(Number(raw));
    return { raw, value: valid ? Number(raw) : num(raw), valid };
  }

  function setSizeQuantityError(row, message = "") {
    const input = $('[data-size-quantity]', row);
    const field = input?.closest(".field");
    const error = $('[data-size-quantity-error]', row);
    field?.classList.toggle("field--invalid", Boolean(message));
    if (error) error.textContent = message;
  }

  function validateSizeQuantity(row, showEmpty = false) {
    const { raw, valid } = quantityValueState(row);
    const shouldValidate = showEmpty || raw !== "";
    const message = shouldValidate && !valid ? "Введите количество целым числом от 1." : "";
    setSizeQuantityError(row, message);
    return !shouldValidate || valid;
  }

  function baseWastePercentValueState(row) {
    const input = $('[data-size-base-waste-percent]', row);
    const raw = String(input?.value || "").trim();
    const normalized = raw.replace(",", ".");
    const validFormat = /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized);
    const value = validFormat ? Number(normalized) : null;
    return { raw, value, valid: validFormat && Number.isFinite(value) && value >= 0 };
  }

  function validateSizeBaseWastePercent(row) {
    const resultMode = $('[data-size-result]', row)?.value || "exact";
    const active = resultMode === "allowance20";
    const state = baseWastePercentValueState(row);
    const error = $('[data-size-base-waste-error]', row);
    const field = $('[data-size-base-waste-percent]', row)?.closest(".field");
    const message = active && !state.valid ? "Введите отход основы числом от 0." : "";
    field?.classList.toggle("field--invalid", Boolean(message));
    if (error) error.textContent = message;
    return !active || state.valid;
  }

  function updateSizeTransitionUI(row) {
    const transition = Boolean($('[data-size-transition]', row)?.checked);
    const quantityState = quantityValueState(row);
    const quantity = quantityState.value;
    const hasDescription = Boolean($('[data-size-comment]', row)?.value.trim()) || uploadedFileNames($('[data-size-files]', row)).length > 0;
    const quantityError = $('[data-size-transition-quantity-error]', row);
    const detailsError = $('[data-size-transition-details-error]', row);
    if (quantityError) quantityError.textContent = transition && quantityState.valid && Number.isFinite(quantity) && quantity > 1
      ? "Для перехода рисунка каждая деталь должна быть отдельной позицией. Укажите 1 шт. и добавьте отдельные позиции для остальных деталей."
      : "";
    if (detailsError) detailsError.textContent = transition && !hasDescription
      ? "Добавьте описание перехода рисунка или приложите файл."
      : "";
  }

  function updateSizeRowAvailability(row) {
    const mode = row.dataset.sizeMode || "";
    const length = num($('[data-size-length]', row)?.value);
    const width = num($('[data-size-width]', row)?.value);
    const fields = $('[data-size-fields]', row);
    const standardOrderField = $('[data-size-standard-order-field]', row);
    const resultField = $('[data-size-result-field]', row);
    const allowanceFields = $('[data-size-allowance-fields]', row);
    const resultMode = $('[data-size-result]', row)?.value || "exact";
    fields?.classList.toggle("is-hidden", !mode);
    standardOrderField?.classList.toggle("is-hidden", mode !== "standard");
    resultField?.classList.toggle("is-hidden", mode !== "custom");
    allowanceFields?.classList.toggle("is-hidden", mode !== "custom" || resultMode !== "allowance20");
    updateSizeTransitionUI(row);
  }

  function addSizeRow(values = {}) {
    const wrap = document.createElement("div");
    wrap.innerHTML = sizeRowTemplate(values).trim();
    const row = wrap.firstElementChild;
    form.sizeRows.append(row);
    activeSizeRow = row;
    updateSizeRemoveButtons();
    renderStandardSizesForRow(row);

    const fileInput = $('[data-size-files]', row);
    const fileOutput = $('[data-size-file-names]', row);
    if (fileInput && fileOutput) bindFileInput(fileInput, fileOutput, true);

    if (values.length && values.width) {
      row.dataset.sizeMode = values.mode || "custom";
      $('[data-size-length]', row).value = values.length;
      $('[data-size-width]', row).value = values.width;
      $('[data-size-quantity]', row).value = values.quantity || "";
      const standardMode = row.dataset.sizeMode === "standard";
      $('[data-size-length]', row).readOnly = standardMode;
      $('[data-size-width]', row).readOnly = standardMode;
      $('[data-size-result]', row).value = values.resultMode || "exact";
      const standardOrder = $('[data-size-standard-order]', row);
      if (standardOrder) standardOrder.value = values.standardOrderType || "standard_panel";
    }
    updateSizeRowAvailability(row);
    if (positionFinishOverridesEnabled) renderPositionFinishOverrides();
    recalc();
    return row;
  }

  function duplicateSizeRow(sourceRow) {
    if (!sourceRow) return null;
    capturePositionFinishStateFromDom();
    const values = {
      mode: sourceRow.dataset.sizeMode || "custom",
      length: num($('[data-size-length]', sourceRow)?.value),
      width: num($('[data-size-width]', sourceRow)?.value),
      quantity: num($('[data-size-quantity]', sourceRow)?.value),
      resultMode: $('[data-size-result]', sourceRow)?.value || "exact",
      standardOrderType: $('[data-size-standard-order]', sourceRow)?.value || "standard_panel"
    };
    const targetRow = addSizeRow(values);
    $('[data-size-base-waste-percent]', targetRow).value = $('[data-size-base-waste-percent]', sourceRow)?.value || "";
    $('[data-size-transition]', targetRow).checked = Boolean($('[data-size-transition]', sourceRow)?.checked);
    $('[data-size-comment]', targetRow).value = $('[data-size-comment]', sourceRow)?.value || "";

    const sourceFiles = getUploadedFiles($('[data-size-files]', sourceRow));
    const targetFiles = $('[data-size-files]', targetRow);
    const targetFileNames = $('[data-size-file-names]', targetRow);
    if (targetFiles && sourceFiles.length) {
      setUploadedFiles(targetFiles, sourceFiles);
      if (targetFileNames) renderUploadedFiles(targetFiles, targetFileNames, true);
    }

    const sourceFinish = positionFinishState.get(sourceRow.dataset.rowId);
    if (sourceFinish) {
      positionFinishState.set(targetRow.dataset.rowId, {
        ...sourceFinish,
        files: [...(sourceFinish.files || [])]
      });
    }

    updateSizeRowAvailability(targetRow);
    updateSizeTransitionUI(targetRow);
    if (positionFinishOverridesEnabled) renderPositionFinishOverrides();
    recalc();
    return targetRow;
  }

  function readSizeRows() {
    return $$('[data-size-row]', form.sizeRows).map((row, index) => {
      const length = num($('[data-size-length]', row)?.value);
      const width = num($('[data-size-width]', row)?.value);
      const quantityState = quantityValueState(row);
      const quantity = quantityState.value;
      const mode = row.dataset.sizeMode || "";
      const resultMode = $('[data-size-result]', row)?.value || "exact";
      const standardOrderType = mode === "standard" ? ($('[data-size-standard-order]', row)?.value || "standard_panel") : null;
      const baseWasteState = baseWastePercentValueState(row);
      const allowance = resultMode === "allowance20" ? 20 : 0;
      const calcLength = allowance && length ? length + allowance : length;
      const calcWidth = allowance && width ? width + allowance : width;
      const physicalSizeValid = row.dataset.sizeMode !== "custom" ||
        !(length > 0 && width > 0) ||
        sizeFitsProduction(length, width, allowance);
      const size = {
        row,
        rowId: row.dataset.rowId || "",
        index,
        position: index + 1,
        mode,
        standardOrderType,
        length,
        width,
        quantity,
        quantityValid: quantityState.valid,
        quantityRaw: quantityState.raw,
        resultMode,
        physicalSizeValid,
        baseWastePercent: baseWasteState.valid ? baseWasteState.value : null,
        baseWastePercentValid: resultMode !== "allowance20" || baseWasteState.valid,
        baseWastePercentRaw: baseWasteState.raw,
        calcLength,
        calcWidth,
        transition: Boolean($('[data-size-transition]', row)?.checked),
        comment: $('[data-size-comment]', row)?.value.trim() || "",
        files: uploadedFileNames($('[data-size-files]', row))
      };
      const technologicalState = physicalSizeValid && length > 0 && width > 0
        ? finishedDetailTechnologicalSizeState(size)
        : { valid: true, limit: null };
      size.technologicalSizeValid = technologicalState.valid;
      size.technologicalSizeLimit = technologicalState.limit;
      size.sizeValid = physicalSizeValid && technologicalState.valid;
      size.area = length && width && quantity && size.sizeValid ? length * width * quantity / 1_000_000 : 0;
      size.calcArea = calcLength && calcWidth && quantity && size.sizeValid ? calcLength * calcWidth * quantity / 1_000_000 : 0;
      return size;
    });
  }

  function isKnownStandardSize(size) {
    if (!size || size.resultMode !== "exact" || !size.length || !size.width) return false;
    return standardSizesForBase().some((item) => (
      Number(item.length) === Number(size.length) && Number(item.width) === Number(size.width)
    ));
  }

  function cleanCuttingRequired(size) {
    if (!size || size.resultMode !== "exact") return false;
    if (size.mode === "standard") return size.standardOrderType === "exact_detail";
    return size.mode === "custom";
  }

  function standardCandidateRows() {
    const base = selectedBase(), t = parseThicknessComposition(currentBaseThicknessRaw());
    if (!base || base.id !== "mdf" || !Number.isFinite(t.total) || t.composite || !selectedVeneerA) return [];
    const sides = Number(form.veneeredSidesSelect.value), layout = form.layoutSelect.value, cut = layout === "mixmatch" ? "mixed" : form.veneerCutSelect.value;
    if (!["book", "mixmatch"].includes(layout)) return [];
    if (sides === 1 && form.reverseSideSelect.value !== "rough") return [];
    if (sides === 2 && form.veneerBModeSelect.value !== "same") return [];
    if (layoutNeedsTz(layout)) return [];
    const sourceNames = new Set(veneerVariants(selectedVeneerA).map((x) => String(x.name || "").toLocaleLowerCase("ru")));
    const warehouseFormats = data?.warehouseFormatsByThickness?.[String(t.total)];
    const allowedWarehouse = (row) => !Array.isArray(warehouseFormats) || warehouseFormats.some((fmt) => (
      Number(fmt.length) === Number(row.lengthMm) && Number(fmt.width) === Number(row.widthMm)
    ));
    return data.standardMdfItems.filter((x) => x.thicknessMm === t.total && allowedWarehouse(x) && sourceNames.has(String(x.veneerFamily || "").toLocaleLowerCase("ru")) && x.sides === sides && x.layout === layout && (layout !== "book" || x.veneerCut === cut));
  }

  function findStandardItem(size) {
    if (size.resultMode !== "exact" || size.transition || !isKnownStandardSize(size)) return null;
    return standardCandidateRows().find((x) => Number(x.lengthMm) === Number(size.length) && Number(x.widthMm) === Number(size.width)) || null;
  }

  function classifySize(size) {
    const warehouse = findStandardItem(size);
    if (warehouse) return { id: "warehouse_standard", name: "Складской стандарт", warehouse };

    const normalStandardLayouts = new Set(["book", "straight", "turn180", "mixmatch", "diagonal45"]);
    const exactKnownFormat = size?.resultMode === "exact" && isKnownStandardSize(size);
    if (exactKnownFormat && normalStandardLayouts.has(form.layoutSelect.value)) {
      return { id: "standard_request", name: "Стандарт по запросу", warehouse: null };
    }
    return { id: "nonstandard", name: "Нестандарт", warehouse: null };
  }

  function renderStandardSizesForRow(row) {
    if (!row) return;
    const target = $('[data-standard-size-values]', row);
    if (!target) return;
    const base = selectedBase();
    const pairs = physicalStandardSizes();
    const sizes = orientedStandardSizes();

    if (!base) {
      target.innerHTML = "<span>Сначала выберите основу</span>";
      return;
    }

    const hasThicknessMap = Boolean(data?.standardSizesByBaseThickness?.[base.id]);
    const thickness = parseThicknessComposition(currentBaseThicknessRaw());
    if (hasThicknessMap && !Number.isFinite(thickness.total)) {
      target.innerHTML = "<span>Сначала выберите толщину основы</span>";
      return;
    }

    if (!pairs.length) {
      target.innerHTML = "<span>Для выбранной толщины стандартные размеры не найдены</span>";
      return;
    }

    const currentLength = num($('[data-size-length]', row)?.value);
    const currentWidth = num($('[data-size-width]', row)?.value);
    const stillStandard = sizes.some((size) => size.length === currentLength && size.width === currentWidth);

    if (row.dataset.sizeMode === "standard" && !stillStandard) {
      row.dataset.sizeMode = "custom";
      $('[data-size-length]', row).readOnly = false;
      $('[data-size-width]', row).readOnly = false;
      $('[data-size-result]', row).value = "exact";
      const standardOrder = $('[data-size-standard-order]', row);
      if (standardOrder) standardOrder.value = "standard_panel";
      updateSizeRowAvailability(row);
    }

    target.innerHTML = pairs.map((size) => {
      const active = row.dataset.sizeMode === "standard" &&
        currentLength === size.length &&
        currentWidth === size.width;
      return `<div class="standard-size-pair standard-size-pair--single"><button class="standard-size-choice${active ? " is-selected" : ""}" type="button" data-standard-size data-length="${size.length}" data-width="${size.width}">${size.length} × ${size.width}</button></div>`;
    }).join("");
  }

  function renderStandardSizes() {
    $$('[data-size-row]', form.sizeRows).forEach(renderStandardSizesForRow);
  }

  function applyStandardSize(row, length, width) {
    if (!row) return;
    row.dataset.sizeMode = "standard";
    const lengthInput = $('[data-size-length]', row);
    const widthInput = $('[data-size-width]', row);
    lengthInput.value = length;
    widthInput.value = width;
    lengthInput.readOnly = true;
    widthInput.readOnly = true;
    $('[data-size-result]', row).value = "exact";
    const standardOrder = $('[data-size-standard-order]', row);
    if (standardOrder) standardOrder.value = "standard_panel";
    clearSizeErrors(row);
    renderStandardSizesForRow(row);
    updateSizeRowAvailability(row);
    updatePositionFinishLabels();
    recalc();
  }

  function setCustomSizeMode(row) {
    if (!row) return;
    row.dataset.sizeMode = "custom";
    const lengthInput = $('[data-size-length]', row);
    const widthInput = $('[data-size-width]', row);
    lengthInput.readOnly = false;
    widthInput.readOnly = false;
    lengthInput.value = "";
    widthInput.value = "";
    $('[data-size-result]', row).value = "exact";
    const standardOrder = $('[data-size-standard-order]', row);
    if (standardOrder) standardOrder.value = "standard_panel";
    clearSizeErrors(row);
    renderStandardSizesForRow(row);
    updateSizeRowAvailability(row);
    updatePositionFinishLabels();
    lengthInput.focus();
    recalc();
  }

  function setSizeFieldError(row, key, message = "") {
    const input = $(`[data-size-${key}]`, row);
    const field = input?.closest(".field");
    const error = $(`[data-size-${key}-error]`, row);

    field?.classList.toggle("field--invalid", Boolean(message));
    if (error) error.textContent = message;
  }

  function clearSizeErrors(row) {
    setSizeFieldError(row, "length", "");
    setSizeFieldError(row, "width", "");
  }

  function customSizeAllowance(row) {
    return $('[data-size-result]', row)?.value === "allowance20" ? 20 : 0;
  }

  function validateCustomSizeOnBlur(input, row, key, label) {
    if (!row || row.dataset.sizeMode !== "custom" || !input) return true;

    const raw = input.value.trim();
    if (!raw) {
      setSizeFieldError(row, key, "");
      recalc();
      return true;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      input.value = "";
      updateSizeRowAvailability(row);
      recalc();
      setSizeFieldError(row, key, `${label}: введите числовое значение.`);
      return false;
    }

    const formats = rawStandardSizesForBase();
    if (!formats.length && !Number.isFinite(detailWeightKg(value, value))) {
      setSizeFieldError(row, key, "");
      recalc();
      return true;
    }

    const otherKey = key === "length" ? "width" : "length";
    const otherInput = $(`[data-size-${otherKey}]`, row);
    const otherValue = Number(otherInput?.value);
    const allowance = customSizeAllowance(row);
    let max = null;
    let valid = true;

    let weightTooHigh = false;
    if (Number.isFinite(otherValue) && otherValue > 0) {
      max = formats.length ? strictMaxCompanionDimension(otherValue, formats, key, allowance) : null;
      const length = key === "length" ? value : otherValue;
      const width = key === "width" ? value : otherValue;
      valid = (!formats.length || strictSizeFitsFormats(length, width, formats, allowance));
      weightTooHigh = !heavySizeAllowed(length + allowance, width + allowance);
      valid = valid && !weightTooHigh;
    } else {
      max = formats.length ? strictMaxDimensionForFormats(formats, key, allowance) : null;
      valid = Number.isFinite(max) ? value <= max : true;
    }

    if (!valid) {
      input.value = "";
      updateSizeRowAvailability(row);
      recalc();
      if (weightTooHigh) {
        setSizeFieldError(row, key, `${label}: расчётная масса составной детали превышает ${data.meta.heavyPlateTargetKgMax} кг. Уменьшите размер детали.`);
      } else {
        const fallbackMax = formats.length ? strictMaxDimensionForFormats(formats, key, allowance) : null;
        setSizeFieldError(
          row,
          key,
          Number.isFinite(max ?? fallbackMax) ? `${label}: допустимо от 1 до ${Math.floor(max ?? fallbackMax)}.` : `${label}: размер не помещается в подтверждённый формат основы.`
        );
      }
      return false;
    }

    setSizeFieldError(row, key, "");
    recalc();
    return true;
  }

  function revalidateCustomSizeRows() {
    $$('[data-size-row]', form.sizeRows).forEach((row) => {
      if (row.dataset.sizeMode !== "custom") return;
      clearSizeErrors(row);

      const lengthInput = $('[data-size-length]', row);
      const widthInput = $('[data-size-width]', row);
      const length = Number(lengthInput?.value);
      const width = Number(widthInput?.value);

      if (Number.isFinite(length) && length > 0 && Number.isFinite(width) && width > 0) {
        validateCustomSizeOnBlur(widthInput, row, "width", "Ширина");
      } else if (Number.isFinite(length) && length > 0) {
        validateCustomSizeOnBlur(lengthInput, row, "length", "Длина");
      } else if (Number.isFinite(width) && width > 0) {
        validateCustomSizeOnBlur(widthInput, row, "width", "Ширина");
      }
    });
  }

  function updateEdgeUI() {
    updateAttachedEdgeAvailability();
    const mode = form.edgeModeSelect.value;
    form.attachedEdgeFields.classList.toggle("is-hidden", mode !== "attached");
    form.separateEdgeFields.classList.toggle("is-hidden", mode !== "separate");
    form.edgeCommentField.classList.toggle("is-hidden", mode === "none");
    if (mode !== "separate") {
      setSeparateEdgeMetersError("");
      setAutocompleteError(form.separateEdgeMaterialInput, form.separateEdgeMaterialError, "");
    }
    if (mode !== "attached") setAutocompleteError(form.edgeMaterialInput, form.edgeMaterialError, "");
    syncEdgeVeneerDefaults();
    recalc();
  }

  function edgeMetersForSize(size) {
    const rule = data.edgeSides.find((x) => x.id === form.edgeSidesSelect.value);
    return Core.edgeMetersForSize(size, rule);
  }
  function nonstandardRateFor(thicknessRaw, sides, baseId = selectedBase()?.id || "mdf") {
    return Core.nonstandardRateFor(data, baseId, thicknessRaw, sides);
  }
  function automaticBaseRateFor(thicknessRaw, sides, baseId = selectedBase()?.id || "mdf") {
    const key = normalizeThicknessKey(thicknessRaw);
    const row = (data?.nonstandardRates || []).find((item) => (
      item.baseId === baseId &&
      normalizeThicknessKey(item.thickness) === key &&
      Number(item.sides) === Number(sides)
    ));
    const rate = num(row?.baseRatePerM2);
    return Number.isFinite(rate) ? rate : null;
  }

  function standardProductionRateFor(thicknessRaw, sides, veneerThickness = selectedVeneerThickness(), baseId = selectedBase()?.id || "mdf") {
    return Core.standardProductionRateFor(data, baseId, thicknessRaw, sides, veneerThickness);
  }
  function cuttingRateFor(thicknessRaw, baseId = selectedBase()?.id || "mdf") {
    return Core.cuttingRateFor(data, baseId, thicknessRaw);
  }
  function attachedEdgeRateFor(thicknessRaw, edgeThickness, runningM, baseId = selectedBase()?.id || "mdf") {
    return Core.edgeRateFor(data, baseId, thicknessRaw, edgeThickness, runningM);
  }

  const standardSheetPrices = Core.standardSheetPrices;

  const weightForSize = Core.weightForSize;
  const weightText = Core.weightText;

  function levelValidation(item, level, purchase, warnings, label) {
    Core.validateVeneerPriceLevel(
      item,
      level,
      purchase,
      warnings,
      label,
      num(item?.thicknessMm ?? form.veneerThicknessInput.value)
    );
  }

  const veneerPurchase = Core.veneerPurchase;

  function calculate() {
    if (!data) return null;
    capturePositionFinishStateFromDom();
    const warnings = [], breakdown = [], sizes = readSizeRows();
    sizes.forEach((size) => {
      validateSizeQuantity(size.row, Boolean(size.mode && size.length > 0 && size.width > 0));
      validateSizeBaseWastePercent(size.row);
      updateSizeTransitionUI(size.row);
    });
    const quantityInvalidRows = sizes.filter((size) => size.mode && size.length > 0 && size.width > 0 && !size.quantityValid);
    const baseWasteInvalidRows = sizes.filter((size) => size.mode && size.length > 0 && size.width > 0 && size.resultMode === "allowance20" && !size.baseWastePercentValid);
    const transitionQuantityInvalidRows = sizes.filter((size) => size.transition && size.quantityValid && Number.isFinite(size.quantity) && size.quantity > 1);
    const transitionDescriptionInvalidRows = sizes.filter((size) => size.transition && !size.comment && !size.files.length);
    const technologicalSizeInvalidRows = sizes.filter((size) => size.physicalSizeValid !== false && size.technologicalSizeValid === false);
    const sizeValidation = {
      valid: quantityInvalidRows.length === 0 && baseWasteInvalidRows.length === 0 && transitionQuantityInvalidRows.length === 0 && transitionDescriptionInvalidRows.length === 0 && technologicalSizeInvalidRows.length === 0,
      quantityInvalidPositions: quantityInvalidRows.map((size) => size.position),
      baseWasteInvalidPositions: baseWasteInvalidRows.map((size) => size.position),
      transitionQuantityInvalidPositions: transitionQuantityInvalidRows.map((size) => size.position),
      transitionDescriptionInvalidPositions: transitionDescriptionInvalidRows.map((size) => size.position),
      technologicalSizeInvalidPositions: technologicalSizeInvalidRows.map((size) => size.position),
      error: quantityInvalidRows.length
        ? "Введите количество целым числом от 1."
        : baseWasteInvalidRows.length
          ? "Введите отход основы числом от 0."
        : transitionQuantityInvalidRows.length
          ? "Для перехода рисунка каждая деталь должна быть отдельной позицией. Укажите 1 шт. и добавьте отдельные позиции для остальных деталей."
          : transitionDescriptionInvalidRows.length
            ? "Добавьте описание перехода рисунка или приложите файл."
            : technologicalSizeInvalidRows.length
              ? (() => {
                  const limit = technologicalSizeInvalidRows[0].technologicalSizeLimit;
                  return `Для нестандартной готовой детали со шлифовкой, лаком и кромкой при этой толщине максимум ${limit?.maxLengthMm || "—"} × ${limit?.maxWidthMm || "—"} мм.`;
                })()
              : ""
    };
    if (quantityInvalidRows.length) warnings.push("Введите количество целым числом от 1.");
    if (baseWasteInvalidRows.length) warnings.push("Введите отход основы числом от 0.");
    if (transitionQuantityInvalidRows.length) warnings.push("Для перехода рисунка каждая деталь должна быть отдельной позицией. Укажите 1 шт. и добавьте отдельные позиции для остальных деталей.");
    if (transitionDescriptionInvalidRows.length) warnings.push("Добавьте описание перехода рисунка или приложите файл.");
    technologicalSizeInvalidRows.forEach((size) => {
      const limit = size.technologicalSizeLimit;
      warnings.push(`Позиция ${size.position}: нестандартная готовая деталь со шлифовкой, лаком и кромкой при толщине ${String(parseThicknessComposition(currentBaseThicknessRaw()).total).replace(".", ",")} мм — максимум ${limit?.maxLengthMm || "—"} × ${limit?.maxWidthMm || "—"} мм.`);
    });
    const validSizes = sizes.filter((x) => x.sizeValid && x.length > 0 && x.width > 0 && x.quantityValid && x.baseWastePercentValid);
    const base = selectedBase(), thickness = parseThicknessComposition(currentBaseThicknessRaw()), sides = Number(form.veneeredSidesSelect.value), condition = form.clientConditionSelect.value || "retail", mdfVolumeId = form.mdfVolumeConditionSelect.value || "none", layout = form.layoutSelect.value, herringbone = layout === "herringbone", customLayout = layout === "custom", selectionMarkup = currentSelectionMarkup();
    const classifiedSizes = validSizes.map((size) => ({ size, classification: classifySize(size) }));
    const standardPieceCount = classifiedSizes.reduce((sum, row) => sum + (row.classification.id === "warehouse_standard" ? row.size.quantity : 0), 0);
    const selectionId = base?.id === "mdf" ? automaticMdfSelectionId(thickness.total, standardPieceCount) : "none";
    const manualDiscount = priceOverride("manager:nonstandard", 0);
    form.manualDiscountInput.value = String(manualDiscount);
    let retailTotal = 0, finalTotal = 0, totalArea = 0, totalProductionArea = 0, totalPieces = 0, hasPartialPrice = false, allStandard = validSizes.length > 0;
    let standardFinalSubtotal = 0, standardRequestFinalSubtotal = 0, nonstandardFinalSubtotal = 0;
    let veneerRequiredStandardA = 0, veneerRequiredStandardB = 0, veneerRequiredNonstandardA = 0, veneerRequiredNonstandardB = 0;
    let cuttingMetersTotal = 0, cuttingCostTotal = 0, sandingCostTotal = 0;
    const itemResults = [], veneerPricings = [], mdfPricings = [];
    const positionCostByRowId = new Map();
    let positionPricingBlockedBySharedManualBase = false;
    const addPositionCost = (sizeOrRowId, value) => {
      const rowId = typeof sizeOrRowId === "string" ? sizeOrRowId : sizeOrRowId?.rowId;
      const cost = Number(value);
      if (!rowId || !Number.isFinite(cost) || Math.abs(cost) < 0.000001) return;
      positionCostByRowId.set(rowId, (positionCostByRowId.get(rowId) || 0) + cost);
    };
    const allocatePositionCost = (items, totalCost, weightForItem) => {
      const cost = Number(totalCost);
      if (!Number.isFinite(cost) || Math.abs(cost) < 0.000001 || !items?.length) return;
      const weighted = items
        .map((item) => ({ item, weight: Math.max(0, Number(weightForItem(item)) || 0) }))
        .filter((row) => row.weight > 0);
      const totalWeight = weighted.reduce((sum, row) => sum + row.weight, 0);
      if (!(totalWeight > 0)) return;
      weighted.forEach(({ item, weight }) => addPositionCost(item, cost * weight / totalWeight));
    };
    const standardRequestWarnings = new Set();

    if (!base) warnings.push("Не выбрана основа.");
    if (!Number.isFinite(thickness.total)) warnings.push("Не задана корректная толщина основы.");
    if (!selectedVeneerAGroup) warnings.push(form.veneerAInput.value.trim() ? "Выберите точное наименование шпона стороны А из справочника." : "Не выбран шпон стороны А.");
    if (selectedVeneerAGroup && Number.isFinite(selectedVeneerThickness()) && selectedVeneerAGroup.type === "natural" && !selectedVeneerA) warnings.push("Для выбранного натурального шпона выберите распил.");
    if (sides === 2 && form.veneerBModeSelect.value === "other" && selectedVeneerBGroup?.type === "natural" && !selectedVeneerB) warnings.push("Для натурального шпона стороны Б выберите распил.");
    if (selectedVeneerAGroup && !selectedVeneerA && !Number.isFinite(selectedVeneerThickness())) warnings.push("Не выбрана толщина лицевого шпона.");
    if (!layout) warnings.push("Не выбрана раскладка шпона.");
    const layoutDescriptionValid = !layoutNeedsTz(layout) || layoutHasDescriptionOrFile();
    if (!layoutDescriptionValid) warnings.push("Добавьте описание раскладки или приложите файл.");
    setLayoutTzError(layoutNeedsTz(layout) && !layoutDescriptionValid);

    validSizes.forEach((size) => {
      totalArea += size.area; totalProductionArea += size.calcArea || size.area; totalPieces += size.quantity;
      const weight = weightForSize(size, base, thickness);
      const classification = classifySize(size);
      const standard = classification.warehouse;

      if (standard) {
        const mdfConditionKey = mdfVolumeId && mdfVolumeId !== "none" ? mdfVolumeId : condition;
        const discountKey = `mdf:${standard.id}:${mdfConditionKey}:discount`;
        const selectionKey = `mdf:${standard.id}:${selectionId}:selection`;
        const p = standardSheetPrices(standard, condition, selectionId, mdfVolumeId, warnings, {
          discountPercent: priceAdjustmentOverrides.has(discountKey) ? priceAdjustmentOverrides.get(discountKey) : null,
          markupPercent: priceAdjustmentOverrides.has(selectionKey) ? priceAdjustmentOverrides.get(selectionKey) : null
        });
        let retailCost = Number.isFinite(p.retailSheet) ? p.retailSheet * size.quantity : 0;
        let finalCost = Number.isFinite(p.finalSheet) ? p.finalSheet * size.quantity : 0;
        if (cleanCuttingRequired(size)) {
          const meters = ((size.length + size.width) * 2 / 1000) * size.quantity;
          const rate = cuttingRateFor(thickness.raw, base?.id);
          cuttingMetersTotal += meters;
          if (Number.isFinite(rate)) {
            const cuttingCost = meters * rate;
            cuttingCostTotal += cuttingCost;
            retailCost += cuttingCost;
            finalCost += cuttingCost;
            breakdown.push({ label: "Чистовой раскрой", value: cuttingCost, note: `${round(meters, 2)} пог. м × ${money(rate)}/пог. м.` });
          } else {
            warnings.push(`Нет подтверждённого тарифа припила для толщины ${thickness.total ?? "—"} мм.`);
            hasPartialPrice = true;
          }
        }
        retailTotal += retailCost; finalTotal += finalCost; standardFinalSubtotal += finalCost; if (p.partial) hasPartialPrice = true;
        mdfPricings.push({
          standard, size, quantity: size.quantity, selectionId, mdfVolumeId, condition,
          discountKey, selectionKey, ...p
        });
        breakdown.push({ label: `Складской стандарт ${size.length}×${size.width}`, value: finalCost, note: `${money(p.finalSheet)}/лист × ${size.quantity}. Цена за м² рассчитывается из цены за лист.` });
        addPositionCost(size, finalCost);
        itemResults.push({ ...size, standard: true, classificationId: classification.id, classificationName: classification.name, standardItem: standard, retailCost, finalCost, veneerRequiredA: 0, veneerRequiredB: 0, veneerWastePercent: null, weight });
        return;
      }

      const area = size.calcArea || size.area;
      let retailCost = 0, finalCost = 0, baseMaterialCost = 0, baseWork = 0;
      let itemVeneerRequiredA = 0, itemVeneerRequiredB = 0;

      if (classification.id === "standard_request") {
        const veneerThickness = selectedVeneerThickness();
        const rate = standardProductionRateFor(thickness.raw, sides, veneerThickness, base?.id);
        if (Number.isFinite(rate)) {
          baseWork = area * rate;
          retailCost += baseWork;
          finalCost += baseWork;
          breakdown.push({
            label: `Стандарт по запросу · ${size.length}×${size.width}`,
            value: baseWork,
            note: `${money(rate)}/м² · шпон ${Number.isFinite(veneerThickness) && veneerThickness >= 1.5 ? "от 1,5 мм" : "0,6 мм"}.`
          });
        } else if (base?.id === "mdf" || base?.id === "dsp") {
          const key = `standard-request-${base.id}-${thickness.raw || thickness.total}-${veneerThickness || "none"}-${sides}`;
          if (!standardRequestWarnings.has(key)) {
            warnings.push(`Стандарт по запросу: нет подтверждённой ставки для ${base.name} ${thickness.raw || thickness.total || "—"} мм, ${sides} ст., шпон ${Number.isFinite(veneerThickness) ? `${String(veneerThickness).replace(".", ",")} мм` : "—"}. Базовая стоимость не включена.`);
            standardRequestWarnings.add(key);
          }
          hasPartialPrice = true;
        } else {
          // Стоимость материала основы для этой толщины вводится отдельно по данным производства.
          // Сам по себе ручной источник цены не делает расчёт неполным.
        }

        // Материал лицевого шпона всегда берётся из актуального шпоновочного прайса отдельно.
        // Обычный стандарт не получает 80% отхода нестандарта; для диагонали действует отдельное подтверждённое правило 120%.
        const standardVeneerWastePercent = layout === "diagonal45" ? num(data.meta.diagonalVeneerWastePercent) : 0;
        const standardVeneerCoefficient = 1 + (Number.isFinite(standardVeneerWastePercent) ? standardVeneerWastePercent : 0) / 100;
        itemVeneerRequiredA = area * standardVeneerCoefficient;
        veneerRequiredStandardA += itemVeneerRequiredA;
        if (sides === 2 || form.reverseSideSelect.value === "same") {
          itemVeneerRequiredB = area * standardVeneerCoefficient;
          veneerRequiredStandardB += itemVeneerRequiredB;
        } else if (form.reverseSideSelect.value === "rough") {
          const roughRates = data.meta.roughBackVeneerRatesPerM2ByThickness || {};
          const roughRate = Number.isFinite(veneerThickness) && Math.abs(veneerThickness - 0.6) < 0.001
            ? num(roughRates["0.6"])
            : Number.isFinite(veneerThickness) && Math.abs(veneerThickness - 1.5) < 0.001
              ? num(roughRates["1.5"])
              : null;
          if (Number.isFinite(roughRate)) {
            const rough = area * roughRate;
            retailCost += rough;
            finalCost += rough;
            breakdown.push({ label: "Черновая рубашка стороны Б · стандарт", value: rough, note: `${money(roughRate)}/м² для шпона ${String(veneerThickness).replace(".", ",")} мм.` });
          } else {
            warnings.push("Стандарт по запросу: для выбранной толщины лицевого шпона нет подтверждённой ставки черновой рубашки; стоимость не включена.");
            hasPartialPrice = true;
          }
        } else if (form.reverseSideSelect.value === "paper") {
          const paperRate = num(data.meta.paperBackRatePerM2);
          if (Number.isFinite(paperRate)) {
            const paper = area * paperRate;
            retailCost += paper;
            finalCost += paper;
            breakdown.push({ label: "Бумага стороны Б · стандарт", value: paper, note: `${money(paperRate)}/м².` });
          } else {
            warnings.push("Стандарт по запросу: ставка бумаги на обратной стороне не задана; стоимость не включена.");
            hasPartialPrice = true;
          }
        }

        const sandingRate = sides === 2 ? data.meta.sandingRatesPerM2.twoSides : data.meta.sandingRatesPerM2.oneSide;
        const sanding = area * sandingRate;
        sandingCostTotal += sanding;
        retailCost += sanding;
        finalCost += sanding;
        breakdown.push({ label: "Шлифовка · стандарт по запросу", value: sanding, note: `${sides} ст. × ${money(sandingRate)}/м².` });

        if (layout === "diagonal45") {
          const diagonalRate = num(data.meta.diagonalWorkSurchargePerM2);
          if (Number.isFinite(diagonalRate)) {
            const diagonalCost = area * diagonalRate;
            retailCost += diagonalCost;
            finalCost += diagonalCost;
            breakdown.push({ label: "Диагональ 45° · стандарт по запросу", value: diagonalCost, note: `Дополнительная работа ${money(diagonalRate)}/м²; отход лицевого шпона ${round(standardVeneerWastePercent, 1)}%.` });
          } else {
            warnings.push("Диагональ 45°: ставка дополнительной работы не задана; стоимость не включена.");
            hasPartialPrice = true;
          }
        }

        if (cleanCuttingRequired(size)) {
          const meters = ((size.length + size.width) * 2 / 1000) * size.quantity;
          const rate = cuttingRateFor(thickness.raw, base?.id);
          cuttingMetersTotal += meters;
          if (Number.isFinite(rate)) {
            const cuttingCost = meters * rate;
            cuttingCostTotal += cuttingCost;
            retailCost += cuttingCost;
            finalCost += cuttingCost;
            breakdown.push({ label: "Чистовой раскрой", value: cuttingCost, note: `${round(meters, 2)} пог. м × ${money(rate)}/пог. м.` });
          } else {
            warnings.push(`Нет подтверждённого тарифа припила для толщины ${thickness.total ?? "—"} мм.`);
            hasPartialPrice = true;
          }
        }

        if (size.transition) {
          warnings.push(`Позиция ${size.position}: переход рисунка для стандартного формата подтверждён как возможный, но отдельная формула доплаты стандарта не подтверждена. Базовая ставка стандарта включена, доплата за переход — по согласованию.`);
          hasPartialPrice = true;
        }

        retailTotal += retailCost;
        finalTotal += finalCost;
        standardRequestFinalSubtotal += finalCost;
        addPositionCost(size, finalCost);
        itemResults.push({ ...size, standard: true, classificationId: classification.id, classificationName: classification.name, retailCost, finalCost, veneerRequiredA: itemVeneerRequiredA, veneerRequiredB: itemVeneerRequiredB, veneerWastePercent: standardVeneerWastePercent, weight });
        return;
      }

      allStandard = false;
      if (base?.id === "mdf" || base?.id === "dsp") {
        if (size.resultMode === "allowance20") {
          if (base.id === "mdf") {
            if (selectedBasePriceMode() === "automatic") {
              const baseRate = automaticBaseRateFor(thickness.raw, sides, base.id);
              if (Number.isFinite(baseRate)) {
                const baseWastePercent = Number.isFinite(size.baseWastePercent)
                  ? size.baseWastePercent
                  : (num(data?.meta?.allowance20DefaultBaseWastePercent) || 25);
                const baseWasteCoefficient = 1 + baseWastePercent / 100;
                baseMaterialCost = area * baseRate * baseWasteCoefficient;
                breakdown.push({
                  label: `Основа МДФ · полуфабрикат ${size.length}×${size.width} +20`,
                  value: baseMaterialCost,
                  note: `${money(baseRate)}/м² × ${round(baseWasteCoefficient, 3)} · отход основы ${round(baseWastePercent, 1)}%. Фиксированный отход основы 53% обычного нестандарта здесь не применяется.`
                });
              } else {
                warnings.push(`Полуфабрикат ${size.length}×${size.width} +20: для МДФ ${thickness.raw || "—"} мм не найдена автоматическая ставка основы; стоимость основы не включена.`);
                hasPartialPrice = true;
              }
            }
            const rate = num(data?.meta?.allowance20MdfWorkRatePerM2) || 1500;
            baseWork = area * rate;
            breakdown.push({ label: `Работа · полуфабрикат ${size.length}×${size.width} +20`, value: baseWork, note: `${money(rate)}/м². Это только работа; отход основы учитывается отдельно в стоимости материала.` });
          } else {
            warnings.push(`Полуфабрикат ${size.length}×${size.width} +20: автоматическая ставка работы для ${base.name} не подтверждена; компонент не включён.`);
            hasPartialPrice = true;
          }
        } else {
          const rate = nonstandardRateFor(thickness.raw, sides, base.id);
          if (Number.isFinite(rate)) {
            baseWork = area * rate;
            breakdown.push({ label: `${base.name} + работа, ${size.length}×${size.width}`, value: baseWork, note: `Готовая ставка из актуальной таблицы деталировки: ${money(rate)}/м². Коэффициент 1,53 повторно не применяется.` });
            const faceThickness = selectedVeneerThickness();
            if (Number.isFinite(faceThickness) && Math.abs(faceThickness - 0.6) > 0.001) {
              const key = `nonstandard-thick-veneer-${faceThickness}`;
              if (!standardRequestWarnings.has(key)) {
                warnings.push(`Нестандарт со шпоном ${String(faceThickness).replace(".", ",")} мм: более ранний подтверждённый источник указывает, что толщина лицевого шпона влияет на тариф нестандарта, а новая таблица «Для деталировки» не разделяет ставки по толщине шпона. Ставка основы + работы включена как подтверждённый компонент, но возможная доплата за толстый шпон не рассчитана.`);
                standardRequestWarnings.add(key);
              }
              hasPartialPrice = true;
            }
          } else { warnings.push(`Нет подтверждённой ставки нестандарта для ${base.name} ${thickness.raw || "—"} мм, ${sides} ст.`); hasPartialPrice = true; }
        }
      } else if (base) {
        // Для толщин без автоматической цены материал основы будет добавлен один раз ниже
        // по цене и оплачиваемому объёму, переданным производством.
      }
      if (size.transition && size.resultMode === "allowance20") {
        warnings.push(`Позиция ${size.position}: для сочетания «С припуском +20 мм» + «Переход рисунка» отдельная формула доплаты не подтверждена. Основа и работа +20 включены известными компонентами, доплата за переход рисунка не рассчитана.`);
        hasPartialPrice = true;
      } else if (size.transition && Number.isFinite(baseWork) && baseWork > 0) {
        const normalCoefficient = num(data.meta.nonstandardBaseWasteCoefficient) || 1.53;
        const transitionCoefficient = num(data.meta.transitionMarkupCoefficient) || 2.53;
        const transitionWork = baseWork / normalCoefficient * transitionCoefficient;
        const transitionSurcharge = transitionWork - baseWork;
        baseWork = transitionWork;
        breakdown.push({
          label: `Переход рисунка · позиция ${size.position}`,
          value: transitionSurcharge,
          note: `Для компонента ${base.name} + работа коэффициент ${String(normalCoefficient).replace(".", ",")} заменён на ${String(transitionCoefficient).replace(".", ",")}; шпон, распил, кромка и финиш не умножаются.`
        });
      } else if (size.transition) {
        warnings.push(`Позиция ${size.position}: переход рисунка выбран, но базовая ставка ${base?.name || "основы"} + работы не подтверждена; доплата не рассчитана.`);
        hasPartialPrice = true;
      }
      retailCost += baseMaterialCost + baseWork; finalCost += baseMaterialCost + baseWork;

      let veneerWastePercent = data.meta.nonstandardVeneerWastePercent;
      if (layout === "diagonal45" || herringbone) veneerWastePercent = data.meta.diagonalVeneerWastePercent;
      if (customLayout) {
        veneerWastePercent = null;
        hasPartialPrice = true;
        warnings.push("Раскладка по ТЗ: процент отхода шпона должен быть определён для конкретного ТЗ; шпон не включён в автоматическую стоимость.");
      }
      if (Number.isFinite(veneerWastePercent)) {
        const required = area * (1 + veneerWastePercent / 100);
        itemVeneerRequiredA = required;
        veneerRequiredNonstandardA += itemVeneerRequiredA;
        if (sides === 2 || form.reverseSideSelect.value === "same") {
          itemVeneerRequiredB = required;
          veneerRequiredNonstandardB += itemVeneerRequiredB;
        }
        else if (form.reverseSideSelect.value === "rough") {
          const faceThickness = selectedVeneerThickness();
          const roughRates = data.meta.roughBackVeneerRatesPerM2ByThickness || {};
          const roughRate = Number.isFinite(faceThickness) && Math.abs(faceThickness - 0.6) < 0.001
            ? num(roughRates["0.6"])
            : Number.isFinite(faceThickness) && Math.abs(faceThickness - 1.5) < 0.001
              ? num(roughRates["1.5"])
              : null;
          if (Number.isFinite(roughRate)) {
            const rough = area * roughRate; retailCost += rough; finalCost += rough;
            breakdown.push({ label: "Черновой шпон стороны Б", value: rough, note: `${money(roughRate)}/м² для подтверждённой толщины ${String(faceThickness).replace(".", ",")} мм.` });
          } else {
            hasPartialPrice = true;
            warnings.push(`Черновая сторона Б: для лицевого шпона ${String(faceThickness).replace(".", ",")} мм нет подтверждённой ставки рубашки; компонент оставлен на согласование.`);
            breakdown.push({ label: "Черновой шпон стороны Б", value: 0, note: "Тариф для этой толщины не подтверждён — не включён автоматически." });
          }
        } else if (form.reverseSideSelect.value === "paper") {
          const paperRate = num(data.meta.paperBackRatePerM2);
          if (Number.isFinite(paperRate)) {
            const paper = area * paperRate; retailCost += paper; finalCost += paper;
            breakdown.push({ label: "Бумага стороны Б", value: paper, note: `${money(paperRate)}/м².` });
          } else {
            warnings.push("Для бумаги на обратной стороне ставка не задана; стоимость не включена.");
            hasPartialPrice = true;
          }
        }
      }

      if (layout === "diagonal45") { const c = area * data.meta.diagonalWorkSurchargePerM2; retailCost += c; finalCost += c; breakdown.push({ label: "Диагональ 45°", value: c, note: `Дополнительная работа ${money(data.meta.diagonalWorkSurchargePerM2)}/м².` }); }
      if (herringbone) { const c = area * data.meta.herringboneWorkSurchargePerM2; retailCost += c; finalCost += c; breakdown.push({ label: "Ёлочка", value: c, note: `Дополнительная работа ${money(data.meta.herringboneWorkSurchargePerM2)}/м²; требуется оцифровка по ТЗ.` }); }

      if (cleanCuttingRequired(size)) {
        const meters = ((size.length + size.width) * 2 / 1000) * size.quantity, rate = cuttingRateFor(thickness.raw, base?.id);
        cuttingMetersTotal += meters;
        if (Number.isFinite(rate)) {
          const c = meters * rate;
          cuttingCostTotal += c;
          retailCost += c; finalCost += c;
          breakdown.push({ label: "Чистовой раскрой", value: c, note: `${round(meters, 2)} пог. м × ${money(rate)}/пог. м.` });
        } else { warnings.push(`Нет подтверждённого тарифа припила для толщины ${thickness.total ?? "—"} мм.`); hasPartialPrice = true; }
      }

      const sandingRate = sides === 2 ? data.meta.sandingRatesPerM2.twoSides : data.meta.sandingRatesPerM2.oneSide;
      const sanding = area * sandingRate;
      sandingCostTotal += sanding;
      retailCost += sanding; finalCost += sanding;
      breakdown.push({ label: "Шлифовка", value: sanding, note: `${sides} ст. × ${money(sandingRate)}/м².` });

      retailTotal += retailCost; finalTotal += finalCost; nonstandardFinalSubtotal += finalCost;
      addPositionCost(size, finalCost);
      itemResults.push({ ...size, standard: false, classificationId: classification.id, classificationName: classification.name, retailCost, finalCost, veneerRequiredA: itemVeneerRequiredA, veneerRequiredB: itemVeneerRequiredB, veneerWastePercent, weight });
    });

    if (!validSizes.length) warnings.push("Не добавлен ни один заполненный размер.");

    let manualBasePricing = { required: manualBasePriceRequired(), valid: true, source: manualBasePriceRequired() ? "manager" : "automatic", cost: null };
    if (base && manualBasePriceRequired()) {
      const cost = manualBasePriceValue();
      const validManual = Number.isFinite(cost) && cost > 0;
      manualBasePricing = { required: true, valid: validManual, source: "manager", cost: validManual ? cost : null };
      if (validManual) {
        retailTotal += cost;
        finalTotal += cost;
        if (validSizes.length === 1) addPositionCost(validSizes[0], cost);
        else if (validSizes.length > 1) positionPricingBlockedBySharedManualBase = true;
        breakdown.push({
          label: "Стоимость основы",
          value: cost,
          note: "Введено вручную · итоговая стоимость всего объёма основы для этой позиции по данным производства."
        });
      } else {
        warnings.push(`${base.name} ${thickness.raw || "—"} мм: стоимость основы от производства пока не указана.`);
        hasPartialPrice = true;
      }
    }

    const allocateVeneerCostToPositions = (cost, which, sameAsA, pricingMode) => {
      const classificationId = pricingMode === "nonstandard" ? "nonstandard" : "standard_request";
      const items = itemResults.filter((item) => item.classificationId === classificationId);
      allocatePositionCost(items, cost, (item) => {
        if (which === "A" && sameAsA) return (item.veneerRequiredA || 0) + (item.veneerRequiredB || 0);
        return which === "B" ? (item.veneerRequiredB || 0) : (item.veneerRequiredA || 0);
      });
    };

    const addVeneerComponent = (item, requiredArea, which, label, markup = 0, sameAsA = false, pricingMode = "standard") => {
      if (!item || !Number.isFinite(requiredArea) || requiredArea <= 0) return;
      const pricing = automaticVeneerPricing(item, requiredArea, which, pricingMode);
      if (!pricing || !Number.isFinite(pricing.retailPrice) || !Number.isFinite(pricing.finalPrice)) {
        warnings.push(`${label}: цена шпона не найдена в выбранной позиции; компонент не включён в стоимость.`);
        hasPartialPrice = true;
        veneerPricings.push({ which, item, sameAsA, pricingMode, ...(pricing || {}), label });
        return;
      }
      const retailPurchase = veneerPurchase(item, requiredArea, pricing.retailPrice, 0, warnings, label);
      const finalPurchase = veneerPurchase(item, requiredArea, pricing.finalPrice, markup, warnings, label);
      retailTotal += retailPurchase.cost;
      finalTotal += finalPurchase.cost;
      if (pricingMode === "nonstandard") nonstandardFinalSubtotal += finalPurchase.cost;
      else standardRequestFinalSubtotal += finalPurchase.cost;
      allocateVeneerCostToPositions(finalPurchase.cost, which, sameAsA, pricingMode);
      hasPartialPrice ||= retailPurchase.partial || finalPurchase.partial;
      veneerPricings.push({ which, item, sameAsA, pricingMode, label, ...pricing, retailPurchase, finalPurchase, selectionMarkup: markup });
      if (finalPurchase.cost > 0) {
        breakdown.push({
          label,
          value: finalPurchase.cost,
          note: `${finalPurchase.note}${markup ? ` · отбор +${round(markup * 100, 1)}%` : ""} · ${pricing.levelName}${pricingMode === "nonstandard" ? " · нестандарт: только розничная цена" : ""}`
        });
      }
    };

    const addVeneerContext = (requiredA, requiredB, pricingMode, contextLabel) => {
      if (!(requiredA > 0 || requiredB > 0)) return;
      const sameVeneerOnB = requiredB > 0 && (
        (sides === 2 && form.veneerBModeSelect.value === "same") ||
        (sides === 1 && form.reverseSideSelect.value === "same")
      );

      if (sameVeneerOnB && isFaceOnlyExtraVeneer(selectedVeneerA)) {
        addVeneerComponent(selectedVeneerA, requiredA, "A", `Шпон стороны А${contextLabel}`, selectionMarkup, false, pricingMode);
        const backB = backsideBVariantFor(selectedVeneerA);
        if (backB) addVeneerComponent(backB, requiredB, "B", `Шпон стороны Б (категория B)${contextLabel}`, 0, false, pricingMode);
        else {
          warnings.push(`Сторона Б${contextLabel}: для Extra/AA нельзя автоматически дублировать лицевой шпон; цена категории B для выбранной позиции не найдена.`);
          hasPartialPrice = true;
        }
      } else if (sameVeneerOnB) {
        addVeneerComponent(selectedVeneerA, requiredA + requiredB, "A", `Шпон сторон А и Б${contextLabel}`, selectionMarkup, true, pricingMode);
      } else {
        if (requiredA > 0) addVeneerComponent(selectedVeneerA, requiredA, "A", `Шпон стороны А${contextLabel}`, selectionMarkup, false, pricingMode);
        if (requiredB > 0) addVeneerComponent(selectedVeneerB, requiredB, "B", `Шпон стороны Б${contextLabel}`, 0, false, pricingMode);
      }
    };

    addVeneerContext(veneerRequiredStandardA, veneerRequiredStandardB, "standard", " · стандарт по запросу");
    addVeneerContext(veneerRequiredNonstandardA, veneerRequiredNonstandardB, "nonstandard", " · нестандарт");

    let attachedEdgeMeters = 0;
    if (form.edgeModeSelect.value === "attached") {
      const edgeMinThickness = num(data?.meta?.edgeMinBaseThicknessMm);
      const edgeMaxThickness = num(data?.meta?.edgeMaxBaseThicknessMm);
      if (Number.isFinite(thickness.total) && Number.isFinite(edgeMinThickness) && thickness.total < edgeMinThickness) {
        warnings.push(`Кромление недоступно для основы тоньше ${edgeMinThickness} мм.`);
        hasPartialPrice = true;
      } else if (Number.isFinite(thickness.total) && Number.isFinite(edgeMaxThickness) && thickness.total > edgeMaxThickness) {
        warnings.push(`Кромление недоступно для основы толще ${edgeMaxThickness} мм.`);
        hasPartialPrice = true;
      } else {
        const edgeSides = form.edgeSidesSelect.value;
        const edgeThickness = num(form.edgeThicknessSelect.value);

        if (!edgeSides) {
          warnings.push("Не выбраны стороны кромления.");
          hasPartialPrice = true;
        } else {
          attachedEdgeMeters = validSizes.reduce((sum, x) => sum + edgeMetersForSize(x), 0);
        }

        if (!Number.isFinite(edgeThickness)) {
          warnings.push("Не выбрана толщина кромки.");
          hasPartialPrice = true;
        } else if (attachedEdgeMeters > 0) {
          const rateInfo = attachedEdgeRateFor(thickness.raw, edgeThickness, attachedEdgeMeters, base?.id);
          if (rateInfo && Number.isFinite(rateInfo.rate)) {
            const c = attachedEdgeMeters * rateInfo.rate;
            const warehouseMeters = validSizes.filter((x) => classifySize(x).id === "warehouse_standard").reduce((sum, x) => sum + edgeMetersForSize(x), 0);
            const requestMeters = validSizes.filter((x) => classifySize(x).id === "standard_request").reduce((sum, x) => sum + edgeMetersForSize(x), 0);
            const nonstandardMeters = validSizes.filter((x) => classifySize(x).id === "nonstandard").reduce((sum, x) => sum + edgeMetersForSize(x), 0);
            retailTotal += c;
            finalTotal += c;
            validSizes.forEach((size) => addPositionCost(size, edgeMetersForSize(size) * rateInfo.rate));
            standardFinalSubtotal += warehouseMeters * rateInfo.rate;
            standardRequestFinalSubtotal += requestMeters * rateInfo.rate;
            nonstandardFinalSubtotal += nonstandardMeters * rateInfo.rate;
            breakdown.push({
              label: "Кромление",
              value: c,
              note: `${round(attachedEdgeMeters, 2)} пог. м × ${money(rateInfo.rate)}/пог. м · ${rateInfo.method === "machine"
                ? `станок (от ${rateInfo.threshold} пог. м)`
                : rateInfo.method === "manual"
                  ? `вручную (до ${rateInfo.threshold} пог. м)`
                  : "ранее подтверждённый тариф; новый порог ручное/станочное для этой толщины не задан"}.`
            });
          } else {
            warnings.push(`Нет подтверждённого тарифа кромления для ${base?.name || "основы"} ${thickness.raw || thickness.total || "—"} мм и кромки ${String(edgeThickness).replace(".", ",")} мм.`);
            hasPartialPrice = true;
          }
        }

        if (!selectedAttachedEdgeVeneer) {
          warnings.push("Не выбран шпон кромки.");
          hasPartialPrice = true;
        }
        if (form.edgeBevelSelect.value === "yes") {
          warnings.push("Фаска на кромке выбрана, но актуальный тариф не предоставлен.");
          hasPartialPrice = true;
        }
      }
    } else if (form.edgeModeSelect.value === "separate") {
      const meters = num(form.separateEdgeMetersInput.value);
      if (Number.isFinite(meters) && meters > 0 && meters < data.meta.edgeSeparateMinimumRunningM) {
        warnings.push(`Отдельная кромка производится от ${data.meta.edgeSeparateMinimumRunningM} пог. м. Укажите допустимый метраж или согласуйте исключение.`);
        hasPartialPrice = true;
      } else if (Number.isFinite(meters) && meters >= data.meta.edgeSeparateMinimumRunningM) {
        warnings.push("Для отдельной кромки актуальная цена не предоставлена; позиция сохраняется без автосчёта этой части.");
        hasPartialPrice = true;
      }
      if (!form.separateEdgeThicknessSelect.value) {
        warnings.push("Не выбрана толщина кромки.");
        hasPartialPrice = true;
      }
      if (!selectedSeparateEdgeVeneer) {
        warnings.push("Не выбран шпон кромки.");
        hasPartialPrice = true;
      }
    }

    const calibrationTarget = num(form.calibrationTargetInput.value);
    const calibrationDepth = num(form.calibrationDepthInput?.value);
    let calibrationCost = 0;
    const calibrationEnabled = base?.id === "mdf" && form.calibrationSelect.value === "yes";
    if (calibrationEnabled) {
      if (!Number.isFinite(calibrationTarget) || calibrationTarget <= 0) {
        warnings.push("Для калибровки укажите требуемую итоговую толщину.");
        hasPartialPrice = true;
      }
      const confirmedDepth = num(data.meta.calibrationConfirmedDepthMm);
      const calibrationRate = num(data.meta.calibrationRatePerM2For1Mm);
      if (Number.isFinite(calibrationDepth) && Number.isFinite(confirmedDepth) && Math.abs(calibrationDepth - confirmedDepth) < 0.001 && Number.isFinite(calibrationRate)) {
        const warehouseArea = validSizes.filter((x) => classifySize(x).id === "warehouse_standard").reduce((sum, x) => sum + (x.calcArea || x.area), 0);
        const requestArea = validSizes.filter((x) => classifySize(x).id === "standard_request").reduce((sum, x) => sum + (x.calcArea || x.area), 0);
        const nonstandardArea = validSizes.filter((x) => classifySize(x).id === "nonstandard").reduce((sum, x) => sum + (x.calcArea || x.area), 0);
        calibrationCost = (warehouseArea + requestArea + nonstandardArea) * calibrationRate;
        retailTotal += calibrationCost;
        finalTotal += calibrationCost;
        validSizes.forEach((size) => addPositionCost(size, (size.calcArea || size.area) * calibrationRate));
        standardFinalSubtotal += warehouseArea * calibrationRate;
        standardRequestFinalSubtotal += requestArea * calibrationRate;
        nonstandardFinalSubtotal += nonstandardArea * calibrationRate;
        breakdown.push({ label: "Калибровка", value: calibrationCost, note: `${money(calibrationRate)}/м² для подтверждённого съёма ${confirmedDepth} мм.` });
      } else {
        warnings.push(`Калибровка: автоматический тариф подтверждён только для съёма ${confirmedDepth || 1} мм. Для ${Number.isFinite(calibrationDepth) ? String(calibrationDepth).replace(".", ",") : "неуказанного"} мм стоимость не включена.`);
        hasPartialPrice = true;
      }
    }


    let toningCost = 0, standardToningCost = 0, requestToningCost = 0, nonstandardToningCost = 0;
    let isolatorCost = 0, standardIsolatorCost = 0, requestIsolatorCost = 0, nonstandardIsolatorCost = 0;
    const finishResults = [];
    const finishWarningKeys = new Set();
    validSizes.forEach((size) => {
      const config = effectiveFinishForSize(size);
      if (!config || config.finishId === "none") {
        finishResults.push({ position: size.position, rowId: size.rowId, config, summary: "Без покрытия", cost: 0 });
        return;
      }

      const area = size.calcArea || size.area;
      const classificationId = classifySize(size).id;
      const summary = finishSummary(config);
      let finishCost = 0;
      const rateInfo = finishRateInfo(config);

      if (rateInfo && Number.isFinite(rateInfo.rate)) {
        finishCost = area * rateInfo.rate;
        retailTotal += finishCost;
        finalTotal += finishCost;
        addPositionCost(size, finishCost);
        if (classificationId === "warehouse_standard") standardFinalSubtotal += finishCost;
        else if (classificationId === "standard_request") standardRequestFinalSubtotal += finishCost;
        else nonstandardFinalSubtotal += finishCost;
        breakdown.push({ label: `Финиш · позиция ${size.position}`, value: finishCost, note: `${money(rateInfo.rate)}/м² · ${rateInfo.note}.` });
      } else {
        const key = [config.finishId, config.lacquerType, config.lacquerProcess, config.enamelVariant, config.sides].join("|");
        if (!finishWarningKeys.has(key)) {
          finishWarningKeys.add(key);
          if (config.finishId === "custom") warnings.push("Финиш по ТЗ: индивидуальный расчёт, стоимость автоматически не включена.");
          else if (config.finishId === "lacquer" && config.lacquerType !== "acrylic") warnings.push("Полиуретановый лак: параметры сохранены, но актуальный тариф в новой таблице не указан; стоимость не включена.");
          else warnings.push(`${finishOption(config.finishId)?.name || "Финиш"}: для выбранной технологической схемы/числа сторон нет подтверждённого автоматического тарифа; стоимость не включена.`);
          hasPartialPrice = true;
        }
      }

      if (config.toning === "yes" && config.finishId === "lacquer") {
        const toningSides = finishSideCount(config.toningSides);
        const toningRatePerSide = num(data?.meta?.toningRatePerM2PerSide);
        if (toningSides > 0 && Number.isFinite(toningRatePerSide)) {
          const cost = area * toningRatePerSide * toningSides;
          toningCost += cost;
          addPositionCost(size, cost);
          if (classificationId === "warehouse_standard") standardToningCost += cost;
          else if (classificationId === "standard_request") requestToningCost += cost;
          else nonstandardToningCost += cost;
        }
      }

      if (config.isolator && config.isolator !== "no" && finishAllowsIsolator(config.finishId)) {
        const isolatorSides = finishSideCount(config.isolator);
        const isolatorRatePerSide = num(data?.meta?.isolatorRatePerM2);
        if (isolatorSides > 0 && Number.isFinite(isolatorRatePerSide)) {
          const cost = area * isolatorRatePerSide * isolatorSides;
          isolatorCost += cost;
          addPositionCost(size, cost);
          if (classificationId === "warehouse_standard") standardIsolatorCost += cost;
          else if (classificationId === "standard_request") requestIsolatorCost += cost;
          else nonstandardIsolatorCost += cost;
        }
      }

      if (config.finishId === "custom" && !config.comment && !(config.files || []).length) {
        warnings.push(`Позиция ${size.position}: для финиша по ТЗ добавьте комментарий или файл.`);
      }
      finishResults.push({ position: size.position, rowId: size.rowId, config, summary, cost: finishCost });
    });

    if (toningCost > 0) {
      retailTotal += toningCost;
      finalTotal += toningCost;
      standardFinalSubtotal += standardToningCost;
      standardRequestFinalSubtotal += requestToningCost;
      nonstandardFinalSubtotal += nonstandardToningCost;
      breakdown.push({ label: "Тонировка", value: toningCost, note: `${money(data.meta.toningRatePerM2PerSide)}/м² за сторону по позициям, где она выбрана.` });
    }

    if (isolatorCost > 0) {
      retailTotal += isolatorCost;
      finalTotal += isolatorCost;
      standardFinalSubtotal += standardIsolatorCost;
      standardRequestFinalSubtotal += requestIsolatorCost;
      nonstandardFinalSubtotal += nonstandardIsolatorCost;
      breakdown.push({ label: "Изолятор", value: isolatorCost, note: `${money(data.meta.isolatorRatePerM2)}/м² за сторону по позициям, где он выбран.` });
    }

    if (nonstandardFinalSubtotal > 0 && manualDiscount > 0) {
      if (manualDiscount > 10) warnings.push("Ручная скидка более 10% требует согласования с руководством.");
      const discount = nonstandardFinalSubtotal * manualDiscount / 100;
      finalTotal -= discount;
      nonstandardFinalSubtotal -= discount;
      const discountedItems = itemResults.filter((item) => item.classificationId === "nonstandard");
      allocatePositionCost(discountedItems, -discount, (item) => positionCostByRowId.get(item.rowId) || 0);
      breakdown.push({ label: `Скидка менеджера на нестандарт ${manualDiscount}%`, value: -discount, note: manualDiscount <= 10 ? "До 10% — полномочие менеджера." : "Требует согласования." });
    }
    if (!allStandard && condition !== "retail") warnings.push("Для нестандартных позиций VIP/лояльность и объёмные уровни шпона не применяются: используется розничная цена, а скидка менеджера задаётся отдельно.");
    if (base?.id === "dsp" && condition !== "retail") warnings.push("Для ДСП новая таблица подтверждает производственные ставки, но отдельная скидочная структура VIP/лояльность не задана. Условие клиента может применяться к шпону, если оно есть в шпоновом прайсе, но не уменьшает базовую ставку ДСП.");

    let mixMatchPurchaseArea = null;
    let mixMatchValid = true;
    if (layout === "mixmatch") {
      const productionVeneerRequired = veneerRequiredStandardA + veneerRequiredNonstandardA;
      if (productionVeneerRequired > 0 && selectedVeneerA) {
        const purchaseBasis = Core.veneerVolumeBasis(selectedVeneerA, productionVeneerRequired);
        mixMatchPurchaseArea = num(purchaseBasis.area) || productionVeneerRequired;
        if (mixMatchPurchaseArea < data.meta.mixMatchMinimumVeneerAreaM2) {
          mixMatchValid = false;
          warnings.push("Для MixMatch требуется не менее 50 м² шпона. Выберите другую раскладку.");
        }
      }
    }

    const invalidDiagonalSizes = layout === "diagonal45"
      ? validSizes.filter((size) => !diagonalSizeFits(size.length, size.width))
      : [];
    const diagonalValid = invalidDiagonalSizes.length === 0;
    if (!diagonalValid) warnings.push("Для раскладки „Диагональ 45°“ максимальный размер детали — 2800 × 2070 мм.");
    const layoutValidation = {
      valid: layoutDescriptionValid && mixMatchValid && diagonalValid,
      descriptionValid: layoutDescriptionValid,
      mixMatchValid,
      mixMatchPurchaseArea,
      diagonalValid,
      invalidDiagonalPositions: invalidDiagonalSizes.map((size) => size.position),
      error: !layoutDescriptionValid
        ? "Добавьте описание раскладки или приложите файл."
        : !mixMatchValid
          ? "Для MixMatch требуется не менее 50 м² шпона. Выберите другую раскладку."
          : !diagonalValid
            ? "Для раскладки „Диагональ 45°“ максимальный размер детали — 2800 × 2070 мм."
            : ""
    };
    const veneerThickness = selectedVeneerThickness();
    if (Number.isFinite(veneerThickness) && veneerThickness > 1.5 && sides !== 2) warnings.push("Шпон толще 1,5 мм требует двусторонней оклейки аналогичной толщиной.");
    if (Number.isFinite(veneerThickness) && veneerThickness > 1.5 && form.veneerBModeSelect.value === "other") warnings.push("Для шпона толще 1,5 мм нельзя комбинировать разные толщины на сторонах А и Б.");

    let weightMin = 0, weightMax = 0, hasWeight = false;
    itemResults.forEach((x) => { if (x.weight) { hasWeight = true; weightMin += x.weight.min; weightMax += x.weight.max; } });
    if (base && !base.weightDensityKgM3 && validSizes.length) warnings.push(`${base.name}: плотность в предоставленных данных не подтверждена; расчётный вес не выводится.`);
    const totalWeight = hasWeight ? { min: weightMin, max: weightMax } : null;

    const faceVeneerReady = Boolean(selectedVeneerA || (selectedVeneerAGroup && selectedVeneerAGroup.type !== "natural"));
    const faceThicknessReady = Number.isFinite(selectedVeneerThickness());
    const reverseSideReady = sides === 1 || form.veneerBModeSelect.value === "same" || Boolean(selectedVeneerB || (selectedVeneerBGroup && selectedVeneerBGroup.type !== "natural"));
    const priceCalculationComplete = Boolean(
      base &&
      Number.isFinite(thickness.total) &&
      validSizes.length &&
      faceVeneerReady &&
      faceThicknessReady &&
      reverseSideReady &&
      layout &&
      layoutValidation.valid &&
      sizeValidation.valid &&
      !hasPartialPrice
    );
    const positionTotalSum = itemResults.reduce((sum, item) => sum + (positionCostByRowId.get(item.rowId) || 0), 0);
    const positionPricingReconciled = positionPricingBlockedBySharedManualBase ||
      !priceCalculationComplete ||
      Math.abs(positionTotalSum - finalTotal) <= 0.05;
    if (priceCalculationComplete && !positionPricingBlockedBySharedManualBase && !positionPricingReconciled) {
      warnings.push("Позиционные стоимости не сошлись с итогом заказа; цены по отдельным позициям временно скрыты.");
    }

    itemResults.forEach((item) => {
      const positionTotalRaw = positionCostByRowId.get(item.rowId);
      const positionPricingComplete = Boolean(
        priceCalculationComplete &&
        !positionPricingBlockedBySharedManualBase &&
        positionPricingReconciled &&
        Number.isFinite(positionTotalRaw)
      );
      item.positionPricingComplete = positionPricingComplete;
      item.positionTotal = positionPricingComplete ? positionTotalRaw : null;
      item.positionPricePerM2 = positionPricingComplete && Number.isFinite(item.area) && item.area > 0
        ? positionTotalRaw / item.area
        : null;
      item.positionPricePerPiece = positionPricingComplete && Number.isFinite(item.quantity) && item.quantity > 0
        ? positionTotalRaw / item.quantity
        : null;
    });

    const vat = finalTotal > 0 ? finalTotal * data.meta.vatRate / (1 + data.meta.vatRate) : 0;
    const techOperations = {
      sides,
      sandingRatePerM2: sides === 2 ? data.meta.sandingRatesPerM2.twoSides : data.meta.sandingRatesPerM2.oneSide,
      sandingCost: sandingCostTotal,
      cuttingMeters: cuttingMetersTotal,
      cuttingCost: cuttingCostTotal,
      gluing: Boolean(thickness.composite),
      gluingComposition: thickness.raw || "",
      calibration: calibrationEnabled,
      calibrationTarget,
      calibrationDepth,
      calibrationCost
    };
    const edgeComment = form.edgeModeSelect.value === "none" ? "" : form.edgeCommentInput.value.trim();
    return { base, thickness, sizes, validSizes, itemResults, totalArea, totalProductionArea, totalPieces, retailTotal, finalTotal, vat, avgM2: totalArea > 0 ? finalTotal / totalArea : null, avgPiece: totalPieces > 0 ? finalTotal / totalPieces : null, totalWeight, warnings: [...new Set(warnings)], breakdown, hasPartialPrice, priceCalculationComplete, allStandard, attachedEdgeMeters, edgeComment, selectionId, mdfVolumeId, herringbone, customLayout, veneerPricings, mdfPricings, standardFinalSubtotal, standardRequestFinalSubtotal, nonstandardFinalSubtotal, techOperations, finishResults, manualBasePricing, layoutValidation, sizeValidation };
  }

  function specRow(label, value, level = 0) {
    const classes = [];
    if (level >= 1) classes.push("spec-list__nested");
    if (level >= 2) classes.push("spec-list__nested--2");
    const classAttr = classes.length ? ` class="${classes.join(" ")}"` : "";
    const displayValue = value === null || value === undefined || value === "" ? "—" : value;
    return `<div${classAttr}><dt>${esc(label)}</dt><dd>${esc(displayValue)}</dd></div>`;
  }

  function specNumber(value, maximumFractionDigits = 2) {
    return Number.isFinite(value)
      ? new Intl.NumberFormat("ru-RU", { maximumFractionDigits }).format(value)
      : "—";
  }

  function specMm(value) {
    return Number.isFinite(num(value)) && num(value) > 0 ? `${specNumber(num(value), 2)} мм` : "—";
  }

  function compositeThicknessText(raw) {
    const text = String(raw || "").trim();
    if (!text) return "—";
    return `${text.split("+").map((part) => part.trim()).join(" + ")} мм`;
  }

  function finishSpecRows(config, { label = "Финишное покрытие", level = 0, commentLabel = "Комментарий к финишу", filesLabel = "Файлы к финишу" } = {}) {
    const finishId = config?.finishId || "none";
    const option = finishOption(finishId);
    const rows = [specRow(label, option?.name || "—", level)];
    const childLevel = level + 1;

    if (finishId === "lacquer") {
      const lacquerType = data?.finishParameters?.lacquerTypes?.find((item) => item.id === config?.lacquerType);
      rows.push(specRow("Тип лака", lacquerType?.name || "—", childLevel));
      rows.push(specRow("Степень блеска", config?.lacquerGloss || "—", childLevel));
      rows.push(specRow("Стороны покрытия", config?.sides || "—", childLevel));
      if (config?.toning === "yes") {
        rows.push(specRow("Тонировка", "Нужна", childLevel));
        rows.push(specRow("Стороны тонировки", config?.toningSides || "—", childLevel));
      }
      if (config?.isolator && config.isolator !== "no") rows.push(specRow("Изолятор", config.isolator, childLevel));
    } else if (finishId === "gloss") {
      rows.push(specRow("Вариант покрытия", config?.glossVariant || config?.variant || "—", childLevel));
    } else if (finishId === "enamel") {
      rows.push(specRow("Вариант покрытия", config?.enamelVariant || "—", childLevel));
      rows.push(specRow("Стороны покрытия", config?.sides || "—", childLevel));
    }

    if (config?.comment) rows.push(specRow(commentLabel, config.comment, childLevel));
    const fileNames = (config?.files || []).map((file) => file?.name || String(file)).filter(Boolean);
    if (fileNames.length) rows.push(specRow(filesLabel, fileNames.join(", "), childLevel));
    return rows;
  }

  function sizeTypeForSpec(size) {
    if (!size?.mode) return "—";
    if (size.mode === "standard" && size.resultMode === "exact" && size.standardOrderType !== "exact_detail") return "стандартная панель";
    if (size.resultMode === "allowance20") return "нестандарт с припуском +20 мм, без чистового пропила";
    return "нестандарт в чистовой размер";
  }

  function sizeVolumeForSpec(size, thickness) {
    const length = num(size?.calcLength);
    const width = num(size?.calcWidth);
    const quantity = num(size?.quantity);
    const totalThickness = num(thickness?.total);
    if (![length, width, quantity, totalThickness].every((value) => Number.isFinite(value) && value > 0)) return null;
    return (length / 1000) * (width / 1000) * (totalThickness / 1000) * quantity;
  }

  function renderSpec(result) {
    if (!result) return;
    const base = result.base;
    const sides = Number(form.veneeredSidesSelect.value);
    const sideText = sides === 2 ? "2 стороны" : sides === 1 ? "1 сторона" : "—";
    const veneerA = selectedVeneerA || selectedVeneerAGroup;
    const veneerThickness = selectedVeneerThickness();
    const layoutFiles = uploadedFileNames(form.layoutTzFiles);
    const selectedFiles = uploadedFileNames(form.filesInput);
    const globalFinish = currentGlobalFinishConfig();
    const cutA = data.veneerCuts.find((item) => item.id === form.veneerCutSelect.value)?.name || "";
    const cutB = data.veneerCuts.find((item) => item.id === form.veneerBCutSelect.value)?.name || "";
    const sideBMode = sides === 2
      ? (form.veneerBModeSelect.options[form.veneerBModeSelect.selectedIndex]?.text || "—")
      : (form.reverseSideSelect.options[form.reverseSideSelect.selectedIndex]?.text || "—");
    const sizeRows = result.sizes || [];
    const positionFinishSpecRows = positionFinishOverridesEnabled ? sizeRows.flatMap((size, index) => {
      const config = positionFinishState.get(size.rowId);
      if (!config || config.finishId === "inherit") return [];
      return finishSpecRows(config, {
        label: `Финиш · позиция ${index + 1}`,
        level: 1,
        commentLabel: `Комментарий к финишу · позиция ${index + 1}`,
        filesLabel: `Файлы к финишу · позиция ${index + 1}`
      });
    }) : [];

    const characteristics = [
      specRow("Основа", base?.name),
      specRow("Толщина основы", Number.isFinite(result.thickness?.total) ? `${specNumber(result.thickness.total, 2)} мм` : result.thickness?.raw ? `${result.thickness.raw} мм` : "—"),
      ...(result.thickness?.composite ? [specRow("Склейка основы", compositeThicknessText(result.thickness.raw), 1)] : []),
      ...(result.techOperations?.calibration ? [
        specRow("Калибровка", "Применяется", 1),
        specRow("Требуемая итоговая толщина", specMm(result.techOperations.calibrationTarget), 2)
      ] : []),
      specRow("Формируемые стороны", sideText),
      specRow("Шпон стороны А", veneerDisplayName(veneerA)),
      specRow("Тип шпона", veneerA?.typeName || "—", 1),
      specRow("Толщина лицевого шпона", Number.isFinite(veneerThickness) ? `${specNumber(veneerThickness, 2)} мм` : "—", 1),
      ...(cutA ? [specRow("Распил стороны А", cutA, 1)] : []),
      specRow("Сторона Б", sideBMode),
      ...(sides === 2 && form.veneerBModeSelect.value === "other" ? [
        specRow("Шпон стороны Б", veneerDisplayName(selectedVeneerB || selectedVeneerBGroup), 1)
      ] : []),
      ...(sides === 2 && form.veneerBModeSelect.value === "other" && cutB ? [specRow("Распил стороны Б", cutB, 1)] : []),
      specRow("Раскладка", selectedLayout()?.name),
      ...(form.layoutTzComment.value.trim() ? [specRow("Комментарий к раскладке", form.layoutTzComment.value.trim(), 1)] : []),
      ...(layoutFiles.length ? [specRow("Файлы к раскладке", layoutFiles.join(", "), 1)] : []),
      specRow("Кромка", form.edgeModeSelect.value === "attached" ? "На изделии" : form.edgeModeSelect.value === "separate" ? "Отдельно" : "Не нужна"),
      ...(form.edgeModeSelect.value === "attached" ? [
        specRow("Стороны кромления", form.edgeSidesSelect.options[form.edgeSidesSelect.selectedIndex]?.text || "—", 1),
        specRow("Толщина кромки", specMm(form.edgeThicknessSelect.value), 1),
        specRow("Шпон кромки", veneerDisplayName(selectedAttachedEdgeVeneer), 1),
        specRow("Расчётный метраж кромки", result.attachedEdgeMeters > 0 ? `${specNumber(result.attachedEdgeMeters, 2)} пог. м` : "—", 1),
        ...(form.edgeBevelSelect.value === "yes" ? [specRow("Фаска на кромке", "Да", 1)] : []),
        ...(result.edgeComment ? [specRow("Комментарий к кромке", result.edgeComment, 1)] : [])
      ] : []),
      ...(form.edgeModeSelect.value === "separate" ? [
        specRow("Толщина кромки", specMm(form.separateEdgeThicknessSelect.value), 1),
        specRow("Шпон кромки", veneerDisplayName(selectedSeparateEdgeVeneer), 1),
        specRow("Метраж кромки", Number.isFinite(num(form.separateEdgeMetersInput.value)) && num(form.separateEdgeMetersInput.value) > 0 ? `${specNumber(num(form.separateEdgeMetersInput.value), 2)} пог. м` : "—", 1),
        ...(result.edgeComment ? [specRow("Комментарий к кромке", result.edgeComment, 1)] : [])
      ] : []),
      specRow("Шлифовка", sideText),
      ...finishSpecRows(globalFinish),
      ...positionFinishSpecRows,
      ...(form.commentInput.value.trim() ? [specRow("Комментарий к позиции", form.commentInput.value.trim())] : []),
      ...(selectedFiles.length ? [specRow("Файлы к позиции", selectedFiles.join(", "))] : [])
    ];
    form.specCharacteristics.innerHTML = characteristics.join("");

    const itemByRowId = new Map((result.itemResults || []).map((item) => [item.rowId, item]));
    form.specSizes.innerHTML = sizeRows.map((size, index) => {
      const item = itemByRowId.get(size.rowId) || size;
      const lengthValue = Number.isFinite(size.length) && size.length > 0 ? `${specNumber(size.length, 2)} мм` : "—";
      const widthValue = Number.isFinite(size.width) && size.width > 0 ? `${specNumber(size.width, 2)} мм` : "—";
      const quantityValue = Number.isInteger(size.quantity) && size.quantity > 0 ? `${size.quantity} шт.` : "—";
      const areaValue = Number.isFinite(size.area) && size.area > 0 ? `${specNumber(size.area, 3)} м²` : "—";
      const volume = sizeVolumeForSpec(size, result.thickness);
      const weight = item?.weight || weightForSize(size, result.base, result.thickness);
      const rows = [
        specRow("Длина — направление волокон", lengthValue),
        specRow("Ширина", widthValue),
        specRow("Количество", quantityValue),
        specRow("Тип размера", sizeTypeForSpec(size)),
        ...(size.resultMode === "allowance20" ? [
          specRow("Производственный размер", Number.isFinite(size.calcLength) && size.calcLength > 0 && Number.isFinite(size.calcWidth) && size.calcWidth > 0 ? `${specNumber(size.calcLength, 2)} × ${specNumber(size.calcWidth, 2)} мм` : "—"),
          specRow("Отход основы", Number.isFinite(size.baseWastePercent) ? `${specNumber(size.baseWastePercent, 1)}%` : "—")
        ] : []),
        specRow("Площадь", areaValue),
        specRow("Объём", Number.isFinite(volume) ? `${specNumber(volume, 4)} м³` : "—"),
        specRow("Расчётный вес", weightText(weight)),
        ...(item?.positionPricingComplete ? [
          specRow("Стоимость позиции с НДС", money(item.positionTotal)),
          specRow("Цена за м² с НДС", money(item.positionPricePerM2)),
          specRow("Цена за шт. / лист", money(item.positionPricePerPiece))
        ] : []),
        ...(size.transition ? [specRow("Переход рисунка", "Да")] : []),
        ...(size.comment ? [specRow("Комментарий к размеру", size.comment)] : []),
        ...(size.files?.length ? [specRow("Файлы к размеру", size.files.join(", "))] : [])
      ];
      return `<section class="spec-position-block"><h4 class="spec-position-block__title">Позиция ${index + 1}</h4><dl class="spec-list spec-list--full">${rows.join("")}</dl></section>`;
    }).join("");

    const multiplePositions = (result.validSizes || []).length > 1;
    form.specPricePerM2Label.textContent = multiplePositions ? "Средняя цена за м² с НДС" : "Цена за м² с НДС";
    form.specPricePerPieceLabel.textContent = multiplePositions ? "Средняя цена за шт. / лист" : "Цена за шт. / лист";
    if (result.priceCalculationComplete) {
      form.specPricePerM2.textContent = money(result.avgM2);
      form.specPricePerPiece.textContent = money(result.avgPiece);
      form.specTotal.textContent = money(result.finalTotal);
      form.specVat.textContent = `В том числе НДС 22%: ${money(result.vat)}`;
    } else {
      form.specPricePerM2.textContent = "—";
      form.specPricePerPiece.textContent = "—";
      form.specTotal.textContent = "—";
      form.specVat.textContent = "В том числе НДС 22%: —";
    }
  }

  function setRowStatus() {}

  function renderPriceAdjustmentControl({ id, name, automaticPercent = 0, percent = 0, type = "discount", note = "", max = null }) {
    const wrapper = document.createElement("div");
    wrapper.className = "dynamic-adjustment-row";

    const label = document.createElement("span");
    label.className = "dynamic-adjustment-row__label";
    label.textContent = name;
    if (note) {
      const meta = document.createElement("span");
      meta.className = "adjustment-manual";
      meta.textContent = note;
      label.append(document.createElement("br"), meta);
    }

    const right = document.createElement("div");
    right.className = "dynamic-adjustment-row__right";
    const control = document.createElement("span");
    control.className = "inline-percent-control";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.step = "0.1";
    if (Number.isFinite(max)) input.max = String(max);
    input.value = String(round(percent, 1));
    input.setAttribute("aria-label", `${name}, %`);
    const sign = document.createElement("strong");
    sign.textContent = "%";
    control.append(input, sign);
    right.append(control);

    input.addEventListener("change", () => {
      const value = Number(input.value);
      const maxValue = input.max ? Number(input.max) : Infinity;
      if (!Number.isFinite(value) || value < 0 || value > maxValue) {
        input.value = String(round(percent, 1));
        return;
      }
      if (Math.abs(value - automaticPercent) < 0.000001) priceAdjustmentOverrides.delete(id);
      else priceAdjustmentOverrides.set(id, value);
      recalc();
    });

    const manuallyChanged = priceAdjustmentOverrides.has(id) && Math.abs(percent - automaticPercent) > 0.000001;
    if (manuallyChanged) {
      const meta = document.createElement("span");
      meta.className = "adjustment-manual";
      meta.append("Изменено вручную · ");
      const reset = document.createElement("button");
      reset.type = "button";
      reset.className = "adjustment-reset";
      reset.textContent = "Вернуть";
      let handled = false;
      const resetValue = () => {
        if (handled) return;
        handled = true;
        priceAdjustmentOverrides.delete(id);
        recalc();
      };
      reset.addEventListener("pointerdown", (event) => { event.preventDefault(); resetValue(); });
      reset.addEventListener("click", (event) => { event.preventDefault(); resetValue(); });
      meta.append(reset);
      right.append(meta);
    }

    wrapper.append(label, right);
    form.priceAdjustmentsList.append(wrapper);
  }

  function renderPriceAdjustments(result) {
    form.priceAdjustmentsList.replaceChildren();
    let rowCount = 0;

    // Ценовое условие шпона: только одно условие на каждую сторону/совмещённую пару.
    const veneerSeen = new Set();
    (result?.veneerPricings || []).forEach((pricing) => {
      if (!pricing?.item || pricing.pricingMode === "nonstandard" || pricing.conditionUnresolved) return;
      if (!(pricing.discountPercent > 0 || priceAdjustmentOverrides.has(pricing.adjustmentId))) return;
      const key = `${pricing.which}|${pricing.adjustmentId}`;
      if (veneerSeen.has(key)) return;
      veneerSeen.add(key);
      const sideName = pricing.sameAsA ? "сторон А и Б" : `стороны ${pricing.which}`;
      const sourceNote = pricing.conditionSource === "volume"
        ? "Объёмное ценовое условие"
        : pricing.conditionSource === "client"
          ? "Цена по статусу клиента"
          : "";
      renderPriceAdjustmentControl({
        id: pricing.adjustmentId,
        name: `Ценовое условие шпона ${sideName} · ${pricing.levelName || "ценовое условие"}`,
        automaticPercent: pricing.automaticDiscountPercent,
        percent: pricing.discountPercent,
        type: "discount",
        note: sourceNote,
        max: 99.9
      });
      rowCount += 1;
    });

    // Дополнительный отбор шпона применяется после ценового условия шпона.
    currentSelectionMarkupRows().forEach((row) => {
      renderPriceAdjustmentControl({
        id: row.id,
        name: `Наценка за ${row.label.toLocaleLowerCase("ru")}`,
        automaticPercent: row.automaticPercent,
        percent: row.percent,
        type: "markup"
      });
      rowCount += 1;
    });

    // Отбор МДФ показывается отдельной строкой.
    const mdfSeenSelection = new Set();
    (result?.mdfPricings || []).forEach((pricing) => {
      if (!(pricing?.markupPercent > 0 || priceAdjustmentOverrides.has(pricing.selectionKey))) return;
      const key = `${pricing.selectionKey}|${round(pricing.automaticMarkupPercent, 4)}`;
      if (mdfSeenSelection.has(key)) return;
      mdfSeenSelection.add(key);
      const selectionName = data.mdfSelectionOptions.find((x) => x.id === pricing.selectionId)?.name || "Отбор МДФ";
      renderPriceAdjustmentControl({
        id: pricing.selectionKey,
        name: `Наценка за отбор МДФ · ${pricing.size.length}×${pricing.size.width}`,
        automaticPercent: pricing.automaticMarkupPercent,
        percent: pricing.markupPercent,
        type: "markup",
        note: selectionName.replace(/^Отбор МДФ:\s*/i, "")
      });
      rowCount += 1;
    });

    // Ценовое условие МДФ заменяет обычное клиентское условие, если менеджер выбрал спецусловие.
    const mdfConditionName = result?.mdfVolumeId && result.mdfVolumeId !== "none"
      ? data.mdfVolumeConditions.find((x) => x.id === result.mdfVolumeId)?.name
      : data.plateClientConditions.find((x) => x.id === (form.clientConditionSelect.value || "retail"))?.name;
    const mdfSeenDiscount = new Set();
    (result?.mdfPricings || []).forEach((pricing) => {
      if (!(pricing?.discountPercent > 0 || priceAdjustmentOverrides.has(pricing.discountKey))) return;
      const key = `${pricing.discountKey}|${round(pricing.automaticDiscountPercent, 4)}`;
      if (mdfSeenDiscount.has(key)) return;
      mdfSeenDiscount.add(key);
      renderPriceAdjustmentControl({
        id: pricing.discountKey,
        name: `Ценовое условие МДФ · ${pricing.size.length}×${pricing.size.width}`,
        automaticPercent: pricing.automaticDiscountPercent,
        percent: pricing.discountPercent,
        type: "discount",
        note: mdfConditionName || "Условие по прайсу",
        max: 99.9
      });
      rowCount += 1;
    });

    // Скидка менеджера действует только на нестандартную часть.
    if ((result?.nonstandardFinalSubtotal || 0) > 0) {
      const automatic = 0;
      const percent = priceOverride("manager:nonstandard", automatic);
      renderPriceAdjustmentControl({
        id: "manager:nonstandard",
        name: "Скидка менеджера на нестандарт",
        automaticPercent: automatic,
        percent,
        type: "discount",
        note: percent > 10 ? "Более 10% — требуется согласование" : "До 10% — без дополнительного согласования",
        max: 99.9
      });
      rowCount += 1;
    }

    form.priceAdjustmentsBlock.classList.toggle("is-hidden", rowCount === 0);
    const manualBaseVisible = Boolean(result?.manualBasePricing?.required && result.manualBasePricing.valid && result.manualBasePricing.source === "manager");
    form.manualBasePriceSummary?.classList.toggle("is-hidden", !manualBaseVisible);
    if (manualBaseVisible) form.manualBasePriceSummaryValue.textContent = money(result.manualBasePricing.cost);
    updateManualVeneerPriceControls(result);
  }

  function renderTechOperations(result) {
    if (!result?.techOperations) return;
    const tech = result.techOperations;
    form.techVeneeringSummary.textContent = `${tech.sides} ${tech.sides === 1 ? "сторона" : "стороны"}`;
    form.techSandingSummary.textContent = `${tech.sides} ${tech.sides === 1 ? "сторона" : "стороны"} · ${money(tech.sandingRatePerM2)}/м²`;
    form.techCuttingSummary.textContent = tech.cuttingMeters > 0
      ? `${round(tech.cuttingMeters, 2)} пог. м${tech.cuttingCost > 0 ? ` · ${money(tech.cuttingCost)}` : ""}`
      : "Не требуется";

    form.techGluingRow.classList.toggle("is-hidden", !tech.gluing);
    if (tech.gluing) {
      const included = ["mdf", "dsp"].includes(result.base?.id) && (
        Number.isFinite(nonstandardRateFor(result.thickness.raw, tech.sides, result.base?.id)) ||
        Number.isFinite(standardProductionRateFor(result.thickness.raw, tech.sides, selectedVeneerThickness(), result.base?.id))
      );
      form.techGluingSummary.textContent = included
        ? `${tech.gluingComposition} мм · учтена в ставке основы + работа`
        : `${tech.gluingComposition} мм · стоимость отдельно не выделена`;
    }

    form.techCalibrationRow.classList.toggle("is-hidden", !tech.calibration);
    if (tech.calibration) {
      const targetText = Number.isFinite(tech.calibrationTarget) ? `до ${String(tech.calibrationTarget).replace(".", ",")} мм` : "итоговая толщина не указана";
      const depthText = Number.isFinite(tech.calibrationDepth) ? `съём ${String(tech.calibrationDepth).replace(".", ",")} мм` : "съём не указан";
      form.techCalibrationSummary.textContent = tech.calibrationCost > 0
        ? `${targetText} · ${depthText} · ${money(tech.calibrationCost)}`
        : `${targetText} · ${depthText} · требуется подтверждение тарифа`;
    }
  }

  function renderLocalValidation(result) {
    const layoutMissing = !form.layoutSelect.value;
    if (form.layoutError) form.layoutError.textContent = layoutMissing ? "Не выбрана раскладка шпона." : "";

    const hasValidSize = Boolean(result?.validSizes?.length);
    if (form.sizeBlockError) {
      const message = hasValidSize ? "" : "Не добавлен ни один заполненный размер.";
      form.sizeBlockError.textContent = message;
      form.sizeBlockError.classList.toggle("is-hidden", !message);
    }

    const calibrationEnabled = result?.base?.id === "mdf" && form.calibrationSelect.value === "yes";
    const calibrationTarget = num(form.calibrationTargetInput.value);
    const targetMissing = calibrationEnabled && (!Number.isFinite(calibrationTarget) || calibrationTarget <= 0);
    if (form.calibrationTargetError) form.calibrationTargetError.textContent = targetMissing ? "Для калибровки укажите требуемую итоговую толщину." : "";
    form.calibrationTargetField?.classList.toggle("field--invalid", targetMissing);

    const calibrationDepth = num(form.calibrationDepthInput?.value);
    const confirmedDepth = num(data?.meta?.calibrationConfirmedDepthMm) || 1;
    const depthUnconfirmed = calibrationEnabled && (!Number.isFinite(calibrationDepth) || Math.abs(calibrationDepth - confirmedDepth) >= 0.001);
    if (form.calibrationDepthError) {
      form.calibrationDepthError.textContent = depthUnconfirmed
        ? `Автоматический тариф подтверждён только для съёма ${String(confirmedDepth).replace(".", ",")} мм. Стоимость для другого значения требует подтверждения.`
        : "";
    }
  }

  function recalc() {
    lastCalculation = calculate(); if (!lastCalculation) return;
    renderLocalValidation(lastCalculation);
    const showEdgeMeters = form.edgeModeSelect.value === "attached" && lastCalculation.attachedEdgeMeters > 0;
    form.attachedEdgeMetersSummary.classList.toggle("is-hidden", !showEdgeMeters);
    form.attachedEdgeMetersSummary.textContent = showEdgeMeters ? `Расчётный метраж: ${round(lastCalculation.attachedEdgeMeters, 2)} пог. м` : "";
    const showMdfPriceOptions = lastCalculation.base?.id === "mdf" && (lastCalculation.mdfPricings || []).length > 0;
    form.mdfPriceOptions.classList.toggle("is-hidden", !showMdfPriceOptions);
    const condition = form.clientConditionSelect.value || "retail";
    const conditionNotes = [];
    if (condition !== "retail" && !lastCalculation.allStandard) {
      conditionNotes.push("Для нестандартной части стандартные клиентские условия не применяются; используется розничная цена шпона и отдельная скидка менеджера на нестандарт.");
    }
    if (condition !== "retail" && lastCalculation.base?.id === "dsp") {
      conditionNotes.push("Для ДСП клиентское условие может применяться к шпону, но не уменьшает производственную ставку ДСП.");
    }
    form.clientConditionNote.textContent = conditionNotes.join(" ");
    form.clientConditionNote.classList.toggle("is-hidden", conditionNotes.length === 0);
    setRowStatus(lastCalculation); renderTechOperations(lastCalculation); renderSpec(lastCalculation); renderPriceAdjustments(lastCalculation);
    const multiplePositions = (lastCalculation.itemResults || []).length > 1;
    form.finalPricePerM2Label.textContent = multiplePositions ? "Средняя цена за м²" : "Цена за м²";
    form.finalPricePerPieceLabel.textContent = multiplePositions ? "Средняя цена за шт. / лист" : "Цена за шт. / лист";
    if (lastCalculation.priceCalculationComplete) {
      form.finalPriceValue.textContent = money(lastCalculation.finalTotal);
      form.finalPricePerM2Value.textContent = money(lastCalculation.avgM2);
      form.finalPricePerPieceValue.textContent = money(lastCalculation.avgPiece);
      form.finalVatValue.textContent = money(lastCalculation.vat);
      form.finalPriceNote.textContent = "";
    } else {
      form.finalPriceValue.textContent = "—";
      form.finalPricePerM2Value.textContent = "—";
      form.finalPricePerPieceValue.textContent = "—";
      form.finalVatValue.textContent = "—";
      form.finalPriceNote.textContent = "Расчёт не завершён";
    }
    const layoutError = lastCalculation.layoutValidation?.error || "";
    const showLayoutConstraint = Boolean(layoutError && lastCalculation.layoutValidation?.descriptionValid);
    form.mixMatchWarning.classList.toggle("is-hidden", !showLayoutConstraint);
    form.mixMatchWarning.textContent = showLayoutConstraint ? layoutError : "";
  }

  function updateFinishUI() {
    const finishId = form.finishSelect.value || "none";
    const active = finishId !== "none";
    const lacquer = finishId === "lacquer";
    const enamel = finishId === "enamel";
    const common = finishAllowsIsolator(finishId);
    syncGlobalFinishSidesWithVeneer();

    if (form.toningSelect && !lacquer && form.toningSelect.value !== "no") form.toningSelect.value = "no";
    const toning = lacquer && form.toningSelect?.value === "yes";
    const acrylic = lacquer && form.lacquerTypeSelect?.value === "acrylic";
    const details = finishNeedsDetails(finishId) || toning;

    form.finishParameterFields.classList.toggle("is-hidden", !active);
    form.lacquerParameterFields.classList.toggle("is-hidden", !lacquer);
    form.enamelParameterFields.classList.toggle("is-hidden", !enamel);
    form.finishCommonFields.classList.toggle("is-hidden", !common);
    form.toningField?.classList.toggle("is-hidden", !lacquer);
    form.toningSidesField?.classList.toggle("is-hidden", !toning);
    form.lacquerProcessField?.classList.toggle("is-hidden", !acrylic);
    form.finishDetailsToggle.classList.toggle("is-hidden", !details || finishId === "custom");

    if (finishId === "custom") {
      form.finishDetailsToggle.setAttribute("aria-expanded", "true");
      form.finishDetailsFields.classList.remove("is-hidden");
    } else if (!details) {
      form.finishDetailsToggle.setAttribute("aria-expanded", "false");
      form.finishDetailsFields.classList.add("is-hidden");
    }

    updateLacquerGlossOptions();
    updateLacquerProcessOptions();
    recalc();
  }

  function updateLacquerGlossOptions() {
    const id = form.lacquerTypeSelect.value;
    const row = data?.finishParameters?.lacquerTypes?.find((x) => x.id === id);
    const current = form.lacquerGlossSelect.value;
    form.lacquerGlossSelect.innerHTML = "";
    (row?.gloss || []).forEach((x) => form.lacquerGlossSelect.add(new Option(x, x)));
    if ([...(row?.gloss || [])].includes(current)) form.lacquerGlossSelect.value = current;
  }

  function updateLacquerProcessOptions() {
    if (!form.lacquerProcessSelect) return;
    const acrylic = form.finishSelect.value === "lacquer" && form.lacquerTypeSelect.value === "acrylic";
    if (!acrylic) return;
    const current = form.lacquerProcessSelect.value;
    const options = availableLacquerProcesses(form.finishSidesSelect.value);
    form.lacquerProcessSelect.innerHTML = "";
    options.forEach((item) => form.lacquerProcessSelect.add(new Option(item.name, item.id)));
    if (options.some((item) => item.id === current)) form.lacquerProcessSelect.value = current;
    else if (options[0]) form.lacquerProcessSelect.value = options[0].id;
  }

  function defaultPositionFinishState() {
    const lacquerType = data?.finishParameters?.lacquerTypes?.[0]?.id || "";
    const lacquerGloss = data?.finishParameters?.lacquerTypes?.[0]?.gloss?.[0] || "";
    return {
      finishId: "inherit",
      toning: "no",
      toningSides: "1 сторона",
      lacquerType,
      lacquerGloss,
      lacquerProcess: availableLacquerProcesses(defaultFinishSides())?.[0]?.id || "",
      enamelVariant: data?.finishParameters?.enamelVariants?.[0] || "",
      sides: defaultFinishSides(),
      sidesManual: false,
      isolator: "no",
      comment: "",
      files: [],
      detailsOpen: false
    };
  }

  function capturePositionFinishStateFromDom() {
    if (!form.positionFinishOverrides) return;
    $$('[data-position-finish-row]', form.positionFinishOverrides).forEach((card) => {
      const rowId = card.dataset.positionFinishRow;
      const previous = positionFinishState.get(rowId) || defaultPositionFinishState();
      const fileInput = $('[data-position-finish-files]', card);
      positionFinishState.set(rowId, {
        finishId: $('[data-position-finish-select]', card)?.value || previous.finishId || "inherit",
        toning: $('[data-position-toning]', card)?.value || previous.toning || "no",
        toningSides: $('[data-position-toning-sides]', card)?.value || previous.toningSides || "1 сторона",
        lacquerType: $('[data-position-lacquer-type]', card)?.value || previous.lacquerType || "",
        lacquerGloss: $('[data-position-lacquer-gloss]', card)?.value || previous.lacquerGloss || "",
        lacquerProcess: $('[data-position-lacquer-process]', card)?.value || previous.lacquerProcess || "",
        enamelVariant: $('[data-position-enamel-variant]', card)?.value || previous.enamelVariant || "",
        sides: $('[data-position-finish-sides]', card)?.value || previous.sides || defaultFinishSides(),
        sidesManual: Boolean(previous.sidesManual),
        isolator: $('[data-position-isolator]', card)?.value || previous.isolator || "no",
        comment: $('[data-position-finish-comment]', card)?.value?.trim() || "",
        files: fileInput ? getUploadedFiles(fileInput) : (previous.files || []),
        detailsOpen: Boolean($('[data-position-finish-details]', card) && !$('[data-position-finish-details]', card).classList.contains("is-hidden"))
      });
    });
  }

  function positionFinishLabel(row, index) {
    const length = num($('[data-size-length]', row)?.value);
    const width = num($('[data-size-width]', row)?.value);
    const quantity = num($('[data-size-quantity]', row)?.value);
    const parts = [`Позиция ${index + 1}`];
    if (length > 0 && width > 0) parts.push(`${length} × ${width} мм`);
    if (quantity > 0) parts.push(`${quantity} шт.`);
    return parts.join(" · ");
  }

  function positionFinishOptionsHtml(selectedId) {
    const options = [`<option value="inherit"${selectedId === "inherit" ? " selected" : ""}>Как для всех</option>`];
    allowedFinishOptions().forEach((item) => {
      options.push(`<option value="${esc(item.id)}"${selectedId === item.id ? " selected" : ""}>${esc(item.name)}</option>`);
    });
    return options.join("");
  }

  function selectOptionsHtml(items, selectedValue, valueGetter = (item) => item, labelGetter = (item) => item) {
    return (items || []).map((item) => {
      const value = String(valueGetter(item) ?? "");
      const label = String(labelGetter(item) ?? value);
      return `<option value="${esc(value)}"${String(selectedValue) === value ? " selected" : ""}>${esc(label)}</option>`;
    }).join("");
  }

  function renderPositionFinishOverrides(capture = true) {
    if (!form.positionFinishOverrides) return;
    if (capture) capturePositionFinishStateFromDom();
    const rows = $$('[data-size-row]', form.sizeRows);
    const validRowIds = new Set(rows.map((row) => row.dataset.rowId));
    [...positionFinishState.keys()].forEach((rowId) => {
      if (!validRowIds.has(rowId)) positionFinishState.delete(rowId);
    });

    form.positionFinishOverrides.innerHTML = rows.map((row, index) => {
      const rowId = row.dataset.rowId;
      const state = { ...defaultPositionFinishState(), ...(positionFinishState.get(rowId) || {}) };
      positionFinishState.set(rowId, state);
      const finishId = state.finishId;
      const lacquer = finishId === "lacquer";
      const enamel = finishId === "enamel";
      if (!state.sidesManual) state.sides = defaultFinishSides();
      if (!lacquer) state.toning = "no";
      const toning = lacquer && state.toning === "yes";
      const custom = finishId === "custom";
      const common = finishAllowsIsolator(finishId);
      const lacquerRow = data?.finishParameters?.lacquerTypes?.find((item) => item.id === state.lacquerType) || data?.finishParameters?.lacquerTypes?.[0];
      if (lacquerRow && !(lacquerRow.gloss || []).includes(state.lacquerGloss)) state.lacquerGloss = lacquerRow.gloss?.[0] || "";
      const acrylic = lacquer && state.lacquerType === "acrylic";
      const lacquerProcesses = acrylic ? availableLacquerProcesses(state.sides) : [];
      if (acrylic && !lacquerProcesses.some((item) => item.id === state.lacquerProcess)) state.lacquerProcess = lacquerProcesses[0]?.id || "";
      if (state.isolator === "yes") state.isolator = "1 сторона";
      const detailsVisible = custom || (toning && state.detailsOpen);

      return `<div class="finish-position-card" data-position-finish-row="${esc(rowId)}">
        <div class="finish-position-card__head"><strong data-position-finish-title>${esc(positionFinishLabel(row, index))}</strong></div>
        <label class="field">
          <span class="field__label">Финишное покрытие</span>
          <select data-position-finish-select>${positionFinishOptionsHtml(finishId)}</select>
        </label>
        ${lacquer ? `<div class="field-grid field-grid--two">
          <label class="field"><span class="field__label">Тип лака</span><select data-position-lacquer-type>${selectOptionsHtml(data.finishParameters.lacquerTypes, state.lacquerType, (item) => item.id, (item) => item.name)}</select></label>
          <label class="field"><span class="field__label">Степень блеска</span><select data-position-lacquer-gloss>${selectOptionsHtml(lacquerRow?.gloss || [], state.lacquerGloss)}</select></label>
        </div>${acrylic ? `<label class="field"><span class="field__label">Технологическая схема лака</span><select data-position-lacquer-process>${selectOptionsHtml(lacquerProcesses, state.lacquerProcess, (item) => item.id, (item) => item.name)}</select></label>` : ""}
        <label class="field"><span class="field__label">Тонировка</span><select data-position-toning><option value="no"${state.toning !== "yes" ? " selected" : ""}>Без тонировки</option><option value="yes"${state.toning === "yes" ? " selected" : ""}>Нужна тонировка</option></select></label>
        ${toning ? `<label class="field"><span class="field__label">Стороны тонировки</span><select data-position-toning-sides><option value="1 сторона"${state.toningSides !== "2 стороны" ? " selected" : ""}>1 сторона</option><option value="2 стороны"${state.toningSides === "2 стороны" ? " selected" : ""}>2 стороны</option></select></label>` : ""}` : ""}
        ${enamel ? `<label class="field"><span class="field__label">Вариант покрытия</span><select data-position-enamel-variant>${selectOptionsHtml(data.finishParameters.enamelVariants, state.enamelVariant)}</select></label>` : ""}
        ${common ? `<div class="field-grid field-grid--two">
          <label class="field"><span class="field__label">Стороны финишного покрытия</span><select data-position-finish-sides>${selectOptionsHtml(data.finishParameters.coatingSides, state.sides)}</select></label>
          <label class="field"><span class="field__label">Изолятор</span><select data-position-isolator><option value="no"${state.isolator === "no" ? " selected" : ""}>Не нужен</option><option value="1 сторона"${state.isolator === "1 сторона" ? " selected" : ""}>1 сторона</option><option value="2 стороны"${state.isolator === "2 стороны" ? " selected" : ""}>2 стороны</option></select></label>
        </div>` : ""}
        ${toning ? `<button class="field-action" data-position-finish-details-toggle type="button" aria-expanded="${state.detailsOpen ? "true" : "false"}">Комментарий и файлы</button>` : ""}
        ${(toning || custom) ? `<div class="finish-position-details${detailsVisible ? "" : " is-hidden"}" data-position-finish-details>
          <label class="field"><span class="field__label">Комментарий к покрытию</span><textarea data-position-finish-comment rows="2" placeholder="Опишите требования к покрытию">${esc(state.comment || "")}</textarea></label>
          <label class="field file-upload-box"><span class="field__label">Файлы к покрытию</span><input data-position-finish-files type="file" multiple accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" /><div class="uploaded-files is-hidden" data-position-finish-file-names>Файлы не выбраны</div></label>
        </div>` : ""}
      </div>`;
    }).join("");

    $$('[data-position-finish-row]', form.positionFinishOverrides).forEach((card) => {
      const rowId = card.dataset.positionFinishRow;
      const state = positionFinishState.get(rowId) || defaultPositionFinishState();
      const fileInput = $('[data-position-finish-files]', card);
      const fileOutput = $('[data-position-finish-file-names]', card);
      if (fileInput && fileOutput) {
        setUploadedFiles(fileInput, state.files || []);
        renderUploadedFiles(fileInput, fileOutput, true);
        fileInput.addEventListener("change", () => handleFileInputChange(fileInput, fileOutput, true));
      }
    });
  }

  function updatePositionFinishLabels() {
    if (!form.positionFinishOverrides || form.positionFinishOverrides.classList.contains("is-hidden")) return;
    const rows = $$('[data-size-row]', form.sizeRows);
    rows.forEach((row, index) => {
      const card = $(`[data-position-finish-row="${row.dataset.rowId}"]`, form.positionFinishOverrides);
      const title = card ? $('[data-position-finish-title]', card) : null;
      if (title) title.textContent = positionFinishLabel(row, index);
    });
  }

  function effectiveFinishForSize(size) {
    const globalConfig = currentGlobalFinishConfig();
    const rowId = size?.rowId || size?.row?.dataset?.rowId;
    const override = rowId ? positionFinishState.get(rowId) : null;
    if (!override || override.finishId === "inherit") return { ...globalConfig, source: "global" };
    return { ...override, source: "position" };
  }

  function fileIdentity(file) {
    return [file.name, file.size, file.type, file.lastModified].join("::");
  }

  function getUploadedFiles(input) {
    const stored = uploadedFilesState.get(input);
    return stored ? [...stored] : [...(input?.files || [])];
  }

  function setUploadedFiles(input, files) {
    const nextFiles = [...files];
    uploadedFilesState.set(input, nextFiles);
    try {
      const transfer = new DataTransfer();
      nextFiles.forEach((file) => transfer.items.add(file));
      input.files = transfer.files;
    } catch {
      // The same fallback as in the flooring calculator: state remains in uploadedFilesState.
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
    setUploadedFiles(input, getUploadedFiles(input).filter((_, fileIndex) => fileIndex !== index));
  }

  function uploadedFileNames(input) {
    return getUploadedFiles(input).map((file) => file.name);
  }

  function renderUploadedFiles(input, output, hideWhenEmpty = true) {
    const files = getUploadedFiles(input);
    output.innerHTML = "";
    output.classList.toggle("is-hidden", hideWhenEmpty && !files.length);
    if (!files.length) {
      output.textContent = "Файлы не выбраны";
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
        renderUploadedFiles(input, output, hideWhenEmpty);
        recalc();
      });
      tag.append(name, removeButton);
      output.append(tag);
    });
  }

  function handleFileInputChange(input, output, hideWhenEmpty = true) {
    const selectedNow = [...(input.files || [])];
    appendUploadedFiles(input, selectedNow);
    renderUploadedFiles(input, output, hideWhenEmpty);
    recalc();
  }

  function bindFileInput(input, output, hideWhenEmpty = true) {
    setUploadedFiles(input, getUploadedFiles(input));
    renderUploadedFiles(input, output, hideWhenEmpty);
    input.addEventListener("change", () => handleFileInputChange(input, output, hideWhenEmpty));
  }

  function populate() {
    const typeLabels = new Map();
    data.veneers.forEach((x) => { if (!typeLabels.has(x.type)) typeLabels.set(x.type, x.typeName); });
    (data.meta?.veneerTypeOrder || ["natural", "multi", "design"]).forEach((type) => {
      if (typeLabels.has(type)) form.veneerTypeSelect.add(new Option(typeLabels.get(type), type));
    });
    data.bases.forEach((x) => form.baseSelect.add(new Option(x.name, x.id)));
    form.baseSelect.value = "mdf";
    data.layouts.forEach((x) => form.layoutSelect.add(new Option(x.name, x.id)));
    data.edgeSides.forEach((x) => form.edgeSidesSelect.add(new Option(x.name, x.id)));
    data.edgeThicknesses.forEach((x) => { form.edgeThicknessSelect.add(new Option(String(x).replace(".", ","), x)); form.separateEdgeThicknessSelect.add(new Option(String(x).replace(".", ","), x)); });
    allowedFinishOptions().forEach((x) => form.finishSelect.add(new Option(x.name, x.id)));
    data.finishParameters.lacquerTypes.forEach((x) => form.lacquerTypeSelect.add(new Option(x.name, x.id)));
    (data.finishParameters.lacquerProcesses || []).forEach((x) => form.lacquerProcessSelect?.add(new Option(x.name, x.id)));
    data.finishParameters.enamelVariants.forEach((x) => form.enamelVariantSelect.add(new Option(x, x)));
    data.finishParameters.coatingSides.forEach((x) => form.finishSidesSelect.add(new Option(x, x)));
    data.plateClientConditions.forEach((x) => form.clientConditionSelect.add(new Option(x.name, x.id)));
    data.mdfVolumeConditions.forEach((x) => form.mdfVolumeConditionSelect.add(new Option(x.name, x.id)));

    addSizeRow(); updateFinishUI(); updateBaseUI();
  }

  function pricingSnapshot(result) {
    const veneer = {};
    (result?.veneerPricings || []).forEach((pricing) => {
      if (!pricing?.item || !pricing.which) return;
      if (!veneer[pricing.which]) veneer[pricing.which] = [];
      veneer[pricing.which].push({
        pricingMode: pricing.pricingMode || "standard",
        sameAsA: Boolean(pricing.sameAsA),
        veneerId: pricing.item.id || "",
        veneerName: veneerDisplayName(pricing.item),
        retailPricePerM2: Number.isFinite(pricing.retailPricePerM2) ? pricing.retailPricePerM2 : null,
        manualPricePerM2: pricing.manual && Number.isFinite(pricing.manualPricePerM2) ? pricing.manualPricePerM2 : null,
        priceSource: pricing.priceSource || (pricing.manual ? "manual" : "price_list"),
        priceSourceLabel: pricing.manual ? "Вручную" : "Прайс",
        condition: {
          id: pricing.levelId || "retail",
          name: pricing.levelName || "Розничная цена",
          source: pricing.conditionSource || "retail",
          selectedConditionId: pricing.selectedConditionId || "",
          unresolved: Boolean(pricing.conditionUnresolved),
          automaticPercent: Number(pricing.automaticDiscountPercent || 0),
          actualPercent: Number(pricing.discountPercent || 0),
          changedManually: priceAdjustmentOverrides.has(pricing.adjustmentId)
        },
        finalPricePerM2: Number.isFinite(pricing.finalPricePerM2) ? pricing.finalPricePerM2 : null,
        effectivePricePerM2: Number.isFinite(effectiveVeneerPricePerM2(pricing)) ? effectiveVeneerPricePerM2(pricing) : null,
        requiredArea: Number.isFinite(pricing.requiredArea) ? pricing.requiredArea : null
      });
    });

    const veneerSelections = currentSelectionMarkupRows().map((row) => ({
      id: row.key,
      name: row.label,
      automaticPercent: Number(row.automaticPercent || 0),
      actualPercent: Number(row.percent || 0),
      changedManually: priceAdjustmentOverrides.has(row.id)
    }));

    const mdf = (result?.mdfPricings || []).map((pricing) => ({
      size: `${pricing.size?.length || ""}×${pricing.size?.width || ""}`,
      conditionId: pricing.conditionKey || pricing.mdfVolumeId || pricing.condition || "retail",
      conditionName: pricing.mdfVolumeId && pricing.mdfVolumeId !== "none"
        ? data.mdfVolumeConditions.find((x) => x.id === pricing.mdfVolumeId)?.name || pricing.mdfVolumeId
        : data.plateClientConditions.find((x) => x.id === pricing.condition)?.name || pricing.condition || "Розничная цена",
      automaticConditionPercent: Number(pricing.automaticDiscountPercent || 0),
      actualConditionPercent: Number(pricing.discountPercent || 0),
      conditionChangedManually: priceAdjustmentOverrides.has(pricing.discountKey),
      selectionId: pricing.selectionId || "none",
      automaticSelectionPercent: Number(pricing.automaticMarkupPercent || 0),
      actualSelectionPercent: Number(pricing.markupPercent || 0),
      selectionChangedManually: priceAdjustmentOverrides.has(pricing.selectionKey),
      retailSheet: Number.isFinite(pricing.retailSheet) ? pricing.retailSheet : null,
      finalSheet: Number.isFinite(pricing.finalSheet) ? pricing.finalSheet : null
    }));

    const managerDiscountPercent = priceOverride("manager:nonstandard", 0);
    return {
      veneer,
      veneerSelections,
      mdf,
      clientConditionSelected: form.clientConditionSelect.value || "retail",
      clientConditionName: data.plateClientConditions.find((x) => x.id === (form.clientConditionSelect.value || "retail"))?.name || "Розничная цена",
      mdfConditionSelected: form.mdfVolumeConditionSelect.value || "none",
      manualBase: result?.manualBasePricing?.source === "manager" ? {
        source: "manual",
        totalCost: result.manualBasePricing.valid ? result.manualBasePricing.cost : null
      } : null,
      managerNonstandardDiscount: (result?.nonstandardFinalSubtotal || 0) > 0 ? {
        automaticPercent: 0,
        actualPercent: managerDiscountPercent,
        changedManually: priceAdjustmentOverrides.has("manager:nonstandard"),
        approvalRequired: managerDiscountPercent > 10
      } : null,
      total: result?.priceCalculationComplete ? result.finalTotal : null,
      pricePerM2: result?.priceCalculationComplete ? result.avgM2 : null,
      pricePerPiece: result?.priceCalculationComplete ? result.avgPiece : null,
      vatIncluded: true,
      vat: result?.priceCalculationComplete ? result.vat : null
    };
  }

  function saveToSpecification() {
    if (!lastCalculation) { form.saveStatus.textContent = "Добавьте хотя бы один заполненный размер."; return; }
    if (lastCalculation.sizeValidation && !lastCalculation.sizeValidation.valid) {
      form.saveStatus.textContent = lastCalculation.sizeValidation.error;
      return;
    }
    if (!lastCalculation.validSizes.length) { form.saveStatus.textContent = "Добавьте хотя бы один заполненный размер."; return; }
    if (lastCalculation.layoutValidation && !lastCalculation.layoutValidation.valid) {
      form.saveStatus.textContent = lastCalculation.layoutValidation.error;
      return;
    }
    const sides = Number(form.veneeredSidesSelect.value);
    const payload = {
      id: `plate_${Date.now()}`, productType: "plate", productTypeName: "Плитные материалы и изделия", createdAt: new Date().toISOString(),
      title: `${lastCalculation.base?.name || "Плита"} ${lastCalculation.thickness.raw ? `${lastCalculation.thickness.raw} мм` : ""}`.trim(),
      base: lastCalculation.base?.name || "", baseId: lastCalculation.base?.id || "", baseCharacteristics: lastCalculation.base?.characteristics || [], baseThickness: lastCalculation.thickness.raw,
      basePrice: lastCalculation.manualBasePricing?.source === "manager" ? { source: "manager", sourceLabel: "Введено менеджером", cost: lastCalculation.manualBasePricing.cost } : { source: "automatic", sourceLabel: "Автоматический расчёт" },
      veneerType: (selectedVeneerA || selectedVeneerAGroup)?.typeName || "", veneerA: veneerDisplayName(selectedVeneerA || selectedVeneerAGroup), veneerThickness: selectedVeneerThickness(), veneerAPriceLevel: lastCalculation.veneerPricings.find((x) => x.which === "A")?.levelName || "",
      sides, sideB: sides === 1 ? (form.reverseSideSelect.value === "same" ? veneerDisplayName(selectedVeneerA || selectedVeneerAGroup) : form.reverseSideSelect.options[form.reverseSideSelect.selectedIndex]?.text) : (form.veneerBModeSelect.value === "same" ? (isFaceOnlyExtraVeneer(selectedVeneerA) ? "Категория B той же породы (автоматически)" : veneerDisplayName(selectedVeneerA || selectedVeneerAGroup)) : veneerDisplayName(selectedVeneerB || selectedVeneerBGroup)), veneerBPriceLevel: lastCalculation.veneerPricings.find((x) => x.which === "B")?.levelName || "",
      layout: selectedLayout()?.name || "", veneerCut: data.veneerCuts.find((x) => x.id === form.veneerCutSelect.value)?.name || "", veneerBCut: data.veneerCuts.find((x) => x.id === form.veneerBCutSelect.value)?.name || "", herringbone: form.layoutSelect.value === "herringbone", layoutTzComment: form.layoutTzComment.value.trim(), layoutTzFiles: uploadedFileNames(form.layoutTzFiles),
      sizes: lastCalculation.itemResults.map((x) => ({
        position: x.position,
        length: x.length,
        width: x.width,
        quantity: x.quantity,
        resultMode: x.resultMode,
        standardOrderType: x.standardOrderType || null,
        productionLength: x.calcLength,
        productionWidth: x.calcWidth,
        baseWastePercent: Number.isFinite(x.baseWastePercent) ? x.baseWastePercent : null,
        area: x.area,
        weight: x.weight,
        transition: x.transition,
        comment: x.comment,
        files: x.files,
        standard: x.classificationId !== "nonstandard",
        classificationId: x.classificationId,
        classificationName: x.classificationName,
        pricingComplete: Boolean(x.positionPricingComplete),
        total: Number.isFinite(x.positionTotal) ? x.positionTotal : null,
        pricePerM2: Number.isFinite(x.positionPricePerM2) ? x.positionPricePerM2 : null,
        pricePerPiece: Number.isFinite(x.positionPricePerPiece) ? x.positionPricePerPiece : null
      })),
      edge: { mode: form.edgeModeSelect.value, sides: form.edgeSidesSelect.options[form.edgeSidesSelect.selectedIndex]?.text || "", thickness: form.edgeThicknessSelect.value, material: veneerDisplayName(selectedAttachedEdgeVeneer), bevel: form.edgeBevelSelect.value === "yes", calculatedMeters: lastCalculation.attachedEdgeMeters, separateMeters: form.separateEdgeMetersInput.value, separateThickness: form.separateEdgeThicknessSelect.value, separateMaterial: veneerDisplayName(selectedSeparateEdgeVeneer), comment: lastCalculation.edgeComment || "" },
      technologicalOperations: lastCalculation.techOperations,
      calibration: { enabled: lastCalculation.techOperations?.calibration === true, targetThicknessMm: num(form.calibrationTargetInput.value) || null, depthMm: num(form.calibrationDepthInput?.value) || null, cost: lastCalculation.techOperations?.calibrationCost || 0 },
      finish: finishSummary(currentGlobalFinishConfig()),
      finishParameters: { ...currentGlobalFinishConfig(), files: uploadedFileNames(form.finishFilesInput) },
      finishByPosition: (lastCalculation.finishResults || []).filter((item) => item.config?.source === "position").map((item) => ({ position: item.position, summary: item.summary, ...item.config, files: (item.config.files || []).map((file) => file?.name || String(file)).filter(Boolean) })),
      clientCondition: form.clientConditionSelect.value, mdfSelection: lastCalculation.selectionId, mdfSelectionEnabled: form.mdfSelectionCheckbox.checked, mdfVolumeCondition: form.mdfVolumeConditionSelect.value,
      comment: form.commentInput.value.trim(), files: uploadedFileNames(form.filesInput),
      totalArea: lastCalculation.totalArea, total: lastCalculation.priceCalculationComplete ? lastCalculation.finalTotal : null, vat: lastCalculation.priceCalculationComplete ? lastCalculation.vat : null, totalWeight: lastCalculation.totalWeight, pricePerM2: lastCalculation.priceCalculationComplete ? lastCalculation.avgM2 : null, pricePerPiece: lastCalculation.priceCalculationComplete ? lastCalculation.avgPiece : null, pricingPartial: !lastCalculation.priceCalculationComplete, pricing: pricingSnapshot(lastCalculation), warnings: lastCalculation.warnings
    };
    const existing = JSON.parse(sessionStorage.getItem(SPEC_STORAGE_KEY) || "[]"); existing.push(payload); sessionStorage.setItem(SPEC_STORAGE_KEY, JSON.stringify(existing));
    form.saveStatus.textContent = `Позиция добавлена в общую спецификацию. Позиций: ${existing.length}. Параметры заказа и данные клиента задаются на следующих общих шагах.`;
  }

  function bind() {
    form.baseSelect.addEventListener("change", () => {
      resetManualBasePricingInputs();
      updateBaseUI();
    });
    form.baseThicknessSelect.addEventListener("change", () => {
      resetManualBasePricingInputs();
      updateManualBasePriceUI();
      updateThicknessWarnings();
      updateEdgeUI();
      renderStandardSizes();
      revalidateCustomSizeRows();
      recalc();
    });
    form.manualBasePriceInput.addEventListener("input", () => {
      const raw = form.manualBasePriceInput.value;
      const sanitized = sanitizeManualBasePriceValue(raw);
      const invalidCharactersRemoved = raw !== sanitized;
      if (invalidCharactersRemoved) form.manualBasePriceInput.value = sanitized;
      const hasValue = form.manualBasePriceInput.value.trim() !== "";
      setManualBasePriceError(invalidCharactersRemoved || (hasValue && manualBasePriceValue() === null));
      recalc();
    });
    form.manualBasePriceInput.addEventListener("blur", () => {
      const hasValue = form.manualBasePriceInput.value.trim() !== "";
      setManualBasePriceError(hasValue && manualBasePriceValue() === null);
    });
    form.veneerTypeSelect.addEventListener("change", () => {
      const selectedType = form.veneerTypeSelect.value;
      if (["multi", "design"].includes(selectedType) && form.layoutSelect.value !== "straight") {
        // Подтверждённый рабочий дефолт: мультишпон — прямая раскладка;
        // для дизайн-шпона также автоматически предлагаем прямую. Менеджер может изменить её вручную.
        form.layoutSelect.value = "straight";
        updateLayoutUI();
      }
      if (selectedVeneerAGroup && (!selectedType || selectedVeneerAGroup.type !== selectedType)) {
        selectedVeneerAGroup = null;
        selectedVeneerA = null;
        selectedVeneerBGroup = null;
        selectedVeneerB = null;
        form.veneerAInput.value = "";
        form.veneerAClear.classList.add("is-hidden");
        form.veneerThicknessField.classList.add("is-hidden");
        form.veneerBInput.value = "";
        syncEdgeVeneerDefaults();
        renderSelectionSurcharges();
        syncVeneerCutUI(false);
        syncVeneerBCutUI(false);
      }
      renderStandardSizes();
      recalc();
    });
    form.veneerThicknessSelect.addEventListener("change", selectVeneerVariantByThickness);
    form.veneerThicknessInput.addEventListener("input", () => {
      const raw = form.veneerThicknessInput.value;
      const sanitized = sanitizeVeneerThicknessValue(raw);
      const invalidCharactersRemoved = raw !== sanitized;
      if (invalidCharactersRemoved) {
        form.veneerThicknessInput.value = sanitized;
        form.veneerThicknessInput.dataset.invalidEntry = "true";
      } else {
        delete form.veneerThicknessInput.dataset.invalidEntry;
      }
      validateManualVeneerThickness({ invalidCharactersRemoved });
      applyVeneerThicknessRules();
      renderStandardSizes();
      recalc();
    });
    form.veneerThicknessInput.addEventListener("blur", () => validateManualVeneerThickness({ showEmpty: true }));
    form.veneerAPriceToggle.addEventListener("click", () => { veneerAPriceAuto = false; form.veneerPriceInput.value = ""; recalc(); form.veneerPriceInput.focus(); });
    form.veneerAPriceReset.addEventListener("click", () => { veneerAPriceAuto = true; form.veneerPriceInput.value = ""; recalc(); });
    form.veneerBPriceToggle.addEventListener("click", () => { veneerBPriceAuto = false; form.veneerBPriceInput.value = ""; recalc(); form.veneerBPriceInput.focus(); });
    form.veneerBPriceReset.addEventListener("click", () => { veneerBPriceAuto = true; form.veneerBPriceInput.value = ""; recalc(); });
    form.veneerPriceInput.addEventListener("input", recalc); form.veneerBPriceInput.addEventListener("input", recalc);
    form.veneerAConditionSelect.addEventListener("change", () => { veneerConditionChoices.A = form.veneerAConditionSelect.value; clearPriceOverrides("veneer:A:"); recalc(); });
    form.veneerBConditionSelect.addEventListener("change", () => { veneerConditionChoices.B = form.veneerBConditionSelect.value; clearPriceOverrides("veneer:B:"); recalc(); });
    form.selectionSurchargeOptions.addEventListener("change", (event) => {
      const input = event.target.closest("input[data-selection-surcharge]");
      if (input) {
        if (input.checked) selectedVeneerSelectionKeys.add(input.value);
        else {
          selectedVeneerSelectionKeys.delete(input.value);
          priceAdjustmentOverrides.delete(`veneer-selection:${input.value}`);
        }
      }
      recalc();
    }); form.veneeredSidesSelect.addEventListener("change", updateSidesUI); form.reverseSideSelect.addEventListener("change", () => { renderStandardSizes(); recalc(); }); form.veneerBModeSelect.addEventListener("change", updateSidesUI); form.layoutSelect.addEventListener("change", updateLayoutUI); form.veneerCutSelect.addEventListener("change", onVeneerCutChanged); form.veneerBCutSelect.addEventListener("change", onVeneerBCutChanged);
    form.layoutTzComment.addEventListener("input", () => { setLayoutTzError(layoutNeedsTz(form.layoutSelect.value) && !layoutHasDescriptionOrFile()); recalc(); });

    form.addSizeRowBtn.addEventListener("click", () => addSizeRow());
    form.sizeRows.addEventListener("keydown", (e) => {
      if (!e.target.matches('[data-size-quantity]')) return;
      if ([".", ",", "-", "+", "e", "E"].includes(e.key)) e.preventDefault();
    });
    form.sizeRows.addEventListener("focusin", (e) => {
      const row = e.target.closest('[data-size-row]');
      if (row) setActiveSizeRow(row);
    });
    form.sizeRows.addEventListener("click", (e) => {
      const row = e.target.closest('[data-size-row]');
      if (!row) return;

      const duplicate = e.target.closest('[data-duplicate-size-row]');
      if (duplicate) {
        duplicateSizeRow(row);
        return;
      }

      const remove = e.target.closest('[data-remove-size-row]');
      if (remove) {
        if ($$('[data-size-row]', form.sizeRows).length > 1) {
          capturePositionFinishStateFromDom();
          positionFinishState.delete(row.dataset.rowId);
          row.remove();
          activeSizeRow = $('[data-size-row]', form.sizeRows);
          updateSizeRemoveButtons();
          if (positionFinishOverridesEnabled) renderPositionFinishOverrides();
          recalc();
        }
        return;
      }

      const standardSize = e.target.closest('[data-standard-size]');
      if (standardSize) {
        applyStandardSize(row, Number(standardSize.dataset.length), Number(standardSize.dataset.width));
        return;
      }

      if (e.target.closest('[data-custom-size-toggle]')) {
        setCustomSizeMode(row);
        return;
      }

    });
    form.sizeRows.addEventListener("input", (e) => {
      if (!e.target.matches('[data-size-length],[data-size-width],[data-size-quantity],[data-size-comment],[data-size-base-waste-percent]')) return;
      const row = e.target.closest('[data-size-row]');
      if (row) {
        if (e.target.matches('[data-size-length]')) setSizeFieldError(row, "length", "");
        if (e.target.matches('[data-size-width]')) setSizeFieldError(row, "width", "");
        if (e.target.matches('[data-size-quantity]')) validateSizeQuantity(row, false);
        updateSizeRowAvailability(row);
        updateSizeTransitionUI(row);
        updatePositionFinishLabels();
      }
      recalc();
    });
    form.sizeRows.addEventListener("focusout", (e) => {
      const row = e.target.closest('[data-size-row]');
      if (!row) return;
      if (e.target.matches('[data-size-quantity]')) validateSizeQuantity(row, Boolean(row.dataset.sizeMode));
      if (row.dataset.sizeMode !== "custom") return;
      if (e.target.matches('[data-size-length]')) validateCustomSizeOnBlur(e.target, row, "length", "Длина");
      if (e.target.matches('[data-size-width]')) validateCustomSizeOnBlur(e.target, row, "width", "Ширина");
    });
    form.sizeRows.addEventListener("change", (e) => {
      const row = e.target.closest('[data-size-row]');
      if (!row) return;
      if (e.target.matches('[data-size-result]')) {
        if (e.target.value === "allowance20") {
          const baseWasteInput = $('[data-size-base-waste-percent]', row);
          if (baseWasteInput && !String(baseWasteInput.value || "").trim()) baseWasteInput.value = String(data?.meta?.allowance20DefaultBaseWastePercent ?? 25);
        }
        updateSizeRowAvailability(row);
        const widthInput = $('[data-size-width]', row);
        if (row.dataset.sizeMode === "custom" && widthInput?.value.trim()) {
          validateCustomSizeOnBlur(widthInput, row, "width", "Ширина");
        } else {
          recalc();
        }
      }
      if (e.target.matches('[data-size-standard-order]')) {
        updateSizeRowAvailability(row);
        recalc();
      }
      if (e.target.matches('[data-size-transition]')) {
        updateSizeTransitionUI(row);
        recalc();
      }
    });

    form.edgeModeSelect.addEventListener("change", updateEdgeUI);
    [form.edgeSidesSelect, form.edgeThicknessSelect, form.edgeBevelSelect, form.separateEdgeThicknessSelect].forEach((x) => x.addEventListener("change", recalc));
    form.separateEdgeMetersInput.addEventListener("input", () => { setSeparateEdgeMetersError(""); recalc(); });
    form.separateEdgeMetersInput.addEventListener("blur", validateSeparateEdgeMetersOnBlur);
    form.edgeCommentInput.addEventListener("input", recalc);
    form.calibrationSelect.addEventListener("change", () => {
      const active = selectedBase()?.id === "mdf" && form.calibrationSelect.value === "yes";
      if (!active) form.calibrationTargetInput.value = "";
      updateCalibrationUI();
      recalc();
    });
    form.calibrationTargetInput.addEventListener("input", recalc);
    form.calibrationDepthInput?.addEventListener("input", recalc);

    form.finishSelect.addEventListener("change", updateFinishUI);
    form.toningSelect?.addEventListener("change", updateFinishUI);
    form.toningSidesSelect?.addEventListener("change", recalc);
    form.lacquerTypeSelect.addEventListener("change", updateFinishUI);
    form.finishSidesSelect.addEventListener("change", () => { globalFinishSidesManual = true; updateLacquerProcessOptions(); recalc(); });
    [form.lacquerGlossSelect, form.lacquerProcessSelect, form.enamelVariantSelect, form.isolatorSelect].filter(Boolean).forEach((x) => x.addEventListener("change", recalc));
    form.finishParamsInput.addEventListener("input", recalc);
    form.finishDetailsToggle.addEventListener("click", () => {
      const expanded = form.finishDetailsToggle.getAttribute("aria-expanded") === "true";
      form.finishDetailsToggle.setAttribute("aria-expanded", String(!expanded));
      form.finishDetailsFields.classList.toggle("is-hidden", expanded);
    });

    form.positionFinishToggle.addEventListener("click", () => {
      capturePositionFinishStateFromDom();
      positionFinishOverridesEnabled = !positionFinishOverridesEnabled;
      form.positionFinishToggle.setAttribute("aria-expanded", String(positionFinishOverridesEnabled));
      form.positionFinishToggle.textContent = positionFinishOverridesEnabled ? "Скрыть настройки по позициям" : "Настроить финиш по позициям";
      form.positionFinishOverrides.classList.toggle("is-hidden", !positionFinishOverridesEnabled);
      if (positionFinishOverridesEnabled) renderPositionFinishOverrides();
      recalc();
    });

    form.positionFinishOverrides.addEventListener("change", (e) => {
      const card = e.target.closest('[data-position-finish-row]');
      if (!card) return;
      if (e.target.matches('[data-position-finish-sides]')) {
        const rowId = card.dataset.positionFinishRow;
        const previous = positionFinishState.get(rowId) || defaultPositionFinishState();
        positionFinishState.set(rowId, { ...previous, sides: e.target.value, sidesManual: true });
      }
      capturePositionFinishStateFromDom();
      if (e.target.matches('[data-position-finish-select],[data-position-lacquer-type],[data-position-toning],[data-position-finish-sides]')) {
        renderPositionFinishOverrides();
      }
      recalc();
    });
    form.positionFinishOverrides.addEventListener("input", (e) => {
      if (!e.target.matches('[data-position-finish-comment]')) return;
      capturePositionFinishStateFromDom();
      recalc();
    });
    form.positionFinishOverrides.addEventListener("click", (e) => {
      const toggle = e.target.closest('[data-position-finish-details-toggle]');
      if (!toggle) return;
      const card = toggle.closest('[data-position-finish-row]');
      const details = card ? $('[data-position-finish-details]', card) : null;
      if (!details) return;
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      details.classList.toggle("is-hidden", expanded);
      capturePositionFinishStateFromDom();
    });
    form.clientConditionSelect.addEventListener("change", () => { veneerConditionChoices.A = ""; veneerConditionChoices.B = ""; clearPriceOverrides("veneer:A:"); clearPriceOverrides("veneer:B:"); clearPriceOverrides("mdf:"); recalc(); });
    form.mdfSelectionCheckbox.addEventListener("change", () => { clearPriceOverrides("mdf:"); recalc(); });
    form.mdfVolumeConditionSelect.addEventListener("change", () => { clearPriceOverrides("mdf:"); recalc(); });
    form.commentInput.addEventListener("input", recalc); form.addToSpecButton.addEventListener("click", saveToSpecification);
    bindFileInput(form.layoutTzFiles, form.layoutTzFileNames, true);
    form.layoutTzFiles.addEventListener("change", () => setLayoutTzError(layoutNeedsTz(form.layoutSelect.value) && !layoutHasDescriptionOrFile()));
    bindFileInput(form.finishFilesInput, form.finishFileNames, true);
    bindFileInput(form.filesInput, form.selectedFiles, true);
  }

  async function init() {
    try {
      const response = await fetch(DATA_URL); if (!response.ok) throw new Error(`HTTP ${response.status}`); data = await response.json();
      setupAutocomplete({
        input: form.veneerAInput,
        menu: form.veneerASuggestions,
        clear: form.veneerAClear,
        error: form.veneerAError,
        getItems: () => availableVeneers("A"),
        getSelected: () => selectedVeneerAGroup,
        onSelect: onVeneerASelected,
        onInput: (value) => {
          if (selectedVeneerAGroup && value.trim() !== veneerDisplayName(selectedVeneerAGroup)) {
            selectedVeneerAGroup = null;
            selectedVeneerA = null;
            selectedVeneerBGroup = null;
            selectedVeneerB = null;
            selectedVeneerSelectionKeys.clear();
            clearPriceOverrides("veneer-selection:");
            clearPriceOverrides("veneer:A:");
            clearPriceOverrides("veneer:B:");
            veneerAPriceAuto = true;
            veneerBPriceAuto = true;
            veneerConditionChoices.A = "";
            veneerConditionChoices.B = "";
            form.veneerThicknessField.classList.add("is-hidden");
            form.veneerBInput.value = "";
            updateVeneerBModeLabel();
            syncEdgeVeneerDefaults();
            renderSelectionSurcharges();
            syncVeneerCutUI(false);
            syncVeneerBCutUI(false);
            renderStandardSizes();
            recalc();
          }
        },
        onClear: () => {
          selectedVeneerAGroup = null;
          selectedVeneerA = null;
          selectedVeneerBGroup = null;
          selectedVeneerB = null;
          selectedVeneerSelectionKeys.clear();
          clearPriceOverrides("veneer-selection:");
          clearPriceOverrides("veneer:A:");
          clearPriceOverrides("veneer:B:");
          veneerAPriceAuto = true;
          veneerBPriceAuto = true;
          veneerConditionChoices.A = "";
          veneerConditionChoices.B = "";
          form.veneerTypeSelect.value = "";
          form.veneerThicknessField.classList.add("is-hidden");
          form.veneerBInput.value = "";
          updateVeneerBModeLabel();
          syncEdgeVeneerDefaults();
          renderSelectionSurcharges();
          syncVeneerCutUI(false);
          syncVeneerBCutUI(false);
          renderStandardSizes();
          recalc();
        }
      });
      setupAutocomplete({
        input: form.veneerBInput,
        menu: form.veneerBSuggestions,
        clear: form.veneerBClear,
        error: form.veneerBError,
        getItems: () => availableVeneers("B"),
        getSelected: () => selectedVeneerBGroup,
        onSelect: onVeneerBSelected,
        onInput: (value) => {
          if (selectedVeneerBGroup && value.trim() !== veneerDisplayName(selectedVeneerBGroup)) {
            selectedVeneerBGroup = null;
            selectedVeneerB = null;
            veneerBPriceAuto = true;
            veneerConditionChoices.B = "";
            syncVeneerBCutUI(false);
            recalc();
          }
        },
        onClear: () => { selectedVeneerBGroup = null; selectedVeneerB = null; veneerBPriceAuto = true; veneerConditionChoices.B = ""; form.veneerBError.textContent = ""; syncVeneerBCutUI(false); recalc(); }
      });
      setupAutocomplete({
        input: form.edgeMaterialInput,
        menu: form.edgeMaterialSuggestions,
        clear: form.edgeMaterialClear,
        error: form.edgeMaterialError,
        getItems: () => availableVeneers("EDGE"),
        getSelected: () => selectedAttachedEdgeVeneer,
        onSelect: (item) => {
          selectedAttachedEdgeVeneer = item;
          attachedEdgeMaterialAuto = false;
          recalc();
        },
        onInput: (value) => {
          if (selectedAttachedEdgeVeneer && value.trim() !== veneerDisplayName(selectedAttachedEdgeVeneer)) selectedAttachedEdgeVeneer = null;
          attachedEdgeMaterialAuto = false;
          recalc();
        },
        onClear: () => {
          selectedAttachedEdgeVeneer = null;
          attachedEdgeMaterialAuto = false;
          recalc();
        }
      });
      setupAutocomplete({
        input: form.separateEdgeMaterialInput,
        menu: form.separateEdgeMaterialSuggestions,
        clear: form.separateEdgeMaterialClear,
        error: form.separateEdgeMaterialError,
        getItems: () => availableVeneers("EDGE"),
        getSelected: () => selectedSeparateEdgeVeneer,
        onSelect: (item) => {
          selectedSeparateEdgeVeneer = item;
          separateEdgeMaterialAuto = false;
          recalc();
        },
        onInput: (value) => {
          if (selectedSeparateEdgeVeneer && value.trim() !== veneerDisplayName(selectedSeparateEdgeVeneer)) selectedSeparateEdgeVeneer = null;
          separateEdgeMaterialAuto = false;
          recalc();
        },
        onClear: () => {
          selectedSeparateEdgeVeneer = null;
          separateEdgeMaterialAuto = false;
          recalc();
        }
      });
      populate(); bind(); syncEdgeVeneerDefaults(); updateEdgeUI(); recalc();
    } catch (error) { console.error(error); form.saveStatus.textContent = "Не удалось загрузить данные расчёта. Откройте прототип через локальный HTTP-сервер."; }
  }

  init();
})();
