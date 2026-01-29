import { CameraDistanceAnchor, CameraHorizontalAnchor } from '../constants';

export type UneeqOptions = {
  personaId: string;

  connectionUrl: string;

  layoutMode?: string;
  containedElementIdName: string;
  containedAutoLayout?: boolean;
  mobileViewWidthBreakpoint?: number;
  layoutModeChangeSpeedMs?: number;
  autoStart?: boolean;
  allowResumeSession?: boolean;
  initLoadHandler?: boolean;
  token?: string;
  tokenExpiry?: string;
  sessionId?: string;
  mapPath?: string;
  verboseLogging?: boolean;
  cameraAnchorPosition?: string;
  cameraAnchorDistance?: keyof typeof CameraDistanceAnchor;
  cameraAnchorHorizontal?: keyof typeof CameraHorizontalAnchor;
  platformUnavailableError?: string;
  captionsPosition?: string;
  ctaThumbnailUrl?: string;
  customMetadata?: any;
  customStyles?: string;
  displayCallToAction?: boolean;
  enableMicrophone?: boolean;
  enableVad?: boolean;
  languageStrings?: Record<string, Record<string, string>>;
  logLevel?: string;
  renderContent?: boolean;
  showClosedCaptions?: boolean;
  showUserInputInterface?: boolean;
  speechRecognitionHintPhrases?: string;
  speechRecognitionHintPhrasesBoost?: number;
  speechRecognitionLocales?: string;
  welcomePrompt?: string;

}

export const defaultUneeqOptions: UneeqOptions = {
  connectionUrl: '',
  personaId: '',
  containedElementIdName: 'uneeqContainedLayout',
  displayCallToAction: false,
  cameraAnchorDistance: 'medium_shot' as keyof typeof CameraDistanceAnchor,
  autoStart: false,
  enableMicrophone: false,
  showClosedCaptions: true,
  showUserInputInterface: true,
  layoutMode: "fullScreen",
  containedAutoLayout: true,
  captionsPosition: "bottom-left",
  languageStrings: {},
  customMetadata: {},
  speechRecognitionHintPhrasesBoost: 0,
  allowResumeSession: false,
  verboseLogging: false,
  logLevel: 'error'
};

declare global {
  var uneeqDeployScriptLocation: string;
}
