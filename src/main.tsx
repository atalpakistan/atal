import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Filter out informational Firestore offline transition logs
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;

  console.warn = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('@firebase/firestore') || args[0].includes('Could not reach Cloud Firestore'))) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('@firebase/firestore') || args[0].includes('Could not reach Cloud Firestore') || args[0].includes('code=unavailable'))) {
      return;
    }
    originalError(...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
