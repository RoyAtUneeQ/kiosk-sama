## Components

### Button / CircleButton
- Animated, theme‑aware buttons with hover/active/disabled states and optional highlighted styles.
- `CircleButton` is optimized for iconography and compact actions.

Why: encapsulates a polished, accessible CTA suite consistent across kiosk/remote.

### Loading
- Animated ring, pulsing core, ambient particles; cycles phrases from `i18n.loading.phrases`.
- Works as a full‑screen or inline progress component.

### Panel
- Two‑column responsive layout with a media pane (image/video) and a form/content slot.
- Supports video loop restarts from a specific time.

### Particles
- Wrapper around `@tsparticles/react` with guarded engine initialization to avoid multi‑engine issues across HMR/mounts.
- Curated options (floating preset, colors, z‑index) for tasteful backgrounds.

### QRCode
- Renders a styled QR anchor to pair a remote client with the kiosk session.
- Exposes ref methods: `download`, `getCanvas`, `getBase64`.