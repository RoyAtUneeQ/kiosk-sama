import { KioskIdleView, KioskLiveView } from './components';
import { SessionStatus } from '@/contexts/types';
import { useSession } from '@/contexts/SessionContext';
import { useConfig, useLanguagePersist } from '@/hooks';
import { useKioskOrchestrator } from './hooks/useKioskOrchestrator';

function KioskPage() {
  const { state } = useSession();
  const { config } = useConfig();

  const language = state.loginInfo?.languageCode ?? state.language;
  const { cardData, hasCards, handleGuidedExperienceConfirm, useSeatViewerBackground } = useKioskOrchestrator({
    config,
    language,
    renderMode: state.renderMode as 'cloud' | 'miniprem'
  });

  useLanguagePersist();

  // Render based on session status
  if (state.status === SessionStatus.IDLE || state.status === SessionStatus.READY) {
    return <KioskIdleView config={config} />;
  }

  return <KioskLiveView cardData={cardData} hasCards={hasCards} onGuidedExperienceConfirm={handleGuidedExperienceConfirm} useSeatViewerBackground={useSeatViewerBackground} />;
}

export default KioskPage;
