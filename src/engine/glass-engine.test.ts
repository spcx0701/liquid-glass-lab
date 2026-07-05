import { describe, expect, it } from 'vitest'
import {
  applyColorMatrix,
  computeGlassSurface,
  groupGlassSurfaces,
  listComponentCatalog,
  resolveGlassRecipe,
  resolveGlassTransition,
} from './glass-engine'

describe('CoreMaterial-inspired recipe resolution', () => {
  it('keeps the local macOS content glass matrix and 45px blur', () => {
    const recipe = resolveGlassRecipe({
      surface: 'contentGlass',
      colorScheme: 'light',
      reducedTransparency: false,
      highContrast: false,
    })

    expect(recipe.id).toBe('platformContentGlass')
    expect(recipe.filter.blurRadius).toBe(45)
    expect(recipe.filter.colorMatrix?.m11).toBeCloseTo(0.921)
    expect(recipe.filter.colorMatrix?.m25).toBeCloseTo(0.235)
    expect(recipe.styles.stroke).toBe('platformStrokeLight')
  })

  it('switches chrome to reduce-transparency recipe without blur-at-end', () => {
    const recipe = resolveGlassRecipe({
      surface: 'chrome',
      colorScheme: 'light',
      reducedTransparency: true,
      highContrast: false,
    })

    expect(recipe.id).toBe('platformChromeLightReduceTransparency')
    expect(recipe.filter.averageColorEnabled).toBe(true)
    expect(recipe.filter.blurAtEnd).toBe(false)
    expect(recipe.filter.saturation).toBeCloseTo(0.8)
  })

  it('maps high contrast to a solid legibility overlay', () => {
    const recipe = resolveGlassRecipe({
      surface: 'toolbarButton',
      colorScheme: 'dark',
      reducedTransparency: false,
      highContrast: true,
    })

    expect(recipe.accessibility.legibility).toBe('increased')
    expect(recipe.styles.fill).toBe('highContrastPrimary')
    expect(recipe.filter.blurRadius).toBeLessThanOrEqual(8)
  })
})

describe('Glass surface computation', () => {
  it('emits CSS variables and shader uniforms from one resolved surface', () => {
    const surface = computeGlassSurface({
      id: 'hero-card',
      surface: 'platter',
      colorScheme: 'light',
      reducedTransparency: false,
      highContrast: false,
      tint: '#7cc7ff',
      intensity: 0.82,
      cornerRadius: 28,
      interactive: true,
    })

    expect(surface.cssVars['--lg-blur-radius']).toBe('30px')
    expect(surface.cssVars['--lg-saturation']).toBe('2.4')
    expect(surface.cssVars['--lg-corner-radius']).toBe('28px')
    expect(surface.cssVars['--lg-tint']).toBe('#7cc7ff')
    expect(surface.shaderUniforms.chromaticAberration).toBeGreaterThan(0)
    expect(surface.classes).toContain('is-interactive')
  })

  it('applies the CoreMaterial color matrix to sampled rgb values', () => {
    const recipe = resolveGlassRecipe({
      surface: 'contentGlass',
      colorScheme: 'light',
      reducedTransparency: false,
      highContrast: false,
    })

    const mapped = applyColorMatrix([0.2, 0.45, 0.9, 1], recipe.filter.colorMatrix!)

    expect(mapped[0]).toBeCloseTo(0.2757, 3)
    expect(mapped[1]).toBeCloseTo(0.5257, 3)
    expect(mapped[2]).toBeCloseTo(0.9757, 3)
    expect(mapped[3]).toBe(1)
  })
})

describe('Container proximity merge', () => {
  it('merges similar glass views inside spacing and keeps different variants separate', () => {
    const groups = groupGlassSurfaces(
      [
        { id: 'a', x: 0, y: 0, width: 120, height: 64, recipeId: 'platformContentGlass' },
        { id: 'b', x: 126, y: 0, width: 120, height: 64, recipeId: 'platformContentGlass' },
        { id: 'c', x: 420, y: 0, width: 120, height: 64, recipeId: 'platformContentGlass' },
        { id: 'd', x: 0, y: 120, width: 120, height: 64, recipeId: 'platformChromeLight' },
      ],
      12,
    )

    expect(groups.map((group) => group.ids)).toEqual([['a', 'b'], ['c'], ['d']])
    expect(groups[0].bounds.width).toBe(246)
  })
})

describe('Morph transition semantics', () => {
  it('supports identity, materialize, and matched geometry transition modes', () => {
    expect(resolveGlassTransition({ mode: 'identity', progress: 0.8 }).opacity).toBe(1)
    expect(resolveGlassTransition({ mode: 'materialize', progress: 0.5 }).opacity).toBeCloseTo(0.5)

    const morph = resolveGlassTransition({
      mode: 'matchedGeometry',
      progress: 0.5,
      from: { x: 0, y: 0, width: 100, height: 40, radius: 18 },
      to: { x: 100, y: 40, width: 180, height: 80, radius: 30 },
    })

    expect(morph.transform).toEqual({ x: 50, y: 20, width: 140, height: 60, radius: 24 })
    expect(morph.opacity).toBe(1)
  })
})

describe('UI catalog completeness', () => {
  it('lists every demo component promised by the lab', () => {
    expect(listComponentCatalog().map((component) => component.id)).toEqual([
      'surface',
      'button',
      'card',
      'toolbar',
      'search',
      'tabs',
      'sheet',
      'dock',
      'text',
      'inspector',
      'settings',
      'recipe-matrix',
    ])
  })
})
