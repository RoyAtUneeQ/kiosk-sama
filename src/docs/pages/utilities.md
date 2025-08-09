# Utilities

A small set of utilities support integration boundaries and UX affordances.

## DynamicIconLoader
- Loads icon components dynamically based on icon name and library prefix.
- Exposes `useDynamicIcons` and helpers to retrieve `react-icons` by name at runtime.

Why: Decouple visual iconography choices from compile-time imports.

## Action factories (createAction)
- Centralize creation of typed WebSocket actions (`getConnectionId`, `peerConnect`, `peerMessage`, `closeSession`, etc.).

Why: Keep protocol messages consistent and discoverable.

## Instruction factories
- Create outgoing instruction instances (e.g., `userInstruction`, `randomActionStory`).

Why: Enable higher-level code to express intent while keeping construction details contained.

> Note: These factories are purposefully thin; they exist to improve call-site readability and minimize knowledge of constructor details.