import type { CameraDistanceAnchor, CameraHorizontalAnchor, Config, Uneeq } from "@/types";
// Available for configuration: import type { CameraAnchorOptions } from "@/types";
import type { SessionStatus } from './';
import type { Message, RemoteSessionInfo, WebsocketStatus } from "@/types/transport";
import type { Event } from "@/types/uneeq/Event";
import type { Memory, Media, ErrorMessage } from "@/types/utils";
import type { MicrophoneStatus } from "@/types/microphone";
import type { StateWrapper } from "@/types/stateManager";
import type { FlightsSearchData, FareSelectionData, BookingSummaryData, AddToCartData, PassengerDetailsData, ContactDetailsData } from "@/types/booking";   

export interface State {
    config: Config;
    status: SessionStatus;
    webSocketState: WebsocketStatus;
    uneeq: Uneeq | null;
    connectionId: string | null;
    media: Media | null;
    remoteInfo: RemoteSessionInfo | null;
    awaitingPromptResponse: boolean;
    language: string;
    renderMode: string;
    history: Message[];
    uneeqEvents: Event[];
    
    // Microphone Status
    microphoneStatus: MicrophoneStatus;

    // Speech and interaction states
    isReadySpeechToText: boolean;
    showSuggestions: boolean;

    // Digital Human Controls
    camera: CameraHorizontalAnchor | CameraDistanceAnchor;
    showClosedCaptions: boolean;

    // Storage - When prompts are sent to the server for execution, associated frontend actions 
    // may also require parameters. Instead of resending parameters each time, the prompt can be accessed by its ID,
    // so only the ID is sent rather than all parameters.
    memory: Memory;
    errorMessage: ErrorMessage | null;

    // VAD state
    vadEnabled: boolean;

    // State Manager
    stateManager: StateWrapper | null;

    // Flights search data for displaying flight cards
    flightsSearchData: FlightsSearchData | null;

    // Fare selection data for displaying fare cards
    fareSelectionData: FareSelectionData | null;

    // Booking summary data for displaying booking summary
    bookingSummaryData: BookingSummaryData | null;

    // Map of message IDs to their associated card data
    // This allows cards to stay with specific messages even when new messages arrive
    messageCards: Record<string, FlightsSearchData | FareSelectionData | BookingSummaryData | AddToCartData | PassengerDetailsData | ContactDetailsData | null>;

    // Websocket message
    remoteMessageQueue: any[];

    // Avatar speech state
    isAvatarSpeaking: boolean;
    sentMessageIds: Set<string>;
  }
