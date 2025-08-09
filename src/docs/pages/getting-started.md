# Getting Started

> Goal: run the app and the Docsify docs locally, with minimal friction.

## Prerequisites
- Node.js 18+ and npm
- A configured `src/assets/config.yaml` (see below)

## Install and run
```bash
npm install
npm run dev
```
- The app runs via Vite. Open the printed local URL (e.g., http://localhost:5173).

## Configuration
The app loads runtime configuration from a YAML file imported at build time:
- Sample: `src/assets/config.sample.yaml`
- Required: `src/assets/config.yaml`

Create `config.yaml` from the sample and fill values:
- `personas.<language>.cloud` and `personas.<language>.miniprem`: CDN (script), API (session endpoint), key (personaId)
- `websocket.url`: backend WebSocket endpoint used by Kiosk/Remote
- `apis.pixabay`: example API integration

Why YAML? It allows environment/persona/runtime toggles without code changes and preserves a clean separation of concerns.

## Docs (Docsify)
Docs live at `src/docs/`.
- Open `src/docs/index.html` in a static server or with a simple HTTP serve (e.g., `npx serve src/docs`).
- The sidebar is defined in `src/docs/_sidebar.md` and links to `src/docs/pages/*`.

## Routes
- `/` → Kiosk experience
- `/remote/:kioskConnectionId` → Remote companion page (pairs with the kiosk session via WebSocket)

## Quick sanity checks
- You should see the kiosk screen with a start button and language selector.
- When the session is LIVE, a QR code appears (to open the remote page bound to your current `connectionId`).
- Remote page can send messages to the kiosk, which forwards them as prompts to the digital human.