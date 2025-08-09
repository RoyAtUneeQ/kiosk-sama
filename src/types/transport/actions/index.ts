// WebSocket action union type
export type WebsocketAction =
  | import('./ActionGetConnectionId').ActionGetConnectionId
  | import('./ActionPeerConnect').ActionPeerConnect
  | import('./ActionCheckPeerConnection').ActionCheckPeerConnection
  | import('./ActionPeerMessage').ActionPeerMessage
  | import('./ActionCloseSession').ActionCloseSession;

  