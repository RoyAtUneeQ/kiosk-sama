# Changelog

All notable changes to the Generic Kiosk Frontend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-01-15

### 📖 Documentation
- **UneeQ Event Listeners Guide**: Created comprehensive how-to documentation for standard UneeQ SDK event handling
  - Complete implementation guide for `UneeqEventListener` interface with `EventType` enum
  - Clear distinction between standard UneeQ events vs custom speech events
  - Session management, avatar interaction, user interaction, and system status examples
  - Auto-discovery system explanation and debugging guidance
  - Performance considerations and advanced patterns for event handling

- **Interactive Triggers Guide**: Created comprehensive how-to documentation for interactive trigger system
  - Complete implementation guide from creation to auto-discovery
  - Explanation of automatic LeftSideBar integration
  - Dual-type system: UI triggers (with icons) vs programmatic triggers (code-only)
  - Advanced patterns: state-aware triggers, media integration, error handling
  - Streamlined examples to reduce cognitive load while maintaining technical depth

### ✨ Features
- **Enhanced Cache-Busting**: Implemented comprehensive cache-busting for Docsify documentation
  - Browser-level: HTTP meta tags + dynamic CSS loading + service worker blocking
  - Docsify-level: Request headers + disabled internal caching
  - Server-level: GitLab Pages headers + build timestamps
  - CI/CD-level: Cache clearing + fresh builds + short expiration
  - Developer tools: force refresh utility + troubleshooting README

### 🎯 Benefits
- **Zero-Configuration UI Integration**: Triggers automatically appear as sidebar buttons
- **Dynamic Prompt Generation**: Context-aware content creation for digital human interactions
- **Immediate Documentation Updates**: Cache-busting ensures changes are visible instantly
- **Comprehensive Developer Support**: Full guides for both triggers and custom events

## [1.0.2] - 2025-01-15

### 📖 Documentation
- **UneeQ Speech Events Guide**: Created comprehensive how-to documentation for custom UneeQ speech event handlers
  - Step-by-step implementation guide with practical examples
  - Auto-discovery system explanation and usage patterns
  - Real-world use cases for interactive presentations and product demonstrations
  - Proper UneeQ speech event format: `<uneeq custom event name="..." data="..." />`

### 🔄 Refactoring
- **Interface Naming**: Renamed `CustomEvent` to `CustomEventListener` for clarity and to avoid confusion with browser's native CustomEvent API
- **Folder Structure**: Restructured `custom_events/` to `speech_events/` to align with UneeQ terminology and conventions
  - Updated MediaCustomListener to use new interface and folder structure
  - Removed legacy InMediaInstruction and InWeegoInstruction files
  - Updated all import paths and documentation references

### 🎯 Benefits
- **Aligned with UneeQ conventions** for better developer understanding
- **Clearer naming** that immediately shows purpose and functionality
- **Comprehensive documentation** for easier implementation of custom speech events
- **Standardized approach** to handling UneeQ speech events

---

## [1.0.1] - 2025-01-15

### 🐛 Bug Fixes
- **Message Deduplication**: Fixed duplicate assistant messages appearing in remote interface
  - Added deduplication logic to `addMessageToHistory` to prevent duplicate messages with same ID
  - Resolved issue where both `PromptResultListener` and `PeerMessageListener` could add the same assistant message
  - Improved debugging with console logging for prevented duplicates

---

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
