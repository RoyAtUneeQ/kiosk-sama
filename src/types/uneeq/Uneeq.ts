import type { UneeqOptions } from "./options/UneeqOptions";

export interface Uneeq {
    options: UneeqOptions;
    scrollTicking: boolean;
    containedLayoutElem: HTMLElement | null;
    containedLayoutId: string;
    layoutTransitionInProgress: boolean;
    layoutMode: string | null;
    frameReady: boolean;
    sessionStarting: boolean;
    sessionLive: boolean;
    platformUnavailableError: string;
    frameId: string;
    uneeqFrame: HTMLIFrameElement;

    addLoadHandler(): void;
    init(): void;
    removeListeners(): void;
    validateOptions(): boolean;
    getHostedExperienceUrl(): string;
    addFrame(): void;
    validateLayoutModeChangeSpeedMs(): void;
    validateLayoutMode(layoutMode: string): string;
    postToFrame(type: string, value: any): void;
    getContainedLayoutElem(): HTMLElement | null;
    initScrollHandler(): void;
    frameFadeOutIn(fadedOutCallback: () => void, layoutMode: string): void;
    isMobileLayoutModeEnabled(): boolean;
    handleClientResize(): void;
    frameReadyHandler(): void;
    shouldResumeSession(allowResumeSession: boolean, sessionData: any): boolean;
    sendSessionRequest(endpoint: string, body: any): Promise<any>;
    handleSessionResponse(response: Response, personaId: string): Promise<any>;
    handleTokenRejection(error: any): void;
    handleDeprecatedOptions(options: UneeqOptions): UneeqOptions;
    initResizeHandler(): void;
    isPersonaIdValidGuid(personaId: string): boolean;
    sendEventMessage(eventDetail: any): void;

    cameraAnchor(position: string, duration: number): void;

    cameraAnchorHorizontal(position: string, duration: number): void;

    cameraAnchorDistance(position: string, duration: number): void;

    chatPrompt(prompt: string, addClosedCaption?: boolean): void;

    speak(speech: string): void;

    enableMicrophone(): void;

    endSession(): void;

    pauseSpeechRecognition(): void;

    resumeSpeechRecognition(): void;

    setCustomPromptMetadata(customMetadata: any): void;

    setLayoutMode(layoutMode: string): void;

    setWebRtcStatsEnabled(emitMessages: boolean, logMessages: boolean): void;

    stopSpeaking(): void;

    unmuteDigitalHuman(): void;

    muteDigitalHuman(): void;

    updateDisplayContent(htmlContent: string): void;

    setShowClosedCaptions(show: boolean): void;

    setShowUserInputInterface(show: boolean): void;

    startSession(): void;

    waitForToken(): Promise<string>;

    onMessage(event: MessageEvent): void;

    handleLogMessages(type: string, data: any[]): void;

    showSnackbar(message: string, timeout?: number): void;
}

declare global {
    var uneeqDeployScriptLocation: string;
}
