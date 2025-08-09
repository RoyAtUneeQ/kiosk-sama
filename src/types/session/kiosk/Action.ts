import type { SessionStatus } from './SessionStatus';
import type { ActionType } from './ActionType';
import type { WebsocketStatus } from '@/types/transport';
import type { Uneeq, RemoteSessionInfo, OutgoingInstruction } from '@/types';
import type { Event } from '@/types/uneeq/Event';

// Reducer actions for session state management
// Define a generic action type
export interface GenericSessionAction<T extends ActionType, P = undefined> {
  type: T;
  payload: P;
}

// Specific action types inheriting from the generic action
export type SessionAction =
  | GenericSessionAction<ActionType.SET_STATUS, { status: SessionStatus }>
  | GenericSessionAction<ActionType.SET_AWAITING_PROMPT_RESPONSE, boolean>
  | GenericSessionAction<ActionType.SET_IMAGE_URL, string>
  | GenericSessionAction<ActionType.SET_VIDEO_URL, string>
  | GenericSessionAction<ActionType.SET_REMOTE_INFO, RemoteSessionInfo | null>
  | GenericSessionAction<ActionType.SET_LANGUAGE, string>
  | GenericSessionAction<ActionType.SET_RENDER_MODE, string>
  | GenericSessionAction<ActionType.SET_WEBSOCKET_STATE, WebsocketStatus>
  | GenericSessionAction<ActionType.SET_CONNECTION_ID, { id: string; callback?: (id: string) => void }>
  | GenericSessionAction<ActionType.SET_UNEEQ, Uneeq>
  | GenericSessionAction<ActionType.SET_UNEEQ_EVENTS, Event[]>
  | GenericSessionAction<ActionType.SET_OUTGOING_INSTRUCTION, OutgoingInstruction | null>
  | GenericSessionAction<ActionType.SET_PEER_MESSAGE, any>
