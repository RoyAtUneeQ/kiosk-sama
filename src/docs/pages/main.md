<a id="initial" name="initial"></a>
<br/>
# Uneeq Demo App - Frontend

<div style="text-align: center;">
  <img src="../assets/images/logo-description.png" alt="Uneeq Demo App - Frontend Logo" style="max-width: 300px;"/>
</div>

## Overview

The **Uneeq Demo App Frontend** is a sophisticated **React + TypeScript** application designed to showcase the full capabilities of the **Uneeq digital human platform**. It provides both kiosk and remote control interfaces for creating immersive, interactive experiences with AI-powered digital humans.

This application serves as a demonstration platform for businesses, developers, and organizations looking to integrate digital human technology into their customer-facing applications, training systems, or interactive displays.


## Architecture Overview

The application follows a modern React architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph "Frontend Application"
        A[App Root] --> B[Kiosk Interface]
        A --> C[Remote Interface]
        A --> D[Configuration System]
        A --> E[i18n System]
        
        B --> F[Uneeq Container]
        B --> G[Audio Controls]
        B --> H[Media Display]
        B --> I[WebSocket Client]
        
        C --> I
        C --> J[Chat Interface]
        C --> K[Remote Controls]
    end
    
    subgraph "External Services"
        L[Uneeq Digital Human API]
        M[Deepgram Speech API]
        N[Pixabay Media API]
        O[WebSocket Server]
    end
    
    subgraph "Data Flow"
        F --> L
        G --> M
        H --> N
        I --> O
        
        L --> P[AI/LLM Backend]
        O --> Q[Session Management]
    end
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style L fill:#fff3e0
    style P fill:#e8f5e8
```
