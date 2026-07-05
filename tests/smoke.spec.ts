import { expect, test } from '@playwright/test'

test('renders the full interactive liquid glass lab', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Liquid Glass Lab' })).toBeVisible()
  await expect(page.locator('[data-component]')).toHaveCount(12)
  await expect(page.locator('[data-component="toolbar"]')).toBeVisible()
  await expect(page.locator('[data-component="recipe-matrix"]')).toBeVisible()
  await page.waitForFunction(() => {
    const node = document.querySelector<HTMLCanvasElement>('[data-backdrop]')
    const context = node?.getContext('2d')
    if (!node || !context || node.width === 0 || node.height === 0) {
      return false
    }
    const pixel = context.getImageData(Math.floor(node.width / 2), Math.floor(node.height / 2), 1, 1).data
    return pixel[3] > 0
  })

  const canvasSample = await page.locator('[data-backdrop]').evaluate((canvas) => {
    const node = canvas as HTMLCanvasElement
    const context = node.getContext('2d')
    if (!context || node.width === 0 || node.height === 0) {
      return null
    }
    const pixel = context.getImageData(Math.floor(node.width / 2), Math.floor(node.height / 2), 1, 1).data
    return Array.from(pixel)
  })

  expect(canvasSample).not.toBeNull()
  expect(canvasSample?.[3]).toBeGreaterThan(0)
})

test('toggles accessibility and opens the sheet', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-control="reducedTransparency"]').click()
  await page.locator('[data-control="highContrast"]').click()
  await page.locator('[data-action="open-sheet"]').click()

  await expect(page.locator('#app')).toHaveAttribute('data-reduced-transparency', 'true')
  await expect(page.locator('#app')).toHaveAttribute('data-high-contrast', 'true')
  await expect(page.locator('[data-sheet-state="open"]')).toBeVisible()
})
