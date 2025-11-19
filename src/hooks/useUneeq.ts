import { useEffect, useCallback } from "react";
import useScript from "react-script-hook";
import { useConfig } from "@/hooks/useConfig";
import type { Uneeq, UneeqOptions, Event } from "@/types";
import { MessageSender, CameraHorizontalAnchor, CameraDistanceAnchor } from "@/types";
import { useSession } from "@/contexts/SessionContext";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

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
  
  // Performance monitoring for UneeQ operations
  const { startTiming, endTiming } = usePerformanceMonitor('useUneeq');

  // Get config values with fallback to available render mode
  const personaConfig = config?.personas?.[language];
  const availableType = personaConfig?.[type] ? type : Object.keys(personaConfig || {})[0] as 'cloud' | 'miniprem';

  const scriptUrl = personaConfig?.[availableType]?.CDN || '';
  const connectionUrl = personaConfig?.[availableType]?.API || '';
  const personaId = personaConfig?.[availableType]?.id || '';
  const sessionKey = `${connectionUrl}-${personaId}`;

  // Load script using external library
  const [scriptLoading, scriptError] = useScript({ src: scriptUrl });

  // Track script loading performance
  useEffect(() => {
    if (scriptUrl && scriptLoading) {
      startTiming('script-load');
    } else if (scriptUrl && !scriptLoading && !scriptError) {
      endTiming('script-load');
    }
  }, [scriptLoading, scriptError, scriptUrl, startTiming, endTiming]);

  // Create stable event handler using useCallback
  const handleUneeqMessage = useCallback((e: CustomEvent) => {
    console.log(`[AddedUneeq Event] %c ${e.detail.uneeqMessageType}`, 'color:rgb(255, 62, 142);');
    actions.setUneeqEvents([e.detail as Event]);
  }, [actions]);

  // Initialize Uneeq when script is ready (simple singleton pattern)
  useEffect(() => {
    if (scriptLoading || scriptError || !connectionUrl || !personaId || loading) return;

    // Skip if already initialized for this session
    if (window.uneeqSessionKey === sessionKey && window.uneeq) {
      actions.setUneeq(window.uneeq);
      return;
    }
    
    try {
      startTiming('sdk-init');
      
      // Clean up previous session
      window.uneeq?.endSession?.();
      
      const finalOptions = {
        ...options,
        connectionUrl,
        personaId,
        showClosedCaptions: options.showClosedCaptions
      };
      
      console.log('🎬 Initializing Uneeq session with options:', finalOptions);
      
      // Initialize new session
      window.uneeq = new Uneeq(finalOptions);
      window.uneeqSessionKey = sessionKey;
      const uneeq = window.uneeq as Uneeq;
      actions.setUneeq(uneeq);

      // Log UneeQ object structure for debugging State Manager
      console.log('[useUneeq] 🔍 UneeQ object created');
      console.log('[useUneeq] UneeQ keys:', Object.keys(uneeq));
      console.log('[useUneeq] UneeQ.options:', uneeq.options);
      console.log('[useUneeq] Looking for sessionId at uneeq.options?.sessionId:', uneeq.options?.sessionId);

      uneeq.setWebRtcStatsEnabled(false, false);
      
      // Add event listener with stable callback reference
      window.addEventListener('UneeqMessage', handleUneeqMessage as EventListener);
      
      endTiming('sdk-init');
      
    } catch (err) {
      console.error('Uneeq initialization failed:', err);
      endTiming('sdk-init'); // End timing even on error
    }

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('UneeqMessage', handleUneeqMessage as EventListener);
    };
  }, [scriptLoading, scriptError, connectionUrl, personaId, loading, sessionKey, handleUneeqMessage]);

  //Send last history message to Uneeq  
  useEffect(() => {
    console.log("[useUneeq] sending message to Uneeq, last message is");
    const lastMessage = state.history[state.history.length - 1];    
    console.dir(lastMessage);
    // Only send non-User messages to Uneeq to prevent loops
    if (lastMessage && state.uneeq && lastMessage.sender !== MessageSender.Assistant) {
      window.uneeq?.[lastMessage.prompt ? 'chatPrompt' : 'speak'](lastMessage.content);
      console.log("[useUneeq] message sent to Uneeq");
    }

  }, [state.history]);        

  // Update VAD state when session changes
  useEffect(() => {
    console.log(`[useUneeq] 🎤 VAD state changed to: ${state.vadEnabled ? 'ENABLED' : 'DISABLED'}`);
    if(!window.uneeq) {
      console.error('Uneeq is not initialized. Cannot update VAD state.');
      return;
    }
    
    try {
      if (state.vadEnabled) {
        console.log("[useUneeq] 🎤 Resuming speech recognition...");
        window.uneeq.resumeSpeechRecognition();
        console.log("[useUneeq] ✅ Speech recognition resumed");
      } else {
        console.log("[useUneeq] 🎤 Pausing speech recognition...");
        window.uneeq.pauseSpeechRecognition();
        console.log("[useUneeq] ✅ Speech recognition paused");
      }
    } catch (error) {
      console.error("[useUneeq] ❌ Error updating VAD state:", error);
    }
  }, [state.vadEnabled]);


  useEffect(() => {
    if (state.camera && window.uneeq) {
      const isHorizontal = Object.values(CameraHorizontalAnchor).includes(state.camera as CameraHorizontalAnchor);
      const cameraEnum = isHorizontal ? CameraHorizontalAnchor : CameraDistanceAnchor;
      const cameraKey = Object.keys(cameraEnum).find(key => cameraEnum[key as keyof typeof cameraEnum] === state.camera);
      
      console.log("[useUneeq] setting camera to", cameraKey);
      window.uneeq[isHorizontal ? 'cameraAnchorHorizontal' : 'cameraAnchorDistance'](cameraKey as string, 1000);
    }
  }, [state.camera]);

  // Update closed captions setting when options change
  useEffect(() => {
    if (window.uneeq && typeof options.showClosedCaptions !== 'undefined') {
      console.log(`[useUneeq] 📝 Setting closed captions to: ${options.showClosedCaptions}`);
      console.log(`[useUneeq] Uneeq methods available:`, Object.getOwnPropertyNames(window.uneeq));
      
      try {
        window.uneeq.setShowClosedCaptions(options.showClosedCaptions);
        console.log(`[useUneeq] ✅ Successfully called setShowClosedCaptions(${options.showClosedCaptions})`);
      } catch (error) {
        console.error(`[useUneeq] ❌ Error calling setShowClosedCaptions:`, error);
      }
    }
  }, [options.showClosedCaptions]);

  // Monitor session state changes and apply captions setting when session becomes LIVE
  useEffect(() => {
    if (window.uneeq && state.status === 'LIVE' && typeof options.showClosedCaptions === 'boolean') {
      console.log(`[useUneeq] 🎯 Session is LIVE - applying captions setting: ${options.showClosedCaptions}`);
      
      // Apply immediately and with delays to ensure it sticks
      const applyCaptions = () => {
        try {
          window.uneeq?.setShowClosedCaptions(options.showClosedCaptions as boolean);
          console.log(`[useUneeq] ✅ Captions applied during LIVE session: ${options.showClosedCaptions}`);
        } catch (error) {
          console.error(`[useUneeq] ❌ Error applying captions during LIVE session:`, error);
        }
      };
      
      applyCaptions(); // Apply immediately
      setTimeout(applyCaptions, 500); // Apply after 500ms
      setTimeout(applyCaptions, 2000); // Apply after 2s to be sure
    }
  }, [state.status, options.showClosedCaptions]);   

}