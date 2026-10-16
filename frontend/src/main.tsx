import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { LineProvider } from './context/LineContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LineProvider>
      <App />
    </LineProvider>
  </React.StrictMode>,
)
