<a id="initial"></a>
## Generic Kiosk — Frontend Documentation

This application provides a digital human kiosk experience with remote mobile control capabilities. Users interact with an AI-powered avatar (Uneeq) on the main kiosk display, while remote users can connect via mobile devices to send messages and control the conversation.

### System Architecture

```mermaid
graph TB
    subgraph "Frontend Applications"
        Kiosk[Kiosk Display<br/>Large screen interface]
        Remote[Remote Controller<br/>Mobile web interface]
    end
    
    subgraph "External Services"
        UneeqSDK[Uneeq Digital Human SDK<br/>Avatar rendering & AI]
        Backend[Backend Services<br/>WebSocket + HTTP APIs]
    end
    
    Kiosk <--> UneeqSDK
    Kiosk <--> Backend
    Remote <--> Backend
    
    Backend --> UneeqSDK
```

The system consists of:

- **Kiosk**: Main display showing the digital human avatar and UI controls
- **Remote**: Mobile interface for remote users to interact with the kiosk
- **Backend**: Manages WebSocket connections, peer-to-peer messaging, and service tokens
- **Uneeq SDK**: Third-party service providing the digital human avatar and AI capabilities

### Documentation Sections

#### Kiosk (Main Display Interface)
- **[Overview](pages/kiosk/overview.md)** - System context and relationships
- **[State Management](pages/kiosk/states.md)** - Session lifecycle and state transitions  
- **[Event System](pages/kiosk/events.md)** - How Uneeq and WebSocket events are processed
- **[UI Architecture](pages/kiosk/ui.md)** - Component composition and rendering logic

#### Remote (Mobile Interface)
- **[Overview](pages/remote/overview.md)** - Mobile interface architecture and design
- **[Connection Flow](pages/remote/connection.md)** - Device pairing and WebSocket setup
- **[Message System](pages/remote/messaging.md)** - Text and voice communication handling
- **[UI Architecture](pages/remote/ui.md)** - Mobile-first responsive design patterns

### Key Technologies
- **React + TypeScript** - UI framework and type safety
- **Zustand** - Centralized state management with shared interaction states
- **WebSocket** - Real-time communication with backend
- **Uneeq SDK** - Digital human avatar integration
- **Vite** - Build tool and development server


