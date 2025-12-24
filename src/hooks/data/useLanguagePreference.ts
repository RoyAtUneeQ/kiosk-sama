import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

export const useLanguagePreference = (): void => {
  const { state } = useSession();

  useEffect(() => {
    console.log('[StateManagerSDK] KioskPage useEffect triggered for stateManager/language');
    console.log('[StateManagerSDK] Current state:', {
      hasStateManager: !!state.stateManager,
      language: state.language,
      sessionStatus: state.status,
      hasUneeq: !!state.uneeq,
      sessionId: state.uneeq?.options?.sessionId
    });

    if (state.stateManager && state.language) {
      console.log('[StateManagerSDK] 💾 Attempting to persist language:', state.language);

      state.stateManager.set('preferredLanguage', state.language)
        .then(() => {
          console.log('[StateManagerSDK] ✅ Language persisted successfully in KioskPage');
        })
        .catch((err: unknown) => {
          console.error('[StateManagerSDK] ❌ Failed to persist language in KioskPage:', err);
          console.error('[StateManagerSDK] Error details:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined
          });
        });
    } else {
      console.log('[StateManagerSDK] ⏳ Waiting for state.stateManager or language:', {
        hasStateManager: !!state.stateManager,
        language: state.language
      });
    }
  }, [state.stateManager, state.language]);
};
