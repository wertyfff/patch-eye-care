# PATCH

English-language eye patch storefront with responsive product pages, a local shopping bag, promo codes and order handoff to Telegram @kiwnt1.

Live site: https://wertyfff.github.io/patch-eye-care/

## Local development

Node.js 22 or newer. No dependency installation is required.

```sh
npm start
```

Open http://127.0.0.1:4173/.

## Checks and publishing

```sh
npm run check
npm test
npm run build
npm run preview:pages
```

The build creates `docs/` for GitHub Pages, using `/patch-eye-care/` as the base path. Product pages have physical index files, so direct URLs and refreshes work on static hosting. Publish the `main` branch, `/docs` directory. Commit the generated `docs/` after source changes.

## Shop settings

Prices in RUB and active promo codes live in `assets/shop-config.js`. Aqua: 290; Glow: 310; Graphite: 390; Rose: 590. SEREGA gives 50% off; NASTUHA gives 99% off. Discounts apply to items, with shipping agreed separately.

The bag is stored in the visitor's browser. Checkout opens Telegram with the item list, quantities, discount and total as a draft message. The buyer sends it and arranges payment with the seller. No online payment processing is implemented. The seller confirms the final order before payment.

## UI and assets

Local GSAP, ScrollTrigger and Lenis assets provide the scroll effects. Reduced motion, touch scrolling and keyboard navigation are supported. The symbol in `assets/brand-mark.svg` is used in the header, footer, loader and favicon.

Photo sources and processing notes are recorded in `assets/catalog/sources.json` and `assets/catalog/restored-sources.json`. Vendor and font licences are included with the assets. Product ingredient lists, packaging quantities and shipping terms must be confirmed with the seller.
