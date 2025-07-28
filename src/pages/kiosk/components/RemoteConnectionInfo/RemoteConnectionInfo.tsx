import './RemoteConnectionInfo.scss';
import React from 'react';
import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';

// Keep the existing RemoteInfo type for backward compatibility
export type RemoteInfo = RemoteSessionInfo;

const RemoteConnection: React.FC<{ info: RemoteInfo }> = ({ info }) => {
  return (
    <div className="remote-connection-container">
      <div className="remote-connection-icon" tabIndex={0}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#fff' }}>
          <path d="M17 1.01L7 1C5.9 1 5 1.9 5 3V21C5 22.1 5.9 23 7 23H17C18.1 23 19 22.1 19 21V3C19 1.9 18.1 1.01 17 1.01ZM17 19H7V5H17V19Z" fill="currentColor"/>
          <path d="M12 21C12.55 21 13 20.55 13 20C13 19.45 12.55 19 12 19C11.45 19 11 19.45 11 20C11 20.55 11.45 21 12 21Z" fill="currentColor"/>
          <path d="M16 0.5L16 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 0.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 0.5L12 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 20.5L16 23.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M8 20.5L8 23.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M12 20.5L12 23.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <div className="remote-connection-tooltip">
          <div className="tooltip-title">Remote Connected</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Connection ID:</span> 
            <span className="tooltip-value">{info.connectionId}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Device:</span> 
            <span className="tooltip-value">{info.device}</span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Browser:</span> 
            <span className="tooltip-value">{info.browser}</span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Platform:</span> 
            <span className="tooltip-value">{info.platform}</span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Screen:</span> 
            <span className="tooltip-value">{info.screen.width}x{info.screen.height}</span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Connection:</span> 
            <span className="tooltip-value">{info.online ? 'Online' : 'Offline'}{info.connectionType ? ` (${info.connectionType})` : ''}</span>
          </div>
          
          <div className="tooltip-row">
            <span className="tooltip-label">Connected:</span> 
            <span className="tooltip-value">{new Date(info.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoteConnection;
