// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { listComponentCatalog } from '../engine/glass-engine'
import { createInitialLabState, LiquidGlassLab } from './LiquidGlassLab'

afterEach(cleanup)

describe('React Liquid Glass lab', () => {
  it('renders every catalog component through the React port', () => {
    const { container } = render(<LiquidGlassLab initialState={createInitialLabState()} />)

    expect(screen.getByRole('heading', { name: 'Liquid Glass Lab' })).not.toBeNull()
    expect(container.querySelectorAll('[data-component]').length).toBe(listComponentCatalog().length)
    expect(container.querySelector('[data-component="toolbar"]')).not.toBeNull()
    expect(container.querySelector('[data-component="sheet"]')).not.toBeNull()
    expect(container.querySelector('[data-component="recipe-matrix"]')).not.toBeNull()
  })

  it('maps the macOS recipe model into React style variables', () => {
    const { container } = render(<LiquidGlassLab initialState={createInitialLabState()} />)
    const surface = container.querySelector<HTMLElement>('[data-component="surface"]')

    expect(surface?.style.getPropertyValue('--lg-blur-radius')).toBe('45px')
    expect(surface?.classList.contains('recipe-platformContentGlass')).toBe(true)
  })

  it('connects React controls to recipe state and root data attributes', () => {
    const { container } = render(<LiquidGlassLab initialState={createInitialLabState()} />)

    fireEvent.click(screen.getByLabelText('Reduce transparency'))
    fireEvent.click(screen.getByLabelText('Increase contrast'))
    fireEvent.click(screen.getByLabelText('Toggle color scheme'))

    const app = container.firstElementChild as HTMLElement
    expect(app.dataset.reducedTransparency).toBe('true')
    expect(app.dataset.highContrast).toBe('true')
    expect(app.dataset.scheme).toBe('dark')
  })

  it('opens and closes the materialized sheet demo in React state', () => {
    const { container } = render(<LiquidGlassLab initialState={createInitialLabState()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Open Sheet' }))
    expect(container.querySelector('[data-sheet-state="open"]')).not.toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(container.querySelector('[data-sheet-state="closed"]')).not.toBeNull()
  })
})
