
import { create } from 'zustand';
import { type RemoteSessionInfo, WebsocketStatus, type Uneeq, type Event, type Message, CameraHorizontalAnchor, CameraDistanceAnchor, type Memory, type Config, type Media } from '@/types';
import { type State, SessionStatus } from './types';

const initialState: State = {
  config: null as unknown as Config,
  status: SessionStatus.IDLE,
  webSocketState: WebsocketStatus.DISCONNECTED,
  connectionId: null,
  uneeq: null,
  uneeqEvents: [],
  media: null,
  remoteInfo: null,
  awaitingPromptResponse: false,
  language: 'en',
  renderMode: 'cloud',
  history: [],
  // Speech and interaction states
  isTyping: false,
  micActive: false,
  sttReady: false,
  showSuggestions: true,
  camera: CameraHorizontalAnchor.center,
  showClosedCaptions: true,
  memory: {} as Memory
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
  // Speech and interaction actions
  setIsTyping: (isTyping: boolean) => void;
  setMicActive: (micActive: boolean) => void;
  setSttReady: (sttReady: boolean) => void;
  setShowSuggestions: (showSuggestions: boolean) => void;
  setCamera: (camera: CameraHorizontalAnchor | CameraDistanceAnchor) => void;
  setShowClosedCaptions: (showClosedCaptions: boolean) => void;
  setMemory: (key: string, value: any) => void;
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
          return { state: { ...prev.state, history: [...prev.state.history, message] } };
        });
    },
    // Speech and interaction actions
    setIsTyping: (isTyping) => {
      set((prev) => ({ state: { ...prev.state, isTyping } }));
    },
    setMicActive: (micActive) => {
      set((prev) => ({ state: { ...prev.state, micActive } }));
    },
    setSttReady: (sttReady) => {
      set((prev) => ({ state: { ...prev.state, sttReady } }));
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
  },
}));



/**
 * Access the session store state and actions.
 */
export const useSession = (): SessionContextType => useSessionStore((s) => s);