# Interactive 3D Developer Portfolio — Space Hub & Tower

A first-person, walkable 3D portfolio — no page scrolling. You spawn on a
platform floating in space; walking around and through a portal *is* the
navigation.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. `npm run build` produces a static `dist/`
folder you can host anywhere — it's just HTML/CSS/JS, no server needed.

## What's where

- **Space Hub** (you spawn here): two floating planets — one an
  approach-and-interact live GitHub profile, one your about-me/skills
  transmission — a floating PC that opens another site when clicked, a
  row of joke buttons, and a portal.
- **The Portal** teleports you (with a quick warp-flash transition) to the
  **Tower Plaza**, where a giant tower reads **INWEKOBONG TECHNOLOGIES**
  across its face.
- **Inside the tower**: your desk/monitor setup, the GitHub computer, a
  comms terminal (the contact form), an original AI hologram assistant,
  and stairs up to the **Project Floor** with a station per project.
- A return portal in the plaza brings you back to the Hub.

> Heads up: this deliberately does **not** use Tony Stark / JARVIS / Friday
> / Ultron by name — those are Marvel's characters. The tower vibe and the
> AI hologram ("OBI") are original, so nothing here trades on someone
> else's IP. Feel free to reskin the AI's name/lines further in
> `src/data/portfolio.ts`.

## Make it yours

Everything text-based lives in **`src/data/portfolio.ts`** — you shouldn't
need to touch any 3D component to update your own info:

- `bio`, `skills`, `experience`, `education`, `interests` — the usual
  portfolio content, shown when you approach the iNWEKOBONG planet.
- `githubUsername` / `githubUrl` — the GitHub panel does a **live fetch**
  to the real GitHub API, so it always matches your actual profile.
- `externalSiteUrl` — where the floating PC sends visitors. Defaults to
  your GitHub; point it at a flagship project, a blog, wherever.
- `planetPoweressien` / `planetInwekobong` — name/tagline/blurb/color for
  each planet.
- `aiAssistant` — the hologram's name and its cycling one-liners.
- `funnyButtons` — label + response for each joke button; add or remove
  freely.
- `email` / `linkedinUrl` / `whatsappNumber` / `contactFormEndpoint` — as
  before: blank fields just don't render, and the contact form opens a
  mailto: draft instead of pretending to submit anywhere until you set a
  real endpoint.

**`src/data/projects.ts`** is the Project Floor's data — add, remove, or
reorder entries freely; the floor lays itself out to fit however many you
list. A few `githubUrl`/`liveUrl` fields are intentionally left blank
where the real link wasn't confirmed — fill those in rather than guessing.

## Controls

**Desktop:** WASD / arrow keys to move, mouse to look (click Explore to
lock the pointer), `E` to interact, `Esc` to pause.
**Mobile:** left-side joystick to move, drag anywhere on the right side to
look, tap the `E` button to interact.

The accessibility menu (bottom-left) opens About/Projects/Contact/GitHub
directly without walking there, and Settings has a reduced-motion toggle
that turns off camera bob, portal spin, and particle drift.

## Notes on what's real vs. placeholder

- **Audio** is synthesized with the Web Audio API (footsteps, portal
  whoosh, UI clicks, a low ambient hum) — nothing to license or download.
  Off by default until you toggle it (browser autoplay rules).
- **Screens and planet textures** are drawn procedurally onto canvas
  textures, not image files — same reasoning.
- If WebGL isn't available, visitors get a clean normal page
  (`src/components/FallbackPortfolio.tsx`) with the same content, not a
  blank screen.

## Project structure

```
src/
  components/3d/
    SpaceHub.tsx        the starting platform: planets, PC, buttons, portal
    Planet.tsx           reusable floating planet
    Portal.tsx            reusable teleporting portal
    FloatingPC.tsx / FunnyButtons.tsx
    TowerExterior.tsx    plaza + the giant tower + entrance + return portal
    TowerInterior.tsx    desk/monitors/GitHub computer/comms terminal/stairs
    AIHologram.tsx       the tower's resident AI
    ProjectFloor.tsx / ProjectStation.tsx   (unchanged — data-driven)
    Player.tsx           movement, collision, and portal teleport handling
  components/ui/         HUD, panels (About/Project/Contact/GitHub/AI/Settings),
                          loading/intro screens, mobile controls, toast, warp flash
  data/                  portfolio.ts + projects.ts (edit these), worldColliders.ts (layout)
  store/                 Zustand store — phase, active panel, doors, teleport/warp, toasts
  hooks/ lib/             input, interaction registration, collision math, audio, textures
```

## Performance notes

Shadows and bloom/vignette are automatically disabled on detected mobile
devices; particle counts scale down too. Movement, input, and the
interaction proximity scan all run outside React state (`src/lib/engine.ts`),
so the component tree only re-renders on actual state changes like
opening a panel or warping.
