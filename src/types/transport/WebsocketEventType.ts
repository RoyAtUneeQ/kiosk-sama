export enum WebSocketEventType {
  CONNECTION_ID = 'connectionId',
  REGISTER_REMOTE = 'RegisterRemote',
  PEER_MESSAGE = 'peerMessage',
  HISTORY_SYNC = 'historySync',
  SERVICE_TOKEN = 'ServiceToken',
  PEER_CHECKED = 'PeerChecked',
  PEER_DISCONNECTED = 'PeerDisconnected',
  PING = 'ping',
  PONG = 'pong',
}