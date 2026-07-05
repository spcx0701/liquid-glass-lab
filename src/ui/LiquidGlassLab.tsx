import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
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

export interface LiquidGlassLabProps {
  initialState?: LabState
}

interface MacOSGlassSurfaceProps {
  state: LabState
  id: string
  component: string
  surface: SurfaceKind
  label: string
  children: ReactNode
  interactive?: boolean
  radius?: number
  tint?: string
  extraClass?: string
}

type GlassCSSProperties = CSSProperties & Record<`--${string}`, string | number>

const tintOptions = [
  ['#7cc7ff', 'Glacial'],
  ['#8ce8be', 'Mint'],
  ['#ffb86b', 'Amber'],
  ['#ff8aa6', 'Coral'],
  ['transparent', 'None'],
] as const

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

export function LiquidGlassLab({ initialState = createInitialLabState() }: LiquidGlassLabProps) {
  const [state, setState] = useState<LabState>(initialState)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = rootRef.current?.parentElement
    if (!host || host.id !== 'app') {
      return
    }

    host.dataset.scheme = state.colorScheme
    host.dataset.reducedTransparency = String(state.reducedTransparency)
    host.dataset.highContrast = String(state.highContrast)
  }, [state.colorScheme, state.highContrast, state.reducedTransparency])

  useAnimatedBackdrop(canvasRef, state)

  const patchState = (patch: Partial<LabState>) => {
    setState((current) => ({ ...current, ...patch }))
  }

  return (
    <div
      ref={rootRef}
      className="lab-app"
      data-scheme={state.colorScheme}
      data-reduced-transparency={state.reducedTransparency}
      data-high-contrast={state.highContrast}
    >
      <SvgFilters />
      <canvas ref={canvasRef} className="sample-backdrop" data-backdrop aria-hidden="true" />
      <header className="topbar">
        <div>
          <p className="kicker">macOS 26 recipe lab</p>
          <h1>Liquid Glass Lab</h1>
        </div>
        <button
          className="icon-toggle"
          data-control="scheme"
          type="button"
          aria-label="Toggle color scheme"
          onClick={() => {
            patchState({ colorScheme: state.colorScheme === 'light' ? 'dark' : 'light' })
          }}
        >
          {state.colorScheme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>

      <main className="lab-grid">
        <SettingsPanel state={state} patchState={patchState} />
        <section className="stage" aria-label="Interactive Liquid Glass demo">
          <Toolbar state={state} patchState={patchState} />
          <div className="stage-layout">
            <HeroStack state={state} patchState={patchState} />
            <Inspector state={state} />
          </div>
          <Dock state={state} />
          <Sheet state={state} patchState={patchState} />
        </section>
        <RecipeMatrix state={state} />
      </main>
    </div>
  )
}

export function MacOSGlassSurface({
  state,
  id,
  component,
  surface,
  label,
  children,
  interactive,
  radius = 24,
  tint,
  extraClass,
}: MacOSGlassSurfaceProps) {
  const computedSurface = computeGlassSurface({
    id,
    surface,
    colorScheme: state.colorScheme,
    reducedTransparency: state.reducedTransparency,
    highContrast: state.highContrast,
    tint: tint ?? state.tint,
    intensity: state.intensity,
    cornerRadius: radius,
    interactive: Boolean(interactive),
  })
  const style = computedSurface.cssVars as GlassCSSProperties
  const className = `${computedSurface.classes.join(' ')} ${extraClass ?? ''}`.trim()

  return (
    <section className={className} data-component={component} style={style}>
      <div className="glass-highlight" />
      <header className="component-title">
        <span>{label}</span>
        <small>{computedSurface.recipe.id}</small>
      </header>
      {children}
    </section>
  )
}

function SettingsPanel({
  state,
  patchState,
}: {
  state: LabState
  patchState: (patch: Partial<LabState>) => void
}) {
  return (
    <MacOSGlassSurface
      state={state}
      id="settings"
      component="settings"
      surface="module"
      label="Settings"
      interactive
      radius={22}
    >
      <div className="control-row">
        <span>Transparency</span>
        <label className="switch">
          <input
            aria-label="Reduce transparency"
            data-control="reducedTransparency"
            type="checkbox"
            checked={state.reducedTransparency}
            onChange={(event) => {
              patchState({ reducedTransparency: event.currentTarget.checked })
            }}
          />
          <span />
        </label>
      </div>
      <div className="control-row">
        <span>Contrast</span>
        <label className="switch">
          <input
            aria-label="Increase contrast"
            data-control="highContrast"
            type="checkbox"
            checked={state.highContrast}
            onChange={(event) => {
              patchState({ highContrast: event.currentTarget.checked })
            }}
          />
          <span />
        </label>
      </div>
      <label className="field">
        <span>Intensity</span>
        <input
          data-control="intensity"
          type="range"
          min="0.35"
          max="1"
          step="0.01"
          value={state.intensity}
          onChange={(event) => {
            patchState({ intensity: Number(event.currentTarget.value) })
          }}
        />
      </label>
      <label className="field">
        <span>Tint</span>
        <select
          data-control="tint"
          value={state.tint}
          onChange={(event) => {
            patchState({ tint: event.currentTarget.value })
          }}
        >
          {tintOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="catalog-list">
        {listComponentCatalog().map((item) => (
          <span key={item.id}>{item.label}</span>
        ))}
      </div>
    </MacOSGlassSurface>
  )
}

function Toolbar({
  state,
  patchState,
}: {
  state: LabState
  patchState: (patch: Partial<LabState>) => void
}) {
  return (
    <MacOSGlassSurface
      state={state}
      id="toolbar"
      component="toolbar"
      surface="chrome"
      label="Toolbar"
      interactive
      radius={999}
      extraClass="toolbar-shell"
    >
      <div className="toolbar-group">
        <button className="glass-action" type="button" aria-label="Back">
          ←
        </button>
        <button className="glass-action" type="button" aria-label="Forward">
          →
        </button>
      </div>
      <div className="search-box" data-component="search">
        <span>⌕</span>
        <input aria-label="Search recipes" defaultValue="platformContentGlass" />
      </div>
      <div className="toolbar-group">
        <button
          className="glass-action is-primary"
          data-action="open-sheet"
          type="button"
          onClick={() => {
            patchState({ sheetOpen: true })
          }}
        >
          Open Sheet
        </button>
      </div>
    </MacOSGlassSurface>
  )
}

function HeroStack({
  state,
  patchState,
}: {
  state: LabState
  patchState: (patch: Partial<LabState>) => void
}) {
  const materialize = resolveGlassTransition({ mode: 'materialize', progress: state.sheetOpen ? 1 : 0.44 })
  const matched = resolveGlassTransition({
    mode: 'matchedGeometry',
    progress: state.sheetOpen ? 1 : 0.35,
    from: { x: 0, y: 0, width: 180, height: 84, radius: 24 },
    to: { x: 34, y: 28, width: 250, height: 130, radius: 34 },
  })
  const blobStyle: GlassCSSProperties = {
    opacity: materialize.opacity,
    '--morph-x': `${matched.transform?.x ?? 0}px`,
    '--morph-y': `${matched.transform?.y ?? 0}px`,
  }

  return (
    <div className="hero-stack">
      <MacOSGlassSurface
        state={state}
        id="surface"
        component="surface"
        surface="contentGlass"
        label="Surface"
        radius={34}
        tint={state.tint}
        extraClass="hero-card"
        interactive
      >
        <div className="metric-row">
          <span>Blur</span>
          <strong>45</strong>
          <span>Luma</span>
          <strong>matrix</strong>
        </div>
        <div className="liquid-blob" style={blobStyle} />
        <p className="large-label" data-component="text">
          Dynamic glass over live sampled color
        </p>
      </MacOSGlassSurface>
      <div className="component-row">
        <MacOSGlassSurface
          state={state}
          id="button"
          component="button"
          surface="toolbarButton"
          label="Button"
          radius={24}
          interactive
        >
          <button className="glass-cta" type="button">
            Press
          </button>
        </MacOSGlassSurface>
        <MacOSGlassSurface state={state} id="card" component="card" surface="platter" label="Card" radius={26} interactive>
          <p className="card-copy">Platter recipe with stronger saturation and border vibrancy.</p>
        </MacOSGlassSurface>
      </div>
      <Tabs state={state} patchState={patchState} />
    </div>
  )
}

function Tabs({
  state,
  patchState,
}: {
  state: LabState
  patchState: (patch: Partial<LabState>) => void
}) {
  return (
    <MacOSGlassSurface
      state={state}
      id="tabs"
      component="tabs"
      surface="platter"
      label="Tabs"
      interactive
      radius={999}
      extraClass="tabs-shell"
    >
      {(['surface', 'recipes', 'motion'] as const).map((tab) => (
        <button
          key={tab}
          className={state.activeTab === tab ? 'is-selected' : ''}
          data-tab={tab}
          type="button"
          onClick={() => {
            patchState({ activeTab: tab })
          }}
        >
          {tab}
        </button>
      ))}
    </MacOSGlassSurface>
  )
}

function Inspector({ state }: { state: LabState }) {
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

  return (
    <MacOSGlassSurface state={state} id="inspector" component="inspector" surface="sheet" label="Inspector" radius={26}>
      <dl className="readout">
        <div>
          <dt>Recipe</dt>
          <dd>{activeRecipe.recipe.id}</dd>
        </div>
        <div>
          <dt>Refraction</dt>
          <dd>{activeRecipe.shaderUniforms.refraction.toFixed(2)}</dd>
        </div>
        <div>
          <dt>Chromatic</dt>
          <dd>{activeRecipe.shaderUniforms.chromaticAberration.toFixed(3)}</dd>
        </div>
        <div>
          <dt>Legibility</dt>
          <dd>{activeRecipe.recipe.accessibility.legibility}</dd>
        </div>
      </dl>
    </MacOSGlassSurface>
  )
}

function Dock({ state }: { state: LabState }) {
  return (
    <MacOSGlassSurface
      state={state}
      id="dock"
      component="dock"
      surface="dock"
      label="Dock"
      radius={999}
      interactive
      extraClass="dock-shell"
    >
      {['⌘', '◇', '◌', '✦', '⌁'].map((icon) => (
        <button key={icon} type="button" aria-label="Dock item">
          {icon}
        </button>
      ))}
    </MacOSGlassSurface>
  )
}

function Sheet({
  state,
  patchState,
}: {
  state: LabState
  patchState: (patch: Partial<LabState>) => void
}) {
  return (
    <MacOSGlassSurface
      state={state}
      id="sheet"
      component="sheet"
      surface="sheet"
      label="Sheet"
      radius={30}
      interactive
      extraClass={`sheet-demo ${state.sheetOpen ? 'is-open' : ''}`}
    >
      <div data-sheet-state={state.sheetOpen ? 'open' : 'closed'}>
        <p>Materialized sheet transition</p>
        <button
          className="glass-action"
          data-action="close-sheet"
          type="button"
          onClick={() => {
            patchState({ sheetOpen: false })
          }}
        >
          Close
        </button>
      </div>
    </MacOSGlassSurface>
  )
}

function RecipeMatrix({ state }: { state: LabState }) {
  return (
    <MacOSGlassSurface state={state} id="recipe-matrix" component="recipe-matrix" surface="module" label="Recipe Matrix" radius={24}>
      <div className="recipe-grid">
        {listRecipes()
          .filter((recipe) =>
            [
              'platformContentGlass',
              'platformChromeLight',
              'platformChromeDark',
              'toolbarButtonBackground',
              'dockLight',
              'platters',
              'highContrast',
            ].includes(recipe.id),
          )
          .map((recipe) => (
            <div key={recipe.id}>
              <strong>{recipe.id}</strong>
              <span>{recipe.filter.blurRadius}px blur</span>
              <span>{recipe.filter.saturation ?? 'matrix'} sat</span>
            </div>
          ))}
      </div>
    </MacOSGlassSurface>
  )
}

function SvgFilters() {
  return (
    <svg className="svg-defs" aria-hidden="true">
      <filter id="liquid-displace">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

function useAnimatedBackdrop(canvasRef: React.RefObject<HTMLCanvasElement | null>, state: LabState) {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
      return undefined
    }

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return undefined
    }

    let frame = 0
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
      frame = requestAnimationFrame(draw)
    }

    draw(window.performance.now())

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [canvasRef, state])
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
