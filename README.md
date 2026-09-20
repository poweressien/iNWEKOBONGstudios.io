# iNWEKOBONGtechnologies.io

A single tower in space — the whole portfolio is one 3D scene. Visitors orbit the
building, and each occupied level opens a section: **Studio**, **Work**, **Stack**,
**Labs** (live GitHub) and **Signal** (contact). A built-in concierge answers
questions about the work from the site's own data.

* Canvas 2D with a small hand-written 3D camera — no WebGL, no 3D libraries
* ~100 KB gzipped JavaScript, self-hosted fonts, no third-party requests at load
* Desktop: drag to orbit, scroll to zoom, hover/click a level, keys `1`–`5`, `C` concierge, `Esc` close
* Mobile: drag to orbit, pinch to zoom, tap a level or use the bottom dock
* Optional synthesised ambience (off by default)

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
```

## Edit your content — `src/data/`

| File | Controls |
| --- | --- |
| `portfolio.ts` | name / domain, bio, focus areas, skills, **email, phone, WhatsApp, social channels** |
| `projects.ts` | the products listed under Work (add `githubUrl` / `liveUrl` to show link buttons) |
| `levels.ts` | the five levels: labels and where they sit on the tower |

The tower's geometry (tiers, window grid, sign) lives in `src/scene/scene.ts` (`TIERS`).

## Deploy on Render (static site)

Build command `npm ci && npm run build`, publish directory `dist`. `.node-version` pins Node 22.
