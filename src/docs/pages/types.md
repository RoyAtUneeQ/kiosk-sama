## Types

A clear type layer defines contracts between UI, hooks, transport, and the Uneeq SDK.

### Session
- `SessionStatus`: IDLE → READY → LOADING → LIVE → ENDED/ERROR
- `ActionType` (and corresponding reducer actions): narrow, explicit transitions
- `State`: central session state (Uneeq instance, events, media, language, remote info, etc.)

### Uneeq
- `Uneeq` interface: SDK surface used by the app (`init`, `startSession`, `chatPrompt`, etc.)
- `EventType` and `Event`: structured SDK messages
- `UneeqOptions`: how sessions are configured (`defaultUneeqOptions` provided)

### Transport
- `RemoteSessionInfo`: device/browser/screen metadata captured for pairing
- `WebsocketStatus`: connection lifecycle
- Actions: `ActionGetConnectionId`, `ActionPeerConnect`, `ActionPeerMessage`, `ActionCheckPeerConnection`, `ActionCloseSession`

### Instructions
- `OutgoingInstruction`: contract for prompts sent to Uneeq
- `IncomingInstruction`: contract for client‑side effects resolved from events

### Why explicit types
- Prevent protocol drift as backends/SDKs evolve
- Make the integration seam self‑documenting and refactor‑friendly