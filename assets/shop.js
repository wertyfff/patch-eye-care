(() => {
  const config = window.patchShopConfig || {};
  const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'RUB', minimumFractionDigits: value % 100 ? 2 : 0, maximumFractionDigits: 2 }).format(value / 100);
  const price = id => {
    const value = config.prices?.[id];
    return typeof value === 'number' && Number.isFinite(value) && value > 0 && Number.isSafeInteger(Math.round(value * 100)) ? Math.round(value * 100) : null;
  };
  const normalize = code => String(code || '').trim().toUpperCase();
  function totals(cart, code = '') {
    const entries = Object.entries(cart).filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0);
    const ready = entries.length > 0 && entries.every(([id]) => price(id) !== null);
    const subtotal = ready ? entries.reduce((sum, [id, quantity]) => sum + price(id) * quantity, 0) : null;
    const normalized = normalize(code);
    const promo = Object.entries(config.promoCodes || {}).find(([key]) => normalize(key) === normalized)?.[1];
    let error = '', discount = 0;
    if (normalized) {
      if (!promo || !['percent', 'fixed'].includes(promo.type) || !Number.isFinite(promo.value) || promo.value <= 0 || (promo.type === 'percent' && promo.value > 100)) error = 'Promo code not found.';
      else if (!ready) error = 'A promo code can be applied once item prices are available.';
      else if (subtotal < Math.round((promo.minSubtotal || 0) * 100)) error = `This code applies to orders of at least ${money(Math.round(promo.minSubtotal * 100))}.`;
      else discount = Math.min(subtotal, Math.round(promo.type === 'percent' ? subtotal * promo.value / 100 : promo.value * 100));
    }
    return { ready, subtotal, discount, total: ready ? subtotal - discount : null, code: normalized && !error ? normalized : '', error };
  }
  window.patchShop = { money, price, normalize, totals };
})();
