# Pages

## KioskPage
Coordinates the live session lifecycle:
- Initializes Uneeq (`useUneeq`) and binds event processing (`useUneeqEvents`).
- Opens WebSocket and polls for peer connectivity.
- Shows `KioskStartForm` while IDLE/READY; when LIVE:
  - Displays `UneeqContainer`
  - Shows QR until a remote is paired
  - Displays `RemoteConnectionInfo` once paired
  - Renders media overlays via `MediaContainer` when instructions set `imageUrl`/`videoUrl`

### Language and render mode
- Language selector backed by `LanguageProvider` and `ConfigProvider`.
- Optional render mode toggle when multiple modes are available per language (e.g., `cloud` vs `miniprem`).

## RemotePage
A companion chat UI that pairs via `/remote/:kioskConnectionId`:
- Shows a header with connection status.
- Presents a `MessageList`, input box, and suggestions.
- Sends text to kiosk via `peerMessage`; kiosk forwards prompt to Uneeq and streams back results.

### Why two pages?
- Kiosk: optimized for large displays and on-site interaction.
- Remote: facilitates second-screen control, ADA scenarios, or staff-guided experiences.