import { useState } from 'react';

interface ErrorTesterProps {
  show?: boolean;
}

export const ErrorTester = ({ show = false }: ErrorTesterProps) => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [errorType, setErrorType] = useState<'render' | 'async' | 'event'>('render');
  
  
  if (!show) return null;
  
  // Render error (caught by ErrorBoundary)
  if (shouldThrow && errorType === 'render') {
    throw new Error('Test render error from ErrorTester component!');
  }

  const handleAsyncError = async () => {
    // Async errors are NOT caught by ErrorBoundary
    await new Promise(resolve => setTimeout(resolve, 100));
    throw new Error('Test async error - this will NOT be caught by ErrorBoundary!');
  };

  const handleEventError = () => {
    // Event handler errors are NOT caught by ErrorBoundary
    throw new Error('Test event handler error - this will NOT be caught by ErrorBoundary!');
  };

  const triggerError = () => {
    if (errorType === 'render') {
      setShouldThrow(true);
    } else if (errorType === 'async') {
      handleAsyncError().catch(error => {
        console.error('Async error (not caught by ErrorBoundary):', error);
        alert('Async error occurred - check console. This is NOT caught by ErrorBoundary.');
      });
    } else if (errorType === 'event') {
      try {
        handleEventError();
      } catch (error) {
        console.error('Event handler error (not caught by ErrorBoundary):', error);
        alert('Event handler error occurred - check console. This is NOT caught by ErrorBoundary.');
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      zIndex: 9999,
      top: '20px',
      right: '20px',
      background: '#2a2a2a',
      padding: '20px',
      borderRadius: '8px',
      color: 'white',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '14px' }}>
        🧪 ErrorBoundary Tester
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
          Error Type:
        </label>
        <select
          value={errorType}
          onChange={(e) => setErrorType(e.target.value as any)}
          style={{
            width: '100%',
            padding: '5px',
            borderRadius: '4px',
            border: '1px solid #555',
            background: '#333',
            color: 'white',
            fontSize: '12px'
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
          fontSize: '12px',
          marginBottom: '10px'
        }}
      >
        Trigger {errorType} Error
      </button>

      <div style={{ fontSize: '10px', opacity: 0.7, lineHeight: '1.4' }}>
        <strong>Note:</strong> Only render errors during component lifecycle are caught by ErrorBoundary. 
        Async errors and event handler errors are not caught.
        <br /><br />
      </div>
    </div>
  );
};

export default ErrorTester;
