# Liquid Glass Lab Design

## Goal

Build a private GitHub repository with a GitHub Pages demo that showcases a complete browser-side Liquid Glass engine and component catalog.

## Architecture

The engine lives in `src/engine/glass-engine.ts` and stays independent from the DOM. It resolves recipes, computes CSS variables and shader-like uniforms, applies color matrices, groups nearby glass surfaces, and calculates transition states.

The UI layer in `src/ui/lab-ui.ts` mounts a single interactive page. Every component receives engine output through CSS custom properties and uses `data-component` attributes for testing and auditability.

The page uses a live canvas backdrop so refraction and blur effects have dynamic visual content under the glass. CSS handles the visible glass treatment through `backdrop-filter`, borders, highlights, and SVG displacement.

## Component Coverage

The catalog intentionally includes the surfaces missing from most open-source implementations: toolbar/search, sheet, dock, inspector, accessibility settings, and recipe matrix, not just cards and buttons.

## Validation

Vitest covers engine recipes, color matrix math, proximity grouping, transitions, and UI catalog rendering. Playwright smoke tests verify desktop/mobile rendering, canvas output, toggles, and sheet interaction.

## Known Limits

Apple's private WindowServer compositor, AppKit private variants, and full CoreMaterial shader pipeline are not available to web code. This project mirrors their observable behavior and parameters where practical, and states that boundary in the README.
