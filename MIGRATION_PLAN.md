# THE VISUAL ARCHIVE — MIGRATION PLAN

Work is performed **directly on `main`**. The original single-file application `index.html` (1,626 lines) stays in the repository **untouched** as the source of truth and as a permanent reference/fallback. No branch, PR, or GitHub compare operations are used.

---

## 1. Current architecture (analysis of `index.html`)

A single HTML file containing:

- `<head>`: meta/OG/favicon(data-URI)/manifest(data-URI)/JSON-LD, Google Fonts (Anton, Space Grotesk, Space Mono), preconnects to commons/upload/openverse/picsum.
- CDN runtime: Tailwind Play CDN (+ inline theme config), React 18.3.1 UMD, ReactDOM UMD, Framer Motion 11.11.17 UMD (`window.Motion`), Lenis 1.1.18, Supabase JS v2, Babel Standalone (JSX compiled in-browser).
- Inline boot-error collector (`window.__VA_ERRORS`, root-empty fallback screen after 7 s).
- One `<style>` block (~90 rules): CSS vars (`--ink/--vermilion/--bone/--pad/--nav-h/--e-out/--va-skew`), scrollbar, `.glass/.glass-sheen/.water-light`, `.grain` animation, `.marquee`, `.duo` image filter treatment, `.mask-line/.chars` line-reveal, cursor hiding, reduced-motion overrides.
- One `<script type="text/babel">` with the whole app (extracted verbatim for reference at `frontend/_app_extract.js`).

### Feature inventory (all must survive byte-for-byte behaviorally)

| # | Feature | Implementation notes |
|---|---------|----------------------|
| 1 | Preloader | counter 0→100 via setInterval(70 ms), skip if REDUCED |
| 2 | Smooth scroll | Lenis `{duration:1.15,easing:t=>1-(1-t)^4}` + rAF loop; global `lenisInstance` |
| 3 | Scroll-velocity skew | rAF lerp writing `--va-skew` clamp ±3.5°, `.skewable` class |
| 4 | Curtain nav | full-screen sweep overlay (`curtainGo/curtainSweep` globals), SND.open/close |
| 5 | Custom cursor | pointer:fine only, rAF lerp ring, `data-hover` targets |
| 6 | Grain overlay | fixed SVG-noise div, steps(6) keyframe |
| 7 | Glass Nav | water-light follows `--mx`, spring tilt on scroll velocity, ripple buttons, mobile curtain menu w/ focus trap, member chip / SIGN IN, ⚄ random plate |
| 8 | Section tracking | IntersectionObserver rootMargin `-40% 0px -50%`, Dots rail + pct readout |
| 9 | Hero | backdrop plate rotator (`fetchPlate` per HERO_QUERIES), CharLines reveal, Scramble title, marquee ticker |
| 10 | Search Room (01) | query input, QUICK chips, license filters all/cc0/commercial, results grid, pagination, loading/error/empty states → `searchImages(q,page,lic)` with cache key `q\|page\|lic` |
| 11 | Image pipeline | Wikimedia Commons API → Openverse API → picsum placeholder fallback chain (verbatim params & normalization incl. license regex filters) |
| 12 | Lightbox | event bus `window 'va-lb'` CustomEvent, dialog, ESC close, credit block |
| 13 | Random plate | `r` key / ⚄ button: current results pool else `searchImages('surprise',1,'all')` |
| 14 | Genres (02) | sticky-stacked cards, per-genre queries, RATIOS rotation, hover duo filter |
| 15 | Darkroom (03) | **DitheredPlate canvas engine**: offscreen sample grid → serpentine Floyd–Steinberg error diffusion, threshold/contrast/gamma/blur/dotScale/invert/cornerRadius mask (`insideRoundedMask`), pointer repulsion (CR/CF), ripples (RS/RW/RF/RD), idle sleep, FPS auto-degrade, PNG export via `canvasOut` ref; upload/drop/paste input; live controls sliders |
| 16 | Contact Sheet (04) | mirrors latest search `shot` into film-strip grid, click → lightbox, shutter sound |
| 17 | Correspondence (05) | textarea + paper-type (letter/postcard/telegram), framer drag-to-slot + crumple sequence (scale/rotate/borderRadius keyframes), WebAudio SND.crumple/thunk, last-3 slips persisted, optional POST to `NOTE_ENDPOINT` (currently empty string = disabled) |
| 18 | Auth (#login view) | hash-route `#login`, LoginBackdrop fetches LOGIN_QUERIES plates, sign in/sign up/reset/Google OAuth via Supabase, password strength meter, caps-lock warning, shake on error, ACCESS GRANTED stamp + curtain exit; session restore + onAuthStateChange |
| 19 | Footer/Dev | DevPortrait (dev.png), contact links, clock, back-to-top |
| 20 | Keyboard | `/` search focus, `m` mute toggle, `r` random, `g`+{s,g,d,c,n} section jumps (<900 ms), `1..5` sections, `0` top, Esc closes menu/lightbox |
| 21 | Sound | WebAudio SND {click,open,close,pop,shutter,crumple,thunk,toggle}, mute persisted |
| 22 | Responsive | Tailwind breakpoints md/sm throughout; touch: min-h-[44px] targets, drag touchAction none |
| 23 | A11y | skip link, aria-labels/expanded/modal/pressed, focus-visible outline, prefers-reduced-motion kills animations, alt text on plates |

### External dependencies
CDN Tailwind, unpkg React/ReactDOM/Framer-Motion/Lenis/Babel, jsdelivr Supabase, Google Fonts; APIs: `commons.wikimedia.org/w/api.php`, `api.openverse.org/v1/images/`, `picsum.photos`; auth: Supabase project `orstxiasufevqdstbjtv`.

### localStorage usage & decisions

| Key | Purpose | Decision |
|-----|---------|----------|
| `va-mute` | sound mute flag | **KEEP LOCAL** (device preference) |
| `va-notes` | last 3 correspondence filings (full text) | **KEEP LOCAL** (existing UX preserved); server copy added *optionally* behind `POST /api/correspondence` when `DATABASE_URL` is configured — client behavior unchanged |
| `sb-*` (SDK-managed) | Supabase session | KEEP LOCAL (provider-managed) |

No existing feature requires server-side persistence; the DB layer is therefore minimal and opt-in (see §4).

---

## 2. Recommended frontend architecture

**Vite + React 18.3.1 + Framer Motion 11.11.17 + Lenis 1.1.18** — the *same library versions* the page already runs from CDNs, so component code migrates essentially verbatim (Babel-in-browser replaced by real JSX compilation). Tailwind 3.4 (PostCSS build) with the theme tokens copied **exactly** from the inline CDN config. No router (the app is one page + `#login` hash view — keep that mechanism), no state library (React hooks suffice), no UI kit.

```
frontend/
├── index.html            ← head/meta/fonts verbatim from source (CDN scripts removed)
├── vite.config.js        ← dev proxy /api → backend:4000; build out → ../public/app
├── tailwind.config.js    ← tokens copied verbatim
├── public/dev.png        ← copied asset
└── src/
    ├── main.jsx          ← boot() equivalent + error collector
    ├── App.jsx           ← verbatim App: hash view, Lenis, skew loop, IO tracking, shortcuts
    ├── styles/{base.css,global.css}   ← <style> block extracted VERBATIM
    ├── utils/constants.js ← REDUCED/FINE/clampN/lerp/store/slug/picseed/SKEW_STYLE/RATIOS/DEV/emailOk/memberName/authRedirectUrl
    ├── utils/dom.js       ← lenisInstance/curtainGo/curtainSweep/hardScroll/scrollToEl/curtainTo/openLightbox
    ├── data/content.js    ← GENRES/QUICK/HERO_QUERIES/LOGIN_QUERIES/SECTIONS (verbatim)
    ├── services/{auth,sound,image.service}.js ← supabase client (env-driven), SND verbatim, commons/openverse/placeholderSet/searchImages(corsPhoto,fetchPlate) verbatim + optional /api proxy pass-through
    ├── components/        ← VAMark, Photo, Marquee, CharLines, Scramble, Mag, Bridge, SectionHead, Credit, Grain, Cursor, Clock, Preloader, Curtain, Lightbox, Dots, BackTop, Nav, Boundary
    ├── pages/             ← SitePage.jsx, LoginView.jsx (+LoginBackdrop/LoginCard/LoginField/strengthScore)
    └── sections/          ← Hero, SearchSection, GenreSection(+GenreCard), DarkroomSection(+DitheredPlate), SheetSection, NoteSection, Footer(+DevPortrait)
```

Rules enforced during extraction: every className string, timing constant, easing curve, rAF loop, and cleanup path is copied **character-for-character**; only module plumbing (imports/exports, `window.X` → `import X`) changes.

## 3. Backend (actually required services)

Node + Express (single small app, zero ORM):

```
backend/src/
├── index.js              ← app entry, static-serve ../public/app, PORT env
├── routes/{search.js,correspondence.js,health.js}
├── controllers/search.controller.js, correspondence.controller.js
├── services/{wikimedia.service.js,openverse.service.js,placeholder.service.js,image-normalizer.js}
├── middleware/{errorHandler.js,rateLimit-lite.js}
└── config/env.js
```

- `GET /api/search?q&page&lic` — server-side mirror of the same commons→openverse→placeholder chain returning the identical normalized shape. Frontend tries `/api` first, falls back to the **original direct client chain** on any failure → UI behavior identical even if backend is down.
- `GET /api/images/random` — random plate helper.
- `POST /api/correspondence` / `GET /api/correspondence` — stores filings **only when `DATABASE_URL` set**; otherwise returns 503 and the client silently ignores it (matching today's empty `NOTE_ENDPOINT` behavior — no UX change).
- No secrets exist today (Supabase key is a publishable client key; Commons/Openverse anonymous tiers). Env still externalizes everything for rotation.

## 4. Database (only what is actually needed)

Single SQLite table (opt-in):

```sql
CREATE TABLE notes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL CHECK(length(message)<=240),
  paper TEXT NOT NULL CHECK(paper IN ('letter','postcard','telegram')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notes_created ON notes(created_at DESC);
```

Users, sessions, and auth remain entirely in Supabase (already deployed). Preferences and drafts stay in localStorage per §1. Nothing else warrants a table.

## 5. Environment variables (`.env.example`)

```
VITE_SUPABASE_URL=...            # public client value (was hard-coded; now injected)
VITE_SUPABASE_PUBLISHABLE_KEY=...# publishable anon key (safe by design)
PORT=4000
DATABASE_URL=                    # optional: enables /api/correspondence persistence
OPENVERSE_TOKEN=                 # optional: raises openverse rate limit
```

## 6. Migration strategy without UX change

1. Extract `<style>` → `base.css` verbatim; extract babel body → module files verbatim (done mechanically; diffs auditable against `_app_extract.js`).
2. Same library versions ⇒ identical render output; Tailwind built locally from identical theme object.
3. All globals (`lenisInstance`, `curtainGo`, `va-lb` bus, `SND`) preserved as ES-module singletons with the same mutation points.
4. DitheredPlate ported line-by-line — algorithm, ripples, pointer physics, FPS guard, export untouched.
5. Auth flow kept as `#login` hash view with identical card/backdrop/stamp animations; only credential sourcing moves to env.
6. Verify: `npm run build`, serve `public/app`, side-by-side interaction checklist (navigation, search+filters+lightbox, random, genres, darkroom incl. paste/drop/export, sheet, correspondence drag+sound, login/signup/reset/OAuth states, keyboard map, reduced-motion, 320→1920 widths).
7. Original `index.html` remains at repo root permanently; rollback = serve it.

## 7. Risks

- Tailwind Play CDN vs JIT build: arbitrary-value classes used here are static strings → fully supported by the build scanner (safelist content globs added).
- UMD `window.Motion` vs ESM `framer-motion`: same version API surface; imports verified at build time.
- CORS: server proxy mirrors exact upstream params; client fallback keeps browser-direct mode working.
- In-browser Babel hid syntax errors until runtime: real toolchain surfaces them at build — caught before deploy, not after.

## Commit staging (on main)

1. `chore: analysis + migration plan + scaffold configs`
2. `refactor(frontend): extract styles/constants/data/services modules verbatim`
3. `refactor(frontend): components (chrome/nav/lightbox)`
4. `refactor(frontend): sections (hero/search/genres/darkroom/sheet/note/footer)`
5. `refactor(frontend): pages + app shell + boot`
6. `feat(backend): express api + services + db migration/seed`
7. `chore: env example, README, build verification`
