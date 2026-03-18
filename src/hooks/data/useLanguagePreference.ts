import { useEffect } from 'react';
import { useSession } from '@/contexts/SessionContext';

export interface LanguageStateValue {
  languageCode: string;
}

export const useLanguagePreference = (): void => {
  const { state } = useSession();

  useEffect(() => {
    const languageCode = state.loginInfo?.languageCode;
    if (state.stateManager && languageCode) {
      const value: LanguageStateValue = { languageCode };
      console.log('Setting language:', value);
      state.stateManager.set('loginInfo', value).catch((err: unknown) => {
        console.error('[StateManagerSDK] ❌ Failed to persist language:', err);
      });
    }
  }, [state.stateManager, state.loginInfo?.languageCode]);
};
