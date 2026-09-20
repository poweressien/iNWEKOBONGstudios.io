# iNWEKOBONG — playable portfolio

A game-style developer portfolio. There is no page to scroll: visitors walk a
character around a small floating universe, collect skill orbs, inspect each
project on an arcade cabinet, talk to **OBI** (a local, in-browser assistant) and
warp between districts from a map.

* **Canvas 2D engine** — no WebGL, no 3D libraries, works on low-end phones
* **~100 KB gzipped JavaScript**, self-hosted fonts, zero third-party requests at load
* **Desktop:** WASD / arrows, Shift dash, E interact, M map, Esc menu, click to walk
* **Mobile:** floating joystick (drag anywhere), dash + interact buttons
* **Progress** (XP, levels, orbs, trophies) is saved in `localStorage`

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
```

## Edit your content — `src/data/`

| File | What it controls |
| --- | --- |
| `portfolio.ts` | name, bio, skills (each becomes a collectable orb), experience, **email / WhatsApp / LinkedIn**, OBI's idle lines, the four button pads |
| `projects.ts` | one arcade cabinet per entry (title, marquee name, description, tech, tags, links) |

Contact buttons only appear when filled in: set `email`, `whatsappNumber`
(digits with country code, e.g. `2348012345678`) and/or `linkedinUrl` in
`portfolio.ts`. Add `githubUrl` / `liveUrl` to a project to show its link buttons.

## Deploy on Render (static site)

| Setting | Value |
| --- | --- |
| Build command | `npm ci && npm run build` |
| Publish directory | `dist` |

`.node-version` pins Node 22. `render.yaml` is an optional Blueprint.

## Layout of the code

```
src/game/world.ts     islands, collision, props, orbs, interactables (edit the map here)
src/game/render.ts    all canvas drawing
src/game/engine.ts    loop, movement, interaction, camera, adaptive quality
src/game/ai.ts        OBI — matches questions against src/data/*
src/store/            zustand store: progress, panels, toasts
src/components/ui/    HUD, title screen, touch controls, panels
```
