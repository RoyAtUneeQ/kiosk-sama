import { useState, useEffect, useRef } from 'react';
import { UneeqContainer, RemoteConnectionInfo, KioskStartForm, LeftSideBar, ImageContainer, MicButton } from './components';
import { SessionState, UneeqEventType, WebsocketState, type RemoteSessionInfo, type UneeqEvent } from '@/types';
import { useWebSocket, useUneeq, useMicrophone, useDeepgram } from '@/hooks';
import { QRCode } from '@/components';
import { ImageInstructionGenerator } from '@/instructions';
import { useConfig } from '@/hooks/useConfig';
import { useTranslation } from '@/hooks';
  
// Kiosk Page Component
function KioskPage() {
  const uneeqContainerId = 'uneeq-digital-human-container';
  const [sessionState, setSessionState] = useState(SessionState.IDLE);
  const [remoteInfo, setRemoteInfo] = useState<RemoteSessionInfo | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const checkRemoteConnection = useRef<NodeJS.Timeout | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<"cloud" | "miniprem">('miniprem');
  const [isLoading, setIsLoading] = useState(false);

  // Config is now guaranteed to be available
  const { config, getSupportedLanguages, getDefaultLanguage } = useConfig();
  
  // Get the current language from i18n system
  const { getCurrentLanguage } = useTranslation();
  const [language, setLanguage] = useState<string>(getCurrentLanguage());

  // Helper function to get a safe language that exists in config
  const getSafeLanguage = (requestedLanguage: string): string => {
    const supportedLanguages = getSupportedLanguages();
    
    // If requested language exists in config, use it
    if (supportedLanguages.includes(requestedLanguage)) {
      return requestedLanguage;
    }
    
    // Otherwise, use the default language from config
    const defaultLang = getDefaultLanguage();
    console.warn(`Language '${requestedLanguage}' not found in config personas. Falling back to '${defaultLang}'`);
    return defaultLang;
  };

  // Get safe language for use in config access
  const safeLanguage = getSafeLanguage(language);

  // Sync language state with i18n changes
  useEffect(() => {
    const currentLang = getCurrentLanguage();
    if (currentLang !== language) {
      setLanguage(currentLang);
    }
  }, [getCurrentLanguage, language]);

  // Initialize hooks with config values (now guaranteed to be available)
  const { events, uneeq, clearEvents, prompt } = useUneeq({
    connectionUrl: config.personas[safeLanguage][renderMode].API,
    renderMode: renderMode,
    language: safeLanguage,
    containedElementIdName: uneeqContainerId,
    displayCallToAction: false,
    cameraAnchorDistance: 'medium_shot',
    autoStart: true,
    logLevel: "info",
    enableMicrophone: false,
    layoutMode: "fullScreen",
    showUserInputInterface: false,
    enableVad: false,
    containedAutoLayout: true,
    showClosedCaptions: false,
    captionsPosition: "bottom-left",
    languageStrings: {},
    customMetadata: {},
    speechRecognitionHintPhrasesBoost: 0,
    allowResumeSession: false
  });

  const { webSocketState, connectionId, sendMessage, on } = useWebSocket({
    webSocketUrl: config.websocket.url
  });

  // Initialize Microphone Hook
  const { startMicrophone, stopMicrophone, data } = useMicrophone();

  // Initialize Deepgram Hook
  const { transcribe } = useDeepgram(config.apis.deepgram.api_key, safeLanguage);

  const startListening = () => {
    uneeq?.stopSpeaking();
    startMicrophone();
  }

  const stopListening = () => {
    stopMicrophone();
  }

  useEffect(() => {
    if (data && transcribe) {
      transcribe(data).then((transcript: string) => prompt(transcript));
    }
  }, [data, transcribe]);
  

  const handleRegisterRemote = (message: any) => {
    setRemoteInfo(message.remoteInfo);
    checkRemoteConnection.current = setInterval(() => {   
      sendMessage({
        type: "CheckPeerConnection",
        remoteId: message.remoteInfo.connectionId
      });
    }, 1000);

    if (uneeq)
      prompt("Hello, can you introduce yourself?");
  };

  const handleRemoteDisconnected = () => {
    setRemoteInfo(null);
    if (checkRemoteConnection.current) {
      clearInterval(checkRemoteConnection.current);
      checkRemoteConnection.current = null;
    }
  };

  useEffect(() => {
    on("RegisterRemote", handleRegisterRemote);
    on("PeerDisconnected", handleRemoteDisconnected);
  }, [on]);

  // Log sessionState for debugging
  useEffect(() => console.info("sessionState: ", sessionState), [sessionState]);

  // Set ready when uneeq is ready to be used
  useEffect(() => {
    console.info("uneeq: ", uneeq);
    console.info("webSocketState: ", webSocketState);
    if (uneeq && webSocketState === WebsocketState.CONNECTED) {
      setSessionState(SessionState.READY);
    }
  }, [uneeq, webSocketState]);

  // Process Uneeq events
  useEffect(() => {
    if (!events || events.length === 0) return;

    console.log("Processing", events.length, "events");
    events.forEach(async (evt: UneeqEvent) => {
      console.info("Processing event:", evt.type, evt);
      
      if (evt.type === UneeqEventType.SessionLive || evt.type === UneeqEventType.DigitalHumanUnmuted) { 
        setSessionState(SessionState.LIVE);
        setIsLoading(false);
        setHighlight(null);
        setImageUrl("");
        prompt("introduce yourself?");
      }

      if (evt.type === UneeqEventType.PromptRequest){
        setIsLoading(true);
      }

      if (evt.type === UneeqEventType.PromptResult){
        setIsLoading(false);
      }

      if (evt.type === UneeqEventType.SpeechEvent) {
        const [type, value] = evt.data.speechEvent.param_value.split(/_(.+)/).filter(Boolean);

        console.info("Speech event received", type);
        console.info("Speech event value", value);


        if (type === 'image') {
          // If the screen is landscape, anchor the camera to the right
          if (window.innerWidth > window.innerHeight)
            uneeq?.cameraAnchorHorizontal("right", 1000);
          setImageUrl(await new ImageInstructionGenerator(config.apis.pixabay.api_key, config.apis.pixabay.api_url).getImageUrlById(value) );  
        } 

        if (type === 'highlight') {
          console.info("Highlight event received", value);
          setHighlight(value);
        }

        if (type === 'camera') {
          console.info("Camera anchor event received", value);
          uneeq?.cameraAnchorDistance(value, 1000);
        }
       
      } 

      if (evt.type === UneeqEventType.AvatarStoppedSpeaking) {
        console.info("Avatar stopped speaking event received");
        setTimeout(() => {
          setHighlight(null);
          uneeq?.cameraAnchorHorizontal("center", 1000);
          setImageUrl("");
          setHighlight(null);
        }, 1000);
      }

      if (evt.type === UneeqEventType.SessionEnded || evt.type === UneeqEventType.SessionDisconnected) {
        console.info("Session ended or disconnected, stopping audio capture");
        try {
          await stopMicrophone();
        } catch (error) {
          console.error('Failed to stop audio capture:', error);
        }
      }
    });
    // Clear processed events
    clearEvents();
  }, [events, uneeq, clearEvents, config]);

  const onMenuButtonClick = (button: string) => {
    setHighlight(null);
    setImageUrl("");
    uneeq?.cameraAnchorHorizontal("center", 1000);
    if (button != "zoom_out" && button != "zoom_in") {
      setHighlight(button);
    }
  }

  // If uneeq is not initialized, return the Kiosk Start Form (Digital Human)
  if (sessionState === SessionState.IDLE || sessionState === SessionState.READY)
    return (
      <>
        <KioskStartForm 
          sessionId={connectionId || "-"} 
          scriptReady={uneeq != null} 
          webSocketConnected={webSocketState === WebsocketState.CONNECTED} 
          onStartExperience={() => setSessionState(SessionState.LOADING)} 
          onRenderModeChange={(mode: string) => setRenderMode(mode as "cloud" | "miniprem")}
          onLanguageChange={(language: string) => setLanguage(language)}
        />
      </>
    );

  return (
    <div>
      <UneeqContainer 
        id={uneeqContainerId}  
        loaded={uneeq != null && sessionState === SessionState.LIVE}
        onInit={() => {
          setSessionState(SessionState.LOADING);
          console.info("Initializing Uneeq");
          uneeq?.init();
        }} 
      />
      {sessionState === SessionState.LIVE && (
        <>
          <MicButton onStart={startListening} onStop={stopListening}  />
          <LeftSideBar isLoading={isLoading} uneeq={uneeq || null} highlight={highlight} setHighlight={setHighlight} onButtonClick={onMenuButtonClick} promptCallback={prompt} />
          {!remoteInfo && (
            <QRCode 
              value={`${window.location.protocol}//${window.location.host}/remote/${connectionId}`} 
              size={160} 
            />
          )}
          {remoteInfo && <RemoteConnectionInfo info={remoteInfo} />}
          {imageUrl && <ImageContainer imageUrl={imageUrl} />}
        </>
      )}
    </div>
  );
}

export default KioskPage;
