import type { SessionContextType } from '@/contexts/SessionContext';
import { useSessionStore } from '@/contexts/SessionContext';
import type { WebSocketEventListener } from '../types/WebsocketEventListener';
import { WebSocketEventType } from '@/types/transport/WebsocketEventType';

export class RegisterRemoteListener implements WebSocketEventListener {
  eventType = WebSocketEventType.REGISTER_REMOTE;
  execute(data: any, session: SessionContextType): void {
    console.log("[RegisterRemoteListener] 🎤 Disabling VAD for remote session");
    session.actions.setVadEnabled(false);
    session.actions.setRemoteInfo(data.remoteInfo);
    console.log("[RegisterRemoteListener] ✅ VAD disabled, remote info set");
    
    // IMPORTANT: Get fresh state directly from Zustand store to avoid stale closures
    // The session parameter may have stale state if it was captured in a closure
    const freshState = useSessionStore.getState().state;
    const currentHistory = freshState.history;
    const currentMessageCards = freshState.messageCards;
    
    console.log('[RegisterRemoteListener] 📊 Fresh state check:', {
      historyLength: currentHistory.length,
      messageCardsCount: Object.keys(currentMessageCards).length,
      historyPreview: currentHistory.map(m => ({ 
        id: m.id, 
        sender: m.sender, 
        content: m.content?.substring(0, 50) + '...' 
      }))
    });
    
    // Send complete conversation history to the newly connected remote
    if (currentHistory.length > 0) {
      console.log(`[RegisterRemoteListener] 📜 Syncing ${currentHistory.length} messages to remote`);
      const historySyncData = {
        type: 'historySync',
        messages: currentHistory,
        messageCards: currentMessageCards
      };
      console.log('[RegisterRemoteListener] 📤 History sync payload:', {
        type: historySyncData.type,
        messagesCount: historySyncData.messages.length,
        messageCardsCount: Object.keys(historySyncData.messageCards).length,
        firstMessage: historySyncData.messages[0] ? {
          id: historySyncData.messages[0].id,
          sender: historySyncData.messages[0].sender,
          preview: historySyncData.messages[0].content?.substring(0, 80)
        } : null
      });
      session.actions.sendRemoteMessage(historySyncData);
      console.log('[RegisterRemoteListener] ✅ History sync queued for delivery');
    } else {
      console.warn('[RegisterRemoteListener] ⚠️ No history to sync - history is empty!');
      console.warn('[RegisterRemoteListener] ⚠️ This should not happen if messages were received before remote connected');
    }
  }
}     


