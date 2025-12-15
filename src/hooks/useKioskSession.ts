import { useEffect } from 'react';
import type { Config } from '@/types';
import type { UneeqOptions } from '@/types/uneeq';
import { defaultUneeqOptions } from '@/types';
import { useUneeq } from '@/hooks/useUneeq';
import { useUneeqEvents, useStateManager, useWebSocket } from '@/hooks';
import { useSession } from '@/contexts/SessionContext';
import { WebSocketService } from '@/services';

interface UseKioskSessionParams {
  /**
   * Application configuration containing persona, backend, and environment settings.
   */
  config: Config | null;
  /**
   * Language code (e.g., 'en', 'fr') for UneeQ persona selection.
   */
  language: string;
  /**
   * Render mode for UneeQ ('cloud' or 'miniprem').
   */
  renderMode: 'cloud' | 'miniprem';
}

interface UseKioskSessionReturn {
  /**
   * WebSocket service instance for sending and receiving messages.
   */
  websocket: WebSocketService | null;
}

/**
 * Bundle kiosk initialization logic: UneeQ setup, event listeners, state management, and WebSocket connection.
 *
 * This hook orchestrates the complete initialization sequence required for a kiosk session:
 * 1. Initializes UneeQ digital human with provided configuration
 * 2. Sets up event listeners for UneeQ messages
 * 3. Initializes state manager for persistent storage
 * 4. Configures the config in session state
 * 5. Establishes WebSocket connection to backend
 *
 * @param params - Configuration parameters for session initialization
 * @returns Object containing the websocket service instance
 *
 * @example
 * ```tsx
 * function MyKiosk() {
 *   const { config } = useConfig();
 *   const { state } = useSession();
 *   const { websocket } = useKioskSession({
 *     config,
 *     language: state.language,
 *     renderMode: state.renderMode as 'cloud' | 'miniprem'
 *   });
 * }
 * ```
 */
export const useKioskSession = (params: UseKioskSessionParams): UseKioskSessionReturn => {
  const { config, language, renderMode } = params;
  const { state, actions } = useSession();

  // Welcome prompt for UneeQ session
  const welcomePrompt = `Introduce yourself to the user in a friendly and engaging manner. Use your knowledge base to spark a conversation and guide the interaction.
Follow up with a specific, focused question that directs the next step in the conversation, avoiding open-ended questions.`;

  // Initialize UneeQ with merged options
  useUneeq(
    {
      ...defaultUneeqOptions,
      showClosedCaptions: state.showClosedCaptions,
      welcomePrompt,
      showUserInputInterface: false
    } as UneeqOptions,
    language,
    renderMode
  );

  // Set up UneeQ event listeners
  useUneeqEvents();

  // Initialize state manager for persistent storage
  useStateManager();

  // Configure the application config in session state
  useEffect(() => {
    if (config) {
      actions.setConfig(config);
    }
  }, [config, actions]);

  // Establish WebSocket connection
  const { websocket } = useWebSocket({
    webSocketUrl: config?.backend?.endpoints?.ws || ''
  });

  return { websocket: websocket ?? null };
};
