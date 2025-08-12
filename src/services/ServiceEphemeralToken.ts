type Key = `${string}:${string}`; // provider:service

import WSClient from '@/services/WebSocketClient';
import { createAction } from '@/utils';

class ServiceEphemeralToken {
  private map = new Map<Key, { value: string; expiresAt: string }>();

  set(provider: string, service: 'stt' | 'tts', value: string, expiresAt: string) {
    this.map.set(`${provider}:${service}`, { value, expiresAt });
  }

  get(provider: string, service: 'stt' | 'tts') {
    return this.map.get(`${provider}:${service}`) || null;
  }

  async ensure(
    provider: string,
    service: 'stt' | 'tts',
    ttlSeconds: number = 60,
    timeoutMs: number = 5000,
    pollIntervalMs: number = 100,
  ): Promise<string> {
    const cached = this.get(provider, service);

    console.log('cached', cached);
    if (cached && ServiceEphemeralToken.isNotExpired(Number(cached.expiresAt) || 0)) {
      return cached.value;
    }

    // Ask backend via app WebSocket
    console.log('requesting service token', provider, service, ttlSeconds);
    WSClient.send(createAction.requestServiceToken(provider, service, ttlSeconds));

    console.log('waiting for service token', provider, service, ttlSeconds);
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const issued = this.get(provider, service);
      console.log('issued', issued);
      if (issued && ServiceEphemeralToken.isNotExpired(Number(issued.expiresAt) || 0)) {
        return issued.value;
      }
      await ServiceEphemeralToken.sleep(pollIntervalMs);
    }

    throw new Error('Timed out waiting for service token');
  }

  private static isNotExpired(expiresAt: number): boolean {
    const now = Date.now();
    const exp = expiresAt;
    // 5s safety margin
    return Number.isFinite(exp) && exp - now > 5000;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default new ServiceEphemeralToken();


