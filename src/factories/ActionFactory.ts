import type {
  WebsocketAction
} from "@/types/transport/actions";
import type { RemoteSessionInfo, Message } from "@/types/transport";

export type ActionFactoryDefaults = {
  peerId?: string;
  remoteInfo?: RemoteSessionInfo;
  provider?: string;
  service?: 'stt' | 'tts';
  ttlSeconds?: number;
  params?: Record<string, any>;
  language?: string;
  model?: string;
};

export interface ActionFactory {
  getConnectionId: () => WebsocketAction;
  peerConnect: (peerId?: string, remoteInfo?: RemoteSessionInfo) => WebsocketAction;
  checkPeerConnection: (peerId?: string) => WebsocketAction;
  sendMessage: (peerId: string | undefined, payload: any) => WebsocketAction;
  sendUneeqMessage: (peerId: string, message: Message) => WebsocketAction;
  peerAudioTranscribe: (
    peerId: string | undefined,
    audioBase64: string,
    mimetype: string,
    language?: string,
    model?: string,
  ) => WebsocketAction;
  closeSession: () => WebsocketAction;
  withDefaults: (overrides: Partial<ActionFactoryDefaults>) => ActionFactory;
}

export const createActionFactory = (
  defaults: Partial<ActionFactoryDefaults> = {}
): ActionFactory => {
  const ensure = <T>(value: T | undefined, message: string): T => {
    if (value === undefined || value === null) {
      throw new Error(message);
    }
    return value;
  };

  return {
    getConnectionId: (): WebsocketAction => ({
      type: 'getConnectionId'
    }),

    peerConnect: (
      peerId?: string,
      remoteInfo?: RemoteSessionInfo
    ): WebsocketAction => ({
      type: 'peerConnect',
      peerId: ensure(peerId ?? defaults.peerId, 'peerConnect requires peerId'),
      remoteInfo: ensure(remoteInfo ?? defaults.remoteInfo, 'peerConnect requires remoteInfo')
    }),

    checkPeerConnection: (peerId?: string): WebsocketAction => ({
      type: 'CheckPeerConnection',
      peerId: ensure(peerId ?? defaults.peerId, 'checkPeerConnection requires peerId')
    }),

    sendUneeqMessage: (peerId: string, message: Message): WebsocketAction => ({
      type: 'peerMessage',
      peerId,
      payload: message
    }),
    
    sendMessage: (peerId: string | undefined, payload: any): WebsocketAction => ({
      type: 'peerMessage',
      peerId: ensure(peerId ?? defaults.peerId, 'sendMessage requires peerId'),
      payload
    }),

    peerAudioTranscribe: (
      peerId: string | undefined,
      audioBase64: string,
      mimetype: string,
      language?: string,
      model?: string,
    ): WebsocketAction => ({
      type: 'peerAudioTranscribe',
      peerId: ensure(peerId ?? defaults.peerId, 'peerAudioTranscribe requires peerId'),
      audio: audioBase64,
      mimetype,
      language: language ?? defaults.language,
      model: model ?? defaults.model,
    }),

    closeSession: (): WebsocketAction => ({
      type: 'closeSession'
    }),

    withDefaults: (overrides: Partial<ActionFactoryDefaults>): ActionFactory =>
      createActionFactory({ ...defaults, ...overrides })
  };
};
