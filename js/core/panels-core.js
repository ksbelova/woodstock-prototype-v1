"use strict";

(function attachPanelsCore(global) {
  const RU_LOCALE = "ru-RU";

  function parseNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const cleaned = String(value ?? "").trim().replace(/\s+/g, "").replace(",", ".");
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  function formatMoney(value) {
    return Number.isFinite(value)
      ? `${new Intl.NumberFormat(RU_LOCALE, { maximumFractionDigits: 2 }).format(value)} ₽`
      : "—";
  }

  function parseThicknessComposition(value) {
    const raw = String(value ?? "").trim().replace(/,/g, ".");
    if (!raw) return { raw: "", parts: [], total: null, composite: false };
    const tokens = raw.split("+");
    const parts = tokens.map((x) => Number(x.trim()));
    if (!parts.length || parts.some((x) => !Number.isFinite(x))) {
      return { raw, parts: [], total: null, composite: tokens.length > 1 };
    }
    return {
      raw,
      parts,
      total: parts.reduce((sum, part) => sum + part, 0),
      composite: parts.length > 1
    };
  }

  function closestExactRate(rows, thickness, key) {
    if (!Number.isFinite(thickness)) return null;
    const row = (rows || []).find((x) => Number(x.thicknessMm) === Number(thickness));
    const value = row ? Number(row[key]) : NaN;
    return Number.isFinite(value) ? value : null;
  }

  function edgeMetersForSize(size, rule) {
    if (!rule || !size?.length || !size?.width || !size?.quantity) return 0;
    return ((Number(rule.lengthCount || 0) * size.length + Number(rule.widthCount || 0) * size.width) / 1000) * size.quantity * 1.2;
  }

  function normalizeThicknessKey(value) {
    return String(value ?? "").trim().replace(/\s+/g, "").replace(/,/g, ".");
  }

  function compositionRateRow(rows, baseId, thicknessRaw) {
    const normalized = normalizeThicknessKey(thicknessRaw);
    const thickness = parseThicknessComposition(thicknessRaw);
    const totalKey = Number.isFinite(thickness.total)
      ? normalizeThicknessKey(thickness.total)
      : null;
    const sourceRows = rows || [];

    // New exact rows are keyed by base + actual composition and always win.
    const exactForBase = sourceRows.find((x) => (
      x.baseId === baseId &&
      normalizeThicknessKey(x.thickness ?? x.thicknessMm) === normalized
    ));
    if (exactForBase) return exactForBase;

    // Legacy rows did not know the base and used total thickness. Preserve them only
    // as a fallback for combinations not described by the newer exact matrix.
    const exactLegacy = sourceRows.find((x) => (
      !x.baseId &&
      normalizeThicknessKey(x.thickness ?? x.thicknessMm) === normalized
    ));
    if (exactLegacy) return exactLegacy;
    if (totalKey && totalKey !== normalized) {
      return sourceRows.find((x) => (
        !x.baseId &&
        normalizeThicknessKey(x.thickness ?? x.thicknessMm) === totalKey
      )) || null;
    }
    return null;
  }

  function nonstandardRateFor(data, baseId, thicknessRaw, sides) {
    // Backward compatibility with the previous 3-argument call.
    if (arguments.length === 3) {
      sides = thicknessRaw;
      thicknessRaw = baseId;
      baseId = "mdf";
    }
    const row = (data?.nonstandardRates || []).find((x) => (
      (!x.baseId || x.baseId === baseId) &&
      normalizeThicknessKey(x.thickness) === normalizeThicknessKey(thicknessRaw) &&
      Number(x.sides) === Number(sides)
    ));
    return row ? parseNumber(row.ratePerM2) : null;
  }

  function standardProductionRateFor(data, baseId, thicknessRaw, sides, veneerThickness) {
    const thick = parseNumber(veneerThickness);
    const cls = Number.isFinite(thick) && Math.abs(thick - 0.6) < 0.001
      ? "0.6"
      : Number.isFinite(thick) && thick >= 1.5
        ? "1.5+"
        : null;
    if (!cls) return null;
    const row = (data?.standardProductionRates || []).find((x) => (
      x.baseId === baseId &&
      normalizeThicknessKey(x.thickness) === normalizeThicknessKey(thicknessRaw) &&
      Number(x.sides) === Number(sides) &&
      x.veneerThicknessClass === cls
    ));
    return row ? parseNumber(row.ratePerM2) : null;
  }

  function cuttingRateFor(data, baseId, thicknessRaw) {
    const row = compositionRateRow(data?.cuttingRates, baseId, thicknessRaw);
    return row ? parseNumber(row.ratePerRunningM) : null;
  }

  function edgeRateFor(data, baseId, thicknessRaw, edgeThickness, runningM) {
    const row = compositionRateRow(data?.edgeRates, baseId, thicknessRaw);
    const edge = parseNumber(edgeThickness);
    const meters = parseNumber(runningM);
    if (!row || !Number.isFinite(edge) || !Number.isFinite(meters)) return null;
    const group = edge >= 0.5 && edge <= 1 ? "thin" : edge >= 1.5 && edge <= 2 ? "thick" : null;
    if (!group) return null;

    const threshold = parseNumber(data?.meta?.edgeMachineThresholdRunningM) ?? 40;
    const method = meters >= threshold ? "Machine" : "Manual";
    const currentKey = `${group}${method}RatePerRunningM`;
    const currentRate = parseNumber(row[currentKey]);
    if (Number.isFinite(currentRate)) {
      return {
        rate: currentRate,
        method: method === "Machine" ? "machine" : "manual",
        group,
        threshold,
        source: "current"
      };
    }

    // Older confirmed tariffs only distinguished thin/thick edge and did not define
    // the new <40 / >=40 production-method split. They remain a fallback instead of
    // being silently discarded or transformed into an invented machine tariff.
    const legacyKey = `${group}RatePerRunningM`;
    const legacyRate = parseNumber(row[legacyKey]);
    return Number.isFinite(legacyRate)
      ? { rate: legacyRate, method: "legacy", group, threshold: null, source: "legacy" }
      : null;
  }

  function percentDiscount(retail, target) {
    const r = parseNumber(retail);
    const t = parseNumber(target);
    if (!Number.isFinite(r) || r <= 0 || !Number.isFinite(t)) return 0;
    return Math.max((1 - t / r) * 100, 0);
  }

  function percentMarkup(retail, target) {
    const r = parseNumber(retail);
    const t = parseNumber(target);
    if (!Number.isFinite(r) || r <= 0 || !Number.isFinite(t)) return 0;
    return Math.max((t / r - 1) * 100, 0);
  }

  function standardSheetPrices(standard, condition, mdfSelectionId, volumeId, warnings = [], overrides = {}) {
    const retail = parseNumber(standard?.pricesPerSheet?.retail);
    if (!Number.isFinite(retail)) {
      return { retailSheet: null, finalSheet: null, partial: true, note: "Нет розничной цены в строке прайса." };
    }

    const conditionKey = volumeId && volumeId !== "none" ? volumeId : (condition || "retail");
    const conditionTarget = conditionKey === "retail"
      ? retail
      : parseNumber(standard.pricesPerSheet?.[conditionKey]);
    let partial = false;
    if (!Number.isFinite(conditionTarget)) {
      warnings.push(`Для условия «${conditionKey}» в строке МДФ ${standard.lengthMm}×${standard.widthMm} нет цены; применена розничная цена.`);
      partial = true;
    }
    const automaticDiscountPercent = Number.isFinite(conditionTarget)
      ? percentDiscount(retail, conditionTarget)
      : 0;
    const discountPercent = Number.isFinite(parseNumber(overrides.discountPercent))
      ? Math.max(parseNumber(overrides.discountPercent), 0)
      : automaticDiscountPercent;

    let automaticMarkupPercent = 0;
    if (mdfSelectionId && mdfSelectionId !== "none") {
      const selectionTarget = parseNumber(standard.pricesPerSheet?.[mdfSelectionId]);
      if (Number.isFinite(selectionTarget)) {
        automaticMarkupPercent = percentMarkup(retail, selectionTarget);
      } else {
        warnings.push(`Для отбора МДФ в строке ${standard.lengthMm}×${standard.widthMm} нет цены; отбор не включён автоматически.`);
        partial = true;
      }
    }
    const markupPercent = Number.isFinite(parseNumber(overrides.markupPercent))
      ? Math.max(parseNumber(overrides.markupPercent), 0)
      : automaticMarkupPercent;

    // Для плит порядок согласован так: сначала надбавка за отбор, затем скидка/условие клиента.
    const finalSheet = retail * (1 + markupPercent / 100) * (1 - discountPercent / 100);
    return {
      retailSheet: retail,
      finalSheet,
      partial,
      note: "",
      conditionKey,
      automaticDiscountPercent,
      discountPercent,
      automaticMarkupPercent,
      markupPercent
    };
  }

  function weightForSize(size, base, thickness) {
    const density = base?.weightDensityKgM3;
    if (!density || !Number.isFinite(thickness?.total) || !size?.calcLength || !size?.calcWidth || !size?.quantity) return null;
    const volume = (size.calcLength / 1000) * (size.calcWidth / 1000) * (thickness.total / 1000) * size.quantity;
    return {
      min: volume * density.min,
      max: volume * density.max,
      densityMin: density.min,
      densityMax: density.max
    };
  }

  function weightText(weight) {
    if (!weight) return "—";
    const formatter = new Intl.NumberFormat(RU_LOCALE, { maximumFractionDigits: 1 });
    if (Math.abs(weight.max - weight.min) < 0.01) return `≈ ${formatter.format(weight.min)} кг`;
    return `≈ ${formatter.format(weight.min)}–${formatter.format(weight.max)} кг`;
  }

  function validateVeneerPriceLevel(item, level, purchase, warnings, label, veneerThickness = null) {
    if (!item || !level) return;
    if (level.requiresAgreement) warnings.push(`${label}: выбранный ценовой уровень «${level.name}» по прайсу требует согласования.`);
    if (level.requiresProjectMaterials) warnings.push(`${label}: уровень «${level.name}» действует только при указанной в прайсе доле дополнительных материалов; автоматическая проверка этой доли в расчёте позиции невозможна.`);
    if (level.id === "volume1000_5000" && Number.isFinite(purchase.area) && purchase.area > 5000) {
      warnings.push(`${label}: при объёме свыше 5000 м² цена мультишпона по прайсу согласовывается отдельно.`);
    }
    if (Number.isFinite(level.minM2) && Number.isFinite(purchase.area) && purchase.area < level.minM2) {
      warnings.push(`${label}: для уровня «${level.name}» требуется не менее ${level.minM2} м²; рассчитано к закупке ${round(purchase.area, 2)} м².`);
    }
    if (Number.isFinite(level.minSheets) && Number.isFinite(purchase.sheets) && purchase.sheets < level.minSheets) {
      warnings.push(`${label}: для уровня «${level.name}» требуется не менее ${level.minSheets} листов; рассчитано ${purchase.sheets}.`);
    }
    if (level.minNote) {
      const thick = parseNumber(item.thicknessMm ?? veneerThickness);
      const thickOrExotic = (Number.isFinite(thick) && thick >= 1) || item.exoticOrThick;
      const thresholds = { volume1: thickOrExotic ? 50 : 100, volume2: thickOrExotic ? 149 : 300, volume3: thickOrExotic ? 300 : 1001 };
      const min = thresholds[level.id];
      if (min && Number.isFinite(purchase.area) && purchase.area < min) {
        warnings.push(`${label}: выбранный объёмный уровень начинается с ${min} м² для этой группы; рассчитано к закупке ${round(purchase.area, 2)} м².`);
      }
    }
  }

  function veneerPurchase(item, requiredArea, price, selectionMarkup, warnings, label) {
    if (!Number.isFinite(requiredArea) || requiredArea <= 0) {
      return { cost: 0, area: 0, sheets: 0, partial: false, note: "" };
    }
    if (!Number.isFinite(price)) {
      warnings.push(`${label}: цена шпона не задана; компонент не включён в стоимость.`);
      return { cost: 0, area: requiredArea, sheets: null, partial: true, note: "" };
    }
    const markup = 1 + (selectionMarkup || 0);

    if (item?.priceUnit === "sheet") {
      const dim = item.sheetDimensionsMm;
      if (!dim || !Number.isFinite(dim.width) || !Number.isFinite(dim.length)) {
        warnings.push(`${label}: для цены за лист нет подтверждённого размера листа; стоимость не рассчитана автоматически.`);
        return { cost: 0, area: requiredArea, sheets: null, partial: true, note: "Цена за лист." };
      }
      const sheetArea = dim.width * dim.length / 1_000_000;
      const sheets = Math.ceil(requiredArea / sheetArea);
      return {
        cost: sheets * price * markup,
        area: sheets * sheetArea,
        sheets,
        partial: false,
        note: `${sheets} лист. × ${formatMoney(price)}/лист`
      };
    }

    if (item?.type === "multi") {
      const dim = item.sheetDimensionsMm;
      if (!dim) {
        warnings.push(`${label}: размер листа мультишпона не найден в прайсе; расход кратно листу не рассчитан.`);
        return { cost: 0, area: requiredArea, sheets: null, partial: true, note: "" };
      }
      if (dim.range) {
        warnings.push(`${label}: ширина листа мультишпона в прайсе задана диапазоном ${item.sheetSize}; без фактической ширины нельзя точно округлить расход до целых листов. Стоимость шпона не включена автоматически.`);
        return {
          cost: 0,
          area: requiredArea,
          sheets: null,
          partial: true,
          note: `Требуется фактический размер листа: ${item.sheetSize}`
        };
      }
      const sheetArea = dim.widthMin * dim.length / 1_000_000;
      const sheets = Math.ceil(requiredArea / sheetArea);
      const purchaseArea = sheets * sheetArea;
      return {
        cost: purchaseArea * price * markup,
        area: purchaseArea,
        sheets,
        partial: false,
        note: `${round(requiredArea, 2)} м² потребность → ${sheets} лист. → ${round(purchaseArea, 2)} м² к закупке`
      };
    }

    return {
      cost: requiredArea * price * markup,
      area: requiredArea,
      sheets: null,
      partial: false,
      note: `${round(requiredArea, 2)} м²`
    };
  }

  function veneerThicknessFromItem(item) {
    const direct = parseNumber(item?.thicknessMm);
    if (Number.isFinite(direct)) return direct;
    const text = `${item?.sheetSize || ""} ${item?.name || ""}`;
    const match = text.match(/толщина\s*(\d+(?:[.,]\d+)?)/i);
    return match ? parseNumber(match[1]) : null;
  }

  function veneerVolumeBasis(item, requiredArea) {
    const area = parseNumber(requiredArea);
    if (!Number.isFinite(area) || area <= 0) return { area: 0, sheets: 0, exact: true };
    const dim = item?.sheetDimensionsMm;
    if ((item?.type === "multi" || item?.priceUnit === "sheet") && dim) {
      if (dim.range) return { area, sheets: null, exact: false };
      const width = parseNumber(dim.width ?? dim.widthMin);
      const length = parseNumber(dim.length);
      if (Number.isFinite(width) && Number.isFinite(length)) {
        const sheetArea = width * length / 1_000_000;
        const sheets = Math.ceil(area / sheetArea);
        return { area: sheets * sheetArea, sheets, exact: true };
      }
    }
    return { area, sheets: null, exact: true };
  }

  function automaticVeneerLevel(item, purchaseArea, purchaseSheets = null) {
    if (!item) return { id: "retail", name: "Розничная цена", price: null };
    const area = parseNumber(purchaseArea) || 0;
    const sheets = parseNumber(purchaseSheets);
    const levels = (item.priceLevels || []).filter((level) =>
      level.id !== "client" &&
      !level.requiresAgreement &&
      !level.requiresProjectMaterials &&
      Number.isFinite(parseNumber(item.prices?.[level.id]))
    );

    let selected = null;
    if (item.type === "natural") {
      const thickness = veneerThicknessFromItem(item);
      const thickOrExotic = (Number.isFinite(thickness) && thickness >= 1) || item.exoticOrThick;
      const thresholds = {
        volume1: thickOrExotic ? 50 : 100,
        volume2: thickOrExotic ? 149 : 300,
        volume3: thickOrExotic ? 300 : 1001
      };
      for (const level of levels) {
        const min = thresholds[level.id];
        if (Number.isFinite(min) && area >= min) selected = { ...level, minM2: min };
      }
    } else {
      const sheetLevels = levels.filter((level) => Number.isFinite(parseNumber(level.minSheets)));
      if (sheetLevels.length && Number.isFinite(sheets)) {
        sheetLevels
          .sort((a, b) => parseNumber(a.minSheets) - parseNumber(b.minSheets))
          .forEach((level) => { if (sheets >= parseNumber(level.minSheets)) selected = level; });
      } else {
        levels
          .filter((level) => Number.isFinite(parseNumber(level.minM2)))
          .sort((a, b) => parseNumber(a.minM2) - parseNumber(b.minM2))
          .forEach((level) => { if (area >= parseNumber(level.minM2)) selected = level; });
      }
    }

    if (!selected) return { id: "retail", name: "Розничная цена", price: parseNumber(item.prices?.retail), minM2: 0 };
    return { ...selected, price: parseNumber(item.prices?.[selected.id]) };
  }

  function veneerClientPrice(item, condition) {
    if (!item) return null;
    return parseNumber(item.prices?.[condition]) ?? parseNumber(item.prices?.retail);
  }


  function sortPhysicalSizes(formats = []) {
    const seen = new Set();
    return (formats || [])
      .map((item) => ({
        length: parseNumber(item?.length),
        width: parseNumber(item?.width)
      }))
      .filter((item) => Number.isFinite(item.length) && Number.isFinite(item.width) && item.length > 0 && item.width > 0)
      .filter((item) => {
        const key = [item.length, item.width].sort((a, b) => a - b).join("x");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        const aMax = Math.max(a.length, a.width);
        const bMax = Math.max(b.length, b.width);
        if (aMax !== bMax) return aMax - bMax;
        const aMin = Math.min(a.length, a.width);
        const bMin = Math.min(b.length, b.width);
        return aMin - bMin;
      });
  }

  function sizeFitsFormats(length, width, formats = [], allowanceMm = 0) {
    const l = parseNumber(length);
    const w = parseNumber(width);
    const allowance = Math.max(parseNumber(allowanceMm) || 0, 0);
    if (!Number.isFinite(l) || !Number.isFinite(w) || l <= 0 || w <= 0) return false;

    const requiredLength = l + allowance;
    const requiredWidth = w + allowance;

    return sortPhysicalSizes(formats).some((format) => (
      (requiredLength <= format.length && requiredWidth <= format.width) ||
      (requiredLength <= format.width && requiredWidth <= format.length)
    ));
  }

  function maxDimensionForFormats(formats = [], allowanceMm = 0) {
    const allowance = Math.max(parseNumber(allowanceMm) || 0, 0);
    const values = sortPhysicalSizes(formats).flatMap((format) => [format.length, format.width]);
    if (!values.length) return null;
    return Math.max(...values) - allowance;
  }

  function maxCompanionDimension(value, formats = [], allowanceMm = 0) {
    const dimension = parseNumber(value);
    const allowance = Math.max(parseNumber(allowanceMm) || 0, 0);
    if (!Number.isFinite(dimension) || dimension <= 0) return maxDimensionForFormats(formats, allowance);

    const required = dimension + allowance;
    const candidates = [];
    sortPhysicalSizes(formats).forEach((format) => {
      if (required <= format.length) candidates.push(format.width - allowance);
      if (required <= format.width) candidates.push(format.length - allowance);
    });
    const valid = candidates.filter((candidate) => Number.isFinite(candidate) && candidate > 0);
    return valid.length ? Math.max(...valid) : null;
  }

  global.WoodstockPanelsCore = {
    parseNumber,
    round,
    formatMoney,
    parseThicknessComposition,
    closestExactRate,
    edgeMetersForSize,
    nonstandardRateFor,
    standardProductionRateFor,
    cuttingRateFor,
    edgeRateFor,
    standardSheetPrices,
    weightForSize,
    weightText,
    validateVeneerPriceLevel,
    veneerPurchase,
    veneerThicknessFromItem,
    veneerVolumeBasis,
    automaticVeneerLevel,
    veneerClientPrice,
    sortPhysicalSizes,
    sizeFitsFormats,
    maxDimensionForFormats,
    maxCompanionDimension
  };
})(window);
