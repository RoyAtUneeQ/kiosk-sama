## Remote — UI Architecture

The Remote interface is designed as a mobile-first chat application that adapts to different screen sizes and connection states. It uses a layered component architecture with responsive design principles and real-time visual feedback for an optimal mobile user experience.

### Component Hierarchy

```mermaid
graph TB
    subgraph "Application Shell"
        RemotePage[📱 RemotePage<br/>Main orchestrator]
    end
    
    subgraph "Background Layer"
        GlowBackground[✨ GlowBackground<br/>Reactive visual effects]
    end
    
    subgraph "Chat Interface"
        RemoteHeader[📋 RemoteHeader<br/>Connection status & info]
        MessageList[💬 MessageList<br/>Chat history with thinking indicators]
        Suggestions[💡 Suggestions<br/>Quick action cards]
        ChatInput[⌨️ ChatInput<br/>Text + voice input with mic control]
        MicrophoneControl[🎤 MicrophoneControl<br/>Advanced microphone status control]
    end
    
    subgraph "Shared Components"
        ThinkingIndicator[🧠 ThinkingIndicator<br/>AI processing visualization]
        MessageBubble[💭 MessageBubble<br/>Enhanced text animations]
        FeedbackLine[📊 FeedbackLine<br/>Audio visualization]
        Button[🔘 Button<br/>Interactive elements]
        ErrorBoundary[🛡️ ErrorBoundary<br/>Error containment & fallback UI]
        LoadingFallback[⏳ LoadingFallback<br/>Consistent loading states]
    end
    
    RemotePage --> GlowBackground
    RemotePage --> RemoteHeader
    RemotePage --> MessageList
    RemotePage --> Suggestions
    RemotePage --> ChatInput
    
    ChatInput --> MicrophoneControl
    ChatInput --> FeedbackLine
    MessageList --> ThinkingIndicator
    MessageList --> MessageBubble
    Suggestions --> Button
```

### Connection-Driven UI States

The interface adapts based on connection status and kiosk availability:

```mermaid
graph LR
    subgraph "No Kiosk ID"
        ErrorUI[Error Message<br/>• No functionality<br/>• Static display]
    end
    
    subgraph "Disconnected State"
        DisconnectedUI[Limited UI<br/>• Header with status<br/>• Disabled inputs<br/>• Connection indicator]
    end
    
    subgraph "Connected State"
        ConnectedUI[Full Interface<br/>• Active header<br/>• Message history<br/>• Text input enabled<br/>• Suggestions visible]
    end
    
    subgraph "Voice Active State"
        VoiceUI[Enhanced Interface<br/>• All connected features<br/>• Voice input active<br/>• Audio visualizations<br/>• Listening feedback]
    end
    
    ErrorUI -->|Valid kiosk ID| DisconnectedUI
    DisconnectedUI -->|WebSocket connected| ConnectedUI
    ConnectedUI -->|STT ready + mic active| VoiceUI
    VoiceUI -->|Mic deactivated| ConnectedUI
```

### Layout Architecture

#### Mobile-First Responsive Design
```scss
// From RemotePage.scss - Mobile-optimized container
.chat-container {
    display: flex;
    flex-direction: column;
    height: 100vh;              // Full viewport height
    width: 100%;
    position: relative;
    overflow: hidden;
    background: #0d0d0d;        // Dark theme
    color: #e4e4e4;
}

.chat-content {
    position: relative;
    z-index: 1;                 // Above background effects
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 100vh;          // Prevent content shrinking
}
```

#### Layered Z-Index System
- **Background Layer** (z-index: 0): `GlowBackground` with reactive animations
- **Content Layer** (z-index: 1): Main chat interface components
- **Overlay Layer** (z-index: 5): Listening feedback and modal states

### Component Implementation Details

#### RemotePage (Main Orchestrator)
**Location**: `src/pages/remote/RemotePage.tsx`

**Responsibilities**:
- Manages WebSocket connection and STT service lifecycle
- Handles local state for messages, input, and microphone status
- Orchestrates component rendering based on connection state
- Processes peer messages from shared session state

**Key State Management**:
```typescript
// Local UI-specific state only
const [inputText, setInputText] = useState(''); // Input field content

// Shared session state for all interaction state
const { state, actions } = useSession();
const { websocket } = useWebSocket({ webSocketUrl: BackendHostUrlFactory.getWebSocketUrl(config) });

// Shared states accessed:
// - state.history: Message[]             // Complete message history
// - state.awaitingPromptResponse: boolean // AI processing indicator
// - state.microphoneStatus: MicrophoneStatus // Microphone permission & status
// - state.showSuggestions: boolean       // Show suggestion cards
// - state.webSocketState                 // Connection status

// Voice service integration
const { isProcessing, status, toggleMicrophone } = useSpeechServices();
```

**Conditional Rendering Logic**:
```typescript
return (
    <div className="chat-container">
        {!hasKioskId ? (
            <div className="chat-content">
                <div style={{ padding: '1rem' }}>No kiosk connection ID</div>
            </div>
        ) : (
            <>
                <GlowBackground 
                    isLargeScreen={isLargeScreen}
                    reactiveActive={state.micActive}
                    dimOpacity={0.65}
                />
                <div className="chat-content">
                    <RemoteHeader 
                        title="Thoughts Bridge" 
                        webSocketState={state.webSocketState}
                        kioskConnectionId={kioskConnectionId}
                        connectionId={state.connectionId}
                    />
                    <MessageList messages={state.history} />
                    {state.webSocketState === WebsocketStatus.CONNECTED && state.showSuggestions && (
                        <Suggestions 
                            items={suggestions} 
                            onSelect={(text) => sendText(text)}
                            disabled={state.awaitingPromptResponse}
                            onClose={() => actions.setShowSuggestions(false)}
                        />
                    )}
                    <ChatInput
                        disabled={state.webSocketState !== WebsocketStatus.CONNECTED}
                    />
                </div>
            </>
        )}
    </div>
);
```

#### RemoteHeader (Connection Status)
**Location**: `src/pages/remote/components/RemoteHeader/`

**Features**:
- Displays application title with animated text effect
- Connection status indicator with color-coded states
- Tooltip showing detailed connection information
- Responsive design for different screen sizes

**Connection Status Display**:
```typescript
interface RemoteHeaderProps {
    title: string;                      // Application title
    webSocketState: WebsocketStatus;    // Connection state indicator
    kioskConnectionId?: string | null;  // Target kiosk identifier
    connectionId?: string | null;       // This remote's identifier
}

// Status indicator with dynamic styling
<span className={`value ${webSocketState.toLowerCase()}`}>
    {webSocketState}
</span>
```

#### MessageList (Chat History)
**Location**: `src/pages/remote/components/MessageList/`

**Features**:
- Scrollable message history with auto-scroll to latest
- Distinct styling for user vs assistant messages
- Typing indicator with animated dots
- Timestamp display for each message

**Enhanced Message Rendering**:
```typescript
{messageGroups.map(group => (
    <MessageBubble
        key={group.id}
        content={group.content}
        sender={group.sender}
        timestamp={group.lastTimestamp}
        shouldAnimate={group.shouldAnimate}
        onAnimationStart={() => setShowThinkingIndicator(false)}
    />
))}
```

**AI Processing Indicator**:
```typescript
{showThinkingIndicator && (
    <div className="thinking-container">
        <ThinkingIndicator />
    </div>
)}
```

#### ThinkingIndicator (AI Processing Visualization)
**Location**: `src/components/thinkingIndicator/`

**Features**:
- Animated gradient waves and dots for AI processing visualization
- Smooth animations optimized for mobile performance
- Automatic show/hide integration with message animation lifecycle
- Modern visual design with accessibility considerations

**Implementation**:
```typescript
export const ThinkingIndicator: React.FC = () => {
    return (
        <div className="thinking-indicator">
            <div className="gradient-flow">
                <div className="gradient-wave gradient-wave-1"></div>
                <div className="gradient-wave gradient-wave-2"></div>
                <div className="gradient-wave gradient-wave-3"></div>
            </div>
            <div className="thinking-dots">
                <div className="dot dot-1"></div>
                <div className="dot dot-2"></div>
                <div className="dot dot-3"></div>
            </div>
        </div>
    );
};
```

#### Enhanced MessageBubble Component
**Location**: `src/components/messageBubble/`

**New Features**:
- Enhanced text animations with gradient effects during typing
- Character-by-character rendering with color transitions  
- Smooth animation lifecycle management
- Integration with ThinkingIndicator for seamless AI processing feedback

#### ChatInput (Text + Voice Input)
**Location**: `src/pages/remote/components/ChatInput/`

**Features**:
- Text input with Enter key submission
- Integrated MicrophoneControl component
- Send button with disabled state handling
- Visual feedback line for audio input
- MessageFactory integration for consistent message creation

**Updated Implementation**:
```typescript
interface ChatInputProps {
    disabled?: boolean;
}

// Simplified interface with service integration
const ChatInput: React.FC<ChatInputProps> = ({ disabled }) => {
    const { state, actions } = useSession();
    const [inputText, setInputText] = useState('');

    const handleSendText = useCallback(() => {
        const trimmed = inputText.trim();
        if (!trimmed || disabled) return;
        
        setInputText('');
        actions.addMessageToHistory(
            MessageFactory.createUserMessage(trimmed)
        );
    }, [inputText, disabled, actions]);

    return (
        <>
            <FeedbackLine listening={state.microphoneStatus === MicrophoneStatus.LISTENING} />
            <div className="input-container">
                <input ... />
                <MicrophoneControl disabled={disabled} />
                <button onClick={handleSendText}>Send</button>
            </div>
        </>
    );
};
```

#### MicrophoneControl (Advanced Microphone Management)
**Location**: `src/pages/remote/components/MicrophoneControl/`

**Features**:
- Status-aware microphone control with service integration
- Automatic permission handling and visual feedback
- Processing animations during speech recognition
- ARIA support for accessibility
- Seamless integration with useSpeechServices hook

**Service Integration**:
```typescript
const MicrophoneControl: React.FC<MicrophoneControlProps> = ({ disabled = false }) => {
    const { isProcessing, status, toggleMicrophone } = useSpeechServices();

    return (
        <button
            type="button"
            onClick={toggleMicrophone}
            className={`microphone-control ${status?.className}`}
            aria-label={status?.label}
            title={status?.title}
            disabled={disabled}
        >
            <span className={`mic-icon ${isProcessing ? 'processing-animation' : ''}`}>
                {status.icon}
            </span>
        </button>
    );
};
```

#### Suggestions (Quick Actions)
**Location**: `src/pages/remote/components/Suggestions/`

**Features**:
- Grid layout of suggestion cards with icons
- Fade-out animation when selected
- Close button to hide suggestions
- Disabled state during typing/processing

**Suggestion Card Structure**:
```typescript
interface SuggestionItem {
    label: string;                              // Display text
    text: string;                              // Message to send
    Icon: React.ComponentType<{ size?: number }>; // Feather icon
}

// Predefined suggestions
const suggestions = [
    { label: 'Unique and Fun Birthday Surprise Ideas', text: 'Unique and Fun Birthday Surprise Ideas', Icon: FiFeather },
    { label: 'Create an image', text: 'Please create an image of a sunny beach at golden hour', Icon: FiImage },
    { label: 'How can you help me?', text: 'How can you help me?', Icon: FiHelpCircle },
    { label: 'End session', text: 'End session', Icon: FiPower },
];
```

### Visual Effects and Animations

#### GlowBackground (Reactive Background)
**Purpose**: Provides ambient visual effects that react to user interaction
**Features**:
- Particle system with reduced complexity on large screens
- Reactive intensity based on microphone activity
- Smooth opacity transitions
- Performance-optimized rendering

**Responsive Behavior**:
```typescript
// Viewport size detection for performance optimization
const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 0
);
const isLargeScreen = viewportWidth >= 1280; // Reduce complexity for large screens

<GlowBackground 
    isLargeScreen={isLargeScreen}
    reactiveActive={micActive}
    dimOpacity={0.65}
/>
```

#### Audio Visualization
**FeedbackLine Component**: Provides real-time visual feedback during voice input
- Animated waveform during listening
- Speaking state visualization
- Smooth transitions between states
- Configurable thickness and colors

#### Listening Overlay
**Purpose**: Full-screen feedback during voice input
**Features**:
```scss
.listening-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    z-index: 5;
    pointer-events: none;       // Allows interaction with underlying UI
}

.listening-bubble {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(8px) saturate(120%);
    animation: listeningPulse 1.8s ease-in-out infinite;
}
```

### Performance Optimizations

#### Efficient Re-rendering
- **Lazy Loading**: Pages load on-demand reducing initial bundle size
- **Memoized Services**: Token service and stream clients cached to prevent recreation
- **Conditional Rendering**: Components only render when needed based on state
- **Event Cleanup**: Proper cleanup of WebSocket, STT, and microphone resources

#### Memory Management
- **Message History**: Local state prevents memory leaks from global state
- **Audio Resources**: Proper disposal of AudioContext and MediaStream objects
- **Service Cleanup**: STT clients and WebSocket connections cleaned up on unmount

#### Mobile Performance
- **Reduced Animations**: Simplified effects on smaller screens
- **Touch Optimization**: Large touch targets for mobile interaction
- **Battery Efficiency**: Microphone and STT services only active when needed

#### Error Resilience
- **Error Boundaries**: Prevent component crashes from breaking the entire interface
- **Graceful Loading**: Consistent loading states with `LoadingFallback` component
- **Performance Monitoring**: Development-time metrics for optimization insights

### Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: ARIA labels and semantic HTML structure
- **High Contrast**: Dark theme with sufficient color contrast ratios
- **Touch Accessibility**: Minimum 44px touch targets for mobile devices
- **Voice Alternative**: Text input always available as fallback to voice

### Error State Handling

- **Connection Errors**: Clear status indicators and retry mechanisms
- **Input Validation**: Real-time feedback for invalid states
- **Graceful Degradation**: Features disable gracefully when services unavailable
- **User Feedback**: Toast notifications and status messages for important events

This architecture provides a robust, accessible, and performant mobile interface that scales across different devices and connection states while maintaining a smooth user experience.
