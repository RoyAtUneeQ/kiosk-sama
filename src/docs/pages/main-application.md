# Main Application

The app boots from `src/main.tsx` and composes providers and routes.

## Providers
- `ConfigProvider`: loads YAML configuration (`config.yaml`) and exposes helper methods (supported languages, default language, render modes). Uses a fallback UI during load and an error UI upon failure.
- `LanguageProvider`: wraps i18next and keeps document `lang`/`dir` in sync; provides flags/labels/RTL metadata.
- `SessionProvider`: a lightweight app store managing session status, WebSocket state, Uneeq instance, event queue, media URLs, language, and outgoing instructions.

Order matters: config → language → session ensures dependent providers have what they need.

## Routing
- `/` renders `KioskPage`
- `/remote/:kioskConnectionId` renders `RemotePage`

## Polyfills & compatibility
Before React renders, `main.tsx` polyfills `crypto.randomUUID` with `uuid.v4` for older browsers. This avoids scattering UUID workarounds throughout the codebase and centralizes the compatibility concern.

## Rationale
- Keep bootstrap lean and legible.
- Provider composition matches domain dependencies and keeps concerns separated.