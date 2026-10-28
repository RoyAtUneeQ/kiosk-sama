import type { SessionContextType } from '@/contexts/SessionContext';
import { useSessionStore } from '@/contexts/SessionContext';
import type { SessionControlMessage } from '@/types/transport/SessionControl';
export class SessionControlListener {
  static isSessionControl(data: unknown): data is SessionControlMessage {
    return (data as SessionControlMessage | undefined)?.type === 'sessionControl';
  }

  static execute(payload: { data: SessionControlMessage }, session: SessionContextType): void {
    const message = payload.data;
    const { role, remoteInfo } = useSessionStore.getState().state;

    console.log(
      '%c🔚 SESSION CONTROL',
      'background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      message.action,
      message.reason
    );

    if (role === 'kiosk' && message.action === 'end') {
      if (!remoteInfo) return;
      session.actions.requestSessionEnd(message.reason);
      return;
    }

    if (role === 'remote' && message.action === 'ended') {
      session.actions.setSessionEnded(message.reason);
    }
  }
}
