/**
 * ============================================================================
 * ATELIER ESTIMATOR - REACT ENTRY POINT
 * ============================================================================
 * Bootstraps the root React DOM tree and mounts the App component
 * into the 'root' container element defined in index.html.
 */

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Mount the top-level application component
createRoot(document.getElementById('root')!).render(<App />);
