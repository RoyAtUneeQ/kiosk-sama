import { useEffect, useCallback } from "react";
import useScript from "react-script-hook";
import { useConfig } from "@/hooks/useConfig";
import type { Uneeq, UneeqOptions, Event } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { MessageSender } from "@/types";

declare const Uneeq: any;

declare global {
  interface Window {
    uneeq?: Uneeq;
    uneeqSessionKey?: string; // Track current session to prevent re-initialization
  }
}

/**
 * Initialize and manage a Uneeq session lifecycle for the given persona.
 * Ensures single active session per (connectionUrl, personaId) combination.
 */
export const useUneeq = (options: UneeqOptions, language: string = 'en', type: 'cloud' | 'miniprem' = 'cloud') => {
  const { config, loading } = useConfig();
  const { actions, state } = useSession();

  // Get config values
  const scriptUrl = config?.personas?.[language]?.[type]?.CDN || '';
  const connectionUrl = config?.personas?.[language]?.[type]?.API || '';
  const personaId = config?.personas?.[language]?.[type]?.key || '';
  const sessionKey = `${connectionUrl}-${personaId}`;

  // Load script using external library
  const [scriptLoading, scriptError] = useScript({ src: scriptUrl });

  // Create stable event handler using useCallback
  const handleUneeqMessage = useCallback((e: CustomEvent) => {
    console.log(`[AddedUneeq Event] %c ${e.detail.uneeqMessageType}`, 'color:rgb(255, 62, 142);');
    actions.setUneeqEvents([...state.uneeqEvents, e.detail as Event]);
  }, []);

  // Initialize Uneeq when script is ready (simple singleton pattern)
  useEffect(() => {
    if (scriptLoading || scriptError || !connectionUrl || !personaId || loading) return;

    // Skip if already initialized for this session
    if (window.uneeqSessionKey === sessionKey && window.uneeq) {
      actions.setUneeq(window.uneeq as Uneeq);
      return;
    }
    
    try {
      // Clean up previous session
      window.uneeq?.endSession?.();
      
      console.log('Initializing Uneeq session', {
        ...options,
        connectionUrl,
        personaId
      });
      // Initialize new session
      window.uneeq = new Uneeq({
        ...options,
        connectionUrl,
        personaId
      });
      window.uneeqSessionKey = sessionKey;
      const uneeq = window.uneeq as Uneeq;
      actions.setUneeq(uneeq);

      uneeq.setWebRtcStatsEnabled(false, false);
      
      // Add event listener with stable callback reference
      window.addEventListener('UneeqMessage', handleUneeqMessage as EventListener);
      
    } catch (err) {
      console.error('Uneeq initialization failed:', err);
    }

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('UneeqMessage', handleUneeqMessage as EventListener);
    };
  }, [scriptLoading, scriptError, connectionUrl, personaId, loading, sessionKey, handleUneeqMessage]);

  //Send last history message to Uneeq  
  useEffect(() => {
    console.log("[useUneeq] send last message to Uneeq", state.history);
    const lastMessage = state.history[state.history.length - 1];    
    if(lastMessage && state.uneeq && lastMessage.sender === MessageSender.User)
      state.uneeq?.chatPrompt(lastMessage.content as string);
  }, [state.history]);        

}