import type {
  EphemeralTokenServiceOptions,
  TokenCacheEntry,
  ServiceType,
  TokenResponse
} from '../types/EphemeralTokenServiceTypes';

export class EphemeralTokenService {
  private static cache = new Map<string, TokenCacheEntry>();
  private readonly apiBaseUrl?: string;
  private readonly apiKey?: string;

  constructor(options: EphemeralTokenServiceOptions = {}) {
    this.apiBaseUrl = options.apiBaseUrl;
    this.apiKey = options.apiKey;
  }

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

    const tokenResponse = await this.fetchToken(provider, service, ttlSeconds);
    this.cacheToken(key, tokenResponse);
    return tokenResponse.value;
  }

  private getCachedToken(key: string): string | null {
    const now = Date.now();
    const cached = EphemeralTokenService.cache.get(key);
    
    if (cached && cached.expiresAtMs - now > 5000) {
      return cached.value;
    }
    
    return null;
  }

  private cacheToken(key: string, tokenResponse: TokenResponse): void {
    EphemeralTokenService.cache.set(key, {
      value: tokenResponse.value,
      expiresAtMs: tokenResponse.expiresAtMs
    });
  }

  private async fetchToken(
    provider: string,
    service: ServiceType,
    ttlSeconds: number
  ): Promise<TokenResponse> {
    const baseUrl = this.apiBaseUrl || this.deriveHttpFromWindow();
    
    if (!baseUrl) {
      throw new Error('No API base URL configured');
    }

    // Debug logging

    // Ensure baseUrl ends with / to properly append the path
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = new URL('service-token', normalizedBaseUrl);
    url.searchParams.set('provider', provider);
    url.searchParams.set('service', service);
    url.searchParams.set('ttl', String(ttlSeconds));
    

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        ...(this.apiKey ? { 'x-api-key': this.apiKey } : {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unable to read error response');
      console.error(`[EphemeralTokenService] HTTP ${response.status}: ${response.statusText}`, errorBody);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const body = await response.json();
    const token = body?.token || body?.value;
    const expiresAtMs = Number(body?.expiresAtMs) || 0;

    if (!token || !Number.isFinite(expiresAtMs)) {
      throw new Error('Invalid token response format');
    }

    return { value: token, expiresAtMs };
  }

  private deriveHttpFromWindow(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    
    // For development, use the production API URL as fallback
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.warn('[EphemeralTokenService] Using production API URL for localhost development');
      return 'https://kf9xhxg0o5.execute-api.eu-central-1.amazonaws.com/dev';
    }
    
    return `${window.location.protocol}//${window.location.host}`;
  }
}

export default EphemeralTokenService;


