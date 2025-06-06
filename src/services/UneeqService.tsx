// Import necessary hooks and types
import { useEffect, useState, useRef } from "react";
import type { Uneeq, UneeqConstructor, UneeqOptions } from "@/types/Uneeq";
import type { UneeqEvent } from "@/types/UneeqEvent";

declare const Uneeq: UneeqConstructor;

declare global {
  interface Window {
    uneeq?: Uneeq;
  }
}

export const UneeqService = (options: UneeqOptions) => {
  const [events, setEvents] = useState<UneeqEvent[]>([]);
  const eventsRef = useRef<UneeqEvent[]>([]);
  const [uneeq, setUneeq] = useState<Uneeq | null>(null);
  const scriptLoaded = useRef(false);
  
  useEffect(() => {
    // Skip if script is already loaded or Uneeq is already defined
    if (scriptLoaded.current || window.uneeq) {
      return;
    }
    
    scriptLoaded.current = true;
    
    // Check if script is already in the DOM
    const existingScript = document.getElementById('uneeq-script');
    if (existingScript) {
      initializeUneeq();
      return;
    }
    
    // Create and load script
    const scriptUrl = import.meta.env.VITE_UNEEQ_SCRIPT_URL || 'https://cdn-eu.uneeq.io/hosted-experience/deploy/index.js';
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.id = 'uneeq-script';
    script.async = true;
    
    script.onload = () => {
      // Initialize after a short delay to ensure constructor is available
      setTimeout(initializeUneeq, 100);
    };
    
    document.body.appendChild(script);
  }, []);
  
  const initializeUneeq = () => {
    // Safety check: ensure Uneeq constructor exists
    if (typeof Uneeq === 'undefined') {
      console.error('Uneeq constructor not found');
      return;
    }
    
    // Don't initialize if already initialized
    if (window.uneeq || uneeq) {
      return;
    }
    
    try {
      window.uneeq = new Uneeq(options);

      window.addEventListener('UneeqMessage', ((e: CustomEvent) => {
        console.info("UneeqMessage: ", e);
        const newEvent = {
          type: e.detail.uneeqMessageType,
          data: e.detail
        };
        eventsRef.current = [...eventsRef.current, newEvent];
        setEvents(prev => [...prev, newEvent]);
      }) as EventListener);

      setUneeq(window.uneeq)  
    } catch (error) {
      console.error('Failed to initialize Uneeq:', error);
    }
  };

  // Initialize when options change
  useEffect(() => {
    console.info("Initialized")
    if (typeof Uneeq !== 'undefined' && !uneeq) {
      initializeUneeq();
    }
  }, [options]);
  
  const clearEvents = () => {
    eventsRef.current = [];
    setEvents([]);
  };

  return { uneeq, events, clearEvents };
};
