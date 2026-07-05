import {
  type ColorScheme,
  type SurfaceKind,
  computeGlassSurface,
  listComponentCatalog,
  listRecipes,
  resolveGlassTransition,
} from '../engine/glass-engine'

export interface LabState {
  colorScheme: ColorScheme
  reducedTransparency: boolean
  highContrast: boolean
  intensity: number
  tint: string
  sheetOpen: boolean
  activeTab: 'surface' | 'recipes' | 'motion'
}

export interface MountedLab {
  state: LabState
  update: (patch: Partial<LabState>) => void
  destroy: () => void
}

type SurfaceRenderOptions = {
  id: string
  component: string
  surface: SurfaceKind
  label: string
  body: string
  interactive?: boolean
  radius?: number
  tint?: string
  extraClass?: string
}

export function createInitialLabState(): LabState {
  return {
    colorScheme: 'light',
    reducedTransparency: false,
    highContrast: false,
    intensity: 0.86,
    tint: '#7cc7ff',
    sheetOpen: false,
    activeTab: 'surface',
  }
}

export function mountLiquidGlassLab(root: HTMLElement, initialState = createInitialLabState()): MountedLab {
  const state: LabState = { ...initialState }
  let animationFrame = 0

  const update = (patch: Partial<LabState>) => {
    Object.assign(state, patch)
    render()
  }

  const render = () => {
    root.dataset.scheme = state.colorScheme
    root.dataset.reducedTransparency = String(state.reducedTransparency)
    root.dataset.highContrast = String(state.highContrast)
    root.innerHTML = renderLab(state)
    bindEvents(root, state, update)
    startBackdrop(root, state, animationFrame, (frame) => {
      animationFrame = frame
    })
  }

  const destroy = () => {
    cancelAnimationFrame(animationFrame)
    root.innerHTML = ''
  }

  render()

  return { state, update, destroy }
}

function bindEvents(root: HTMLElement, state: LabState, update: (patch: Partial<LabState>) => void) {
  bindCheckbox(root, 'reducedTransparency', (checked) => {
    update({ reducedTransparency: checked })
  })
  bindCheckbox(root, 'highContrast', (checked) => {
    update({ highContrast: checked })
  })
  root.querySelector<HTMLInputElement>('[data-control="intensity"]')?.addEventListener('input', (event) => {
    update({ intensity: Number((event.currentTarget as HTMLInputElement).value) })
  })
  root.querySelector<HTMLSelectElement>('[data-control="tint"]')?.addEventListener('change', (event) => {
    update({ tint: (event.currentTarget as HTMLSelectElement).value })
  })
  root.querySelector<HTMLButtonElement>('[data-control="scheme"]')?.addEventListener('click', () => {
    update({ colorScheme: state.colorScheme === 'light' ? 'dark' : 'light' })
  })
  root.querySelector<HTMLButtonElement>('[data-action="open-sheet"]')?.addEventListener('click', () => {
    update({ sheetOpen: true })
  })
  root.querySelector<HTMLButtonElement>('[data-action="close-sheet"]')?.addEventListener('click', () => {
    update({ sheetOpen: false })
  })
  root.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      update({ activeTab: button.dataset.tab as LabState['activeTab'] })
    })
  })
}

function renderLab(state: LabState): string {
  return `
    <div class="lab-app">
      ${renderSvgFilters()}
      <canvas class="sample-backdrop" data-backdrop aria-hidden="true"></canvas>
      <header class="topbar">
        <div>
          <p class="kicker">macOS 26 recipe lab</p>
          <h1>Liquid Glass Lab</h1>
        </div>
        <button class="icon-toggle" data-control="scheme" type="button" aria-label="Toggle color scheme">
          ${state.colorScheme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <main class="lab-grid">
        ${renderSettings(state)}
        <section class="stage" aria-label="Interactive Liquid Glass demo">
          ${renderToolbar(state)}
          <div class="stage-layout">
            ${renderHeroCard(state)}
            ${renderInspector(state)}
          </div>
          ${renderDock(state)}
          ${renderSheet(state)}
        </section>
        ${renderRecipeMatrix(state)}
      </main>
    </div>
  `
}

function renderSettings(state: LabState): string {
  return surfaceShell(state, {
    id: 'settings',
    component: 'settings',
    surface: 'module',
    label: 'Settings',
    interactive: true,
    radius: 22,
    body: `
      <div class="control-row">
        <span>Transparency</span>
        <label class="switch">
          <input data-control="reducedTransparency" type="checkbox" ${state.reducedTransparency ? 'checked' : ''}>
          <span></span>
        </label>
      </div>
      <div class="control-row">
        <span>Contrast</span>
        <label class="switch">
          <input data-control="highContrast" type="checkbox" ${state.highContrast ? 'checked' : ''}>
          <span></span>
        </label>
      </div>
      <label class="field">
        <span>Intensity</span>
        <input data-control="intensity" type="range" min="0.35" max="1" step="0.01" value="${state.intensity}">
      </label>
      <label class="field">
        <span>Tint</span>
        <select data-control="tint">
          ${[
            ['#7cc7ff', 'Glacial'],
            ['#8ce8be', 'Mint'],
            ['#ffb86b', 'Amber'],
            ['#ff8aa6', 'Coral'],
            ['transparent', 'None'],
          ].map(([value, label]) => `<option value="${value}" ${state.tint === value ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
      </label>
      <div class="catalog-list">
        ${listComponentCatalog().map((item) => `<span>${item.label}</span>`).join('')}
      </div>
    `,
  })
}

function renderToolbar(state: LabState): string {
  return surfaceShell(state, {
    id: 'toolbar',
    component: 'toolbar',
    surface: 'chrome',
    label: 'Toolbar',
    interactive: true,
    radius: 999,
    extraClass: 'toolbar-shell',
    body: `
      <div class="toolbar-group">
        <button class="glass-action" type="button" aria-label="Back">←</button>
        <button class="glass-action" type="button" aria-label="Forward">→</button>
      </div>
      <div class="search-box" data-component="search">
        <span>⌕</span>
        <input aria-label="Search recipes" value="platformContentGlass">
      </div>
      <div class="toolbar-group">
        <button class="glass-action is-primary" data-action="open-sheet" type="button">Open Sheet</button>
      </div>
    `,
  })
}

function renderHeroCard(state: LabState): string {
  const materialize = resolveGlassTransition({ mode: 'materialize', progress: state.sheetOpen ? 1 : 0.44 })
  const matched = resolveGlassTransition({
    mode: 'matchedGeometry',
    progress: state.sheetOpen ? 1 : 0.35,
    from: { x: 0, y: 0, width: 180, height: 84, radius: 24 },
    to: { x: 34, y: 28, width: 250, height: 130, radius: 34 },
  })

  return `
    <div class="hero-stack">
      ${surfaceShell(state, {
        id: 'surface',
        component: 'surface',
        surface: 'contentGlass',
        label: 'Surface',
        radius: 34,
        tint: state.tint,
        extraClass: 'hero-card',
        interactive: true,
        body: `
          <div class="metric-row">
            <span>Blur</span><strong>45</strong>
            <span>Luma</span><strong>matrix</strong>
          </div>
          <div class="liquid-blob" style="opacity:${materialize.opacity}; --morph-x:${matched.transform?.x ?? 0}px; --morph-y:${matched.transform?.y ?? 0}px"></div>
          <p class="large-label" data-component="text">Dynamic glass over live sampled color</p>
        `,
      })}
      <div class="component-row">
        ${surfaceShell(state, {
          id: 'button',
          component: 'button',
          surface: 'toolbarButton',
          label: 'Button',
          radius: 24,
          interactive: true,
          body: '<button class="glass-cta" type="button">Press</button>',
        })}
        ${surfaceShell(state, {
          id: 'card',
          component: 'card',
          surface: 'platter',
          label: 'Card',
          radius: 26,
          interactive: true,
          body: '<p class="card-copy">Platter recipe with stronger saturation and border vibrancy.</p>',
        })}
      </div>
      ${renderTabs(state)}
    </div>
  `
}

function renderTabs(state: LabState): string {
  return surfaceShell(state, {
    id: 'tabs',
    component: 'tabs',
    surface: 'platter',
    label: 'Tabs',
    interactive: true,
    radius: 999,
    extraClass: 'tabs-shell',
    body: `
      ${(['surface', 'recipes', 'motion'] as const)
        .map((tab) => `<button class="${state.activeTab === tab ? 'is-selected' : ''}" data-tab="${tab}" type="button">${tab}</button>`)
        .join('')}
    `,
  })
}

function renderInspector(state: LabState): string {
  const activeRecipe = computeGlassSurface({
    id: 'inspector-readout',
    surface: 'contentGlass',
    colorScheme: state.colorScheme,
    reducedTransparency: state.reducedTransparency,
    highContrast: state.highContrast,
    tint: state.tint,
    intensity: state.intensity,
    cornerRadius: 26,
    interactive: false,
  })

  return surfaceShell(state, {
    id: 'inspector',
    component: 'inspector',
    surface: 'sheet',
    label: 'Inspector',
    radius: 26,
    body: `
      <dl class="readout">
        <div><dt>Recipe</dt><dd>${activeRecipe.recipe.id}</dd></div>
        <div><dt>Refraction</dt><dd>${activeRecipe.shaderUniforms.refraction.toFixed(2)}</dd></div>
        <div><dt>Chromatic</dt><dd>${activeRecipe.shaderUniforms.chromaticAberration.toFixed(3)}</dd></div>
        <div><dt>Legibility</dt><dd>${activeRecipe.recipe.accessibility.legibility}</dd></div>
      </dl>
    `,
  })
}

function renderDock(state: LabState): string {
  return surfaceShell(state, {
    id: 'dock',
    component: 'dock',
    surface: 'dock',
    label: 'Dock',
    radius: 999,
    interactive: true,
    extraClass: 'dock-shell',
    body: ['⌘', '◇', '◌', '✦', '⌁'].map((icon) => `<button type="button" aria-label="Dock item">${icon}</button>`).join(''),
  })
}

function renderSheet(state: LabState): string {
  return surfaceShell(state, {
    id: 'sheet',
    component: 'sheet',
    surface: 'sheet',
    label: 'Sheet',
    radius: 30,
    interactive: true,
    extraClass: `sheet-demo ${state.sheetOpen ? 'is-open' : ''}`,
    body: `
      <div data-sheet-state="${state.sheetOpen ? 'open' : 'closed'}">
        <p>Materialized sheet transition</p>
        <button class="glass-action" data-action="close-sheet" type="button">Close</button>
      </div>
    `,
  })
}

function renderRecipeMatrix(state: LabState): string {
  return surfaceShell(state, {
    id: 'recipe-matrix',
    component: 'recipe-matrix',
    surface: 'module',
    label: 'Recipe Matrix',
    radius: 24,
    body: `
      <div class="recipe-grid">
        ${listRecipes()
          .filter((recipe) => ['platformContentGlass', 'platformChromeLight', 'platformChromeDark', 'toolbarButtonBackground', 'dockLight', 'platters', 'highContrast'].includes(recipe.id))
          .map((recipe) => `
            <div>
              <strong>${recipe.id}</strong>
              <span>${recipe.filter.blurRadius}px blur</span>
              <span>${recipe.filter.saturation ?? 'matrix'} sat</span>
            </div>
          `)
          .join('')}
      </div>
    `,
  })
}

function surfaceShell(state: LabState, options: SurfaceRenderOptions): string {
  const surface = computeGlassSurface({
    id: options.id,
    surface: options.surface,
    colorScheme: state.colorScheme,
    reducedTransparency: state.reducedTransparency,
    highContrast: state.highContrast,
    tint: options.tint ?? state.tint,
    intensity: state.intensity,
    cornerRadius: options.radius ?? 24,
    interactive: Boolean(options.interactive),
  })
  const style = Object.entries(surface.cssVars)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')

  return `
    <section class="${surface.classes.join(' ')} ${options.extraClass ?? ''}" data-component="${options.component}" style="${style}">
      <div class="glass-highlight"></div>
      <header class="component-title">
        <span>${options.label}</span>
        <small>${surface.recipe.id}</small>
      </header>
      ${options.body}
    </section>
  `
}

function renderSvgFilters(): string {
  return `
    <svg class="svg-defs" aria-hidden="true">
      <filter id="liquid-displace">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise"></feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G"></feDisplacementMap>
      </filter>
    </svg>
  `
}

function startBackdrop(root: HTMLElement, state: LabState, frame: number, setFrame: (frame: number) => void) {
  if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
    return
  }

  cancelAnimationFrame(frame)
  const canvas = root.querySelector<HTMLCanvasElement>('[data-backdrop]')
  const context = canvas ? canvas.getContext('2d') : null
  if (!canvas || !context) {
    setFrame(0)
    return
  }

  const draw = (time: number) => {
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const width = Math.max(1, Math.floor(rect.width * ratio))
    const height = Math.max(1, Math.floor(rect.height * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    paintBackdrop(context, rect.width, rect.height, time / 1000, state)
    setFrame(requestAnimationFrame(draw))
  }

  draw(window.performance.now())
}

function bindCheckbox(root: HTMLElement, control: string, onToggle: (checked: boolean) => void) {
  const input = root.querySelector<HTMLInputElement>(`[data-control="${control}"]`)
  input?.addEventListener('click', (event) => {
    onToggle((event.currentTarget as HTMLInputElement).checked)
  })
}

function paintBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  state: LabState,
) {
  context.clearRect(0, 0, width, height)
  context.fillStyle = state.colorScheme === 'dark' ? '#10100f' : '#f6f1e8'
  context.fillRect(0, 0, width, height)

  const stripes = [
    ['#2fb7a4', 0.12],
    ['#f6b24a', 0.32],
    ['#df5b6b', 0.53],
    ['#6274d9', 0.73],
    ['#b9dd70', 0.9],
  ] as const

  stripes.forEach(([color, offset], index) => {
    context.save()
    context.globalAlpha = state.highContrast ? 0.32 : 0.62
    context.translate(width * offset, height * (0.18 + index * 0.13))
    context.rotate(Math.sin(time * 0.25 + index) * 0.08 - 0.32)
    context.fillStyle = color
    context.fillRect(-width * 0.55, -28, width * 1.2, 56 + index * 8)
    context.restore()
  })

  context.globalAlpha = state.reducedTransparency ? 0.12 : 0.22
  context.strokeStyle = state.colorScheme === 'dark' ? '#ffffff' : '#20170f'
  for (let y = 24; y < height; y += 42) {
    context.beginPath()
    for (let x = 0; x < width; x += 18) {
      const wave = Math.sin(x * 0.02 + time + y * 0.01) * 5
      if (x === 0) {
        context.moveTo(x, y + wave)
      } else {
        context.lineTo(x, y + wave)
      }
    }
    context.stroke()
  }
  context.globalAlpha = 1
}
