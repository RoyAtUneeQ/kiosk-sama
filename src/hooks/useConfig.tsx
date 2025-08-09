import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Config } from '@/types';
import configYaml from '@/assets/config.yaml?raw';
import yaml from 'js-yaml';

interface ConfigContextType {
  config: Config;
  reload: () => void;
  loading: boolean;
  error: Error | null;
  getSupportedLanguages: () => string[];
  getDefaultLanguage: () => string;
  getRenderByLanguage: (language: string ) => string[];
}

const ConfigContext = createContext<ConfigContextType | null>(null);

interface ConfigProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ConfigProvider({ children, fallback }: ConfigProviderProps) {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      setConfig(yaml.load(configYaml) as Config);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown config error');
      setError(error);
      console.error('Config error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const getSupportedLanguages = (): string[] => {
    if (!config?.personas) return [];
    return Object.keys(config.personas);
  };

  const getDefaultLanguage = (): string => {
    const supportedLanguages = getSupportedLanguages();
    return supportedLanguages.includes('en') ? 'en' : supportedLanguages[0] || 'en';
  };

  const getAllAvailableRenderModes = (language: string): string[] => {
    return Object.keys(config?.personas?.[language] || []);
  };

  const contextValue: ConfigContextType = {
    config: config as unknown as Config,
    reload: loadConfig,
    loading,
    error,
    getSupportedLanguages,
    getDefaultLanguage,
    getRenderByLanguage: getAllAvailableRenderModes as (language: string) => string[]
  };

  if (loading) {
    return (
      <div className="config-loading">
        {fallback || <div>Loading configuration...</div>}
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="config-error">
        <h2>Configuration Error</h2>
        <p>{error?.message || 'Failed to load configuration'}</p>
        <button onClick={loadConfig}>Retry</button>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}



export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}