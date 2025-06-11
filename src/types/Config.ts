// Configuration interfaces (re-export from utils if needed)
export interface PersonaConfig {
    cloud: {
        CDN: string;
        API: string;
        key: string;
    };
    miniprem: {
        CDN: string;
        API: string;
        key: string;
    };
  }

  export interface WebSocketConfig {
    url: string;
  }
  
  export interface ApiConfig {
    pixabay: {
      api_key: string;
      api_url: string;
    };
    deepgram: {
      api_key: string;
      api_url: string;
    };
  }
  
  export interface AppConfig {
    name: string;
    environment: 'development' | 'staging' | 'production';
  }
  
  export interface Config {
    app: AppConfig;
    personas: Record<string, PersonaConfig>;
    websocket: WebSocketConfig;
    apis: ApiConfig;
  }
  