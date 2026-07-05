import { createInitialLabState, mountLiquidGlassLab } from './ui/lab-ui'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app root')
}

mountLiquidGlassLab(app, createInitialLabState())
