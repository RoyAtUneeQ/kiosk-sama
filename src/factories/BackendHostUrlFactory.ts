import type { Config } from '@/types';

type Protocols = { ws: 'ws' | 'wss'; http: 'http' | 'https' };

export class BackendHostUrlFactory {
  /**
   * Infer secure/plain protocols based on window location.
   */
  static getProtocols(): Protocols {
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      return { ws: isHttps ? 'wss' : 'ws', http: isHttps ? 'https' : 'http' };
    } catch {
      return { ws: 'ws', http: 'http' };
    }
  }

  static getWebSocketHost(config?: Config | null): string {
    const host = config?.backend?.host?.trim() || 'localhost';
    const backendAny = (config?.backend as any) || {};
    const wsPortCandidate = (backendAny.ports?.ws as number | undefined) ?? (backendAny.wsPort as number | undefined);
    const sharedPortCandidate = (backendAny.port as number | undefined);
    const port = Number.isFinite(wsPortCandidate as number)
      ? (wsPortCandidate as number)
      : Number.isFinite(sharedPortCandidate as number)
        ? (sharedPortCandidate as number)
        : 3001;
    return `${host}${port ? `:${port}` : ''}`;
  }

  static getHttpHost(config?: Config | null): string {
    const host = config?.backend?.host?.trim() || 'localhost';
    const backendAny = (config?.backend as any) || {};
    const httpPortCandidate = (backendAny.ports?.http as number | undefined) ?? (backendAny.httpPort as number | undefined);
    const sharedPortCandidate = (backendAny.port as number | undefined);
    const port = Number.isFinite(httpPortCandidate as number)
      ? (httpPortCandidate as number)
      : Number.isFinite(sharedPortCandidate as number)
        ? (sharedPortCandidate as number)
        : 3000;
    return `${host}${port ? `:${port}` : ''}`;
  }

  static getWebSocketUrl(config?: Config | null): string {
    const { ws } = this.getProtocols();
    return `${ws}://${this.getWebSocketHost(config)}`;
  }

  static getHttpBaseUrl(config?: Config | null): string {
    const { http } = this.getProtocols();
    return `${http}://${this.getHttpHost(config)}`;
  }

  static getApiKey(config?: Config | null): string | undefined {
    return config?.backend?.key || undefined;
  }

  static buildHttpUrl(pathname: string, config?: Config | null): string {
    const base = this.getHttpBaseUrl(config);
    const url = new URL(pathname.startsWith('/') ? pathname : `/${pathname}`, base);
    return url.toString();
  }
}

export default BackendHostUrlFactory;


