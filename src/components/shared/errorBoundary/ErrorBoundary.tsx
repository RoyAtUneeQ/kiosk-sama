import { Component, type ReactNode } from 'react';
import type { ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.resetOnPropsChange && prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // You can add error reporting service here (e.g., Sentry, LogRocket)
      console.error('Production error:', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
    }
    
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--theme-background, #0d0d0d)',
          color: 'var(--theme-neutral-lightest, #f5f5f5)'
        }}>
          <h2 style={{ marginBottom: '1rem', color: 'var(--theme-status-error, #e74c3c)' }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '1.5rem', opacity: 0.8 }}>
            We encountered an unexpected error. Try again to recover or refresh the page for a fresh start.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.resetErrorBoundary}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--theme-primary-main, #3498db)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--theme-neutral-dark, #666)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Refresh Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                background: '#1a1a1a', 
                padding: '1rem', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                overflow: 'auto'
              }}>
                {this.state.error?.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
