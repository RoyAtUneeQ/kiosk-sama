// Import necessary hooks and types
import { useEffect, useState, useRef } from "react";
import type { Uneeq, UneeqConstructor, UneeqOptions } from "@/types/Uneeq";
import type { UneeqEvent } from "@/types/UneeqEvent";
import { useConfig } from "@/hooks/useConfig";
import { useTranslation } from "@/hooks/useTranslation";

declare const Uneeq: UneeqConstructor;

declare global {
  interface Window {
    uneeq?: Uneeq;
  }
}

export const useUneeq = (options: UneeqOptions) => {
  const { config, loading } = useConfig();
  const [events, setEvents] = useState<UneeqEvent[]>([]);
  const eventsRef = useRef<UneeqEvent[]>([]);
  const [uneeq, setUneeq] = useState<Uneeq | null>(null);
  const scriptLoaded = useRef(false);
  const previousOptions = useRef<{ language: string; renderMode: string } | null>(null);
  const { i18n } = useTranslation();

  // Calculate persona ID directly from config and options
  const getPersonaId = () => {
    if (!config?.personas?.[options.language]?.[options.renderMode]?.key) {
      return null;
    }
    return config.personas[options.language][options.renderMode].key;
  };

  // Get script URL from config
  const getScriptUrl = () => {
    return config?.personas?.[options.language]?.[options.renderMode]?.CDN;
  };

  // Check if language or renderMode changed
  const hasOptionsChanged = () => {
    if (!previousOptions.current) {
      return true;
    }
    return (
      previousOptions.current.language !== options.language ||
      previousOptions.current.renderMode !== options.renderMode
    );
  };

  // Clean up existing Uneeq instance
  const cleanupUneeq = () => {
    if (window.uneeq) {
      try {
        window.uneeq.endSession?.();
      } catch (error) {
        console.warn('Error ending Uneeq session:', error);
      }
      window.uneeq = undefined;
    }
    setUneeq(null);
  };

  const prompt = (prompt: string) => {
    //Force the answer to be in the language of the user
    const language = `** THE ANSWER SHOULD BE IN ${i18n.language}, BUT NEVER TRANSLATE THE TAGS, JUST USE THE TAGS AS THEY ARE **`;
    const promptWithLanguage = `${prompt} ${language}`;
    if (window.uneeq) {
      window.uneeq.chatPrompt(promptWithLanguage);
    }
  };
  
  const initializeUneeq = () => {
    // Safety checks
    if (typeof Uneeq === 'undefined') {
      console.error('Uneeq constructor not found');
      return;
    }
    
    const personaId = getPersonaId();
    if (!options.connectionUrl || !options.language || !options.renderMode || !personaId) {
      console.error('Invalid Uneeq options: missing required parameters');
      return;
    }

    // Clean up existing instance if options changed
    if (hasOptionsChanged() && window.uneeq) {
      cleanupUneeq();
    }

    // Don't initialize if already initialized with same options
    if (window.uneeq && !hasOptionsChanged()) {
      return;
    }
    
    try {
      window.uneeq = new Uneeq({ ...options, personaId } as UneeqOptions);
      
      window.addEventListener('UneeqMessage', ((e: CustomEvent) => {
        const newEvent = {
          type: e.detail.uneeqMessageType,
          data: e.detail
        };
        eventsRef.current = [...eventsRef.current, newEvent];
        setEvents(prev => [...prev, newEvent]);
      }) as EventListener);

      setUneeq(window.uneeq);
      
      // Update previous options
      previousOptions.current = {
        language: options.language,
        renderMode: options.renderMode
      };
    } catch (error) {
      console.error('Failed to initialize Uneeq:', error);
    }
  };

  // Load Uneeq script
  useEffect(() => {
    if (scriptLoaded.current || window.uneeq || loading) {
      return;
    }
    
    const scriptUrl = getScriptUrl();
    if (!scriptUrl) {
      console.error('Uneeq script URL not found in configuration');
      return;
    }
    
    // Check if script is already in the DOM
    const existingScript = document.getElementById('uneeq-script');
    if (existingScript) {
      initializeUneeq();
      return;
    }

    scriptLoaded.current = true;
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.id = 'uneeq-script';
    script.async = true;
    
    script.onload = () => {
      setTimeout(initializeUneeq, 100);
    };

    script.onerror = () => {
      console.error('Failed to load Uneeq script from:', scriptUrl);
      scriptLoaded.current = false;
    };
    
    document.body.appendChild(script);
  }, [config, loading, options.connectionUrl, options.language, options.renderMode]);

  // Initialize or reinitialize Uneeq when dependencies change
  useEffect(() => {
    if (typeof Uneeq !== 'undefined' && !loading && config && getPersonaId()) {
      initializeUneeq();
    }
  }, [loading, config, options.connectionUrl, options.language, options.renderMode]);
  
  const clearEvents = () => {
    eventsRef.current = [];
    setEvents([]);
  };

  return { uneeq, events, clearEvents, prompt };
};

export default useUneeq; 