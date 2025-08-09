## Contexts

### SessionContext
The central store for live session state and the Uneeq event queue.

#### State shape
- **status**: lifecycle (IDLE → READY → LOADING → LIVE)
- **webSocketState**: connected/disconnected
- **connectionId**: kiosk’s id for remote pairing
- **uneeq**: Uneeq SDK instance (or null before init)
- **uneeqEvents**: queue of raw Uneeq events to be processed in order
- **imageUrl**, **videoUrl**: media currently displayed
- **remoteInfo**: metadata about the paired remote client
- **awaitingPromptResponse**: UX indicator for prompt lifecycle
- **language**, **renderMode**: current persona/language and render mode
- **outgoingInstruction**: next instruction to be sent to Uneeq
- **peerMessage**: last message from the remote

#### Reducer actions
Explicit `ActionType`s set individual fields with predictable updates. Few actions keep the model simple yet extensible.

#### Patterns
- **Deterministic event processing**: `useUneeqEvents` consumes `uneeqEvents` one‑by‑one, clearing the current and re‑queuing the rest to avoid re‑entrancy and race conditions.
- **Controlled LOADING callback**: a ref stores an optional callback executed when status becomes LOADING, deferring side‑effects (init/start) until state is committed.

### ConfigProvider
Loads YAML at build time (`config.yaml?raw`), parses with `js-yaml`, and exposes helpers:
- `getSupportedLanguages()`
- `getDefaultLanguage()`
- `getRenderByLanguage(language)`

Rationale: keep environment/persona data out of code and allow safe persona switches.