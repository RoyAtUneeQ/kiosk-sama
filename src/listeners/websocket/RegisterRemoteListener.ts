import type { SessionContextType } from '@/contexts/SessionContext';
import { useSessionStore } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';
import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';
import { createActionFactory } from '@/factories/ActionFactory';

export class RegisterRemoteListener implements WebSocketEventListener {
  eventType = WebSocketEventType.REGISTER_REMOTE;
  execute(data: any, session: SessionContextType): void {
    const remoteInfo = data.remoteInfo as RemoteSessionInfo;
    const { sessionToken } = useSessionStore.getState().state;

    if (remoteInfo?.sessionToken !== sessionToken) {
      console.warn('[RegisterRemoteListener] Rejected remote with stale session token', remoteInfo?.connectionId);
      if (remoteInfo?.connectionId) {
        session.actions.queuePeerMessage(createActionFactory().sessionEnded(remoteInfo.connectionId, 'stale-token'));
      }
      return;
    }

    console.log(
      '%c📱 REMOTE CONNECTED',
      'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
    );

    session.actions.setRemoteDisconnectedAt(null);
    session.actions.setVadEnabled(false);
    session.actions.setRemoteInfo(remoteInfo);

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
