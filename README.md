# Liquid Glass Lab

Interactive React Liquid Glass engine and component lab for GitHub Pages.

The implementation ports the locally analyzed macOS Liquid Glass recipe model into React components. A pure TypeScript engine keeps the CoreMaterial-inspired recipe tables and transition math, while `MacOSGlassSurface` maps those recipes into React props, CSS variables, SVG displacement, CSS backdrop filtering, and a live canvas backdrop.

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

This project does not copy Apple private source or binary implementation internals. The actual macOS Liquid Glass pipeline includes private WindowServer composition, AppKit/SwiftUI runtime behavior, and CoreMaterial resources that are not fully public API. This lab is a React port of the observed recipe shape and public SwiftUI semantics into browser primitives.

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
