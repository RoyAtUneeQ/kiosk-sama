import './RemotePage.scss';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useWebSocket, useUserInspect, useMicStream, usePageLoadMonitor, usePerformanceMonitor, useMicPermissions } from '@/hooks';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { useParams } from 'react-router-dom';
import { MessageSender, type Message } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts';
import { createActionFactory } from '@/factories';
import { FiFeather, FiImage, FiHelpCircle, FiPower } from 'react-icons/fi';
import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { GlowBackground } from '@/components';
import { type StreamClient } from '@/types/transport/StreamClient';
import { createStreamClient } from '@/factories';
import { SpeechToTextProviders } from '@/types/providers/SpeechToTextProviders';
import { EphemeralTokenService } from '@/services';
import { BackendHostUrlFactory } from '@/factories';
import { MicUsageState } from '@/hooks/useMicPermissions';

function RemotePage() {
  // Track page load performance to measure lazy loading impact
  usePageLoadMonitor('RemotePage');
  
  // Performance monitoring for STT service initialization
  const { startTiming, endTiming } = usePerformanceMonitor('RemotePage-STT');
  
  const { config } = useConfig();
  const { kioskConnectionId } = useParams();
  const [inputText, setInputText] = useState(''); // Keep local - UI specific input
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);  

  const { state, actions } = useSession();
  const { websocket } = useWebSocket({ webSocketUrl: BackendHostUrlFactory.getWebSocketUrl(config) });
  
  // Microphone permissions management - requests permissions automatically on mount
  const micPermissions = useMicPermissions();
  
  // Memoize the token service to prevent re-instantiation on every render
  // This preserves the static cache across component updates
  const ephemeralTokenService = useMemo(() => new EphemeralTokenService({
    apiBaseUrl: BackendHostUrlFactory.getHttpBaseUrl(config),
    apiKey: BackendHostUrlFactory.getApiKey(config)
  }), [config]);

  
  const userInspect = useUserInspect(state.connectionId ?? '');
  const hasKioskId = Boolean(kioskConnectionId);

  // STT client holder and mic capture that streams 16k PCM to Deepgram
  const sttRef = useRef<StreamClient | null>(null);
  const mic = useMicStream({
    targetSampleRate: 16000,
    onAudio: (audio) => sttRef.current?.send(audio),
  });


  // Track viewport to tailor animation load for large screens
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      
      // Set CSS custom property for viewport height (fallback for browsers without dvh support)
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    // Initial call
    handleResize();
    
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  const isLargeScreen = viewportWidth >= 1280; // big screens: reduce background complexity

  useEffect(() => {
    // no-op for now; could surface mic.error here
    if (mic.error) console.error('[Mic] error:', mic.error);
  }, [mic.error]);

  useEffect(() => {
    if (mic.listening) console.info('[Mic] listening, streaming to deepgram');
  }, [mic.listening]);

  // Create and connect STT client once when WebSocket is connected; reuse across mic toggles
  useEffect(() => {
    if (state.webSocketState !== WebsocketStatus.CONNECTED) return;
    if (sttRef.current) return;

    let cancelled = false;
    startTiming('service-init');
    
    (async () => {
      try {
        // Resolve token before constructing the client
        const token = await ephemeralTokenService.ensure('deepgram', 'stt');
        if (cancelled) return;
        console.log('[RemotePage] Creating initial STT client');
        const streamClient = createStreamClient(SpeechToTextProviders.DEEPGRAM, {
          token,
          model: 'nova-3',
          language: 'en-US',
          encoding: 'linear16',
          sampleRate: 16000,
          channels: 1,
          smartFormat: true,
          onOpen: () => {
            actions.setSttReady(true);
            endTiming('service-init');
            console.log('[RemotePage] ✅ Initial STT client connected and ready');
          },
          onPartial: () => actions.setIsTyping(true),
          onFinal: (text: string) => {
            actions.setIsTyping(false);
            addMessage(text, MessageSender.User);
          },
          onError: (err: any) => {
            console.error('[STT] ❌ Initial STT client error:', err);
            // Mark as not ready on error to trigger refresh on next use
            actions.setSttReady(false);
          },
          onClose: () => {
            console.info('[STT] 🔌 Initial STT connection closed');
            actions.setSttReady(false);
          }
        });

        if (!streamClient) {
          console.error('[RemotePage] Failed to create STT client');
          endTiming('service-init'); // End timing on error
          return;
        }

        sttRef.current = streamClient;

        streamClient.connect().catch((e: unknown) => {
          console.error('[RemotePage] Failed to connect STT:', e);
          sttRef.current = null;
          actions.setSttReady(false);
          endTiming('service-init'); // End timing on connection error
        });
      } catch (e) {
        console.error('[RemotePage] Failed to prepare STT:', e);
        endTiming('service-init'); // End timing on error
      }
    })();

    return () => { cancelled = true; };
  }, [state.webSocketState, startTiming, endTiming]);

  // Connect to kiosk session
  useEffect(() => {
    if (state.webSocketState === WebsocketStatus.CONNECTED && kioskConnectionId && state.connectionId) {
      console.log(`connecting from ${state.connectionId} to ${kioskConnectionId}`);
      websocket?.send(createActionFactory().peerConnect(kioskConnectionId, userInspect));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId, websocket, userInspect]);

  // Auto-scroll to most recent message 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.history]);

  // Focus input field on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (content : string, sender: MessageSender) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender,
      timestamp: new Date(),
      prompt: true,
    };
    console.log('addMessage', newMessage);
    if (sender === MessageSender.User && kioskConnectionId)
      websocket?.send(createActionFactory().sendMessage(kioskConnectionId, newMessage));
    actions.addMessageToHistory(newMessage);
  };

  const sendText = (text: string) => {
    if (!text || state.isTyping) return;
    const messageContent = text.trim();
    if (!messageContent) return;
    setInputText('');
    addMessage(messageContent, MessageSender.User);
    actions.setIsTyping(true);
  };

  // Helper function to refresh STT client connection
  const refreshSttClient = async () => {
    console.log('[RemotePage] Refreshing STT client connection...');
    
    // Close existing connection and log details
    if (sttRef.current) {
      console.log('[RemotePage] Closing existing STT connection before refresh');
      try { 
        sttRef.current.close(); 
      } catch (e) {
        console.error('[RemotePage] Error closing existing STT client:', e);
      }
    }
    sttRef.current = null;
    actions.setSttReady(false);
    
    // Create new connection
    try {
      console.log('[RemotePage] Requesting new ephemeral token for STT refresh');
      const token = await ephemeralTokenService.ensure('deepgram', 'stt');
      
      console.log('[RemotePage] Creating new STT client after refresh');
      const streamClient = createStreamClient(SpeechToTextProviders.DEEPGRAM, {
        token,
        model: 'nova-3',
        language: 'en-US',
        encoding: 'linear16',
        sampleRate: 16000,
        channels: 1,
        smartFormat: true,
        onOpen: () => {
          actions.setSttReady(true);
          console.log('[RemotePage] ✅ STT client refreshed and ready - new WebSocket connection established');
        },
        onPartial: () => actions.setIsTyping(true),
        onFinal: (text: string) => {
          actions.setIsTyping(false);
          addMessage(text, MessageSender.User);
        },
        onError: (err: any) => {
          console.error('[STT] ❌ STT client error:', err);
          // Mark as not ready on error to trigger refresh on next use
          actions.setSttReady(false);
        },
        onClose: () => {
          console.info('[STT] 🔌 STT connection closed');
          actions.setSttReady(false);
        }
      });

      if (!streamClient) {
        console.error('[RemotePage] Failed to create refreshed STT client');
        return false;
      }

      sttRef.current = streamClient;
      
      console.log('[RemotePage] Connecting refreshed STT client...');
      await streamClient.connect();
      console.log('[RemotePage] STT client refresh complete');
      return true;
    } catch (e) {
      console.error('[RemotePage] Failed to refresh STT client:', e);
      sttRef.current = null;
      actions.setSttReady(false);
      return false;
    }
  };

  const toggleMic = async () => {
    // Check permissions first
    if (!micPermissions.canUseMic) {
      console.warn('[RemotePage] Cannot use microphone - permissions not granted');
      return;
    }

    const currentState = micPermissions.usageState;
    console.log('[RemotePage] toggleMic - current state:', currentState);

    if (currentState === MicUsageState.LISTENING) {
      // User wants to mute
      console.log('[RemotePage] 🔇 Muting microphone (keeping STT connection alive)');
      micPermissions.setUsageState(MicUsageState.MUTED);
      actions.setMicActive(false);
      try { 
        await mic.stop(); 
        console.log('[RemotePage] Microphone stream stopped successfully');
      } catch (e) {
        console.error('[RemotePage] Failed to stop mic:', e);
      }
      actions.setIsTyping(false);
    } else if (currentState === MicUsageState.MUTED || currentState === MicUsageState.IDLE) {
      // User wants to start listening
      if (state.webSocketState !== WebsocketStatus.CONNECTED) {
        console.warn('[RemotePage] Cannot start STT, WebSocket not connected');
        return;
      }

      console.log('[RemotePage] Starting microphone - setting up connection...');
      micPermissions.setUsageState(MicUsageState.REQUESTING);
      actions.setShowSuggestions(false);
      
      // If we're coming from MUTED state, check if STT client needs refreshing
      let sttReady = state.sttReady;
      if (currentState === MicUsageState.MUTED) {
        // Test if the existing STT client is still functional by checking if we can send to it
        // If not ready or connection seems stale, refresh it
        if (!sttReady || !sttRef.current) {
          console.log('[RemotePage] STT client not ready, refreshing after mute...');
          sttReady = await refreshSttClient();
          if (!sttReady) {
            console.error('[RemotePage] Failed to refresh STT client');
            micPermissions.setUsageState(MicUsageState.IDLE);
            actions.setMicActive(false);
            actions.setShowSuggestions(true);
            return;
          }
        } else {
          console.log('[RemotePage] STT client appears ready, reusing existing connection');
        }
      }
      
      if (!sttReady) {
        console.warn('[RemotePage] STT not ready');
        micPermissions.setUsageState(MicUsageState.IDLE);
        actions.setShowSuggestions(true);
        return;
      }
      
      try {
        await mic.start();
        // Once mic starts successfully, transition to listening
        micPermissions.setUsageState(MicUsageState.LISTENING);
        actions.setMicActive(true);
      } catch (e) {
        console.error('[RemotePage] Failed to start mic:', e);
        micPermissions.setUsageState(MicUsageState.IDLE);
        actions.setMicActive(false);
        actions.setShowSuggestions(true);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => () => {
    try { sttRef.current?.close(); } catch {}
    sttRef.current = null;
  }, []);

  useEffect(() => {
    const lastMessage = state.history[state.history.length - 1];      
    if (lastMessage && lastMessage.sender === MessageSender.Assistant) {
      actions.setIsTyping(false);
    }
  }, [state.history, actions]);

  // Auto-start microphone when permissions are granted and everything is ready
  useEffect(() => {
    const shouldAutoStart = 
      micPermissions.canUseMic &&
      micPermissions.usageState === MicUsageState.IDLE &&
      state.webSocketState === WebsocketStatus.CONNECTED &&
      state.sttReady;

    if (shouldAutoStart) {
      console.log('[RemotePage] Auto-starting microphone after permission grant');
      toggleMic();
    }
  }, [micPermissions.canUseMic, micPermissions.usageState, state.webSocketState, state.sttReady]);

  const handleEnter = () => sendText(inputText);

  const suggestions: Array<{ label: string; text: string; Icon: React.ComponentType<{ size?: number }> }>
    = [
      { label: 'Unique and Fun Birthday Surprise Ideas', text: 'Unique and Fun Birthday Surprise Ideas', Icon: FiFeather },
      { label: 'Create an image', text: 'Please create an image of a sunny beach at golden hour', Icon: FiImage },
      { label: 'How can you help me?', text: 'How can you help me?', Icon: FiHelpCircle },
      { label: 'End session', text: 'End session', Icon: FiPower },
    ];

  return (
    <div className="chat-container">
      {!hasKioskId ? (
        <div className="chat-content">
          <div style={{ padding: '1rem' }}>No kiosk connection ID</div>
        </div>
      ) : (
        <>
          <GlowBackground 
            className="glow-background"
            ariaHidden={false}
            isLargeScreen={isLargeScreen}
            reactiveActive={state.micActive}
            dimOpacity={0.65}
          />

          <div className="chat-content">
            <RemoteHeader 
              title="Thoughts Bridge" 
              webSocketState={state.webSocketState}
              kioskConnectionId={kioskConnectionId}
              connectionId={state.connectionId}
            />

            <>
              <MessageList messages={state.history} isTyping={state.isTyping} messagesEndRef={messagesEndRef} />
              {state.webSocketState === WebsocketStatus.CONNECTED && state.showSuggestions && (
                <Suggestions 
                  items={suggestions} 
                  onSelect={(text) => {
                    sendText(text);
                  }} 
                  disabled={state.isTyping}
                  onClose={() => actions.setShowSuggestions(false)}
                />
              )}
            </>

            <ChatInput
              inputRef={inputRef}
              value={inputText}
              onChange={setInputText}
              onEnter={handleEnter}
              disabled={state.webSocketState !== WebsocketStatus.CONNECTED}
              micUsageState={micPermissions.usageState}
              onToggleMic={toggleMic}
              speaking={false}
              micError={micPermissions.errorMessage}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RemotePage;
