# Generic Kiosk - Frontend

Digital human kiosk experience with remote mobile control capabilities. Users interact with an AI-powered avatar (Uneeq) on the main kiosk display, while remote users can connect via mobile devices to send messages and control the conversation.

## 📖 Documentation

**Complete documentation is available at:**
- **[View Online Documentation](https://interface-149017.gitlab.io/#/)** - Complete online documentation
- **[Quick Start Guide](https://interface-149017.gitlab.io/#/pages/main)** - System overview and architecture

### Key Features

- **🤖 Digital Human Avatar** - AI-powered conversations using Uneeq SDK
- **📱 Remote Control** - Mobile interface for remote interaction
- **🎤 Voice Input** - Real-time speech-to-text via Deepgram
- **🔄 Auto-Discovery** - Extensible triggers and event listeners
- **⚡ Real-time Communication** - WebSocket-based messaging
- **🎯 Centralized State** - Zustand-based shared state management

### Architecture

- **Frontend Framework**: React + TypeScript
- **State Management**: Zustand with shared interaction states
- **Real-time Communication**: WebSocket with auto-reconnection
- **Speech Recognition**: Deepgram streaming API
- **Build Tool**: Vite

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📚 Documentation Structure

- **[Core System](https://interface-149017.gitlab.io/#/pages/main)** - Foundation and configuration
  - [Performance & Monitoring](https://interface-149017.gitlab.io/#/pages/core/performance-monitoring) - Development metrics and optimization
  - [Configuration System](https://interface-149017.gitlab.io/#/pages/core/configuration) - Application and persona configuration
  - [Error Boundary](https://interface-149017.gitlab.io/#/pages/core/error-boundary) - Error handling and recovery
  - [Language Support](https://interface-149017.gitlab.io/#/pages/core/language-support) - Multi-language and internationalization
- **[Kiosk (Main Display)](https://interface-149017.gitlab.io/#/pages/kiosk/overview)** - Primary interface architecture
  - [State Management](https://interface-149017.gitlab.io/#/pages/kiosk/states) - Session lifecycle and state flows
  - [Event System](https://interface-149017.gitlab.io/#/pages/kiosk/events) - UneeQ and WebSocket event handling
  - [UI Architecture](https://interface-149017.gitlab.io/#/pages/kiosk/ui) - Component composition and rendering
- **[Remote (Mobile Interface)](https://interface-149017.gitlab.io/#/pages/remote/overview)** - Mobile control interface
  - [Connection Flow](https://interface-149017.gitlab.io/#/pages/remote/connection) - Device pairing and WebSocket setup
  - [Message System](https://interface-149017.gitlab.io/#/pages/remote/messaging) - Text and voice communication
  - [UI Architecture](https://interface-149017.gitlab.io/#/pages/remote/ui) - Mobile-first responsive design

## 🏗️ Development

The codebase follows **simple, standardized, and extensible** patterns:

- **Auto-Discovery**: Triggers and event listeners are automatically registered
- **Shared State**: UI interaction states managed centrally
- **Type Safety**: TypeScript with enums for better type checking
- **Modular Components**: Self-contained, reusable components

For detailed implementation guides and architectural decisions, see the comprehensive documentation linked above.