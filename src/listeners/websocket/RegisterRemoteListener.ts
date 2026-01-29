import type { SessionContextType } from '@/contexts/SessionContext';
import { useSessionStore } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class RegisterRemoteListener implements WebSocketEventListener {
  eventType = WebSocketEventType.REGISTER_REMOTE;
  execute(data: any, session: SessionContextType): void {
    console.log(
      '%c📱 REMOTE CONNECTED',
      'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );

    session.actions.setVadEnabled(false);
    session.actions.setRemoteInfo(data.remoteInfo);

    const freshState = useSessionStore.getState().state;
    const currentHistory = freshState.history;
    const currentMessageCards = freshState.messageCards;

    if (currentHistory.length > 0) {
      const historySyncData = {
        type: 'historySync',
        messages: currentHistory,
        messageCards: currentMessageCards
      };
      session.actions.sendRemoteMessage(historySyncData);
    }
  }
}     


