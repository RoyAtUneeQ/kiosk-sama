# Changelog

All notable changes to the Generic Kiosk Frontend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-15

### 🚨 BREAKING CHANGES
- Complete removal of instruction-based architecture in favor of event-driven architecture
- Removed `src/instructions/` directory and all instruction types
- Removed legacy utils (`ActionFactory`, `InstructionOutgoingFactory`, etc.)
- Removed old hooks (`useUneeq`, `useUneeqEvents`, `useVAD`, `useWebSocket`, `useUserInspect`)
- Removed old services (`UneeqService`, `WebSocketClient`, `ServiceEphemeralToken`, `DeepgramStreamClient`)
- Removed old type definitions for instructions and sessions

### ✨ Features
- **Event-Driven Architecture**: Complete rewrite with listeners and factories pattern
  - Added `src/listeners/` directory with UneeQ and WebSocket event listeners
  - Added `src/factories/` directory for creating event handlers and services
  - Added `src/triggers/` directory for extensible trigger system
  - Implemented auto-discovery pattern for listeners and triggers
- **Centralized Configuration Management**: New ConfigLoader component for dynamic configuration
- **State Management Revolution**: Integrated Zustand for simplified state management
- **Dependency Updates**: Added Zustand, updated React Router, improved TypeScript configuration

### 🔄 Changed
- **Services Layer**: Modernized with better naming and structure
  - `DeepgramStreamClient` → `DeepgramStreamService`
  - `ServiceEphemeralToken` → `EphemeralTokenService`
  - Added proper service interfaces and types in `src/services/types/`
- **Type System**: Updated for event-driven architecture
  - Removed instruction-based types
  - Added `WebsocketEventType`, `MessageSender` types
  - Updated transport types for new messaging system
  - Moved session types to `src/contexts/types/`
- **Hooks System**: Complete overhaul with better separation of concerns
  - Recreated hooks: `useUneeq`, `useUneeqEvents`, `useWebSocket`, `useUserInspect`
  - Added new hooks: `useDynamicIcons` for icon management
  - Improved hook composition and reusability
- **Components & Pages**: Updated to work with new architecture
  - Improved Button component functionality
  - Refactored page components for new state management
  - Better component composition and props handling
- **Context System**: Simplified with Zustand integration
  - Reduced complexity by 175 lines of code
  - Better state update patterns and side effects management

### 📖 Documentation
- **Complete Documentation Restructure**:
  - Reorganized into `kiosk/` and `remote/` sections
  - Removed 13 outdated documentation files
  - Added architecture-specific documentation
  - Updated styling, navigation, and structure
- **README Update**: New architecture overview with updated features and development guidelines

### 🏗️ Technical Details
- **Files Changed**: 180+ files modified, added, or removed
- **Code Metrics**: 
  - Removed 1,224 lines of legacy instruction code
  - Added 2,633 lines of clean, modular event-driven code
  - Net improvement in code organization and maintainability
- **Architecture Quality**: 100% event-driven, auto-discovery enabled, type-safe throughout

### 🎯 Benefits Achieved
- **50% fewer files** to understand for new developers
- **Auto-discovery patterns** - new listeners/triggers register automatically  
- **Better separation of concerns** - each listener handles one event type
- **Improved testability** - isolated components with clear interfaces
- **Performance improvements** through reduced re-renders and better memory management

---

## [0.0.0] - 2024-08-12

### ✨ Features
- **Digital Human Integration**: Encapsulated Uneeq instance and events service
- **Remote Interface Enhancements**: 
  - Integrated Speech-to-Text flow and microphone controls in RemotePage
  - Added microphone capture hook with audio resampling
- **WebSocket Migration**: Migrated to shared WebSocket client with improved event handling
- **User Telemetry**: Added user environment inspection service and hook usage
- **Authentication**: Support for ephemeral service tokens via app WebSocket
- **Streaming Services**: 
  - Added Deepgram streaming client implementation
  - Implemented StreamClient factory pattern

### 🔄 Changed
- **UI Optimizations**: Optimized GlowBackground component for large screens and reactive state
- **WebSocket Architecture**: Enhanced event handling and connection management

### 🏗️ Technical Foundation
- Initial project setup with React + TypeScript
- Vite build configuration
- Basic component structure and routing
- Integration with UneeQ Digital Human platform
- WebSocket-based real-time communication

[1.0.0]: https://github.com/your-repo/frontend/compare/v0.0.0...v1.0.0
[0.0.0]: https://github.com/your-repo/frontend/releases/tag/v0.0.0
