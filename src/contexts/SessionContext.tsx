
import { create } from 'zustand';
import { type RemoteSessionInfo, WebsocketStatus, type Uneeq, type Event, type Message, CameraHorizontalAnchor, CameraDistanceAnchor, type Memory, type Config, type Media, type ErrorMessage } from '@/types';
import { type State, SessionStatus } from './types';
import { MicrophoneStatus } from '@/types/microphone';
import type { PersistentStateWrapper } from '@/types/stateManager';

const initialState: State = {
  // Core session configuration
  config: null as unknown as Config,
  status: SessionStatus.IDLE,
  webSocketState: WebsocketStatus.DISCONNECTED,
  connectionId: null,
  
  // Uneeq digital human state
  uneeq: null,
  uneeqEvents: [],
  media: null,
  
  // Remote session information
  remoteInfo: null,
  
  // Conversation state
  awaitingPromptResponse: false,
  language: 'en',
  renderMode: 'cloud',
  history: [],
  
  // Speech and interaction states
  isReadySpeechToText: false,
  showSuggestions: true,
  
  // Digital Human Controls
  showClosedCaptions: false,
  camera: CameraHorizontalAnchor.center,
  
  // Storage - When prompts are sent to the server for execution, associated frontend actions 
  // may also require parameters. Instead of resending parameters each time, the prompt can be accessed by its ID,
  // so only the ID is sent rather than all parameters.
  memory: {} as Memory,

  // Microphone state
  microphoneStatus: MicrophoneStatus.UNKNOWN,

  // Error message
  errorMessage: null,

  // VAD state
  vadEnabled: true,

  // Persistent state manager
  persist: null,

};

/**
 * All actions that can mutate the session store. Implemented via Zustand.
 */
export type SessionActions = {
  setConfig: (config: Config) => void;
  setSessionStatus: (status: SessionStatus, callback?: () => void) => void;
  setAwaitingPromptResponse: (isAwaitingResponse: boolean) => void;
  setMedia: (media: Media | null) => void;
  setRemoteInfo: (info: RemoteSessionInfo | null) => void;
  setLanguage: (language: string) => void;
  setRenderMode: (renderMode: 'cloud' | 'miniprem') => void;
  setWebSocketState: (state: WebsocketStatus) => void;
  setConnectionId: (id: string) => void;
  setUneeq: (uneeq: Uneeq) => void;
  setUneeqEvents: (events: Event[]) => void;
  addMessageToHistory: (message: Message) => void;
  setIsReadySpeechToText: (isReady: boolean) => void;
  setShowSuggestions: (showSuggestions: boolean) => void;
  setCamera: (camera: CameraHorizontalAnchor | CameraDistanceAnchor) => void;
  setShowClosedCaptions: (showClosedCaptions: boolean) => void;
  setMemory: (key: string, value: any) => void;
  setMicrophoneStatus: (status: MicrophoneStatus) => void;
  setErrorMessage: (errorMessage: ErrorMessage | null) => void;
  setVadEnabled: (vadEnabled: boolean) => void;
  setPersist: (wrapper: PersistentStateWrapper | null) => void;
};      

/**
 * Public store shape returned by `useSession()`.
 */
export interface SessionContextType {
  state: State;
  actions: SessionActions;
}

type SessionStore = SessionContextType;

/**
 * Zustand store holding session state and actions.
 */
export const useSessionStore = create<SessionStore>((set, get) => ({
  state: initialState,
  actions: {
    setConfig: (config) => {
      set((prev) => ({ state: { ...prev.state, config } }));
    },
    setSessionStatus: (status, callback) => {
      set((prev) => ({ state: { ...prev.state, status } }));
      if (status === SessionStatus.LOADING && callback) {
        Promise.resolve().then(() => callback());
      }
    },  
    setAwaitingPromptResponse: (isAwaitingResponse) => {
      set((prev) => ({ state: { ...prev.state, awaitingPromptResponse: isAwaitingResponse } }));
    },
    setMedia: (media) => {
      set((prev) => ({ state: { ...prev.state, media } }));
    },
    setRemoteInfo: (info) => {
      set((prev) => ({ state: { ...prev.state, remoteInfo: info } }));
    },
    setLanguage: (language) => {
      set((prev) => ({ state: { ...prev.state, language } }));
    },
    setRenderMode: (renderMode) => {
      set((prev) => ({ state: { ...prev.state, renderMode } }));
    },
    setWebSocketState: (state) => {
      set((prev) => ({ state: { ...prev.state, webSocketState: state } }));
    },
    setConnectionId: (id) => {
      set((prev) => ({ state: { ...prev.state, connectionId: id } }));
    },
    setUneeq: (uneeq) => {
      set((prev) => ({ state: { ...prev.state, uneeq } }));
    },
    setUneeqEvents: (events) => {
      const prev = get().state;
      if (events && events.length > 0) {
        set({ state: { ...prev, uneeqEvents: [...prev.uneeqEvents, ...events] } });
      } else {
        set({ state: { ...prev, uneeqEvents: events } });
      }
    },
    addMessageToHistory: (message: Message) => {
        set((prev) => {
          // Use functional update to avoid stale closure issues
          const newHistory = [...prev.state.history, message];
          return { state: { ...prev.state, history: newHistory } };
        });
    },
    // Speech and interaction actions
    setIsReadySpeechToText: (isReady) => {
      set((prev) => ({ state: { ...prev.state, isReadySpeechToText: isReady } }));
    },
    setShowSuggestions: (showSuggestions) => {
      set((prev) => ({ state: { ...prev.state, showSuggestions } }));
    },
    setCamera: (camera) => {
      set((prev) => ({ state: { ...prev.state, camera } }));
    },
    setShowClosedCaptions: (showClosedCaptions) => {
      set((prev) => ({ state: { ...prev.state, showClosedCaptions } }));
    },
    setMemory: (key, value) => {
      set((prev) => ({ state: { ...prev.state, memory: { ...prev.state.memory, [key]: value } } }));
    },    
    setMicrophoneStatus: (status) => {
      set((prev) => ({ state: { ...prev.state, microphoneStatus: status } }));
    },
    setErrorMessage: (errorMessage) => {
      set((prev) => ({ state: { ...prev.state, errorMessage } }));
    },
    setVadEnabled: (vadEnabled) => {
      console.log(`[SessionContext] 🎤 VAD state changing from ${get().state.vadEnabled} to ${vadEnabled}`);
      set((prev) => ({ state: { ...prev.state, vadEnabled } }));
      console.log(`[SessionContext] ✅ VAD state updated to ${vadEnabled}`);
    },
    setPersist: (wrapper) => {
      set((prev) => ({ state: { ...prev.state, persist: wrapper } }));
    },
  },
}));



/**
 * Access the session store state and actions.
 */
export const useSession = (): SessionContextType => useSessionStore((s) => s);