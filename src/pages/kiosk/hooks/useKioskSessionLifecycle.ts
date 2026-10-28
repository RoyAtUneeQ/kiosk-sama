import { useCallback, useEffect } from 'react';
import { useSession, useSessionStore } from '@/contexts/SessionContext';
import { SessionStatus } from '@/contexts/types';
import { createActionFactory } from '@/factories';
import type { WebSocketService } from '@/services';
import type { SessionEndReason } from '@/types/transport';

export const REMOTE_RECONNECT_GRACE_MS = 2 * 60 * 1000;
const UNEEQ_RESTART_FALLBACK_MS = 8000;

export const useKioskSessionLifecycle = (websocket: WebSocketService | null) => {
  const { state, actions } = useSession();

  const endKioskSession = useCallback((reason: SessionEndReason) => {
    const { remoteInfo, uneeq } = useSessionStore.getState().state;

    console.log(
      '%c🔚 KIOSK SESSION ENDED',
      'background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      reason
    );

    if (websocket && remoteInfo?.connectionId) {
      websocket.send(createActionFactory().sessionEnded(remoteInfo.connectionId, reason), true);
    }

    actions.requestSessionEnd(null);
    actions.resetConversation();
    actions.rotateSessionToken();

    if (!uneeq) return;
    // startSession must wait for SessionEnded; the SDK ignores it while the old session is still live
    actions.setUneeqRestartPending(true);
    actions.setSessionStatus(SessionStatus.LOADING);
    uneeq.endSession();
  }, [websocket, actions]);

  useEffect(() => {
    if (!state.uneeqRestartPending) return;

    const fallback = setTimeout(() => {
      const { uneeqRestartPending, uneeq } = useSessionStore.getState().state;
      if (!uneeqRestartPending) return;
      console.warn('[useKioskSessionLifecycle] SessionEnded not received, starting new session anyway');
      actions.setUneeqRestartPending(false);
      uneeq?.startSession();
    }, UNEEQ_RESTART_FALLBACK_MS);

    return () => clearTimeout(fallback);
  }, [state.uneeqRestartPending, actions]);

  useEffect(() => {
    if (!state.sessionEndRequest) return;
    endKioskSession(state.sessionEndRequest);
  }, [state.sessionEndRequest, endKioskSession]);

  useEffect(() => {
    if (state.remoteDisconnectedAt === null) return;

    const remaining = Math.max(0, state.remoteDisconnectedAt + REMOTE_RECONNECT_GRACE_MS - Date.now());
    const timeout = setTimeout(() => endKioskSession('remote-timeout'), remaining);

    return () => clearTimeout(timeout);
  }, [state.remoteDisconnectedAt, endKioskSession]);

  useEffect(() => {
    if (!websocket) return;

    const notifyRemote = () => {
      const remoteConnectionId = useSessionStore.getState().state.remoteInfo?.connectionId;
      if (!remoteConnectionId) return;
      websocket.send(createActionFactory().sessionEnded(remoteConnectionId, 'kiosk-closed'));
    };

    window.addEventListener('pagehide', notifyRemote);
    window.addEventListener('beforeunload', notifyRemote);

    return () => {
      window.removeEventListener('pagehide', notifyRemote);
      window.removeEventListener('beforeunload', notifyRemote);
    };
  }, [websocket]);

  return { endKioskSession };
};
