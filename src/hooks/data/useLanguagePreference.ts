import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

export interface LanguageStateValue {
  languageCode: string;
}

export const useLanguagePreference = (): void => {
  const { state } = useSession();

  useEffect(() => {
    if (state.stateManager && state.language) {
      const value: LanguageStateValue = { languageCode: state.language };
      console.log('Setting language:', value);
      state.stateManager.set('language', value).catch((err: unknown) => {
        console.error('[StateManagerSDK] ❌ Failed to persist language:', err);
      });
    }
  }, [state.stateManager, state.language]);
};
