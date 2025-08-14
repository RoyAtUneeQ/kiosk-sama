/**
 * Configuration options for Deepgram live transcription streams.
 *
 * Use with `DeepgramStreamService` to establish and manage a live
 * transcription session.
 *
 * @example
 * const options: DeepgramServiceOptions = {
 *   token: 'dg_xxx',
 *   model: 'nova-2',
 *   language: 'en',
 *   encoding: 'linear16',
 *   sampleRate: 16000,
 *   channels: 1,
 *   smartFormat: true,
 *   onPartial: (t) => console.log('partial', t),
 *   onFinal: (t) => console.log('final', t),
 * };
 */
export interface DeepgramServiceOptions {
  /**
   * Optional Deepgram access token. If omitted, the service will throw on connect.
   */
  token?: string;
  /**
   * Deepgram model name (e.g., "nova-2").
   */
  model: string;
  /**
   * Language code (e.g., "en").
   */
  language: string;
  /**
   * Audio encoding (e.g., "linear16").
   */
  encoding: string;
  /**
   * Audio sample rate in Hz (e.g., 16000).
   */
  sampleRate: number;
  /**
   * Number of audio channels.
   */
  channels: number;
  /**
   * Enables Deepgram smart formatting for punctuation, capitalization, etc.
   */
  smartFormat: boolean;
  /**
   * Callback invoked when the socket opens.
   */
  onOpen?: () => void;
  /**
   * Callback for partial (interim) transcripts.
   */
  onPartial?: (text: string) => void;
  /**
   * Callback for final transcripts.
   */
  onFinal?: (text: string) => void;
  /**
   * Callback for errors originating from the Deepgram stream or client methods.
   */
  onError?: (error: any) => void;
  /**
   * Callback invoked when the socket closes.
   */
  onClose?: () => void;
}
