/**
 * Options for configuring `EphemeralTokenService` HTTP behavior.
 */
export interface EphemeralTokenServiceOptions {
  /**
   * Base URL of the backend issuing ephemeral tokens. If not provided, the
   * service attempts to derive it from `window.location`.
   */
  apiBaseUrl?: string;
  /**
   * Optional API key to attach via `X-Api-Key` header when requesting tokens.
   */
  apiKey?: string;
}

/**
 * In-memory cache record for an issued token.
 */
export interface TokenCacheEntry {
  /** Token value string. */
  value: string;
  /** Absolute epoch time in milliseconds at which the token expires. */
  expiresAtMs: number;
}

/**
 * Supported service types for token issuance.
 * - `stt`: Speech-to-text
 * - `tts`: Text-to-speech
 */
export type ServiceType = 'stt' | 'tts';

/**
 * Standardized shape returned by the token endpoint.
 */
export interface TokenResponse {
  /** Issued token value. */
  value: string;
  /** Absolute epoch expiration time (ms). */
  expiresAtMs: number;
}
