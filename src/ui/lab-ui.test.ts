// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { listComponentCatalog } from '../engine/glass-engine'
import { createInitialLabState, mountLiquidGlassLab } from './lab-ui'

describe('liquid glass lab UI', () => {
  it('renders every catalog component as an interactive demo surface', () => {
    const root = document.createElement('div')
    const app = mountLiquidGlassLab(root, createInitialLabState())

    expect(app.state.colorScheme).toBe('light')
    expect(root.querySelectorAll('[data-component]').length).toBe(listComponentCatalog().length)
    expect(root.querySelector('[data-component="toolbar"]')).not.toBeNull()
    expect(root.querySelector('[data-component="sheet"]')).not.toBeNull()
    expect(root.querySelector('[data-component="recipe-matrix"]')).not.toBeNull()
  })

  it('connects controls to recipe state and root data attributes', () => {
    const root = document.createElement('div')
    const app = mountLiquidGlassLab(root, createInitialLabState())
    const reduce = root.querySelector<HTMLInputElement>('[data-control="reducedTransparency"]')
    const contrast = root.querySelector<HTMLInputElement>('[data-control="highContrast"]')
    const scheme = root.querySelector<HTMLButtonElement>('[data-control="scheme"]')

    reduce?.click()
    contrast?.click()
    scheme?.click()

    expect(app.state.reducedTransparency).toBe(true)
    expect(app.state.highContrast).toBe(true)
    expect(app.state.colorScheme).toBe('dark')
    expect(root.dataset.reducedTransparency).toBe('true')
    expect(root.dataset.highContrast).toBe('true')
    expect(root.dataset.scheme).toBe('dark')
  })

  it('opens and closes the materialized sheet demo', () => {
    const root = document.createElement('div')
    const app = mountLiquidGlassLab(root, createInitialLabState())
    const open = root.querySelector<HTMLButtonElement>('[data-action="open-sheet"]')
    const close = root.querySelector<HTMLButtonElement>('[data-action="close-sheet"]')

    open?.click()
    expect(app.state.sheetOpen).toBe(true)
    expect(root.querySelector('[data-sheet-state="open"]')).not.toBeNull()

    close?.click()
    expect(app.state.sheetOpen).toBe(false)
    expect(root.querySelector('[data-sheet-state="closed"]')).not.toBeNull()
  })
})
