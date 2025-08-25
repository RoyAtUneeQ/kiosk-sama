import type {
  EphemeralTokenServiceOptions,
  TokenCacheEntry,
  ServiceType,
  TokenResponse
} from './types/EphemeralTokenServiceTypes';

/**
 * Service for fetching and caching ephemeral service tokens over HTTP.
 * Provides automatic token refresh and in-memory caching.
 *
 * @example
 * const svc = new EphemeralTokenService({ apiBaseUrl: 'https://api.example.com' });
 * const token = await svc.ensure('deepgram', 'stt', 60);
 */
export class EphemeralTokenService {
  private static cache = new Map<string, TokenCacheEntry>();
  private readonly apiBaseUrl?: string;
  private readonly apiKey?: string;

  /**
   * Create a new token service.
   *
   * @param options - HTTP configuration for token fetching.
   */
  constructor(options: EphemeralTokenServiceOptions = {}) {
    this.apiBaseUrl = options.apiBaseUrl;
    this.apiKey = options.apiKey;
  }

  /**
   * Ensure a valid token is available for the specified provider and service.
   * Will return a cached token if it remains valid for at least 5 seconds.
   *
   * @param provider - Provider namespace (e.g., 'deepgram').
   * @param service - Service type, such as 'stt' or 'tts'.
   * @param ttlSeconds - Desired token time-to-live.
   * @returns Resolves with a token string.
   */
  public async ensure(
    provider: string,
    service: ServiceType,
    ttlSeconds: number = 60,
  ): Promise<string> {
    const key = `${provider}:${service}`;
    const cached = this.getCachedToken(key);
    
    if (cached) {
      return cached;
    }

    try {
      const tokenResponse = await this.fetchToken(provider, service, ttlSeconds);
      this.cacheToken(key, tokenResponse);
      return tokenResponse.value;
    } catch (error) {
      this.handleError('ensure', error);
      throw new Error(`Token request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Return a valid cached token for the composite key, or null if missing/stale.
   *
   * @param key - Cache key in the format `${provider}:${service}`.
   */
  private getCachedToken(key: string): string | null {
    const now = Date.now();
    const cached = EphemeralTokenService.cache.get(key);
    
    if (cached && cached.expiresAtMs - now > 5000) {
      return cached.value;
    }
    
    return null;
  }

  /**
   * Store a token response in the in-memory cache.
   */
  private cacheToken(key: string, tokenResponse: TokenResponse): void {
    EphemeralTokenService.cache.set(key, {
      value: tokenResponse.value,
      expiresAtMs: tokenResponse.expiresAtMs
    });
  }

  /**
   * Perform the HTTP request to obtain a new token from the backend.
   *
   * @param provider - Provider namespace (e.g., 'deepgram').
   * @param service - Service type, such as 'stt' or 'tts'.
   * @param ttlSeconds - Desired token time-to-live.
   */
  private async fetchToken(
    provider: string,
    service: ServiceType,
    ttlSeconds: number
  ): Promise<TokenResponse> {
    const baseUrl = this.apiBaseUrl || this.deriveHttpFromWindow();
    
    if (!baseUrl) {
      throw new Error('No API base URL configured');
    }

    console.log('[EphemeralTokenService] baseUrl:', baseUrl);
    const baseUrlObj = new URL(baseUrl);
    baseUrlObj.pathname = baseUrlObj.pathname.endsWith('/') 
      ? baseUrlObj.pathname + 'service-token' 
      : baseUrlObj.pathname + '/service-token';
    const url = baseUrlObj;
    console.log('[EphemeralTokenService] constructed URL:', url.toString());
    url.searchParams.set('provider', provider);
    url.searchParams.set('service', service);
    url.searchParams.set('ttl', String(ttlSeconds));

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...(this.apiKey ? { 'X-Api-Key': this.apiKey } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const body = await response.json();
    const token = body?.token || body?.value;
    const expiresAtMs: number = Number(body?.expiresAtMs) || 0;

    if (!token || !Number.isFinite(expiresAtMs)) {
      throw new Error('Invalid token response format');
    }

    return { value: token, expiresAtMs };
  }

  /**
   * Derive an HTTP base URL from the browser window location.
   */
  private deriveHttpFromWindow(): string {
    try {
      if (typeof window === 'undefined') {
        return '';
      }
      return `${window.location.protocol}//${window.location.host}`;
    } catch (error) {
      this.handleError('deriveHttpFromWindow', error);
      return '';
    }
  }

  /**
   * Log errors with method context.
   */
  private handleError(method: string, error: unknown): void {
    console.error(`[EphemeralTokenService] ${method} failed:`, error);
  }
}

export default EphemeralTokenService;


