import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

export const useLanguagePreference = (): void => {
  const { state } = useSession();

  useEffect(() => {
    if (state.stateManager && state.language) {
      state.stateManager.set('preferredLanguage', state.language)
        .catch((err: unknown) => {
          console.error('[StateManagerSDK] ❌ Failed to persist language:', err);
        });
    }
  }, [state.stateManager, state.language]);
};
