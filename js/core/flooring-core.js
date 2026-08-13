"use strict";

(function attachFlooringCore(global) {
  const RU_LOCALE = "ru-RU";

  const normalizeText = (value) => String(value ?? "").trim().toLocaleLowerCase(RU_LOCALE);

  const round = (value, digits = 2) => {
    const factor = 10 ** digits;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  };

  const money = new Intl.NumberFormat(RU_LOCALE, {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  const editableMoney = new Intl.NumberFormat(RU_LOCALE, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  function parseLocalizedNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    const normalized = String(value ?? "")
      .replace(/[\s\u00A0\u202F]/g, "")
      .replace(/₽/g, "")
      .replace(",", ".")
      .replace(/[^0-9.+-]/g, "");
    if (!normalized || normalized === "." || normalized === "+" || normalized === "-") return null;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function formatEditableMoney(value) {
    const parsed = parseLocalizedNumber(value);
    return parsed === null ? "" : editableMoney.format(parsed);
  }

  function formatMoney(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? money.format(parsed) : "—";
  }

  function formatPercent(value, digits = 2) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return "—";
    return `${new Intl.NumberFormat(RU_LOCALE, { maximumFractionDigits: digits }).format(parsed)}%`;
  }

  function priceArea(baseArea, wastePercent) {
    const area = Number(baseArea);
    const waste = Number(wastePercent);
    if (!Number.isFinite(area) || area <= 0 || !Number.isFinite(waste) || waste < 0) return null;
    return round(area * (1 + waste / 100), 2);
  }

  function catalogPrice(item) {
    if (!item) return null;
    const retail = Number(item?.prices?.retail);
    if (Number.isFinite(retail) && retail > 0) return retail;
    const fallback = Number(item?.pricePerM2);
    return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
  }

  function standardTopLayerThickness(itemOrValue) {
    const value = typeof itemOrValue === "object" ? itemOrValue?.topLayer : itemOrValue;
    const parsed = Number(String(value ?? "").replace(",", ".").replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  function totalThickness(data, item, baseThicknessMm = null) {
    const base = Number(baseThicknessMm ?? data?.meta?.baseThicknessMm ?? 12);
    const top = standardTopLayerThickness(item);
    if (!Number.isFinite(base) || base <= 0 || top === null) return null;
    return round(base + top, 2);
  }

  function automaticVolumeDiscountPercent(data, area) {
    const value = Number(area);
    if (!Number.isFinite(value)) return 0;
    const scale = data?.meta?.pricing?.discountScale || [];
    const tier = scale.find((row) => (
      value >= Number(row.minArea ?? 0) &&
      (row.maxArea === null || row.maxArea === undefined || value <= Number(row.maxArea))
    ));
    return Number(tier?.percent || 0);
  }

  function loyaltyTier(data, tierId) {
    const tiers = data?.meta?.pricing?.loyaltyTiers || [];
    return tiers.find((tier) => tier.id === tierId) || tiers[0] || {
      id: "retail",
      name: "Розничная цена",
      percent: 0
    };
  }

  function clientPricingTier(data, area, loyaltyTierId = "retail") {
    const threshold = Number(data?.meta?.pricing?.smallOrderThresholdM2 || 20);
    const value = Number(area);
    const loyalty = loyaltyTier(data, loyaltyTierId);
    const loyaltyPercent = Number(loyalty.percent || 0);
    const volumePercent = Number.isFinite(value) && value >= threshold
      ? automaticVolumeDiscountPercent(data, value)
      : 0;
    const maxDiscount = Number(data?.meta?.pricing?.maxDiscountPercent || 20);
    const percent = Math.min(Math.max(volumePercent, loyaltyPercent), maxDiscount);
    let source = "retail";
    if (percent > 0) {
      if (volumePercent > loyaltyPercent) source = "volume";
      else if (loyaltyPercent > volumePercent) source = "loyalty";
      else source = "volumeAndLoyalty";
    }
    return {
      id: `client_${source}`,
      name: percent ? `Скидка ${percent}%` : "Розничная цена",
      coefficient: 1 - percent / 100,
      discountPercent: percent,
      volumePercent,
      loyaltyPercent,
      loyaltyName: loyalty.name,
      source
    };
  }

  function dealerPricingTier(data, area) {
    const value = Number(area);
    const tiers = data?.meta?.pricing?.dealerTiers || [];
    const tier = tiers.find((row) => (
      Number.isFinite(value) &&
      value >= Number(row.minArea ?? 0) &&
      (row.maxArea === null || row.maxArea === undefined || value <= Number(row.maxArea))
    )) || tiers[0];
    if (!tier) return { id: "dealer_retail", name: "Розничная цена", coefficient: 1, discountPercent: 0 };
    return {
      ...tier,
      coefficient: Number(tier.coefficient || 1),
      discountPercent: Number(tier.discountPercent || 0)
    };
  }

  function pricingTier(data, area, clientType = "client", loyaltyTierId = "retail") {
    return clientType === "dealer"
      ? dealerPricingTier(data, area)
      : clientPricingTier(data, area, loyaltyTierId);
  }

  function smallOrderMarkup(data, area) {
    const value = Number(area);
    const threshold = Number(data?.meta?.pricing?.smallOrderThresholdM2 || 20);
    if (!Number.isFinite(value) || value >= threshold) return 0;
    return Number(data?.meta?.pricing?.defaultSmallOrderMarkupPercent || 0);
  }

  function selectionSurchargeOptions(data, item) {
    const definitions = data?.meta?.pricing?.selectionSurchargeDefinitions || {};
    const values = item?.selectionSurcharges || {};
    return Object.entries(values)
      .filter(([, percent]) => Number.isFinite(Number(percent)) && Number(percent) > 0)
      .map(([id, percent]) => ({
        id,
        name: definitions?.[id]?.name || id,
        percent: Number(percent)
      }));
  }

  function quickCoatingOptions(data) {
    const fixedGloss = Number(data?.meta?.quickCalculation?.fixedGlossPercent || 10);
    return (data?.coatings || []).map((coating) => ({
      id: coating.id,
      name: coating.glossRequired ? `${coating.name}, блеск ${fixedGloss}%` : coating.name,
      gloss: coating.glossRequired ? fixedGloss : null,
      sourceName: coating.name
    }));
  }

  function calculatePricing({
    data,
    retailPrice,
    areaWithWaste,
    tierCoefficient = 1,
    markups = [],
    finalUnitPriceOverride = null
  }) {
    const retail = Number(retailPrice);
    const area = Number(areaWithWaste);
    const coefficient = Number(tierCoefficient);
    if (![retail, area, coefficient].every(Number.isFinite) || retail <= 0 || area <= 0 || coefficient <= 0) return null;

    const normalizedMarkups = (markups || [])
      .map((row) => ({ ...row, percent: Number(row.percent || 0) }))
      .filter((row) => Number.isFinite(row.percent) && row.percent > 0);
    const markupPercent = normalizedMarkups.reduce((sum, row) => sum + row.percent, 0);

    // Порядок согласован для Woodstock:
    // 1) точная розничная цена;
    // 2) клиентская/дилерская ценовая категория;
    // 3) сумма всех применимых надбавок к полученной отпускной цене.
    const priceAfterTierRaw = retail * coefficient;
    const automaticFinalUnitPriceRaw = priceAfterTierRaw * (1 + markupPercent / 100);
    const override = Number(finalUnitPriceOverride);
    const hasOverride = Number.isFinite(override) && override > 0;
    const finalUnitPriceRaw = hasOverride ? override : automaticFinalUnitPriceRaw;

    const retailCostRaw = area * retail;
    const priceAfterTierCostRaw = area * priceAfterTierRaw;
    const automaticTotalRaw = area * automaticFinalUnitPriceRaw;
    const totalRaw = area * finalUnitPriceRaw;
    const vatRate = Number(data?.meta?.vatRate || 0.22);
    const vatRaw = totalRaw * vatRate / (1 + vatRate);

    return {
      retailPriceRaw: retail,
      tierCoefficient: coefficient,
      priceAfterTierRaw,
      markupPercent,
      markups: normalizedMarkups,
      automaticFinalUnitPriceRaw,
      finalUnitPriceRaw,
      manualPrice: hasOverride,
      retailCostRaw,
      priceAfterTierCostRaw,
      automaticTotalRaw,
      totalRaw,
      vatRaw,
      tierAdjustmentAmountRaw: priceAfterTierCostRaw - retailCostRaw,
      markupAmountRaw: automaticTotalRaw - priceAfterTierCostRaw,
      manualAdjustmentAmountRaw: totalRaw - automaticTotalRaw
    };
  }

  function minimumClientFinalPrice(data, retailPrice, markups = []) {
    const retail = Number(retailPrice);
    if (!Number.isFinite(retail) || retail <= 0) return null;
    const maxDiscount = Number(data?.meta?.pricing?.maxDiscountPercent || 20);
    const markupPercent = (markups || []).reduce((sum, row) => sum + Number(row.percent || 0), 0);
    return retail * (1 - maxDiscount / 100) * (1 + markupPercent / 100);
  }

  global.WoodstockFlooringCore = {
    normalizeText,
    round,
    parseLocalizedNumber,
    formatEditableMoney,
    formatMoney,
    formatPercent,
    priceArea,
    catalogPrice,
    standardTopLayerThickness,
    totalThickness,
    automaticVolumeDiscountPercent,
    loyaltyTier,
    clientPricingTier,
    dealerPricingTier,
    pricingTier,
    smallOrderMarkup,
    selectionSurchargeOptions,
    quickCoatingOptions,
    calculatePricing,
    minimumClientFinalPrice
  };
})(window);
