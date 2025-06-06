import { useState, useEffect, useRef } from 'react';
import { UneeqContainer, RemoteConnectionInfo, KioskStartForm, LeftSideBar, ImageContainer, MicButton } from './components';
import { SessionState, UneeqEventType, WebsocketState, type RemoteSessionInfo, type UneeqEvent } from '@/types';
import { WebSocketService, UneeqService } from '@/services';
import { QRCode } from '@/components';
import { ImageInstructionGenerator } from '@/utils/ImageInstructionGenerator';
  
// Kiosk Page Component
function KioskPage() {
  const uneeqContainerId = 'uneeq-digital-human-container';
  const [sessionState, setSessionState] = useState(SessionState.IDLE);
  const [remoteInfo, setRemoteInfo] = useState<RemoteSessionInfo | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const checkRemoteConnection = useRef<NodeJS.Timeout | null>(null);

  // Initialize Uneeq Instance
  const { events, uneeq, clearEvents } = UneeqService({
    connectionUrl: import.meta.env.VITE_UNEEQ_CONNECTION_URL,
    personaId: import.meta.env.VITE_UNEEQ_PERSONA_ID,
    containedElementIdName: uneeqContainerId,
    displayCallToAction: false,
    cameraAnchorDistance: 'medium_shot',
    autoStart: true,
    logLevel: "info",
    enableMicrophone: false,
    showUserInputInterface: false,
    enableVad: true,
    containedAutoLayout: true,
    showClosedCaptions: true,
    captionsPosition: "bottom-left",
    languageStrings: {},
    customMetadata: {},
    speechRecognitionHintPhrasesBoost: 0,
    allowResumeSession: false,
    forceTURN: false
  });

  // Initialize Websocket Service
  const { webSocketState, connectionId, sendMessage, on } = WebSocketService({webSocketUrl: import.meta.env.VITE_WEBSOCKET_URL});

  const handleRegisterRemote = (message: any) => {
    setRemoteInfo(message.remoteInfo);
    checkRemoteConnection.current = setInterval(() => {   
      sendMessage({
        type: "CheckPeerConnection",
        remoteId: message.remoteInfo.connectionId
      });
    }, 1000);

    if (uneeq)
      uneeq.chatPrompt("Hello, how are you?");
  };

  const handleRemoteDisconnected = () => {
    setRemoteInfo(null);
    if (checkRemoteConnection.current) {
      clearInterval(checkRemoteConnection.current);
      checkRemoteConnection.current = null;
    }
  };

  const handleTranscript = (text: string) => {
    uneeq?.chatPrompt(text)
  };

  useEffect(() => {
    on("RegisterRemote", handleRegisterRemote);
    on("PeerDisconnected", handleRemoteDisconnected);
  }, [uneeq]);

  // Log sessionState for debugging
  useEffect(() => console.info("sessionState: ", sessionState), [sessionState]);

  useEffect(() =>{
    console.info(uneeq)
  }, [uneeq])

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
      }

      if (evt.type === UneeqEventType.SpeechEvent) {
        uneeq?.cameraAnchorHorizontal("right", 1000);
        console.info("Speech event received", evt.data.speechEvent.param_value);
        setImageUrl(await new ImageInstructionGenerator().getImageUrlById(evt.data.speechEvent.param_value) );
      } 

      if (evt.type === UneeqEventType.AvatarStoppedSpeaking) {
        console.info("Avatar stopped speaking event received");
        setTimeout(() => {
          uneeq?.cameraAnchorHorizontal("center", 1000);
          //setImageUrl("");
        }, 1000);
      }
    });
    // Clear processed events
    clearEvents();
  }, [events, uneeq, clearEvents]);

  // If uneeq is not initialized, return the Kiosk Start Form (Digital Human)
  if (sessionState === SessionState.IDLE || sessionState === SessionState.READY)
    return (
      <>
        <KioskStartForm 
          sessionId={connectionId || "-"} 
          scriptReady={uneeq != null} 
          webSocketConnected={webSocketState === WebsocketState.CONNECTED} 
          onStartExperience={() => setSessionState(SessionState.LOADING)} 
        />
      </>
    );

  return (
    <div>
      <UneeqContainer 
        id={uneeqContainerId}  
        onInit={() => {
          setSessionState(SessionState.LOADING);
          console.info("Initializing Uneeq");
          uneeq?.init();
        }} 
      />
      {sessionState === SessionState.LIVE && (
        <>
          <MicButton onTranscript={handleTranscript} />
          <LeftSideBar uneeq={uneeq || null} />
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
