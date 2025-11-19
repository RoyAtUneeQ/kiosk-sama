import { useEffect, useRef } from 'react';
import { StateManager } from 'uneeq-state-manager';
import { SessionStatus } from '@/contexts/types/SessionStatus';
import { useConfig } from '@/hooks/useConfig';
import { useSession, useSessionStore } from '@/contexts/SessionContext';
import { PersistentStateWrapper } from '@/services/PersistentStateWrapper';

/**
 * Initialize State Manager when UneeQ session becomes ACTIVE. Creates PersistentStateWrapper and stores in SessionContext as state.persist.
 */
export const useStateManager = () => {
  const { config, loading: configLoading } = useConfig();
  const { state, actions } = useSession();
  const wrapperRef = useRef<PersistentStateWrapper | null>(null);

  useEffect(() => {
    console.log('[StateManagerSDK] 🔄 Effect triggered');
    console.log('[StateManagerSDK] State check:', {
      configLoading,
      stateManagerEnabled: config?.stateManager?.enabled,
      sessionStatus: state.status,
      wrapperExists: !!wrapperRef.current,
      persistExists: !!state.persist,
      uneeqExists: !!state.uneeq,
      sessionId: state.uneeq?.options?.sessionId
    });

    // Early return if already initialized
    if (wrapperRef.current && state.persist) {
      console.log('[StateManagerSDK] ⏭️  Already initialized, skipping');
      return;
    }

    // Check initialization conditions
    const shouldInitialize =
      !configLoading &&
      config?.stateManager?.enabled === true &&
      state.status === SessionStatus.LIVE &&
      !wrapperRef.current;

    if (!shouldInitialize) {
      console.log('[StateManagerSDK] ⏸️  Conditions not met for initialization:', {
        configLoading,
        enabled: config?.stateManager?.enabled,
        status: state.status,
        expectedStatus: SessionStatus.LIVE,
        wrapperExists: !!wrapperRef.current
      });
      return;
    }

    try {
      console.log('[StateManagerSDK] 🔧 Initializing State Manager SDK');
      console.log('[StateManagerSDK] Config:', {
        workspaceId: config.stateManager!.workspaceId,
        endpoint: config.stateManager!.endpoint,
        hasAPIKey: !!config.stateManager!.apiKey,
        apiKeyPrefix: config.stateManager!.apiKey.substring(0, 20) + '...'
      });
      console.log('[StateManagerSDK] Current UneeQ sessionId:', state.uneeq?.options?.sessionId);

      // Create StateManager instance
      console.log('[StateManagerSDK] Creating raw StateManager instance...');
      const rawManager = new StateManager({
        endpoint: config.stateManager!.endpoint,
        apiKey: config.stateManager!.apiKey,
      });
      console.log('[StateManagerSDK] Raw StateManager instance created');

      // Create PersistentStateWrapper with workspace ID and session ID getters
      // IMPORTANT: Use getState() to always read the current state, avoiding stale closure
      console.log('[StateManagerSDK] Creating PersistentStateWrapper...');
      const wrapper = new PersistentStateWrapper(
        rawManager,
        config.stateManager!.workspaceId,
        () => {
          // Get fresh state from store to avoid stale closure issues
          const currentState = useSessionStore.getState().state;
          const currentSessionId = currentState.uneeq?.options?.sessionId;
          console.log('[StateManagerSDK] 🔍 SessionId getter called, returned:', currentSessionId);
          return currentSessionId;
        }
      );
      console.log('[StateManagerSDK] PersistentStateWrapper created');

      // Store wrapper in ref and SessionContext
      wrapperRef.current = wrapper;
      actions.setPersist(wrapper);

      console.log('[StateManagerSDK] ✅ State Manager SDK initialized successfully and stored in context');

      // Create session and persist start timestamp
      (async () => {
        try {
          const sessionId = state.uneeq?.options?.sessionId;
          if (!sessionId) {
            console.error('[StateManagerSDK] ❌ Cannot create session: sessionId is undefined');
            return;
          }

          console.log('[StateManagerSDK] 🔨 Creating session in State Manager Engine...');
          console.log('[StateManagerSDK] WorkspaceId:', config.stateManager!.workspaceId);
          console.log('[StateManagerSDK] SessionId:', sessionId);

          // Create session with 1 hour TTL using the SDK's session.create() method
          const session = rawManager.workspace(config.stateManager!.workspaceId).session(sessionId);
          await session.create({ ttl: 3600 });

          console.log('[StateManagerSDK] ✅ Session created successfully in Engine');

          // Now persist session start timestamp
          const startedTimestamp = new Date().toISOString();
          console.log('[StateManagerSDK] 📅 Setting "Started" timestamp:', startedTimestamp);

          await wrapper.set('Started', startedTimestamp);
          console.log('[StateManagerSDK] ✅ "Started" timestamp persisted successfully');

        } catch (err) {
          console.error('[StateManagerSDK] ❌ Failed to create session or persist timestamp:', err);
          console.error('[StateManagerSDK] Error details:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
            name: err instanceof Error ? err.name : undefined
          });
        }
      })();

    } catch (error) {
      console.error('[StateManagerSDK] ❌ Failed to initialize State Manager SDK:', error);
      console.error('[StateManagerSDK] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    // Cleanup only on unmount
    return () => {
      if (wrapperRef.current) {
        console.log('[StateManagerSDK] 🧹 Cleaning up State Manager SDK');
        wrapperRef.current.end().catch((err) => {
          console.warn('[StateManagerSDK] Failed to end session:', err);
        });
        wrapperRef.current = null;
        actions.setPersist(null);
        console.log('[StateManagerSDK] Cleanup complete');
      }
    };
  }, [configLoading, config?.stateManager?.enabled, state.status, actions]);
};
