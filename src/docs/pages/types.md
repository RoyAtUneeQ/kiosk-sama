# Types

A rich type layer defines integration contracts and UI state shape.

## Session types
- `SessionStatus`: IDLE → READY → LOADING → LIVE → ENDED/ERROR
- `ActionType` and `SessionAction`: narrow, explicit state transitions
- `State`: central session state (Uneeq instance, events, media, language, remote info, etc.)

## Uneeq types
- `Uneeq` interface: the SDK surface used by the app (methods like `init`, `startSession`, `chatPrompt`, etc.)
- `EventType` and `Event`: structured SDK messages
- Options (`UneeqOptions`) describe how sessions are configured

## Transport types
- `RemoteSessionInfo`: device/browser/screen metadata captured for pairing
- `WebsocketStatus`: connection lifecycle
- Action unions like `ActionGetConnectionId`, `ActionPeerConnect`, `ActionPeerMessage`

## Instruction types
- `OutgoingInstruction`: contract for prompts sent to Uneeq
- `IncomingInstruction`: contract for client-side effects resolved from events

## Why explicit types
- Prevents protocol drift as backends/SDKs evolve.
- Makes the integration seam self-documenting and safer to refactor.