import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '/liquid-glass-lab/',
  test: {
    include: ['src/**/*.test.ts'],
  },
})
