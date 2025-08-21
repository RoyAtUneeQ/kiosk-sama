import type { CameraAnchorOptions, CameraDistanceAnchor, CameraHorizontalAnchor, Uneeq } from "@/types";
import type { SessionStatus } from './'; 
import type { Message, RemoteSessionInfo, WebsocketStatus } from "@/types/transport";
import type { Event } from "@/types/uneeq/Event";

/**
 * Shape of the session state stored in Zustand.
 */
export interface State {
    status: SessionStatus;
    webSocketState: WebsocketStatus;
    uneeq: Uneeq | null;
    connectionId: string | null;
    imageUrl: string;
    videoUrl: string;
    remoteInfo: RemoteSessionInfo | null;
    awaitingPromptResponse: boolean;
    language: string;
    renderMode: string;
    history: Message[];
    uneeqEvents: Event[];
    // Speech and interaction states
    isTyping: boolean;
    micActive: boolean;
    sttReady: boolean;
    showSuggestions: boolean;

    // Digital Human Controls
    camera: CameraHorizontalAnchor | CameraDistanceAnchor;
  }
