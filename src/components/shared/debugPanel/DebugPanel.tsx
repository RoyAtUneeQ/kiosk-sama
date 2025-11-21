import { useState } from 'react';
import { PerformanceMonitor } from '@/services';

interface DebugPanelProps {
  show?: boolean;
}

interface ErrorTestingState {
  shouldThrow: boolean;
  errorType: 'render' | 'async' | 'event';
}

interface PerformanceState {
  enabled: boolean;
}

export const DebugPanel = ({ show = false }: DebugPanelProps) => {
  // Collapsed/Expanded State
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // Error Testing Section State
  const [errorTesting, setErrorTesting] = useState<ErrorTestingState>({
    shouldThrow: false,
    errorType: 'render'
  });
  
  // Performance Monitoring Section State
  const [performance, setPerformance] = useState<PerformanceState>({
    enabled: process.env.NODE_ENV === 'development'
  });
  
  if (!show) return null;
  
  // Render error (caught by ErrorBoundary)
  if (errorTesting.shouldThrow && errorTesting.errorType === 'render') {
    throw new Error('Test render error from DebugPanel component!');
  }

  // Error Testing Handlers
  const handleAsyncError = async () => {
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Test async error - this will NOT be caught by ErrorBoundary!');
  };

  const handleEventError = () => {
    throw new Error('Test event handler error - this will NOT be caught by ErrorBoundary!');
  };

  const triggerError = () => {
    if (errorTesting.errorType === 'render') {
      setErrorTesting(prev => ({ ...prev, shouldThrow: true }));
    } else if (errorTesting.errorType === 'async') {
      handleAsyncError().catch(error => {
        console.error('Async error (not caught by ErrorBoundary):', error);
        alert('Async error occurred - check console. This is NOT caught by ErrorBoundary.');
      });
    } else if (errorTesting.errorType === 'event') {
      try {
        handleEventError();
      } catch (error) {
        console.error('Event handler error (not caught by ErrorBoundary):', error);
        alert('Event handler error occurred - check console. This is NOT caught by ErrorBoundary.');
      }
    }
  };

  // Performance Monitoring Handlers
  const togglePerformanceMonitor = () => {
    const newEnabled = !performance.enabled;
    setPerformance({ enabled: newEnabled });
    PerformanceMonitor.setEnabled(newEnabled);
  };

  return (
    <div style={{
      position: 'fixed',
      zIndex: 9999,
      top: '20px',
      right: '20px',
      background: '#2a2a2a',
      padding: isCollapsed ? '12px' : '20px',
      borderRadius: '8px',
      color: 'white',
      maxWidth: isCollapsed ? '200px' : '320px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      transition: 'all 0.2s ease'
    }}>
      {/* Header with toggle */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isCollapsed ? '0' : '20px'
        }}
      >
        <h3 style={{ 
          margin: '0', 
          fontSize: isCollapsed ? '14px' : '16px', 
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🧪 Debug
        </h3>
        <span style={{ fontSize: '12px', opacity: 0.6 }}>
          {isCollapsed ? '▶' : '▼'}
        </span>
      </div>
      
      {isCollapsed ? (
        /* Collapsed Summary View */
        <div style={{ fontSize: '11px', marginTop: '8px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '4px'
          }}>
            <span>📊</span>
            <span>Performance: {performance.enabled ? '🟢 ON' : '🔴 OFF'}</span>
          </div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Error Testing: Ready</span>
          </div>
        </div>
      ) : (
        /* Expanded Full View */
        <>
          {/* Error Testing Section */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            background: '#333', 
            borderRadius: '6px' 
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '13px', 
              color: '#e74c3c',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚠️ Error Testing
            </h4>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', opacity: 0.8 }}>
                Error Type:
              </label>
              <select
                value={errorTesting.errorType}
                onChange={(e) => setErrorTesting(prev => ({ 
                  ...prev, 
                  errorType: e.target.value as ErrorTestingState['errorType']
                }))}
                style={{
                  width: '100%',
                  padding: '6px',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  background: '#444',
                  color: 'white',
                  fontSize: '11px'
                }}
              >
                <option value="render">Render Error (Caught by ErrorBoundary)</option>
                <option value="async">Async Error (NOT caught)</option>
                <option value="event">Event Handler Error (NOT caught)</option>
              </select>
            </div>

            <button
              onClick={triggerError}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Trigger {errorTesting.errorType} Error
            </button>

            <div style={{ fontSize: '9px', opacity: 0.6, lineHeight: '1.3', marginTop: '8px' }}>
              <strong>Note:</strong> Only render errors during component lifecycle are caught by ErrorBoundary.
            </div>
          </div>

          {/* Performance Monitoring Section */}
          <div style={{ 
            marginBottom: '15px', 
            padding: '15px', 
            background: '#333', 
            borderRadius: '6px' 
          }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '13px', 
              color: '#27ae60',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📊 Performance Monitor
            </h4>

            <button
              onClick={togglePerformanceMonitor}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: performance.enabled ? '#27ae60' : '#7f8c8d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: '500'
              }}
            >
              {performance.enabled ? '🟢' : '🔴'} 
              {performance.enabled ? 'Enabled' : 'Disabled'}
            </button>

            <div style={{ fontSize: '9px', opacity: 0.6, lineHeight: '1.3', marginTop: '8px' }}>
              Monitors render performance and component lifecycle timing.
            </div>
          </div>

          {/* Future Sections Placeholder */}
          <div style={{ fontSize: '10px', opacity: 0.4, textAlign: 'center', fontStyle: 'italic' }}>
            More debugging tools coming soon...
          </div>
        </>
      )}
    </div>
  );
};

export default DebugPanel;
