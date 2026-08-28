import type { StateManagerConfig } from '@/types/stateManager';

// Configuration interfaces (re-export from utils if needed)
export interface PersonaConfig {
  cloud: {
    CDN: string;
    API: string;
    id: string;
  };
  miniprem: {
    CDN: string;
    API: string;
    id: string;
  };
}

export interface BackendConfig {
  endpoints: {
    ws: string;    // Full WebSocket URL (required)
    http: string;  // Full HTTP URL (required)
  };
  key?: string;    // API key for authentication
}

export type MultitaskStrategy = 'reject' | 'rollback' | 'interrupt' | 'enqueue';

export interface LangGraphConfig {
  baseUrl: string;
  assistantId: string;
  multitaskStrategy?: MultitaskStrategy;
  enabled: boolean;
}

export interface ApiConfig {
  pixabay: {
    api_key: string;
    api_url: string;
  };
}

export interface AppConfig {
  name: string;
  environment: 'development' | 'staging' | 'production';
  autoStartMic: boolean;
}

export interface Config {
  app: AppConfig;
  personas: Record<string, PersonaConfig>;
  apis: ApiConfig;
  backend?: BackendConfig;
  stateManager?: StateManagerConfig;
  langgraph?: LangGraphConfig;
}
