import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LiquidGlassLab } from './ui/LiquidGlassLab'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

createRoot(app).render(
  <StrictMode>
    <LiquidGlassLab />
  </StrictMode>,
)
