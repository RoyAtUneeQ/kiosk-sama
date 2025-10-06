# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript frontend for a digital human kiosk experience powered by UneeQ SDK. The application features two main interfaces:
- **Kiosk**: Main display with AI-powered digital human avatar
- **Remote**: Mobile interface for remote control and interaction

**Key Dependencies**: Vite, Zustand (state management), Deepgram (speech-to-text), WebSocket (real-time communication), UneeQ SDK, React Query, i18next

**Node Version**: v20.0.0 or higher required

## Common Commands

### Development
```bash
npm run dev                 # Start Vite dev server (http://localhost:5173)
npm run build              # TypeScript compile + Vite build
npm run preview            # Preview production build locally
npm run lint               # Run ESLint
```

### Documentation
```bash
npm run docs               # Serve documentation at localhost:4000
npm run generate-docs      # Generate Docsify docs to public/
```

### Setup & Configuration
```bash
npm run setup              # Interactive configuration setup
npm run check-setup        # Validate config.yaml exists and is valid
cp src/assets/config.sample.yaml src/assets/config.yaml  # Manual config creation
```

### Deployment
```bash
./deploy-to-aws.sh         # Deploy to AWS with optional build analysis
./optimize-build.js        # Analyze build performance (run after npm run build)
```

## Configuration System

**Critical**: `src/assets/config.yaml` must exist before running the app (not tracked in git).

The config file controls:
- **Personas**: Multi-language UneeQ personas (en, fr, etc.) with cloud/miniprem render modes
- **Backend**: WebSocket and HTTP endpoints for backend communication
- **APIs**: External API keys (e.g., Pixabay for demo)
- **Environment**: development/staging/production mode

Copy from `config.sample.yaml` and update endpoints, persona IDs, and API keys for your environment.

## Architecture & Patterns

### Auto-Discovery Pattern
The codebase uses factory-based auto-registration for extensibility:

**Triggers** (`src/triggers/`): User-initiated actions that generate messages
- Implement `Trigger` interface with `execute(SessionContextType): Message | void`
- Export from `src/triggers/index.ts`
- Auto-registered by `TriggerFactory` using class name reflection
- Example: `WorldCupInfoTrigger` → registered as key `"worldCupInfo"`

**Event Listeners**: Handle incoming events from UneeQ and WebSocket
- **UneeQ listeners** (`src/listeners/uneeq/`): Handle UneeQ digital human events
  - Implement `UneeqEventListener` with `eventType: EventType` and `execute(event, session)`
  - Auto-registered by `UneeqEventFactory`
- **WebSocket listeners** (`src/listeners/websocket/`): Handle backend WebSocket events
  - Implement `WebSocketEventListener` with `eventType: WebSocketEventType` and `execute(data, session)`
  - Auto-registered by `WebSocketEventFactory`
- Export from respective `index.ts` files for auto-discovery

### State Management
**Zustand store** (`src/contexts/SessionContext.tsx`): Single source of truth
- All shared state lives in `SessionContext`
- Components access via `useSession()` hook
- State includes: session status, UneeQ instance, WebSocket connection, conversation history, UI states, language/renderMode, remote connection info

**Session Lifecycle States** (enum `SessionStatus`):
```
IDLE → LOADING → ACTIVE → SPEAKING → (repeat) → ENDED
```

### Core Hooks
- `useUneeq`: Initialize UneeQ digital human session (loads CDN script, manages lifecycle)
- `useWebSocket`: Establish WebSocket connection with auto-reconnection
- `useUneeqEvents`: Subscribe to UneeQ event stream and dispatch to factory
- `useSpeechServices`: Manage Deepgram speech-to-text streaming
- `useConfig`: Load and provide `config.yaml` data throughout app
- `useTranslation`: i18next wrapper with language switching

### Service Layer (`src/services/`)
- `WebSocketService`: RxJS-based WebSocket with reconnection logic
- `DeepgramStreamService`: Streaming speech recognition via Deepgram
- `MicrophoneStreamService`: MediaStream audio capture
- `EphemeralTokenService`: Fetch time-limited tokens from backend
- `PerformanceMonitor`: Development metrics and timing

### Path Aliases (vite.config.ts)
```typescript
@/components → src/components
@/services   → src/services
@/pages      → src/pages
@/hooks      → src/hooks
@/types      → src/types
@/contexts   → src/contexts
@/triggers   → src/triggers
@/listeners  → src/listeners
@/factories  → src/factories
@/i18n       → src/i18n
@/config     → src/config
@/utils      → src/utils
@/assets     → src/assets
```

## Adding New Features

### Adding a Trigger
1. Create new class in `src/triggers/` implementing `Trigger` interface
2. Export from `src/triggers/index.ts`
3. Restart dev server (factory auto-registers on import)

### Adding an Event Listener
**For UneeQ events:**
1. Create class in `src/listeners/uneeq/` implementing `UneeqEventListener`
2. Set `eventType` to match `EventType` enum value
3. Export from `src/listeners/uneeq/index.ts`

**For WebSocket events:**
1. Create class in `src/listeners/websocket/` implementing `WebSocketEventListener`
2. Set `eventType` to match `WebSocketEventType` enum value
3. Export from `src/listeners/websocket/index.ts`

### Adding Translations
1. Add keys to all locale files in `src/i18n/locales/*.json`
2. Use via `useTranslation()` hook: `const { t } = useTranslation();`
3. Supported languages: en, es, ja, ar, pt, de, fr

## Backend Dependencies

This frontend requires a companion backend service:
- **WebSocket server**: Default port 3001 (configurable in config.yaml)
- **HTTP API server**: Default port 3000 (configurable in config.yaml)
- Backend repo: https://websocket-api-75b4d0.gitlab.io/#/

The WebSocket connection must be established before the kiosk start button is enabled.

## Deployment & Build Analysis

**Production build**: `npm run build` creates optimized bundle in `dist/`

**Build analysis**: Run `./optimize-build.js` after building for:
- Bundle size analysis with warnings for large files (>500KB)
- Asset fingerprinting verification
- Cache strategy recommendations for CloudFront/CDN
- Performance optimization suggestions
- Saves report to `build-analysis.json`

**AWS deployment**: `./deploy-to-aws.sh` handles S3 upload and CloudFront invalidation

## Documentation

Full documentation is available via Docsify:
- Online: https://interface-149017.gitlab.io/#/
- Local: `npm run docs` → http://localhost:4000
- Source: `src/docs/` (markdown files)

Key documentation sections:
- Core System: Configuration, error handling, i18n, performance monitoring
- Kiosk Architecture: State management, event system, UI components
- Remote Architecture: Connection flow, messaging, mobile UI

## Troubleshooting

**Start button disabled**: Backend WebSocket server not running on configured port

**Config file not found**: Run `npm run setup` or manually copy `config.sample.yaml` to `config.yaml`

**UneeQ script fails to load**: Check persona CDN URL in config.yaml for selected language/renderMode

**WebSocket connection refused**: Verify backend service is running and endpoint matches config.yaml

**Node version errors**: Upgrade to Node.js v20+
