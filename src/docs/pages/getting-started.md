## Getting Started

> Goal: run the kiosk + remote locally and open the Docsify docs.

### Prerequisites
- Node.js 18+ and npm
- A configured `src/assets/config.yaml` (see below)

### Install and run the app
```bash
npm install
npm run dev
```
Then open the printed Vite URL (e.g., `http://localhost:5173`).

### Configuration
The app imports configuration at build time from YAML:
- Sample: `src/assets/config.sample.yaml`
- Required: `src/assets/config.yaml`

Create `config.yaml` from the sample and set:
- `personas.<language>.cloud|miniprem`: CDN (script), API (session endpoint), key (personaId)
- `websocket.url`: backend WebSocket endpoint used by Kiosk/Remote
- `apis.pixabay`: example API integration

Why YAML? It keeps persona/environment/runtime toggles out of code and enables non‑dev changes safely.

### Docs (Docsify)
Docs live at `src/docs/`.
- Serve with any static server, e.g.: `npx serve src/docs`
- Sidebar: `src/docs/_sidebar.md`; pages in `src/docs/pages/*`.

### Routes
- `/` → Kiosk experience
- `/remote/:kioskConnectionId` → Remote companion page (pairs via WebSocket)

### Quick checks
- Kiosk shows a start screen with language selector.
- When LIVE, a QR code appears to open the remote bound to your current `connectionId`.
- Remote can send messages to kiosk; kiosk forwards prompts to the digital human.