// WebSocket action union type
export type WebsocketAction =
  | import('./ActionGetConnectionId').ActionGetConnectionId
  | import('./ActionPeerConnect').ActionPeerConnect
  | import('./ActionCheckPeerConnection').ActionCheckPeerConnection
  | import('./ActionPeerMessage').ActionPeerMessage
  | import('./ActionPeerAudioTranscribe').ActionPeerAudioTranscribe
  | import('./ActionCloseSession').ActionCloseSession
  | import('./ActionServiceToken').ActionServiceToken;

  