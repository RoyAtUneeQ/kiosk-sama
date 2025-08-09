## Introduction

This frontend showcases a kiosk-driven, real‑time conversational experience powered by Uneeq’s Digital Human platform. It also ships with a second‑screen “remote” that pairs to the kiosk over WebSocket for guidance, accessibility, or live assistance.

### What it does
- **Kiosk session**: Hosts and controls a Uneeq session in a React app.
- **Remote pairing**: Pairs a remote browser to the kiosk via QR/WebSocket to send text prompts and receive replies.
- **Deterministic orchestration**: Translates Uneeq events into UI state and domain “instructions” that update media and UX safely.
- **Modern UI**: Animated components, i18n, and tasteful particles with strong defaults.

### Why it’s built this way
- **Clear separation**: Views are declarative; integrations (Uneeq, WS) live in focused hooks; a small explicit context is the single source of session truth.
- **Determinism over cleverness**: Events are queued and processed one‑by‑one to avoid race conditions and re‑entrancy bugs.
- **Extensible by construction**: Incoming/outgoing instruction classes and factories isolate domain intent from transport and UI.
- **Config as data**: YAML defines personas, environments, and endpoints without code changes.

### How to use these docs
- Start with the big picture in [Architecture](architecture.md).
- Get running with [Getting Started](getting-started.md).
- Dive into: [Main Application](main-application.md), [Contexts](contexts.md), [Hooks](hooks.md), [Components](components.md), [Pages](pages.md), [Internationalization](i18n.md), [Instructions](instructions.md), [Types](types.md), [Styles](styles.md), and [Utilities](utilities.md).