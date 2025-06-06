import type { RemoteSessionInfo } from '@/types/RemoteSessionInfo';

export function UserInspectService(connectionId: string): RemoteSessionInfo {
  // Helper functions to extract information
  function getBrowserInfo(): string {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) browser = "Internet Explorer";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";
    else if (ua.indexOf("Opera") > -1) browser = "Opera";
    return browser;
  }

  function getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    if (/Windows Phone/.test(ua)) return "Windows Phone";
    if (/Windows/.test(ua)) return "Windows";
    if (/Macintosh/.test(ua)) return "Mac";
    if (/Linux/.test(ua)) return "Linux";
    return "Desktop";
  }

  function getConnectionType(): string {
    // @ts-ignore - navigator.connection is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || "";
  }

  function getPlatformInfo(): string {
    const ua = navigator.userAgent;
    if (/Windows NT/.test(ua)) return "Windows";
    if (/Macintosh/.test(ua)) return "macOS";
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    if (/Linux/.test(ua)) return "Linux";
    if (/CrOS/.test(ua)) return "ChromeOS";
    return "Unknown";
  }

  // Collect comprehensive user information
  const userInfo: RemoteSessionInfo = { 
    connectionId: connectionId,
    userAgent: navigator.userAgent,
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    platform: getPlatformInfo(),
    language: navigator.language,
    // Screen information
    screen: {
      width: window.screen.width || 0,
      height: window.screen.height || 0,
    },
    viewport: {
      width: window.innerWidth || 0,
      height: window.innerHeight || 0,
    },
    // Connection information
    connectionType: getConnectionType(),
    online: navigator.onLine,
    // Context information
    referrer: document.referrer,
    url: window.location.href,
    // Time information
    timestamp: new Date().toISOString(),
  };

  return userInfo;
}
