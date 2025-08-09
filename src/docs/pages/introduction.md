# Introduction

This project delivers a kiosk-driven, real‑time conversational experience powered by Uneeq’s Digital Human platform, with an optional remote companion interface.

At its core, it:
- Hosts a digital human session (kiosk) that users interact with directly.
- Exposes a companion “remote” page to send text prompts and receive responses over WebSocket.
- Orchestrates session state, events, and media through a lightweight React architecture with a central context and focused hooks.

## What this software does
- Starts and controls a Uneeq Digital Human session inside a React application.
- Connects to a backend WebSocket for device pairing, messaging, and peer connectivity checks.
- Translates Uneeq events into UI state updates and domain “instructions”, which drive media and UX updates.
- Provides a clean, modern UI with animated components, internationalization, and progressive enhancements.

## Why it’s built this way
- Separation of concerns: declarative UI components, hooks for integrations (Uneeq, WebSocket), and a small, explicit session store.
- Resilience and clarity: events are queued and processed deterministically to avoid race conditions.
- Extensibility: incoming/outgoing instruction classes and factories make it easy to add new behaviors without touching core UI.
- Adaptability: configuration via YAML enables switching personas, languages, and environments without code changes.

## How to navigate this documentation
- Start with the big picture in [Architecture](architecture.md).
- Get running quickly with [Getting Started](getting-started.md).
- Explore individual modules: [Main Application](main-application.md), [Contexts](contexts.md), [Hooks](hooks.md), [Components](components.md), [Pages](pages.md), [Internationalization](i18n.md), [Instructions](instructions.md), [Types](types.md), [Styles](styles.md), and [Utilities](utilities.md).