import { useEffect, useState } from 'react';
import { useSession } from '@/contexts';
import { WebsocketStatus } from '@/types/transport';
import './WebSocketMonitor.scss';

interface WebSocketStats {
  status: WebsocketStatus;
  connectionId: string | null;
  remoteConnectionId: string | null;
  pendingMessages: number;
  historyCount: number;
  lastUpdate: string;
}

/**
 * WebSocketMonitor - Debug component for monitoring WebSocket health
 * 
 * Usage:
 * 1. Import in your page: import { WebSocketMonitor } from '@/components/debug';
 * 2. Add to render: <WebSocketMonitor />
 * 3. Remove or comment out before production deployment
 * 
 * Features:
 * - Real-time connection status
 * - Pending message count
 * - Connection IDs
 * - Auto-refresh every 2 seconds
 */
export const WebSocketMonitor: React.FC<{ websocket?: any }> = ({ websocket }) => {
  const { state } = useSession();
  const [stats, setStats] = useState<WebSocketStats>({
    status: WebsocketStatus.DISCONNECTED,
    connectionId: null,
    remoteConnectionId: null,
    pendingMessages: 0,
    historyCount: 0,
    lastUpdate: new Date().toLocaleTimeString()
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats({
        status: state.webSocketState,
        connectionId: state.connectionId,
        remoteConnectionId: state.remoteInfo?.connectionId || null,
        pendingMessages: websocket?.getPendingMessagesCount?.() || 0,
        historyCount: state.history.length,
        lastUpdate: new Date().toLocaleTimeString()
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);

    return () => clearInterval(interval);
  }, [state.webSocketState, state.connectionId, state.remoteInfo, state.history.length, websocket]);

  const getStatusColor = (status: WebsocketStatus): string => {
    switch (status) {
      case WebsocketStatus.CONNECTED:
        return '#4CAF50';
      case WebsocketStatus.DISCONNECTED:
        return '#f44336';
      default:
        return '#FF9800';
    }
  };

  const getHealthIndicator = (): { color: string; text: string; emoji: string } => {
    if (stats.status !== WebsocketStatus.CONNECTED) {
      return { color: '#f44336', text: 'Disconnected', emoji: '🔴' };
    }
    if (stats.pendingMessages > 5) {
      return { color: '#f44336', text: 'Unhealthy', emoji: '⚠️' };
    }
    if (stats.pendingMessages > 2) {
      return { color: '#FF9800', text: 'Degraded', emoji: '🟡' };
    }
    return { color: '#4CAF50', text: 'Healthy', emoji: '🟢' };
  };

  const health = getHealthIndicator();

  return (
    <div className="websocket-monitor">
      <div className="monitor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="monitor-icon">{health.emoji}</span>
        <span className="monitor-title">WebSocket {health.text}</span>
        <span className="monitor-toggle">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="monitor-content">
          <div className="monitor-row">
            <span className="monitor-label">Status:</span>
            <span 
              className="monitor-value"
              style={{ color: getStatusColor(stats.status) }}
            >
              {stats.status}
            </span>
          </div>

          <div className="monitor-row">
            <span className="monitor-label">Health:</span>
            <span 
              className="monitor-value"
              style={{ color: health.color }}
            >
              {health.text}
            </span>
          </div>

          <div className="monitor-row">
            <span className="monitor-label">Pending Messages:</span>
            <span 
              className="monitor-value"
              style={{ 
                color: stats.pendingMessages > 5 ? '#f44336' : 
                       stats.pendingMessages > 2 ? '#FF9800' : '#4CAF50'
              }}
            >
              {stats.pendingMessages}
            </span>
          </div>

          <div className="monitor-row">
            <span className="monitor-label">My Connection ID:</span>
            <span className="monitor-value monitor-id">
              {stats.connectionId ? stats.connectionId.substring(0, 8) + '...' : 'None'}
            </span>
          </div>

          <div className="monitor-row">
            <span className="monitor-label">Peer Connection ID:</span>
            <span className="monitor-value monitor-id">
              {stats.remoteConnectionId ? stats.remoteConnectionId.substring(0, 8) + '...' : 'None'}
            </span>
          </div>

          <div className="monitor-row">
            <span className="monitor-label">Message History:</span>
            <span className="monitor-value">{stats.historyCount}</span>
          </div>

          <div className="monitor-row">
            <span className="monitor-label">Last Update:</span>
            <span className="monitor-value">{stats.lastUpdate}</span>
          </div>

          <div className="monitor-help">
            <small>
              🟢 Healthy: All systems operational<br />
              🟡 Degraded: Some pending messages<br />
              ⚠️ Unhealthy: Many pending messages<br />
              🔴 Disconnected: No connection
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketMonitor;
