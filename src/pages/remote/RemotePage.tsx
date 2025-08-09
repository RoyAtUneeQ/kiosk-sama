import './RemotePage.scss';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useWebSocket, useUserInspect, useVAD } from '@/hooks';
import { WebsocketStatus } from '@/types/transport/WebsocketStatus';
import { useParams } from 'react-router-dom';
import { type Message } from '@/types';
import { useConfig } from '@/hooks/useConfig';
import { useSession } from '@/contexts';
import { createAction } from '@/utils';
import { FiFeather, FiImage, FiHelpCircle, FiPower } from 'react-icons/fi';
import { RemoteHeader, MessageList, Suggestions, ChatInput } from './components';
import { GlowBackground } from '@/components';
import { pcmToWavBlob, blobToBase64 } from '@/utils';

function RemotePage() {
  const { config } = useConfig();
  const { kioskConnectionId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [micActive, setMicActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { state } = useSession();
  const { sendAction } = useWebSocket({ webSocketUrl: config.websocket.url });
  const userInspect = useUserInspect(state.connectionId ?? '');
  const hasKioskId = Boolean(kioskConnectionId);

  const { start: startVAD, stop: stopVAD, loading: vadLoading, errored: vadErrored, speaking } = useVAD({
    silenceDurationMs: 450,
    minSpeechDurationMs: 180,
    onSpeechStart: () => {
      console.log('onSpeechStart');
      setMicActive(true);
      setShowSuggestions(false);
    },
    onSpeechEnd: async (audio) => {
      try {
        const wav = pcmToWavBlob(audio, 16000);
        const base64 = await blobToBase64(wav);
        console.log('base64', base64);
        if (kioskConnectionId) {
          sendAction(
            createAction.peerAudioTranscribe(
              kioskConnectionId,
              base64,
              'audio/wav',
              'en-US',
              'nova-2'
            )
          );
          setIsTyping(true);
        }
      } catch (err) {
        console.error('Failed to process VAD audio', err);
      }
      // do not stop VAD here; keep listening for continuous utterances
    },
  });

  // Track viewport to tailor animation load for large screens
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isLargeScreen = viewportWidth >= 1280; // big screens: reduce background complexity

  // Configure glow balls based on screen size to reduce GPU work on large displays
  const glowBalls = useMemo(() => {
    if (isLargeScreen) {
      return [
        { delay: '0s', size: 0.6, speed: '30s' },
        { delay: '-6s', size: 0.5, speed: '34s' },
        { delay: '-12s', size: 0.7, speed: '38s' },
      ];
    }
    return [
      { delay: '0s', size: 0.55, speed: '26s' },
      { delay: '-4s', size: 0.75, speed: '32s' },
      { delay: '-8s', size: 0.45, speed: '24s' },
      { delay: '-12s', size: 0.65, speed: '30s' },
      { delay: '-16s', size: 0.35, speed: '18s' },
      { delay: '-20s', size: 0.85, speed: '36s' },
    ];
  }, [isLargeScreen]);

  useEffect(() => {
    if (vadLoading) console.log('[VAD] loading model...');
    if (vadErrored) console.error('[VAD] error:', vadErrored);
  }, [vadLoading, vadErrored]);

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

  const handleSendMessage = () => {
    sendText(inputText);
  };

  const toggleMic = () => {
    const next = !micActive;
    console.log('[RemotePage] toggleMic ->', next);
    setMicActive(next);
    if (next) {
      setShowSuggestions(false);
      console.log('[RemotePage] startVAD');
      startVAD();
    } else {
      console.log('[RemotePage] stopVAD');
      stopVAD();
    }
  };

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

  const handleEnter = () => handleSendMessage();

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
          <GlowBackground balls={glowBalls} 
            className="glow-background"
            ariaHidden={false}
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
              speaking={speaking}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default RemotePage;
