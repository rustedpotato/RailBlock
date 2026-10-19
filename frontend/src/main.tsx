import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { LineProvider } from './context/LineContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <LineProvider>
        <App />
      </LineProvider>
    </AuthProvider>
  </React.StrictMode>,
)
