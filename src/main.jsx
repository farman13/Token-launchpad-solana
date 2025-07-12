import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Config } from './Config/Config.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Config>
      <App />
    </Config>
  </StrictMode>,
)
