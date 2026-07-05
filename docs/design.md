# Liquid Glass Lab Design

## Goal

Build a public GitHub Pages demo that showcases a React port of the locally analyzed macOS Liquid Glass recipe model and component catalog.

## Architecture

The engine lives in `src/engine/glass-engine.ts` and stays independent from React and the DOM. It resolves recipes, computes CSS variables and shader-like uniforms, applies color matrices, groups nearby glass surfaces, and calculates transition states.

The UI layer in `src/ui/LiquidGlassLab.tsx` is the React port. `MacOSGlassSurface` is the direct bridge from the macOS recipe model into React: it receives surface intent, calls `computeGlassSurface()`, and applies the resulting recipe id, CSS custom properties, and state classes to each rendered component. Every component uses `data-component` attributes for testing and auditability.

The page uses a live canvas backdrop so refraction and blur effects have dynamic visual content under the glass. React owns state and interactions; CSS handles the visible glass treatment through `backdrop-filter`, borders, highlights, and SVG displacement.

The deeper native stack is documented in `docs/compositor-metal-analysis.md`. That analysis follows the same material from CoreMaterial resources into AppKit `NSGlassEffectView`, Core Animation `CABackdropLayer`/`CAFilter`, QuartzCore Metal shader libraries, IOSurface, SkyLight, and WindowServer-level composition.

## Component Coverage

The catalog intentionally includes the surfaces missing from most open-source implementations: toolbar/search, sheet, dock, inspector, accessibility settings, and recipe matrix, not just cards and buttons.

## Validation

Vitest covers engine recipes, color matrix math, proximity grouping, transitions, and React UI catalog rendering. Playwright smoke tests verify desktop/mobile rendering, canvas output, toggles, and sheet interaction.

## Known Limits

Apple's private WindowServer compositor, AppKit private variants, and full CoreMaterial shader pipeline are not available to web code and are not copied here. This project mirrors their observable recipe behavior and public SwiftUI semantics where practical, then exposes that as React components.
