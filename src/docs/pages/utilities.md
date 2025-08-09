## Utilities

Focused helpers that support integration boundaries and UX affordances.

### DynamicIconLoader
- Loads icon components dynamically based on icon name and library prefix.
- `useDynamicIcons` returns a `getIconComponent` helper to render icons by name at runtime.

Why: decouple iconography choices from compile‑time imports.

### Action factories (createAction)
Centralize creation of typed WebSocket actions (`getConnectionId`, `peerConnect`, `peerMessage`, `CheckPeerConnection`, `closeSession`).

Why: keep protocol messages consistent and discoverable.

### Instruction factories
Create outgoing instruction instances (e.g., `userInstruction`, `generateImage` which maps to `OutRandomActionStoryInstruction`).

Why: let higher‑level code express intent and keep construction details contained.