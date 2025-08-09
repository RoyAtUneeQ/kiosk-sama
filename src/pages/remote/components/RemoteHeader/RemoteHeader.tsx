import './RemoteHeader.scss';
import React from 'react';
import { FiLink } from 'react-icons/fi';

interface RemoteHeaderProps {
  title: string;
  webSocketState: string; // expects values from WebsocketStatus
  kioskConnectionId?: string;
  connectionId?: string | null;
}

const RemoteHeader: React.FC<RemoteHeaderProps> = ({ title, webSocketState, kioskConnectionId, connectionId }) => {
  return (
    <div className="chat-header">
      <h1 className="header-title">{title}</h1>
      <div className="icon-button status-button" role="button" aria-label="Connection" title="Connection">
        <FiLink />
        <div className="tooltip" role="tooltip">
          <div className="tooltip-title">Kiosk connection</div>
          <div className="tooltip-row">
            <span className={`value ${webSocketState.toLowerCase()}`}>{webSocketState}</span>
          </div>
          {kioskConnectionId && (
            <div className="tooltip-row">
              <span className="label">Kiosk ID</span>
              <span className="value mono">{kioskConnectionId}</span>
            </div>
          )}
          {connectionId && (
            <div className="tooltip-row">
              <span className="label">Your ID</span>
              <span className="value mono">{connectionId}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoteHeader;

