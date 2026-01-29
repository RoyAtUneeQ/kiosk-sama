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
    if (!window.uneeq || state.history.length === 0) {
      return;
    }

    const lastMessage = state.history[state.history.length - 1];

    if (lastProcessedMessageId.current === lastMessage.id || state.sentMessageIds.has(lastMessage.id)) {
      return;
    }

    if (lastMessage.sender === MessageSender.User) {
      resolveCurrentSpeech.current?.();
      resolveCurrentSpeech.current = null;
      queue.current.clear();
      try {
        window.uneeq.chatPrompt(lastMessage.content);
      } catch (error) {
        console.error('[useUneeqMessageQueue] chatPrompt FAILED:', error);
      }
      actions.markMessageAsSent(lastMessage.id);
      lastProcessedMessageId.current = lastMessage.id;
    } else if (lastMessage.sender === MessageSender.Assistant) {
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
