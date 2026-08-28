import { useEffect, useCallback, useRef } from 'react';
import PQueue from 'p-queue';
import { MessageSender } from '@/types/transport/MessageSender';
import type { Message } from '@/types/transport/Message';
import { useSession } from '@/contexts/SessionContext';

export const useUneeqMessageQueue = () => {
  const { actions, state } = useSession();
  const queue = useRef(new PQueue({ concurrency: 1 }));
  const lastProcessedMessageId = useRef<string | null>(null);
  const resolveCurrentSpeech = useRef<(() => void) | null>(null);

  const speakAndWait = useCallback((message: Message): Promise<void> => {
    return new Promise((resolve) => {
      resolveCurrentSpeech.current = resolve;
      // The raw text when there was markup to strip: the avatar's event tag sits
      // mid-sentence on purpose, so the gesture lands on the relevant words.
      window.uneeq?.speak(message.speechContent ?? message.content);
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

    // A replayed transcript is not something to say again — HistorySyncListener
    // adds the whole conversation back when the companion phone reconnects.
    if (lastMessage.isHistorical) {
      lastProcessedMessageId.current = lastMessage.id;
      return;
    }

    if (lastMessage.sender === MessageSender.User) {
      // Barge-in, then dispatch. The kiosk's own speech pipeline puts the
      // transcript into history; this is what carries it to the persona's NLP,
      // which the platform forwards to the conversation integration. Without it
      // only SessionLiveListener's welcome prompt ever reaches the agent.
      resolveCurrentSpeech.current?.();
      resolveCurrentSpeech.current = null;
      queue.current.clear();
      try {
        window.uneeq?.chatPrompt(lastMessage.content);
      } catch (error) {
        console.error('[useUneeqMessageQueue] chatPrompt FAILED:', error);
      }
      actions.markMessageAsSent(lastMessage.id);
      lastProcessedMessageId.current = lastMessage.id;
    } else if (lastMessage.sender === MessageSender.Assistant) {
      queue.current.add(() => speakAndWait(lastMessage));
      actions.markMessageAsSent(lastMessage.id);
      lastProcessedMessageId.current = lastMessage.id;
    }
  }, [state.history, state.isAvatarSpeaking, state.sentMessageIds, actions, speakAndWait]);

  return {
    queue: queue.current,
  };
};
