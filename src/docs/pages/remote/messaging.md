## Remote — Message System

The Remote messaging system enables real-time communication between mobile users and the Kiosk's digital human avatar. It supports both text input and voice transcription, with messages flowing through the backend to reach the avatar and responses returning to the mobile interface.

### Message Flow Architecture

```mermaid
graph TB
    subgraph "Remote Device"
        TextInput[📝 Text Input<br/>ChatInput component]
        VoiceInput[🎤 Voice Input<br/>MicrophoneControl + Services]
        MessageList[💬 Message Display<br/>Enhanced chat with ThinkingIndicator]
    end
    
    subgraph "Message Processing"
        MessageFactory[🏭 MessageFactory<br/>Consistent message creation]
        SessionState[📱 Session State<br/>Shared message history]
        WebSocket[🔌 WebSocket<br/>Real-time transport]
    end
    
    subgraph "Backend Routing"
        PeerMessage[📨 peerMessage Action<br/>Message forwarding]
        Backend[⚡ Backend Service<br/>Connection routing]
    end
    
    subgraph "Kiosk Integration"
        PeerListener[👂 PeerMessageListener<br/>Receives messages]
        Avatar[🤖 Digital Human<br/>Processes & responds]
    end
    
    TextInput --> MessageFactory
    VoiceInput --> MessageFactory
    MessageFactory --> SessionState
    SessionState --> WebSocket
    WebSocket --> PeerMessage
    PeerMessage --> Backend
    Backend --> PeerListener
    PeerListener --> Avatar
    Avatar --> Backend
    Backend --> WebSocket
    WebSocket --> MessageList
```

### Message Data Structure

Messages use a standardized interface defined in `src/types/transport/Message.ts`:

```typescript
import { MessageSender } from '@/types/transport/MessageSender';

interface Message {
    id: string;                    // Unique identifier (timestamp-based)
    content: string;               // Message content
    timestamp: Date | string;      // Creation time
    sender: MessageSender;         // Message origin (User, Assistant, System)
    prompt?: boolean;              // Optional flag indicating if message is a prompt
}
```

### Text Message Flow

#### Sending Messages
```mermaid
sequenceDiagram
    participant User as Mobile User
    participant ChatInput as ChatInput Component
    participant RemotePage as RemotePage
    participant WebSocket as WebSocket Service
    participant Backend as Backend
    participant Kiosk as Kiosk
    
    User->>ChatInput: Types message and presses Enter
    ChatInput->>RemotePage: onEnter() → sendText(inputText)
    RemotePage->>RemotePage: addMessage(text, 'user')
    RemotePage->>WebSocket: createActionFactory().sendMessage(kioskId, message)
    WebSocket->>Backend: peerMessage action
    Backend->>Kiosk: PEER_MESSAGE event
    Kiosk->>Kiosk: PeerMessageListener processes message
    
    Note over RemotePage: Message added to local state
    Note over Kiosk: Message sent to digital human avatar
```

#### Receiving Responses
```mermaid
sequenceDiagram
    participant Avatar as Digital Human
    participant Kiosk as Kiosk
    participant Backend as Backend  
    participant WebSocket as WebSocket Service
    participant RemotePage as RemotePage
    participant MessageList as MessageList
    
    Avatar->>Kiosk: Generates response
    Kiosk->>Backend: peerMessage with response
    Backend->>WebSocket: PEER_MESSAGE event
    WebSocket->>RemotePage: state.peerMessage updated
    RemotePage->>RemotePage: useEffect detects peerMessage change
    RemotePage->>RemotePage: addMessage(responseText, 'assistant')
    RemotePage->>MessageList: messages state updated
    
    Note over RemotePage: Response added to chat history
```

### Voice Message Flow with Speech-to-Text

The Remote app integrates Deepgram's real-time speech-to-text for hands-free messaging:

#### STT Service Architecture & Initialization
```mermaid
sequenceDiagram
    participant Hook as useSpeechServices
    participant PermService as MicrophonePermissionsService
    participant StreamService as MicrophoneStreamService  
    participant STTService as SpeechToTextService
    participant TokenService as EphemeralTokenService
    participant Deepgram as Deepgram API
    
    Hook->>PermService: new MicrophonePermissionsService()
    Hook->>StreamService: new MicrophoneStreamService()
    Hook->>TokenService: ensure('deepgram', 'stt')
    TokenService->>STTService: Ephemeral token
    Hook->>STTService: new SpeechToTextService(config)
    STTService->>Deepgram: createStreamClient(DEEPGRAM)
    STTService->>Hook: onReady() → service ready
    
    Note over Hook: All services orchestrated and ready
```

#### Voice Input Processing with Service Architecture
```mermaid
sequenceDiagram
    participant User as Mobile User
    participant MicControl as MicrophoneControl
    participant SpeechHook as useSpeechServices
    participant StreamService as MicrophoneStreamService
    participant STTService as SpeechToTextService
    participant MessageFactory as MessageFactory
    participant Actions as SessionActions
    
    User->>MicControl: Taps microphone button
    MicControl->>SpeechHook: toggleMicrophone()
    SpeechHook->>StreamService: start()
    StreamService->>StreamService: getUserMedia() → AudioContext + resampling
    StreamService->>STTService: sendAudio(audioChunk)
    STTService->>SpeechHook: onProcessingStart()
    STTService->>SpeechHook: onFinal(text)
    SpeechHook->>MessageFactory: createUserMessage(text)
    MessageFactory->>Actions: addMessageToHistory(message)
    
    Note over User: Speaks into microphone
    Note over SpeechHook: Service orchestration handles all complexity
```

### Message State Management

The Remote app uses a hybrid state approach combining local and shared state:

#### Enhanced Message State with MessageFactory
```typescript
// In RemotePage.tsx - Simplified with MessageFactory
const [inputText, setInputText] = useState(''); // Local UI input only

// Message creation using MessageFactory
const sendText = useCallback((text: string) => {
    const message = MessageFactory.createUserMessage(text);
    
    // Send to kiosk via WebSocket
    if (kioskConnectionId) {
        websocket?.send(createActionFactory().sendMessage(kioskConnectionId, message));
    }
    
    // Add to shared session state
    actions.addMessageToHistory(message);
}, [kioskConnectionId, websocket, actions]);

// Voice messages handled automatically by useSpeechServices
const { isProcessing, status, toggleMicrophone } = useSpeechServices();
```

#### Shared State Integration with Enhanced Voice Support
```typescript
// Centralized session state with voice capabilities
const { state, actions } = useSession();

// Key shared states for voice interaction:
// - state.history: Message[]                   // Complete message history
// - state.awaitingPromptResponse: boolean      // AI processing indicator
// - state.microphoneStatus: MicrophoneStatus   // Microphone permission & status
// - state.showSuggestions: boolean            // Show suggestion cards
// - state.webSocketState                       // Connection status

// Enhanced message display with thinking indicators
<MessageList messages={state.history} />

// Voice service integration provides complete microphone management
const { isProcessing, status, toggleMicrophone } = useSpeechServices();

// Simplified state management through centralized actions
actions.setMicrophoneStatus(MicrophoneStatus.LISTENING);
actions.setAwaitingPromptResponse(true);
actions.addMessageToHistory(MessageFactory.createUserMessage(text));
```

### Enhanced Speech-to-Text Service Architecture

The new service-based architecture provides comprehensive voice capabilities:

```typescript
// SpeechToTextService configuration
const sttService = new SpeechToTextService({
    apiBaseUrl: BackendHostUrlFactory.getHttpBaseUrl(state.config),
    apiKey: BackendHostUrlFactory.getApiKey(state.config),
    provider: 'deepgram',      // Service provider
    model: 'nova-3',          // Latest Deepgram model
    language: 'en-US',        // English US
    encoding: 'linear16',     // PCM format
    sampleRate: 16000,        // 16kHz audio
    channels: 1,              // Mono audio
    smartFormat: true,        // Auto punctuation/capitalization
    tokenTtl: 60,             // Token refresh interval
    
    // Service lifecycle callbacks
    onReady: () => console.log('STT service ready'),
    onProcessingStart: () => setIsProcessing(true),
    onProcessingEnd: () => setIsProcessing(false),
    onFinal: (text: string) => {
        console.log('STT final text:', text);
        actions.addMessageToHistory(MessageFactory.createUserMessage(text));
    },
    onError: (error: any) => console.error('STT service error:', error)
});

// Automatic service management
await sttService.start();
```

### Service Integration Benefits

**MicrophonePermissionsService**:
- Automatic permission requests and state tracking
- Graceful error handling for denied permissions
- User-friendly permission management UI

**MicrophoneStreamService**:
- Real-time audio capture with Web Audio API
- Automatic resampling to target sample rates
- Echo cancellation and noise suppression
- Proper resource cleanup and memory management

**SpeechToTextService**:
- Ephemeral token management with automatic refresh
- Streaming connection with Deepgram
- Error recovery and reconnection capabilities
- State management integration

### Audio Processing Pipeline

The microphone audio undergoes several processing steps:

```mermaid
graph LR
    Microphone[🎤 Device Microphone<br/>Various sample rates] --> 
    WebAudio[🔊 Web Audio API<br/>AudioContext] --> 
    Processor[⚙️ ScriptProcessorNode<br/>4096 buffer size] --> 
    Resample[📊 Downsample<br/>Target: 16kHz] --> 
    Stream[📡 Stream to Deepgram<br/>Real-time PCM]
```

#### Audio Resampling Process
```typescript
// From useMicStream.ts - Audio processing
processor.onaudioprocess = (event: AudioProcessingEvent) => {
    try {
        const input = event.inputBuffer.getChannelData(0);
        const resampled = downsampleToTarget(input, audioContext.sampleRate, targetSampleRate);
        if (resampled.length > 0) onAudio(resampled);
    } catch (e) {
        // Ignore transient errors during processing
    }
};
```

### Message UI Components

#### Typing Indicators
The system provides visual feedback during message processing:

```typescript
// In MessageList.tsx - Typing indicator
{isTyping && (
    <div className="message assistant-message">
        <div className="message-bubble typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
        </div>
    </div>
)}
```

#### Suggestion System
Quick action buttons help users start conversations:

```typescript
const suggestions = [
    { label: 'Unique and Fun Birthday Surprise Ideas', text: 'Unique and Fun Birthday Surprise Ideas', Icon: FiFeather },
    { label: 'Create an image', text: 'Please create an image of a sunny beach at golden hour', Icon: FiImage },
    { label: 'How can you help me?', text: 'How can you help me?', Icon: FiHelpCircle },
    { label: 'End session', text: 'End session', Icon: FiPower },
];
```

### Error Handling and Recovery

#### Message Delivery Failures
- **Network Issues**: Messages queued locally until connection restored
- **Invalid Kiosk ID**: Error logged, message not sent
- **Backend Errors**: Automatic retry with exponential backoff

#### Voice Input Failures  
- **Microphone Access Denied**: Fallback to text input only
- **STT Service Unavailable**: Microphone disabled, text input available
- **Audio Processing Errors**: Silent failure, user can retry

#### Connection Recovery
- **WebSocket Reconnection**: Automatic reconnection preserves chat history
- **STT Service Recovery**: Service reinitialized on successful connection
- **State Persistence**: Local messages preserved during connection issues

This comprehensive messaging system ensures reliable communication between Remote users and the Kiosk avatar while providing multiple input methods and robust error handling.
