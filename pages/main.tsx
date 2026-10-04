import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PagesLanding from './PagesLanding';
import '../app/globals.css';
import './pages.css';
createRoot(document.getElementById('root')!).render(<StrictMode><PagesLanding/></StrictMode>);
