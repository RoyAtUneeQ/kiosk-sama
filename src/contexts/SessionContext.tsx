import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { type SessionAction, type State, type RemoteSessionInfo, ActionType, SessionStatus, WebsocketStatus, type Uneeq, type Event, type OutgoingInstruction } from '@/types';

const initialState: State = {
  status: SessionStatus.IDLE,
  webSocketState: WebsocketStatus.DISCONNECTED,
  connectionId: "-",
  uneeq: null,
  uneeqEvents: [],
  imageUrl: '',
  videoUrl: '',
  remoteInfo: null,
  awaitingPromptResponse: false,
  language: 'en',
  renderMode: 'cloud',
  outgoingInstruction: null
};

// Reducer function
function sessionReducer(state: State, action: SessionAction): State {
  console.groupCollapsed('[Session Reducer] %c%s', 'color: #6cb4f7;', action.type);
  console.log(action.payload);
  const newState = { ...state, ...action };
  switch (action.type) {
    case ActionType.SET_STATUS:
      newState.status = action.payload.status;
      break;
    case ActionType.SET_AWAITING_PROMPT_RESPONSE:
      newState.awaitingPromptResponse = action.payload;
      break;
    //ToDo: IMAGE AND VIDEO CAN BE COMBINED IN MEDIA OBJECT`
    case ActionType.SET_IMAGE_URL:
      newState.imageUrl = action.payload;
      break;
    case ActionType.SET_VIDEO_URL:
      newState.videoUrl = action.payload;
      break;
    case ActionType.SET_REMOTE_INFO:
      newState.remoteInfo = action.payload;
      break;
    case ActionType.SET_LANGUAGE:
      newState.language = action.payload;
      break;
    case ActionType.SET_RENDER_MODE:
      newState.renderMode = action.payload;
      break;
    case ActionType.SET_WEBSOCKET_STATE:
      newState.webSocketState = action.payload;
      break;
    case ActionType.SET_CONNECTION_ID:
      newState.connectionId = action.payload.id;
      break;
    case ActionType.SET_UNEEQ:
      newState.uneeq = action.payload;
      break;
    case ActionType.SET_UNEEQ_EVENTS:
      // Append new events to the existing queue instead of replacing
      if (action.payload && action.payload.length > 0) {
        newState.uneeqEvents = [...state.uneeqEvents, ...action.payload];
        console.info("Events queue after update:", newState.uneeqEvents);
      } else {
        newState.uneeqEvents = action.payload;
      }
      break;
    case ActionType.SET_OUTGOING_INSTRUCTION: 
      newState.outgoingInstruction = action.payload as OutgoingInstruction | null;
      break;
    default:
      return state;
  }     
  //Add value to restrict the output to the value of the object
  console.table(newState, ['value']);
  console.groupEnd();
  return newState;
}

// Internal hook that provides the reducer and action creators
const useSessionReducer = () => {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const loadingCallbackRef = useRef<(() => void) | undefined>(undefined);
  
  // Execute callback after state changes to LOADING
  useEffect(() => {
    // Execute the callback if it exists
    if (state.status === SessionStatus.LOADING && loadingCallbackRef.current)
      loadingCallbackRef.current();

    // Clear the callback
    loadingCallbackRef.current = undefined;
  }, [state.status]);
  
  // Action creators
  const actions = {
    setSessionStatus: useCallback((status: SessionStatus, callback?: () => void) => {
      if (status === SessionStatus.LOADING) loadingCallbackRef.current = callback;
      dispatch({ type: ActionType.SET_STATUS, payload: { status } });
    }, []),
    
    setAwaitingPromptResponse: useCallback((isAwaitingResponse: boolean) => {
      dispatch({ type: ActionType.SET_AWAITING_PROMPT_RESPONSE, payload: isAwaitingResponse });
    }, []),
    
    setImageUrl: useCallback((url: string) => {
      dispatch({ type: ActionType.SET_IMAGE_URL, payload: url });
    }, []),
    
    setVideoUrl: useCallback((url: string) => {
      dispatch({ type: ActionType.SET_VIDEO_URL, payload: url });
    }, []),
    
    setRemoteInfo: useCallback((info: RemoteSessionInfo) => {
      dispatch({ type: ActionType.SET_REMOTE_INFO, payload: info });
    }, []),
    
    setLanguage: useCallback((language: string) => {
      dispatch({ type: ActionType.SET_LANGUAGE, payload: language });
    }, []),

    setRenderMode: useCallback((renderMode: "cloud" | "miniprem") => {
      dispatch({ type: ActionType.SET_RENDER_MODE, payload: renderMode });
    }, []),

    setWebSocketState: useCallback((state: WebsocketStatus) => {
      dispatch({ type: ActionType.SET_WEBSOCKET_STATE, payload: state });
    }, []),

    setConnectionId: useCallback((id: string, callback?: (id: string) => void) => {
      dispatch({ type: ActionType.SET_CONNECTION_ID, payload: { id, callback } });
    }, []),

    setUneeq: useCallback((uneeq: Uneeq) => {
      dispatch({ type: ActionType.SET_UNEEQ, payload: uneeq });
    }, []),

    setUneeqEvents: useCallback((events: Event[]) => {
      dispatch({ type: ActionType.SET_UNEEQ_EVENTS, payload: events });
    }, []),

    setOutgoingInstruction: useCallback((instruction: OutgoingInstruction | null  ) => {
      dispatch({ type: ActionType.SET_OUTGOING_INSTRUCTION, payload: instruction });
    }, []),

    };
  
  return {
    state,
    actions
  };
};

// Define the context type
interface SessionContextType {
  state: State;
  actions: {
    setSessionStatus: (status: SessionStatus,  callback?: () => void) => void;
    setAwaitingPromptResponse: (isAwaitingResponse: boolean) => void;
    setImageUrl: (url: string) => void;
    setVideoUrl: (url: string) => void;
    setRemoteInfo: (info: RemoteSessionInfo) => void;
    setLanguage: (language: string) => void;
    setRenderMode: (renderMode: "cloud" | "miniprem") => void;
    setWebSocketState: (state: WebsocketStatus) => void;
    setConnectionId: (id: string) => void;
    setUneeq: (uneeq: Uneeq) => void;
    setUneeqEvents: (events: Event[]) => void;
    setOutgoingInstruction: (instruction: OutgoingInstruction | null) => void;
  };
}

export type SessionActions = ReturnType<typeof useSessionReducer>['actions'];

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Provider component
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { state, actions } = useSessionReducer();
  
  return (
    <SessionContext.Provider value={{ state, actions }}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use the session context
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}; 