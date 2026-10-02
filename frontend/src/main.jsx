/* Migration entry point: provide UMD-style globals (lib.js), import the VERBATIM original
   app body, then reproduce the original boot() exactly — same markup, same error fallback. */
import './lib.js';
import './styles/global.css';
import { createRoot } from 'react-dom/client';
import { App, Boundary } from './app-body.jsx';

const root = document.getElementById('root');
try {
  createRoot(root).render(<Boundary><App/></Boundary>);
} catch (err) {
  try { window.__VA_ERRORS.push('boot: ' + ((err && err.message) || err)); } catch (_) {}
  root.innerHTML = '<div style="padding:48px;font-family:monospace;color:#FC4C13;white-space:pre-wrap">BOOT ERROR — ' + String((err && err.message) || err) + '</div>';
}
