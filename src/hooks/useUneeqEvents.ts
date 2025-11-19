import { useEffect, useRef } from 'react';
import PQueue from 'p-queue';
import { useSession } from '@/contexts';   
import { UneeqEventFactory } from '@/factories';

/**
 * Sequentially process queued Uneeq events via a single-concurrency queue.
 */
export const useUneeqEvents = (): void => {
  const session = useSession();
  
  // Create queue with concurrency of 1 to process events sequentially
  const queueRef = useRef(new PQueue({ concurrency: 1 }));
  const stateRef = useRef(session.state);
  useEffect(() => {
    stateRef.current = session.state;
  }, [session.state]);

  const processEvent = async (event: any) => {
    console.info(`[Uneeq Event] %c${event.uneeqMessageType}`, 'color:rgb(217, 64, 255);');
    session.state.persist?.set(`uneeq_event_${event.uneeqMessageType.toLowerCase()}`, event);
    console.log('[Uneeq Event] Event Object:');
    console.log(event);

    const eventListener = UneeqEventFactory(event);
    eventListener?.execute(event, session);
  };

  useEffect(() => { 
    if (session.state.uneeqEvents?.length) {
      // Add all events to the queue and clear the state
      session.state.uneeqEvents.forEach(event => {
        queueRef.current.add(() => processEvent(event));
      });
      session.actions.setUneeqEvents([]);
    }
  }, [session.state.uneeqEvents, session.actions]);

};
