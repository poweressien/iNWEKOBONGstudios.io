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

### Things to play with

* **Guided tour** — the camera visits each level with a caption (top bar → Tour)
* **Command palette** — `Ctrl/⌘ K` or `/`: jump anywhere, open any project, control the scene (try `sudo`)
* **Solar position** — move the sun (or let it cycle) and the tower relights (sun button)
* **Transmit** — click the beacon on the spire and a pulse of light travels up the tower
* **Living scene** — shooting stars, an orbiting satellite, a live Nigeria clock, and a generative emblem for every project

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
