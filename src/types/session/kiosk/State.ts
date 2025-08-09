import type { Uneeq, OutgoingInstruction } from "@/types";
import type { SessionStatus } from "./SessionStatus"; 
import type { RemoteSessionInfo, WebsocketStatus } from "@/types/transport";
import type { Event } from "@/types/uneeq/Event";

export interface State {
    status: SessionStatus;
    webSocketState: WebsocketStatus;
    uneeq: Uneeq | null;
    uneeqEvents: Event[];
    connectionId: string | null;
    imageUrl: string;
    videoUrl: string;
    remoteInfo: RemoteSessionInfo | null;
    awaitingPromptResponse: boolean;
    language: string;
    renderMode: string;
    outgoingInstruction: OutgoingInstruction | null;
    peerMessage: any | null;
  }