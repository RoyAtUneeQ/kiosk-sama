# Hooks

## useUneeq(options, language, type)
- Loads the Uneeq SDK script URL from config for the selected language and render type (`cloud|miniprem`).
- Ensures a single global `window.uneeq` instance across mounts/HMR by tracking `window.uneeqSessionKey`.
- Registers a global `UneeqMessage` listener and appends events into `SessionContext`’s queue.
- When `outgoingInstruction` changes, generates a prompt and calls `chatPrompt`.

Why: Owning a single SDK instance is essential for stability; race-free event intake protects UI correctness.

## useUneeqEvents()
- Consumes `uneeqEvents` one-by-one.
- Maps `PromptRequest/PromptResult/SessionLive/...` to UI state transitions.
- On `SpeechEvent`, extracts typed commands and dispatches domain instructions (`IncomingInstructions`).
- Uses a `processingRef` to avoid double-processing.

Why: Centralizes cross-cutting event handling; keeps views declarative and stateless.

## useWebSocket({ webSocketUrl })
- Opens a single WS connection, sets `WebsocketStatus`, and handles messages:
  - `connectionId` → stored for pairing/QR
  - `RegisterRemote` → captures remote device info
  - `peerMessage` → forwarded to `outgoingInstruction`
  - `PeerChecked`/`PeerDisconnected` → connectivity maintenance
- Provides `sendAction` to send typed actions created by `createAction` utilities.

Why: Encapsulates network lifecycle and isolates protocol concerns from UI.

## useConfig()
- Reads parsed YAML and provides helpers to reason about personas/languages/render modes.

## useTranslation()
- Thin wrapper around `react-i18next` to expose a stable API plus convenience functions (available languages, current language).

## useUserInspect(connectionId)
- Captures browser/device/platform/screen/connection info, returns a `RemoteSessionInfo` snapshot for pairing.

Why: Helps the kiosk adapt its UX and provides observability into remote environments.