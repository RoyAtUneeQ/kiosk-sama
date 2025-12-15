import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

/**
 * Hook that persists the current language preference to the State Manager SDK.
 * Triggers whenever the persist wrapper or language changes.
 * Logs debugging information about the persistence operation.
 *
 * @returns void - This is a side-effect only hook.
 */
export const useLanguagePersist = (): void => {
  const { state } = useSession();

  useEffect(() => {
    console.log('[StateManagerSDK] KioskPage useEffect triggered for persist/language');
    console.log('[StateManagerSDK] Current state:', {
      hasPersist: !!state.persist,
      language: state.language,
      sessionStatus: state.status,
      hasUneeq: !!state.uneeq,
      sessionId: state.uneeq?.options?.sessionId
    });

    if (state.persist && state.language) {
      console.log('[StateManagerSDK] 💾 Attempting to persist language:', state.language);

      state.persist.set('preferredLanguage', state.language)
        .then(() => {
          console.log('[StateManagerSDK] ✅ Language persisted successfully in KioskPage');
        })
        .catch((err) => {
          console.error('[StateManagerSDK] ❌ Failed to persist language in KioskPage:', err);
          console.error('[StateManagerSDK] Error details:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined
          });
        });
    } else {
      console.log('[StateManagerSDK] ⏳ Waiting for state.persist or language:', {
        hasPersist: !!state.persist,
        language: state.language
      });
    }
  }, [state.persist, state.language]);
};
