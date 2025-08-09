# Components

## Button / CircleButton
- Animated, theme-aware buttons with hover/active/disabled states and optional highlighted styles.
- `CircleButton` is optimized for iconography and compact actions.

Why: Encapsulate a polished, accessible CTA suite consistent across kiosk/remote.

## Loading
- Animated ring, pulsing core, and ambient particles that read phrases from `i18n.loading.phrases`.
- Designed to run as a full-screen or inline progress component.

Why: Communicate system activity while reinforcing brand feel.

## Panel
- Two-column responsive layout with a media pane (image/video) and a form/content slot.
- Supports video loop restarts from a specific time.

Why: Provides an opinionated, high-quality container for hero experiences like the kiosk start screen.

## Particles
- Wrapper around `@tsparticles/react` with controlled initialization to avoid multi-engine issues across HMR/mounts.
- Exposes a few curated options (`floating` preset, colors, z-index) for tasteful backgrounds.

## QRCode
- Renders a styled QR anchor to pair a remote client with the kiosk session.
- Exposes methods via ref: `download`, `getCanvas`, `getBase64`.

Why: Make pairing trivial and reliable.