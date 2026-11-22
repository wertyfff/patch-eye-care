const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const assert = require('node:assert/strict');
const window = { patchShopConfig: { prices: { aqua: 290, glow: 310, graphite: 390, rose: 590 }, promoCodes: {
  TEST10: { type: 'percent', value: 10 },
  FIXED: { type: 'fixed', value: 500 },
  MINIMUM: { type: 'percent', value: 15, minSubtotal: 1000 },
  INVALID: { type: 'percent', value: 110 }
} } };
runInNewContext(readFileSync('assets/shop.js', 'utf8'), { window, Intl });
const { totals, price } = window.patchShop;
assert.equal(price('aqua'), 29000);
assert.equal(totals({ aqua: 2, glow: 1 }).total, 89000);
assert.equal(totals({ aqua: 2, glow: 1 }, ' test10 ').total, 80100);
assert.equal(totals({ aqua: 2, glow: 1 }, 'test10').code, 'TEST10');
assert.equal(totals({ aqua: 1 }, 'FIXED').total, 0);
assert.equal(totals({ aqua: 2, glow: 1 }, 'missing').discount, 0);
assert.ok(totals({ aqua: 2, glow: 1 }, 'MINIMUM').error);
assert.equal(totals({ rose: 2 }, 'MINIMUM').total, 100300);
assert.ok(totals({ aqua: 1 }, 'INVALID').error);
assert.equal(totals({}).ready, false);
assert.equal(totals({ unknown: 1 }).ready, false);
console.log('Price, quantity, promo, minimum order and discount limits passed.');
