import { useEffect, useCallback, useRef } from 'react';
import PQueue from 'p-queue';
import { MessageSender } from '@/types/transport/MessageSender';
import { useSession } from '@/contexts/SessionContext';

export const useUneeqMessageQueue = () => {
  const { actions, state } = useSession();
  const queue = useRef(new PQueue({ concurrency: 1 }));
  const lastProcessedMessageId = useRef<string | null>(null);
  const resolveCurrentSpeech = useRef<(() => void) | null>(null);

  const speakAndWait = useCallback((content: string): Promise<void> => {
    return new Promise((resolve) => {
      resolveCurrentSpeech.current = resolve;
      window.uneeq?.speak(content);
    });
  }, []);

  // Resolve speech when avatar stops speaking
  useEffect(() => {
    if (!state.isAvatarSpeaking && resolveCurrentSpeech.current) {
      resolveCurrentSpeech.current();
      resolveCurrentSpeech.current = null;
    }
  }, [state.isAvatarSpeaking]);

  // Process message queue
  useEffect(() => {
    console.log('[useUneeqMessageQueue] Effect triggered', {
      hasUneeq: !!window.uneeq,
      historyLength: state.history.length,
    });

    if (!window.uneeq || state.history.length === 0) {
      console.log('[useUneeqMessageQueue] Early return - no uneeq or empty history');
      return;
    }

    const lastMessage = state.history[state.history.length - 1];
    console.log('[useUneeqMessageQueue] Last message:', {
      id: lastMessage.id,
      sender: lastMessage.sender,
      content: lastMessage.content?.substring(0, 50),
      alreadyProcessed: lastProcessedMessageId.current === lastMessage.id,
      alreadySent: state.sentMessageIds.has(lastMessage.id),
    });

    if (lastProcessedMessageId.current === lastMessage.id || state.sentMessageIds.has(lastMessage.id)) {
      console.log('[useUneeqMessageQueue] Skipping - already processed or sent');
      return;
    }

    if (lastMessage.sender === MessageSender.User) {
      console.log('[useUneeqMessageQueue] Sending user message via chatPrompt');
      console.log('[useUneeqMessageQueue] window.uneeq methods:', {
        hasChatPrompt: typeof window.uneeq?.chatPrompt === 'function',
        hasSpeak: typeof window.uneeq?.speak === 'function',
        uneeqKeys: window.uneeq ? Object.keys(window.uneeq) : 'null'
      });
      resolveCurrentSpeech.current?.();
      resolveCurrentSpeech.current = null;
      queue.current.clear();
      try {
        window.uneeq.chatPrompt(lastMessage.content);
        console.log('[useUneeqMessageQueue] chatPrompt called successfully');
      } catch (error) {
        console.error('[useUneeqMessageQueue] chatPrompt FAILED:', error);
      }
      actions.markMessageAsSent(lastMessage.id);
      lastProcessedMessageId.current = lastMessage.id;
    } else if (lastMessage.sender === MessageSender.Assistant) {
      console.log('[useUneeqMessageQueue] Queuing assistant message');
      const queuedContent = lastMessage.content;
      queue.current.add(() => speakAndWait(queuedContent));
      actions.markMessageAsSent(lastMessage.id);
      lastProcessedMessageId.current = lastMessage.id;
    }
  }, [state.history, state.isAvatarSpeaking, state.sentMessageIds, actions, speakAndWait]);

  return {
    queue: queue.current,
  };
};
