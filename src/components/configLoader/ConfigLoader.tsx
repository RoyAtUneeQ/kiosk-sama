import React from 'react';
import type { ReactNode } from 'react';
import { useConfig } from '@/hooks/useConfig';
import { LoadingFallback } from '../loadingFallback/LoadingFallback';

interface ConfigLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConfigLoader: React.FC<ConfigLoaderProps> = ({ 
  children, 
  fallback = <LoadingFallback message="Loading configuration..." size="large" className="loading-fallback--fullscreen" />
}) => {
  const { config, loading, error, reload } = useConfig();

  // Show loading state
  if (loading) {
    return <>{fallback}</>;
  }

  // Show error state with retry option
  if (error || !config) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e74c3c', margin: 0 }}>Configuration Error</h2>
        <p style={{ color: '#666', margin: 0 }}>
          {error?.message || 'Failed to load application configuration'}
        </p>
        <button 
          onClick={() => reload()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Config loaded successfully, render the application
  return <>{children}</>;
};
