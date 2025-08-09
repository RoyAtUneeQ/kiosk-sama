# Contexts

## SessionContext
Central store for live session state and the Uneeq event queue.

### State shape
- `status`: lifecycle (IDLE → READY → LOADING → LIVE)
- `webSocketState`: connected/disconnected
- `connectionId`: kiosk’s id for remote pairing
- `uneeq`: the Uneeq SDK instance (or null before init)
- `uneeqEvents`: queue of raw Uneeq events to be processed in-order
- `imageUrl`, `videoUrl`: media currently displayed
- `remoteInfo`: metadata about the paired remote client
- `awaitingPromptResponse`: UX affordance on prompt lifecycle
- `language`, `renderMode`: current persona/language and render mode
- `outgoingInstruction`: the next instruction to be sent to Uneeq
- `peerMessage`: last message from the remote

### Reducer actions
Explicit `ActionType`s set individual fields with predictable updates. A small number of actions keeps the mental model simple while remaining extensible.

### Rationale & patterns
- Deterministic event processing: `useUneeqEvents` consumes `uneeqEvents` one by one, clearing the current and appending the rest. This avoids re-entrancy pitfalls and race conditions common in event-driven UIs.
- Controlled LOADING callback: a ref holds an optional callback executed when the status becomes `LOADING`. This allows deferring side-effects (init/start) until state is committed.

## ConfigProvider
Loads YAML at build time (`config.yaml?raw`), parses with `js-yaml`, and exposes helpers:
- `getSupportedLanguages()`
- `getDefaultLanguage()`
- `getRenderByLanguage(language)`

Rationale: Keep environment/persona data out of code, enable non-devs to manage deployment and persona switches safely.