export type RemoteSessionInfo = {
  connectionId: string; 

  // Device Information
  userAgent: string;
  browser: string;
  device: string;
  platform: string;
  language: string;
  
  // Screen Information
  screen: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  
  // Connection Information
  connectionType?: string;
  online: boolean;
  
  // Context Information
  referrer: string;
  url: string;
  
  // Time Information
  timestamp: string;
}; 