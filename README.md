# Liquid Glass Lab

Interactive Liquid Glass engine and component lab for GitHub Pages.

The implementation combines a pure TypeScript engine, CoreMaterial-inspired recipe tables, SVG displacement, CSS backdrop filtering, and a live canvas backdrop so every surface can be inspected in one browser page.

## Included Effects

- Content glass, chrome, toolbar button, dock, platter, module, sheet, and text recipes.
- Local macOS 26-inspired values for blur radius, luminance amount, saturation, brightness, backdrop scale, and color matrices.
- Reduced-transparency and high-contrast fallback paths.
- Tint, corner radius, interactive hover/press, chromatic-aberration uniforms, and materialized sheet transition.
- Proximity grouping logic for similar glass surfaces.
- Matched-geometry, materialize, and identity transition calculations.

## Included Components

- Glass surface
- Button
- Card
- Toolbar
- Search
- Tabs
- Sheet
- Dock
- Glass text
- Inspector
- Settings
- Recipe matrix

## Boundary

This project does not claim to reproduce Apple private implementation internals. The actual macOS Liquid Glass pipeline includes private WindowServer composition, AppKit/SwiftUI runtime behavior, and CoreMaterial resources that are not fully public API. This lab implements a faithful, inspectable web approximation using public browser primitives and the locally observed recipe shape.

## Development

```bash
pnpm install
pnpm test
pnpm build
pnpm preview
```

Optional browser smoke test:

```bash
pnpm exec playwright install chromium
pnpm smoke
```

## Deployment

The repo includes a GitHub Actions workflow that builds with pnpm and deploys `dist/` to GitHub Pages from `main`.
