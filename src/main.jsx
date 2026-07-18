import './waapi-guard.js';
import { createRoot } from 'react-dom/client';

import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/600.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/bebas-neue/400.css';

import './index.css';
import './styles.css';
import './tailwind.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
