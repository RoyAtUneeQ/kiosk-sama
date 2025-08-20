## Remote — Message System

The Remote messaging system enables real-time communication between mobile users and the Kiosk's digital human avatar. It supports both text input and voice transcription, with messages flowing through the backend to reach the avatar and responses returning to the mobile interface.

### Message Flow Architecture

```mermaid
graph TB
    subgraph "Remote Device"
        TextInput[📝 Text Input<br/>ChatInput component]
        VoiceInput[🎤 Voice Input<br/>Microphone + STT]
        MessageList[💬 Message Display<br/>Chat history]
    end
    
    subgraph "Message Processing"
        LocalState[📱 Local State<br/>messages: Message array]
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
    
    TextInput --> LocalState
    VoiceInput --> LocalState
    LocalState --> WebSocket
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

#### STT Service Initialization
```mermaid
sequenceDiagram
    participant RemotePage as RemotePage
    participant TokenService as EphemeralTokenService
    participant Deepgram as Deepgram API
    participant MicStream as useMicStream
    
    RemotePage->>TokenService: ensure('deepgram', 'stt')
    TokenService->>RemotePage: Ephemeral token
    RemotePage->>Deepgram: createStreamClient(DEEPGRAM, config)
    Deepgram->>RemotePage: StreamClient instance
    RemotePage->>Deepgram: streamClient.connect()
    Deepgram->>RemotePage: onOpen() → setSttReady(true)
    
    Note over RemotePage: STT service ready for voice input
```

#### Voice Input Processing
```mermaid
sequenceDiagram
    participant User as Mobile User
    participant MicButton as Mic Toggle Button
    participant MicStream as useMicStream Hook
    participant STTClient as Deepgram StreamClient
    participant RemotePage as RemotePage
    
    User->>MicButton: Taps microphone button
    MicButton->>RemotePage: toggleMic() → setMicActive(true)
    RemotePage->>MicStream: mic.start()
    MicStream->>MicStream: getUserMedia() → AudioContext
    MicStream->>STTClient: Streaming 16kHz PCM audio
    STTClient->>RemotePage: onPartial() → setIsTyping(true)
    STTClient->>RemotePage: onFinal(text) → addMessage(text, 'user')
    RemotePage->>RemotePage: Send message to kiosk
    
    Note over User: Speaks into microphone
    Note over RemotePage: Real-time transcription → message
```

### Message State Management

The Remote app uses a hybrid state approach combining local and shared state:

#### Local Message State
```typescript
// In RemotePage.tsx - Local UI state only
const [inputText, setInputText] = useState(''); // Keep local - UI specific input

// Message creation and shared state storage
const addMessage = (content: string, sender: MessageSender) => {
    const newMessage: Message = {
        id: crypto.randomUUID(),
        content,
        sender,
        timestamp: new Date(),
    };
    
    // Send to kiosk if user message
    if (sender === MessageSender.User && kioskConnectionId) {
        websocket?.send(createActionFactory().sendMessage(kioskConnectionId, newMessage));
    }
    
    // Add to shared message history
    actions.addMessageToHistory(newMessage);
};
```

#### Shared State Integration
```typescript
// All interaction states are now centralized in SessionContext
const { state, actions } = useSession();

// Key shared states used:
// - state.history: Message[]           // Complete message history
// - state.isTyping: boolean           // Typing/speaking indicator  
// - state.micActive: boolean          // Microphone status
// - state.sttReady: boolean           // Speech-to-text readiness
// - state.showSuggestions: boolean    // Show suggestion cards
// - state.webSocketState              // Connection status

// Messages are displayed directly from shared history
<MessageList messages={state.history} isTyping={state.isTyping} />

// All state updates go through shared actions
actions.setIsTyping(true);
actions.setMicActive(false);
actions.addMessageToHistory(newMessage);
```

### Speech-to-Text Configuration

The STT service is configured for optimal mobile voice input:

```typescript
const streamClient = createStreamClient(SpeechToTextProviders.DEEPGRAM, {
    token,                    // Ephemeral token from backend
    model: 'nova-3',         // Latest Deepgram model
    language: 'en-US',       // English US
    encoding: 'linear16',    // PCM format
    sampleRate: 16000,       // 16kHz audio
    channels: 1,             // Mono audio
    smartFormat: true,       // Auto punctuation/capitalization
    
    // Real-time callbacks
    onOpen: () => setSttReady(true),
    onPartial: () => setIsTyping(true),           // Interim results
    onFinal: (text: string) => {                  // Final transcription
        setIsTyping(false);
        addMessage(text, MessageSender.User);
    },
    onError: (err: any) => console.error('[STT] error:', err),
    onClose: () => console.info('[STT] closed')
});
```

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
