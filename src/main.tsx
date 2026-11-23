import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { preloadSfx } from './lib/sfx'
import './styles/tokens.css'
import './styles/app.css'

preloadSfx()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/island">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
