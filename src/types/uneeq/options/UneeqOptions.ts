import { CameraDistanceAnchor, CameraHorizontalAnchor } from '../constants';

/**
 * Configuration options for UneeQ digital human interface.
 */
export type UneeqOptions = {
  /**
   * Persona ID for the UneeQ frame.
   */
  personaId: string;

  /**
   * URL for the connection endpoint.
   */
  connectionUrl: string;

  /**
   * Layout mode for the UneeQ frame ('fullScreen', 'overlay', or 'contained').
   * Default value is 'overlay'.
   */
  layoutMode?: string;
  /**
   * Element ID to contain the UneeQ frame in contained mode.
   * To use this layout mode the client must have a div element on the page with the id uneeqContainedLayout.
   */
  containedElementIdName: string;
  /**
   * Whether to automatically switch between contained and overlay modes based on scroll position.
   */
  containedAutoLayout?: boolean;
  /**
   * Breakpoint width in pixels for switching to mobile layout.
   */
  mobileViewWidthBreakpoint?: number;
  /**
   * Animation duration in milliseconds for layout mode transitions.
   */
  layoutModeChangeSpeedMs?: number;
  /**
   * Whether to automatically start the session.
   * This option will configure your session to start automatically on page load, without calling startSession().
   * Default value is false.
   */
  autoStart?: boolean;
  /**
   * A boolean indicating whether to automatically resume a previous session if one exists.
   * If set to true, the system will attempt to restore the last active session based on stored session data - within 24 hours.
   * Session data is stored per personaId, meaning each persona maintains its own session history.
   * If false or omitted, a new session will always be created.
   * Default value is false.
   */
  allowResumeSession?: boolean;
  /**
   * A boolean indicating whether the digital human frame should be initialised on page load.
   * When this value is true the digital human frame will be initialized when the page is loaded (via a page load event handler).
   * When this value is false , then the digital human frame will not be added to the page on page load.
   * If you set this value to false then you will need to call uneeq.init() yourself when you want the digital human frame to be loaded.
   * Default value is true.
   */
  initLoadHandler?: boolean;
  /**
   * Session token (set internally when session is created).
   */
  token?: string;
  /**
   * Expiry time for the token (set internally).
   */
  tokenExpiry?: string;
  /**
   * Session ID (set internally when session is created).
   */
  sessionId?: string;
  /**
   * Map path (set internally when session is created).
   */
  mapPath?: string;
  /**
   * Enable verbose logging.
   * @deprecated Use logLevel instead.
   */
  verboseLogging?: boolean;
  /**
   * @deprecated Use cameraAnchorDistance or cameraAnchorHorizontal instead
   */
  cameraAnchorPosition?: string;
  /**
   * A string defining the initial camera anchor distance (zoom) when the session starts.
   * Values: CameraDistanceAnchor enum keys.
   */
  cameraAnchorDistance?: keyof typeof CameraDistanceAnchor;
  /**
   * A string defining the initial camera anchor horizontal position when the session starts.
   * Values: CameraHorizontalAnchor enum keys.
   */
  cameraAnchorHorizontal?: keyof typeof CameraHorizontalAnchor;
  /**
   * Custom error message when platform is unavailable.
   */
  platformUnavailableError?: string;
  /**
   * (Optional) A string defining where the closed captions will be positioned.
   * Default value is 'bottom-left'.
   * Values: 'bottom-left', 'bottom-right', 'bottom', 'top-left', 'top-right', 'top'.
   */
  captionsPosition?: string;
  /**
   * (Optional) A string URL to override the call-to-action thumbnail image.
   * The image provided by the URL should be a square 140px .jpg .png or .gif.
   */
  ctaThumbnailUrl?: string;
  /**
   * (Optional) JSON data to be passed with all chat prompt or voice prompts.
   * Note, this value can be overwritten at run time using setCustomPromptMetadata().
   * Data set via customMetadata will be sent to your conversation platform, and may be used when generating responses.
   */
  customMetadata?: any;
  /**
   * (Optional) A string defining custom css that will be applied to the hosted experience frame.
   */
  customStyles?: string;
  /**
   * (Optional) A boolean indicating whether to display a call to action.
   * Default value is true.
   */
  displayCallToAction?: boolean;
  /**
   * (Optional) A boolean indicating whether the microphone permission is requested as soon as the session starts.
   * Default value is false.
   */
  enableMicrophone?: boolean;
  /**
   * (Optional) A boolean indicating whether to enable voice activity detection (VAD).
   * VAD allows the user to speak without pushing a button to start/stop recording.
   * Setting this value to false will require the user to push to talk.
   * Default value is true.
   */
  enableVad?: boolean;
  /**
   * (Optional) The languageStrings property can be defined to update any of the text displayed within the Hosted Experience interface.
   */
  languageStrings?: Record<string, Record<string, string>>;
  /**
   * (Optional) A string defining the desired log level.
   * Selecting a lower log level will include all log levels above it.
   * Values: 'error', 'warn', 'info', 'debug', 'trace'.
   */
  logLevel?: string;
  /**
   * (Optional) A boolean indicating whether to render HTML content within the digital human frame.
   * If this option is set to false, you may choose to catch the html content message in the client implementation and render content within your own view.
   */
  renderContent?: boolean;
  /**
   * (Optional) A boolean indicating whether to show closed captions within the view.
   * When disabled, the client may catch the event and render their close.
   * The default value is true.
   */
  showClosedCaptions?: boolean;
  /**
   * (Optional) A boolean indicating whether to show the user input interface, which includes the text input element used for typing text messages, and the microphone mute button.
   * When disabled, you may prefer to implement your own input interface outside of the UneeQ frame.
   * Default value is true.
   */
  showUserInputInterface?: boolean;
  /**
   * (Optional) A comma separated string of hint phrases that should be used to hint the speech recognition system about words to expect.
   */
  speechRecognitionHintPhrases?: string;
  /**
   * (Optional) An integer between 0 and 20 that can be used to boost the likelyhood of hint phrase words being detected in speech.
   */
  speechRecognitionHintPhrasesBoost?: number;
  /**
   * (Optional) This option specifies up to four locales that the Digital Human should understand a person speaking (speech recognition).
   * The locales are specified in the BCP-47 format e.g "en-US".
   * The first locale is considered the primary locale.
   * Locales should be separated with a colon.
   */
  speechRecognitionLocales?: string;
  /**
   * (Optional) The prompt that will be sent to your conversation (LLM) system when the session starts.
   * Default value is "Hello".
   */
  welcomePrompt?: string;
  
}

/**
 * Default options for the UneeQ digital human interface.
 */
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
  verboseLogging: false
};

declare global {
  var uneeqDeployScriptLocation: string;
}
