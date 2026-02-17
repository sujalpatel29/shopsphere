import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/theme.css'
import './styles/tailwind.css'
import './styles/App.css'
import "primereact/resources/themes/lara-light-green/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
