import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Entry point of application was not found');
}

createRoot(root).render(<App />);
