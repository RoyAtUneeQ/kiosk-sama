import { useEffect, useCallback } from 'react';
import useScript from 'react-script-hook';
import { useConfiguration } from '@/hooks/data/useConfiguration';
import type { Uneeq, UneeqOptions, Event } from '@/types';
import { useSession } from '@/contexts/SessionContext';

declare const Uneeq: any;

declare global {
  interface Window {
    uneeq?: Uneeq;
    uneeqSessionKey?: string;
  }
}

export const useUneeqSdkLifecycle = (
  options: UneeqOptions,
  language: string = 'en',
  type: 'cloud' | 'miniprem' = 'cloud'
) => {
  const { config, loading } = useConfiguration();
  const { actions, state } = useSession();
  const personaConfig = config?.personas?.[language];
  const availableType = personaConfig?.[type] ? type : (Object.keys(personaConfig || {})[0] as 'cloud' | 'miniprem');

  const scriptUrl = personaConfig?.[availableType]?.CDN || '';
  const connectionUrl = personaConfig?.[availableType]?.API || '';
  const personaId = personaConfig?.[availableType]?.id || '';
  const sessionKey = `${connectionUrl}-${personaId}`;

  const [scriptLoading, scriptError] = useScript({ src: scriptUrl });

  const handleUneeqMessage = useCallback((e: CustomEvent) => {
    actions.setUneeqEvents([e.detail as Event]);
  }, [actions]);

  useEffect(() => {
    if (scriptLoading || scriptError || !connectionUrl || !personaId || loading) return;

    if (window.uneeqSessionKey === sessionKey && window.uneeq) {
      if (!state.uneeq) {
        actions.setUneeq(window.uneeq);
      }
      return;
    }

    try {
      window.uneeq?.endSession?.();

      const finalOptions = {
        ...options,
        connectionUrl,
        personaId,
        showClosedCaptions: options.showClosedCaptions,
      };

      window.uneeq = new Uneeq(finalOptions);
      window.uneeqSessionKey = sessionKey;
      const uneeq = window.uneeq as Uneeq;
      actions.setUneeq(uneeq);

      uneeq.setWebRtcStatsEnabled(false, false);
      window.addEventListener('UneeqMessage', handleUneeqMessage as EventListener);
    } catch (err) {
      console.error('Uneeq initialization failed:', err);
    }

    return () => {
      window.removeEventListener('UneeqMessage', handleUneeqMessage as EventListener);
    };
  }, [scriptLoading, scriptError, connectionUrl, personaId, loading, sessionKey, handleUneeqMessage]);
};
