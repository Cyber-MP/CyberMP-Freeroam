import './styles/index.css';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { router } from './router';
import { r } from './rpc';

const bootstrap = () => {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Entry point of application was not found');
  }

  r.apply(router);

  createRoot(root).render(<App />);

  console.log('Browser initialized');
};

void bootstrap();
