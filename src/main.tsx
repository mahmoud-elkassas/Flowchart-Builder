import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize dark mode based on system preference
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
if (darkModeMediaQuery.matches) {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)