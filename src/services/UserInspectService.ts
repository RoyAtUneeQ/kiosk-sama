import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';
import type { UserInspectServiceOptions } from './types/UserInspectServiceTypes';

/**
 * Service for collecting browser and device information.
 * Provides user agent, device, screen, and connection details.
 */
export class UserInspectService {
  /**
   * Create a new inspection service.
   *
   * @param _options - Reserved for future configuration.
   */
  constructor(_options: UserInspectServiceOptions = {}) {
    // Future options can be added here
  }

  /**
   * Collect comprehensive session information for a connection.
   *
   * @param connectionId - Remote connection identifier.
   * @returns Snapshot suitable for reporting to backend.
   */
  public collect(connectionId: string): RemoteSessionInfo {
    try {
      return {
        connectionId,
        userAgent: navigator.userAgent,
        browser: this.getBrowserInfo(),
        device: this.getDeviceInfo(),
        platform: this.getPlatformInfo(),
        language: navigator.language,
        screen: {
          width: window.screen?.width || 0,
          height: window.screen?.height || 0,
        },
        viewport: {
          width: window.innerWidth || 0,
          height: window.innerHeight || 0,
        },
        connectionType: this.getConnectionType(),
        online: navigator.onLine,
        referrer: document.referrer || '',
        url: window.location.href || '',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError('collect', error);
      throw new Error(`Failed to collect user information: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get basic browser information.
   */
  public getBrowserInfo(): string {
    try {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) return 'Chrome';
      if (ua.includes('Safari')) return 'Safari';
      if (ua.includes('Firefox')) return 'Firefox';
      if (ua.includes('MSIE') || ua.includes('Trident')) return 'Internet Explorer';
      if (ua.includes('Edge')) return 'Edge';
      if (ua.includes('Opera')) return 'Opera';
      return 'Unknown';
    } catch (error) {
      this.handleError('getBrowserInfo', error);
      return 'Unknown';
    }
  }

  /**
   * Get device type information.
   */
  public getDeviceInfo(): string {
    try {
      const ua = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
      if (/Android/.test(ua)) return 'Android';
      if (/Windows Phone/.test(ua)) return 'Windows Phone';
      if (/Windows/.test(ua)) return 'Windows';
      if (/Macintosh/.test(ua)) return 'Mac';
      if (/Linux/.test(ua)) return 'Linux';
      return 'Desktop';
    } catch (error) {
      this.handleError('getDeviceInfo', error);
      return 'Unknown';
    }
  }

  /**
   * Get platform information.
   */
  public getPlatformInfo(): string {
    try {
      const ua = navigator.userAgent;
      if (/Windows NT/.test(ua)) return 'Windows';
      if (/Macintosh/.test(ua)) return 'macOS';
      if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
      if (/Android/.test(ua)) return 'Android';
      if (/Linux/.test(ua)) return 'Linux';
      if (/CrOS/.test(ua)) return 'ChromeOS';
      return 'Unknown';
    } catch (error) {
      this.handleError('getPlatformInfo', error);
      return 'Unknown';
    }
  }

  /**
   * Get connection type information.
   */
  public getConnectionType(): string {
    try {
      const navigatorAny = navigator as unknown as {
        connection?: { effectiveType?: string };
        mozConnection?: { effectiveType?: string };
        webkitConnection?: { effectiveType?: string };
      };
      
      const connection = navigatorAny.connection || 
                        navigatorAny.mozConnection || 
                        navigatorAny.webkitConnection;
      
      return connection?.effectiveType || '';
    } catch (error) {
      this.handleError('getConnectionType', error);
      return '';
    }
  }

  /**
   * Log errors with method context.
   */
  private handleError(method: string, error: unknown): void {
    console.error(`[UserInspectService] ${method} failed:`, error);
  }
}

export default UserInspectService;


