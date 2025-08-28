import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Config } from '@/types';
import configYaml from '@/assets/config.yaml?raw';
import yaml from 'js-yaml';

const loadConfig = async (): Promise<Config> => {
  try {
    return yaml.load(configYaml) as Config;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown config error');
    console.error('Config error:', err);
    throw err;
  }
};

/**
 * Load and expose kiosk configuration from embedded YAML with helpers.
 */
export function useConfig() {
  const {
    data: config,
    error,
    isLoading: loading,
    refetch: reload
  } = useQuery({
    queryKey: ['config'],
    queryFn: loadConfig,
    staleTime: Infinity, // Config rarely changes
    retry: 3,
    throwOnError: false
  });

  const getSupportedLanguages = useMemo(() => (): string[] => 
    config?.personas ? Object.keys(config.personas) : [], [config]);

  const getDefaultLanguage = useMemo(() => (): string => {
    const supported = getSupportedLanguages();
    return supported.includes('en') ? 'en' : supported[0] || 'en';
  }, [getSupportedLanguages]);

  const getRenderByLanguage = useMemo(() => 
    (language: string): string[] => Object.keys(config?.personas?.[language] || {}), [config]);

  return {
    config: config as Config || null,
    loading,
    error: error as Error | null,
    reload,
    getSupportedLanguages,
    getDefaultLanguage,
    getRenderByLanguage
  };
}