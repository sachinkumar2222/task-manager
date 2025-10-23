import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Global CSS file ko import karein (jismein Tailwind hai)
import './assets/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

