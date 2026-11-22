// Prices and fixed discounts are in rubles. Null means no confirmed price.
window.patchShopConfig = {
  prices: { aqua: 290, glow: 310, graphite: 390, rose: 590 },
  // Example format: CODE: { type: 'percent', value: 10, minSubtotal: 0 }
  // For a fixed discount use type: 'fixed'. Add only approved codes.
  promoCodes: {
    SEREGA: { type: 'percent', value: 50 },
    NASTUHA: { type: 'percent', value: 99 }
  }
};
