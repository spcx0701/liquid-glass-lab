export type ColorScheme = 'light' | 'dark'
export type SurfaceKind =
  | 'contentGlass'
  | 'chrome'
  | 'toolbarButton'
  | 'dock'
  | 'platter'
  | 'module'
  | 'sheet'
  | 'text'

export type TransitionMode = 'identity' | 'materialize' | 'matchedGeometry'

export interface ColorMatrix {
  m11: number
  m12: number
  m13: number
  m14: number
  m15: number
  m21: number
  m22: number
  m23: number
  m24: number
  m25: number
  m31: number
  m32: number
  m33: number
  m34: number
  m35: number
  m41: number
  m42: number
  m43: number
  m44: number
  m45: number
}

export interface MaterialFilter {
  blurRadius: number
  backdropScale?: number
  blurAtEnd?: boolean
  averageColorEnabled?: boolean
  luminanceAmount?: number
  luminanceValues?: [number, number, number, number]
  saturation?: number
  brightness?: number
  zoom?: number
  colorMatrix?: ColorMatrix
}

export interface GlassRecipe {
  id: string
  label: string
  filter: MaterialFilter
  styles: {
    fill: string
    stroke: string
  }
  accessibility: {
    legibility: 'standard' | 'increased'
  }
}

export interface RecipeState {
  surface: SurfaceKind
  colorScheme: ColorScheme
  reducedTransparency: boolean
  highContrast: boolean
}

export interface GlassSurfaceInput extends RecipeState {
  id: string
  tint: string
  intensity: number
  cornerRadius: number
  interactive: boolean
}

export interface ComputedGlassSurface {
  id: string
  recipe: GlassRecipe
  cssVars: Record<string, string>
  shaderUniforms: {
    blur: number
    refraction: number
    chromaticAberration: number
    luminanceAmount: number
    saturation: number
    tintStrength: number
  }
  classes: string[]
}

export interface GlassRect {
  id: string
  x: number
  y: number
  width: number
  height: number
  recipeId: string
}

export interface GlassGroup {
  ids: string[]
  recipeId: string
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface TransitionRect {
  x: number
  y: number
  width: number
  height: number
  radius: number
}

export interface GlassTransitionInput {
  mode: TransitionMode
  progress: number
  from?: TransitionRect
  to?: TransitionRect
}

export interface GlassTransitionOutput {
  opacity: number
  scale: number
  transform?: TransitionRect
}

export interface ComponentCatalogItem {
  id: string
  label: string
  role: string
}

const contentGlassMatrix: ColorMatrix = {
  m11: 0.921,
  m12: -0.265,
  m13: -0.027,
  m14: 0,
  m15: 0.235,
  m21: -0.079,
  m22: 0.735,
  m23: -0.027,
  m24: 0,
  m25: 0.235,
  m31: -0.079,
  m32: -0.265,
  m33: 0.973,
  m34: 0,
  m35: 0.235,
  m41: 0,
  m42: 0,
  m43: 0,
  m44: 1,
  m45: 0,
}

const recipes = {
  platformContentGlass: recipe('platformContentGlass', 'Content glass', {
    blurRadius: 45,
    colorMatrix: contentGlassMatrix,
  }, 'platformFillLight', 'platformStrokeLight'),
  platformChromeLight: recipe('platformChromeLight', 'Chrome light', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 22.5,
    brightness: 0.1,
    luminanceAmount: 0.75,
    luminanceValues: [0.8, 0.9, 1.1, 0.825],
    saturation: 1.1,
  }, 'platformChromeFillLight', 'platformStrokeLight'),
  platformChromeDark: recipe('platformChromeDark', 'Chrome dark', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 22.5,
    brightness: -0.1,
    luminanceAmount: 0.75,
    luminanceValues: [0.23, 0.52, 0.27, 0.255],
    saturation: 2,
  }, 'platformChromeFillDark', 'platformStrokeDark'),
  platformChromeLightReduceTransparency: recipe('platformChromeLightReduceTransparency', 'Chrome reduce transparency', {
    averageColorEnabled: true,
    backdropScale: 0.25,
    blurAtEnd: false,
    blurRadius: 0,
    brightness: 0.1,
    luminanceAmount: 0.75,
    luminanceValues: [0.95, 0.9, 1.1, 0.825],
    saturation: 0.8,
  }, 'platformChromeFillLight', 'platformStrokeLight'),
  toolbarButtonBackground: recipe('toolbarButtonBackground', 'Toolbar button', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 15,
    luminanceAmount: 0.5,
    luminanceValues: [0.24, 0.24, 0.3, 0.39],
    saturation: 1.1,
  }, 'platformChromeFillLight', 'platformStrokeLight'),
  dockLight: recipe('dockLight', 'Dock light', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: 0.08,
    luminanceAmount: 0.5,
    luminanceValues: [0.3, 0.5, 1, 0.77],
    saturation: 1.8,
  }, 'platterFillLight', 'platterStrokeLight'),
  dockDark: recipe('dockDark', 'Dock dark', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    luminanceAmount: 0.5,
    luminanceValues: [0.29, -0.2, 0.375, 0.65],
    saturation: 1.6,
  }, 'platterFillDark', 'platterStrokeDark'),
  platters: recipe('platters', 'Platter light', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    luminanceAmount: 0.6,
    luminanceValues: [0.775, 0.85, 1.05, 0.94],
    saturation: 2.4,
  }, 'platterFillLight', 'platterStrokeLight'),
  plattersDark: recipe('plattersDark', 'Platter dark', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: -0.03,
    luminanceAmount: 0.4,
    luminanceValues: [0.41, -0.4, 0.3, 0],
    saturation: 1.4,
  }, 'platterFillDark', 'platterStrokeDark'),
  modulesBackground: recipe('modulesBackground', 'Module background', {
    blurRadius: 25,
    luminanceAmount: 0.4,
    luminanceValues: [0.38, 0, 1, 0.76],
    saturation: 1.6,
    zoom: 0.04,
  }, 'moduleFill', 'moduleStroke'),
  sheetLight: recipe('sheetLight', 'Sheet', {
    backdropScale: 0.25,
    blurAtEnd: true,
    blurRadius: 30,
    brightness: 0.1,
    luminanceAmount: 0.75,
    luminanceValues: [0.8, 0.9, 1.1, 0.825],
    saturation: 1.5,
  }, 'platformFillLight', 'platformStrokeLight'),
  textGlass: recipe('textGlass', 'Vibrant text', {
    blurRadius: 11.2,
    zoom: 0.024,
    saturation: 1.1,
  }, 'platformFillLight', 'platformStrokeLight'),
  highContrast: recipe('highContrast', 'High contrast fallback', {
    averageColorEnabled: true,
    blurAtEnd: false,
    blurRadius: 6,
    luminanceAmount: 1,
    saturation: 0.2,
  }, 'highContrastPrimary', 'highContrastSecondary', 'increased'),
} satisfies Record<string, GlassRecipe>

export function resolveGlassRecipe(state: RecipeState): GlassRecipe {
  if (state.highContrast) {
    return recipes.highContrast
  }

  if (state.reducedTransparency && state.surface === 'chrome') {
    return recipes.platformChromeLightReduceTransparency
  }

  if (state.surface === 'contentGlass') {
    return recipes.platformContentGlass
  }

  if (state.surface === 'chrome') {
    return state.colorScheme === 'dark' ? recipes.platformChromeDark : recipes.platformChromeLight
  }

  if (state.surface === 'toolbarButton') {
    return recipes.toolbarButtonBackground
  }

  if (state.surface === 'dock') {
    return state.colorScheme === 'dark' ? recipes.dockDark : recipes.dockLight
  }

  if (state.surface === 'platter') {
    return state.colorScheme === 'dark' ? recipes.plattersDark : recipes.platters
  }

  if (state.surface === 'module') {
    return recipes.modulesBackground
  }

  if (state.surface === 'text') {
    return recipes.textGlass
  }

  return recipes.sheetLight
}

export function computeGlassSurface(input: GlassSurfaceInput): ComputedGlassSurface {
  const recipeValue = resolveGlassRecipe(input)
  const blur = recipeValue.filter.blurRadius * input.intensity
  const saturation = recipeValue.filter.saturation ?? 1
  const luminanceAmount = recipeValue.filter.luminanceAmount ?? 0
  const tintStrength = input.tint === 'transparent' ? 0 : Math.max(0.08, input.intensity * 0.22)
  const cssVars: Record<string, string> = {
    '--lg-blur-radius': `${trimNumber(recipeValue.filter.blurRadius)}px`,
    '--lg-effective-blur': `${trimNumber(blur)}px`,
    '--lg-saturation': String(saturation),
    '--lg-luminance': String(luminanceAmount),
    '--lg-corner-radius': `${trimNumber(input.cornerRadius)}px`,
    '--lg-tint': input.tint,
    '--lg-tint-strength': String(trimNumber(tintStrength)),
    '--lg-backdrop-scale': String(recipeValue.filter.backdropScale ?? 1),
    '--lg-brightness': String(recipeValue.filter.brightness ?? 0),
  }

  return {
    id: input.id,
    recipe: recipeValue,
    cssVars,
    shaderUniforms: {
      blur,
      refraction: input.highContrast ? 0 : Math.min(0.72, input.intensity * 0.56),
      chromaticAberration: input.highContrast ? 0 : Math.max(0.004, input.intensity * 0.018),
      luminanceAmount,
      saturation,
      tintStrength,
    },
    classes: [
      'lg-surface',
      `recipe-${recipeValue.id}`,
      input.interactive ? 'is-interactive' : 'is-static',
      input.reducedTransparency ? 'is-reduced-transparency' : 'is-translucent',
      input.highContrast ? 'is-high-contrast' : 'is-standard-contrast',
    ],
  }
}

export function applyColorMatrix(
  rgba: [number, number, number, number],
  matrix: ColorMatrix,
): [number, number, number, number] {
  const [r, g, b, a] = rgba
  return [
    clamp01(matrix.m11 * r + matrix.m12 * g + matrix.m13 * b + matrix.m14 * a + matrix.m15),
    clamp01(matrix.m21 * r + matrix.m22 * g + matrix.m23 * b + matrix.m24 * a + matrix.m25),
    clamp01(matrix.m31 * r + matrix.m32 * g + matrix.m33 * b + matrix.m34 * a + matrix.m35),
    clamp01(matrix.m41 * r + matrix.m42 * g + matrix.m43 * b + matrix.m44 * a + matrix.m45),
  ]
}

export function groupGlassSurfaces(rects: GlassRect[], spacing: number): GlassGroup[] {
  const groups: GlassRect[][] = []

  for (const rect of rects) {
    const target = groups.find((group) => {
      if (group[0].recipeId !== rect.recipeId) {
        return false
      }
      return group.some((item) => distanceBetween(item, rect) <= spacing)
    })

    if (target) {
      target.push(rect)
    } else {
      groups.push([rect])
    }
  }

  return groups.map((group) => {
    const minX = Math.min(...group.map((rect) => rect.x))
    const minY = Math.min(...group.map((rect) => rect.y))
    const maxX = Math.max(...group.map((rect) => rect.x + rect.width))
    const maxY = Math.max(...group.map((rect) => rect.y + rect.height))

    return {
      ids: group.map((rect) => rect.id),
      recipeId: group[0].recipeId,
      bounds: {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      },
    }
  })
}

export function resolveGlassTransition(input: GlassTransitionInput): GlassTransitionOutput {
  const progress = clamp01(input.progress)

  if (input.mode === 'identity') {
    return { opacity: 1, scale: 1 }
  }

  if (input.mode === 'materialize') {
    return { opacity: progress, scale: 0.94 + progress * 0.06 }
  }

  if (!input.from || !input.to) {
    return { opacity: 1, scale: 1 }
  }

  return {
    opacity: 1,
    scale: 1,
    transform: {
      x: lerp(input.from.x, input.to.x, progress),
      y: lerp(input.from.y, input.to.y, progress),
      width: lerp(input.from.width, input.to.width, progress),
      height: lerp(input.from.height, input.to.height, progress),
      radius: lerp(input.from.radius, input.to.radius, progress),
    },
  }
}

export function listComponentCatalog(): ComponentCatalogItem[] {
  return [
    { id: 'surface', label: 'Glass Surface', role: 'base custom glass effect' },
    { id: 'button', label: 'Glass Button', role: 'interactive press and shimmer' },
    { id: 'card', label: 'Glass Card', role: 'platter and content glass comparison' },
    { id: 'toolbar', label: 'Toolbar', role: 'shared glass background grouping' },
    { id: 'search', label: 'Search', role: 'toolbar-level search behavior' },
    { id: 'tabs', label: 'Tabs', role: 'persistent section navigation' },
    { id: 'sheet', label: 'Sheet', role: 'materialized modal surface' },
    { id: 'dock', label: 'Dock', role: 'floating launcher glass' },
    { id: 'text', label: 'Glass Text', role: 'vibrant foreground treatment' },
    { id: 'inspector', label: 'Inspector', role: 'selection-associated side surface' },
    { id: 'settings', label: 'Settings', role: 'accessibility and appearance controls' },
    { id: 'recipe-matrix', label: 'Recipe Matrix', role: 'CoreMaterial parameter display' },
  ]
}

export function listRecipes(): GlassRecipe[] {
  return Object.values(recipes)
}

function recipe(
  id: string,
  label: string,
  filter: MaterialFilter,
  fill: string,
  stroke: string,
  legibility: GlassRecipe['accessibility']['legibility'] = 'standard',
): GlassRecipe {
  return {
    id,
    label,
    filter,
    styles: { fill, stroke },
    accessibility: { legibility },
  }
}

function distanceBetween(a: GlassRect, b: GlassRect): number {
  const horizontalGap = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.width, b.x + b.width))
  const verticalGap = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.height, b.y + b.height))
  return Math.hypot(horizontalGap, verticalGap)
}

function lerp(from: number, to: number, progress: number): number {
  return from + (to - from) * progress
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function trimNumber(value: number): number {
  return Number(value.toFixed(4))
}
