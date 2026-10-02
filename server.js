/* Minimal production server for the migrated Visual Archive.
   Serves ONLY the existing frontend build output (public/app) with SPA fallback.
   No application logic is reimplemented here; search/auth behave exactly as before
   (client-side provider chain + Supabase). */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = join(process.cwd(), 'public', 'app');
const PORT = Number(process.env.PORT || 4000);
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };

http.createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let p = normalize(join(ROOT, url));
    if (!p.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }
    try {
      const body = await readFile(p);
      res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
      res.end(body);
    } catch {
      const html = await readFile(join(ROOT, 'index.html')); // SPA fallback (hash routing only)
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(html);
    }
  } catch {
    res.writeHead(500); res.end('Server error');
  }
}).listen(PORT, () => console.log(`Visual Archive serving ${ROOT} on :${PORT}`));
