import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';

class UserInspectService {
  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) return 'Internet Explorer';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Opera') > -1) return 'Opera';
    return 'Unknown';
  }

  private getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows Phone/.test(ua)) return 'Windows Phone';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Desktop';
  }

  private getConnectionType(): string {
    const navigatorAny = navigator as unknown as {
      connection?: { effectiveType?: string };
      mozConnection?: { effectiveType?: string };
      webkitConnection?: { effectiveType?: string };
    };
    const connection = navigatorAny.connection || navigatorAny.mozConnection || navigatorAny.webkitConnection;
    return connection?.effectiveType || '';
  }

  private getPlatformInfo(): string {
    const ua = navigator.userAgent;
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/Macintosh/.test(ua)) return 'macOS';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Linux/.test(ua)) return 'Linux';
    if (/CrOS/.test(ua)) return 'ChromeOS';
    return 'Unknown';
  }

  collect(connectionId: string): RemoteSessionInfo {
    return {
      connectionId,
      userAgent: navigator.userAgent,
      browser: this.getBrowserInfo(),
      device: this.getDeviceInfo(),
      platform: this.getPlatformInfo(),
      language: navigator.language,
      screen: {
        width: window.screen.width || 0,
        height: window.screen.height || 0,
      },
      viewport: {
        width: window.innerWidth || 0,
        height: window.innerHeight || 0,
      },
      connectionType: this.getConnectionType(),
      online: navigator.onLine,
      referrer: document.referrer,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };
  }
}

export default new UserInspectService();


