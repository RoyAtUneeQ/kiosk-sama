## Hooks

### useUneeq(options, language, type)
- Loads the Uneeq SDK script URL from config for the selected language and render type (`cloud|miniprem`).
- Enforces a singleton instance via `window.uneeqSessionKey` and cleans up previous sessions.
- Registers a global `UneeqMessage` listener that appends events into `SessionContext.uneeqEvents`.
- When `outgoingInstruction` changes, generates a prompt and calls `chatPrompt`.

Why: a single SDK instance ensures stability; an explicit queue ensures correctness.

### useUneeqEvents()
- Consumes `uneeqEvents` one‑by‑one with a processing guard.
- Maps `PromptRequest/PromptResult/SessionLive/...` to UI state updates.
- On `SpeechEvent`, resolves instruction classes dynamically (`IncomingInstructions`) and executes them.

Why: centralizes cross‑cutting event handling and keeps views declarative.

### useWebSocket({ webSocketUrl })
- Opens one WS connection, sets `WebsocketStatus`, and handles messages:
  - `connectionId` → store for pairing/QR
  - `RegisterRemote` → capture remote device info
  - `peerMessage` → forwarded to session as `peerMessage`
  - `PeerChecked`/`PeerDisconnected` → connectivity maintenance
- Exposes `sendAction` to send typed actions created by `createAction`.

Why: encapsulates network lifecycle and isolates protocol concerns from UI.

### useConfig()
Reads parsed YAML and provides helpers to reason about personas/languages/render modes.

### useTranslation()
Thin wrapper around `react-i18next` that exposes a stable API and helpers.

### useUserInspect(connectionId)
Captures browser/device/platform/screen/connection info, returning a `RemoteSessionInfo` snapshot for pairing.

Why: helps adapt UX and provides observability into remote environments.