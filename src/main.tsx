import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { preloadSfx } from './lib/sfx'
import './styles/tokens.css'
import './styles/app.css'
import './styles/theme.css'
import './styles/nes.css'
import './styles/play-ux.css'

document.body.classList.add('app-world')
preloadSfx()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/island">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
