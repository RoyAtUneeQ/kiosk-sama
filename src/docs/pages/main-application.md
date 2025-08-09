## Main Application

The entry point `src/main.tsx` composes providers and routes, and applies a small polyfill.

### Providers (in order)
- **ConfigProvider**: loads YAML config and exposes helpers (supported languages, default language, available render modes).
- **LanguageProvider**: wraps i18next; keeps `lang`/`dir` synced on the `<html>` element; exposes metadata and helpers.
- **SessionProvider**: a focused app store (status, WS state, Uneeq instance, event queue, media URLs, language, outgoing instruction, remote info).

Order matters: `config → language → session` ensures each provider has what it needs.

### Routing
- `/` → `KioskPage`
- `/remote/:kioskConnectionId` → `RemotePage`

### Polyfills
`crypto.randomUUID` is polyfilled with `uuid.v4` for older browsers to centralize compatibility.

### Rationale
- Keep bootstrap lean and legible.
- Provider composition mirrors domain dependencies.