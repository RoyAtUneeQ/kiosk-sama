## Architecture

This application is a React + Vite frontend that embeds a Uneeq Digital Human session and coordinates state via a compact, explicit context. A WebSocket connects a “remote” controller to the kiosk.

### System overview
```mermaid
flowchart LR
  subgraph Remote[Remote Page]
    RP[Chat UI]
  end
  subgraph Kiosk[Kiosk App]
    KP[KioskPage]
    UI[UI Components]
    Ctx[SessionContext]
    HK[Hooks: useUneeq,useUneeqEvents,useWebSocket]
  end
  subgraph Uneeq[Uneeq SDK]
    SDK[Hosted Experience iFrame]
  end
  subgraph WS[Backend WebSocket]
    WSS[(WebSocket Server)]
  end

  RP -- peerMessage --> WSS
  WSS -- connectionId/RegisterRemote/peerMessage --> KP
  KP <--> Ctx
  KP --> HK
  HK --> SDK
  SDK -- events --> HK
  HK --> Ctx
  Ctx --> UI
```

### Key concepts
- **Session store**: `SessionContext` is the single session source of truth (status, Uneeq instance, event queue, media, remote pairing, language, outgoing instruction).
- **Uneeq integration**: `useUneeq` loads the script from config, enforces a singleton (via `window.uneeqSessionKey`), and wires a global `UneeqMessage` handler; `useUneeqEvents` consumes the SDK event stream through an explicit queue with back‑pressure.
- **Remote bridge**: `useWebSocket` handles pairing, connectivity checks, and message passing between remote and kiosk.
- **Instructions**: Incoming and outgoing “instructions” encode domain intent, decoupling UI from SDK speech‑event tags and from prompt text.

### Data flow (prompt lifecycle)
```mermaid
sequenceDiagram
  participant Remote as Remote Page
  participant WS as WebSocket Server
  participant Kiosk as KioskPage + SessionContext
  participant Uneeq as Uneeq SDK

  Remote->>WS: peerMessage(text)
  WS-->>Kiosk: peerMessage payload
  Kiosk->>Kiosk: setOutgoingInstruction(UserInstruction)
  Kiosk->>Uneeq: chatPrompt(instruction.generate())
  Uneeq-->>Kiosk: PromptResult event
  Kiosk->>WS: sendAction(sendMessage to remote)
```

### Why this design
- **Determinism over cleverness**: an explicit queue prevents dropped or re‑ordered Uneeq events and avoids re‑entrancy pitfalls.
- **Controlled external dependency**: the Uneeq SDK is loaded once and owned by the app to avoid HMR/mount churn.
- **Feature isolation**: instructions and hooks isolate integrations from the views; UI can evolve without touching protocol glue.