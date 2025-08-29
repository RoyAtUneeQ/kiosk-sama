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
  host?: string;
  port?: number;
  httpPort?: number;
  wsPort?: number;
  ports?: {
    http?: number;
    ws?: number;
  };
  endpoints?: {
    ws?: string;
    http?: string;
  };
  key?: string;
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
}
