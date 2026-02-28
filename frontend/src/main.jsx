import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './storage-shim.js' // Initialize storage API

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
