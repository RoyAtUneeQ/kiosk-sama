import { useEffect, useRef } from 'react';
import PQueue from 'p-queue';
import { useSession } from '@/contexts';
import { UneeqEventFactory } from '@/factories';

export const useUneeqEvents = (): void => {
  const session = useSession();
  const queueRef = useRef(new PQueue({ concurrency: 1 }));
  const stateRef = useRef(session.state);

  useEffect(() => {
    stateRef.current = session.state;
  }, [session.state]);

  const processEvent = async (event: any) => {
    console.info(`[Uneeq Event] %c${event.uneeqMessageType}`, 'color:rgb(217, 64, 255);');
    console.log('[Uneeq Event] Event Object:');
    console.log(event);

    const eventListener = UneeqEventFactory(event);
    eventListener?.execute(event, session);
  };

  useEffect(() => {
    if (session.state.uneeqEvents?.length) {
      session.state.uneeqEvents.forEach(event => {
        queueRef.current.add(() => processEvent(event));
      });
      session.actions.setUneeqEvents([]);
    }
  }, [session.state.uneeqEvents, session.actions]);
};
