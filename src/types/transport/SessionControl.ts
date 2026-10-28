export type SessionEndReason = 'kiosk-closed' | 'remote-ended' | 'remote-timeout' | 'stale-token';

export type SessionControlAction = 'end' | 'ended';

export interface SessionControlMessage {
  type: 'sessionControl';
  action: SessionControlAction;
  reason: SessionEndReason;
}
