import './RemotePage.scss';
import { useEffect, useState, useRef } from 'react';
import { useWebSocket, useUserInspect, useMicStream } from '@/hooks';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { useParams } from 'react-router-dom';
import { type Message } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts';
import { createAction } from '@/utils';
import { FiFeather, FiImage, FiHelpCircle, FiPower } from 'react-icons/fi';
import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { GlowBackground } from '@/components';
import { type StreamClient } from '@/types/transport/StreamClient';
import { createStreamClient } from '@/utils';
import { SpeechToTextProviders } from '@/types/providers/SpeechToTextProviders';

function RemotePage() {
  const { config } = useConfig();
  const { kioskConnectionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const [sttReady, setSttReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state } = useSession();
  const { sendAction } = useWebSocket({ webSocketUrl: config.websocket.url });
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
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
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

    const streamClient = createStreamClient(SpeechToTextProviders.DEEPGRAM, {
      model: 'nova-3',
      language: 'en-US',
      encoding: 'linear16',
      sampleRate: 16000,
      channels: 1,
      smartFormat: true,
      onOpen: () => setSttReady(true),
      onPartial: () => setIsTyping(true),
      onFinal: (text: string) => {
        setIsTyping(false);
        addMessage(text, 'user');
      },
      onError: (err: any) => console.error('[STT] error:', err),
      onClose: () => console.info('[STT] closed'),
    });

    if (!streamClient) {
      console.error('[RemotePage] Failed to create STT client');
      return;
    }

    sttRef.current = streamClient;
    streamClient.connect().catch((e: unknown) => {
      console.error('[RemotePage] Failed to connect STT:', e);
      sttRef.current = null;
      setSttReady(false);
    });
  }, [state.webSocketState]);

  // Connect to kiosk session
  useEffect(() => {
    if (state.webSocketState === WebsocketStatus.CONNECTED && kioskConnectionId && state.connectionId) {
      console.log(`connecting from ${state.connectionId} to ${kioskConnectionId}`);
      sendAction(createAction.peerConnect(kioskConnectionId, userInspect));
    }
  }, [state.webSocketState, kioskConnectionId, state.connectionId, sendAction, userInspect]);

  // Auto-scroll to most recent message 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input field on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const addMessage = (text: string, sender: 'user' | 'assistant') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    console.log('addMessage', newMessage);
    if (sender === 'user' && kioskConnectionId)
      sendAction(createAction.sendMessage(kioskConnectionId, newMessage));
    setMessages(prev => [...prev, newMessage]);
  };

  const sendText = (text: string) => {
    if (!text || isTyping) return;
    const messageContent = text.trim();
    if (!messageContent) return;
    setInputText('');
    addMessage(messageContent, 'user');
    setIsTyping(true);
  };

  const toggleMic = async () => {
    const next = !micActive;
    console.log('[RemotePage] toggleMic ->', next);
    setMicActive(next);
    if (next) {
      if (state.webSocketState !== WebsocketStatus.CONNECTED) {
        console.warn('[RemotePage] Cannot start STT, WebSocket not connected');
        setMicActive(false);
        return;
      }
      if (!sttReady) {
        console.warn('[RemotePage] STT not ready yet');
        setMicActive(false);
        return;
      }
      setShowSuggestions(false);
      console.log('[RemotePage] start mic stream');
      try {
        await mic.start();
      } catch (e) {
        console.error('[RemotePage] Failed to start mic:', e);
        setMicActive(false);
        setShowSuggestions(true);
      }
    } else {
      console.log('[RemotePage] stop mic stream');
      try { await mic.stop(); } catch {}
      setIsTyping(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => () => {
    try { sttRef.current?.close(); } catch {}
    sttRef.current = null;
  }, []);

  useEffect(() => {
    if (!state.peerMessage) return;
    const type = state.peerMessage.type as string | undefined;
    if (type !== 'peerMessage') return;

    const data = state.peerMessage.data;
    const text = typeof data === 'string' ? data : data?.text ?? '';
    const sender = typeof data === 'string' ? 'assistant' : (data?.sender as 'user' | 'assistant' | undefined) ?? 'assistant';

    if (!text) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(false);
  }, [state.peerMessage]);

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
            reactiveActive={micActive}
            dimOpacity={0.65}
          />

          <div className="chat-content">
            <RemoteHeader 
              title="Thoughts BRIDGE" 
              webSocketState={state.webSocketState}
              kioskConnectionId={kioskConnectionId}
              connectionId={state.connectionId}
            />

            <>
              <MessageList messages={messages} isTyping={isTyping} messagesEndRef={messagesEndRef} />
              {state.webSocketState === WebsocketStatus.CONNECTED && showSuggestions && (
                <Suggestions 
                  items={suggestions} 
                  onSelect={(text) => {
                    sendText(text);
                  }} 
                  disabled={isTyping}
                  onClose={() => setShowSuggestions(false)}
                />
              )}
            </>

            <ChatInput
              inputRef={inputRef}
              value={inputText}
              onChange={setInputText}
              onEnter={handleEnter}
              disabled={state.webSocketState !== WebsocketStatus.CONNECTED}
              micActive={micActive}
              onToggleMic={toggleMic}
              speaking={false}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RemotePage;
