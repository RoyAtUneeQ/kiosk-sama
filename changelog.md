# Changelog

All notable changes to the Generic Kiosk Frontend project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.0] - 2025-01-16

### ✨ Features
- **Memory System**: Lightweight key-value store for component data sharing
  - **setMemory Action**: Store data in session state for cross-component access
  - **Decoupled Architecture**: Pass references instead of complex data through speech events
  - **Performance Benefits**: Avoid redundant API calls between triggers and listeners
  - **Type-Safe Storage**: Memory interface with flexible key-value structure

- **Pixabay Image Service**: External image fetching with comprehensive filtering
  - **HD Image Support**: Full HD, 4K quality levels with aspect ratio filtering
  - **Category-Based Search**: Nature, places, animals, and more predefined categories
  - **Smart Filtering**: Landscape, portrait, square format options
  - **Type-Safe API**: Complete TypeScript interfaces for Pixabay responses
  - **Error Handling**: Robust HTTP client with proper error management

- **Image Trigger**: Landscape story generation with beautiful imagery
  - **Pixabay Integration**: Fetches HD landscape images for visual storytelling
  - **Memory Storage**: Stores image URLs for retrieval by MediaCustomListener
  - **Context-Aware Stories**: Incorporates image metadata and tags into narratives
  - **Auto-Discovery**: Seamlessly integrates with LeftSideBar trigger system
  - **Intelligent Camera**: Optimized positioning for storytelling experience

### 🚨 BREAKING CHANGES
- **Media State Refactoring**: Replaced separate `imageUrl`/`videoUrl` state with unified `media` object
  - **Removed Actions**: `setImageUrl()`, `setVideoUrl()` no longer available
  - **New Action**: Use `setMedia(mediaObject)` with Media interface
  - **Component Updates**: MediaContainer now uses spread operator `{...state.media}`
  - **Type Safety**: All media handling now uses consistent Media interface

### 🔧 Refactoring
- **Session Context Enhancement**: Added config integration to session state
- **Event System Updates**: Updated listeners for new memory and media systems
- **Type System Improvements**: Enhanced type safety across event listeners and triggers
- **Component Integration**: Updated components to use unified media state management

### 📝 Documentation
- **Memory System Guide**: Comprehensive documentation with practical examples
- **Implementation Patterns**: Trigger to listener data passing strategies
- **Performance Guidelines**: When and how to use memory vs direct parameters
- **API Reference**: Complete interface documentation and usage examples

---

## [1.3.0] - 2025-01-16

### ✨ Features
- **Enhanced MediaContainer Component**: Complete UI/UX overhaul for media display
  - **Visual Polish**: Added frosted glass backdrop filter, semi-transparent borders, and depth shadows
  - **Loading States**: Implemented animated spinner with smooth fade transitions
  - **Smart Positioning**: Centered vertically with consistent margins on all sides
  - **Smooth Transitions**: Added fade in/out animations when switching between media items
  - **Interactive Feedback**: Subtle hover animations for better user engagement
  - **Responsive Design**: Device-specific optimizations (desktop, tablet, holobox)
  - **Enhanced Layout**: Proper aspect ratios (4:3 for images, 16:9 for videos)
  - **Performance**: Optimized media loading with key-based remounting

### 📝 Documentation
- **Updated UI Documentation**: Comprehensive MediaContainer documentation with enhanced features
- **Fixed Usage Examples**: Corrected prop interface examples to match actual implementation
- **Improved API Reference**: Added detailed props interface and styling architecture documentation

---

## [1.2.0] - 2025-01-15

### ✨ Features
- **Enhanced Trigger System**: Completely redesigned trigger architecture with new implementations
  - **ActionTrigger**: Random action generation with intelligent camera positioning
  - **EmotionTrigger**: Emotion-based interactions for more engaging experiences  
  - **ZoomIn/ZoomOut Triggers**: Camera zoom controls for dynamic visual experiences
  - **Improved Integration**: Enhanced service layer and component integration
  - **Better Architecture**: Renamed methods for clearer semantics (generate → execute)

### 🔧 Refactoring  
- **Trigger Interface**: Updated method naming from 'generate' to 'execute' for better clarity
- **Legacy Cleanup**: Removed deprecated CinematicsTrigger and RandomStoryTrigger classes
- **Service Enhancement**: Updated DynamicIconLoaderService and useUneeq hook for new trigger system
- **Component Updates**: Improved LeftSideBar integration with enhanced trigger capabilities

---

## [1.1.0] - 2025-01-15

### ✨ Features
- **Generic SettingsPanel Component**: Created reusable settings panel with modern floating UI design
  - **Modern Design**: Minimal 3-dot trigger instead of gear icon with glassmorphism effects
  - **Industry Standards**: Positioned in top-right following UX conventions (Gmail, Slack, VS Code)
  - **Smooth Animations**: Professional slide transitions and micro-interactions
  - **Accessibility**: Full keyboard navigation and screen reader support
  - **Responsive**: Optimized for mobile and tablet with touch-friendly targets
  - **Configurable**: Flexible settings options with callback support

- **Generic StatusPanel Component**: Created reusable status display component
  - **Multiple Status Types**: Support for ready, not-ready, warning, and info states
  - **Color-coded Indicators**: Green, red, orange, and blue status visualization
  - **Interactive Links**: Clickable status items with external navigation
  - **Layout Options**: Horizontal and vertical orientation support
  - **Mobile Optimized**: Responsive behavior with mobile-specific hiding
  - **TypeScript**: Full type safety with proper error handling

- **Component Architecture**: Both components exported from @components/ with TypeScript interfaces
- **Internationalization**: Added settings panel translations for English, Spanish, and French

### 🔧 Refactoring
- **KioskStartForm Modernization**: Replaced inline implementations with reusable components
  - **Code Reduction**: Removed ~130+ lines of duplicate code
  - **Improved UX**: Settings panel now follows industry standard positioning
  - **Better Maintainability**: Centralized component logic and styling
  - **Enhanced Consistency**: Uniform UI/UX across the application

### 🎯 Benefits
- **Reusability**: Settings and status panels can now be used throughout the application
- **Professional UI**: Modern design patterns matching premium applications
- **Better Performance**: Optimized animations and responsive behavior
- **Developer Experience**: Clean, typed interfaces for easy integration
- **User Experience**: Improved visual hierarchy and interaction patterns

---

## [1.0.4] - 2025-01-15

### 📖 Documentation
- **Documentation Architecture Restructure**: Reorganized documentation into hierarchical Core/Kiosk/Remote sections
  - **Core Section**: Created new core/ directory with system fundamentals
  - **File Organization**: Moved error-boundary.md and performance-monitoring.md to core/
  - **New Core Documentation**: Added comprehensive guides for configuration system and language support
  - **Updated Navigation**: Restructured sidebar to reflect logical grouping and improved discoverability
  - **Enhanced Code Highlighting**: Added YAML syntax highlighting support for configuration examples

### ✨ Features  
- **Improved Documentation Structure**: Developers can now easily locate system core concepts, kiosk functionality, and remote features
- **Better Developer Experience**: Clear separation between foundational concepts and feature-specific implementation details

### 🎯 Benefits
- **Enhanced Maintainability**: Logical organization makes documentation easier to update and expand
- **Improved Onboarding**: New developers can follow a clear path from core concepts to specific features
- **Better Code Highlighting**: YAML configuration examples now display with proper syntax highlighting

---

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
