import { KioskIdleView, KioskLiveView } from './components';
import { SessionStatus } from '@/contexts/types';
import { useSession } from '@/contexts/SessionContext';
import { useConfig } from '@/hooks/useConfig';
import {
  usePageLoadMonitor,
  useKioskSession,
  useRemoteConnection,
  useLanguagePersist,
  useCardData
} from '@/hooks';

function KioskPage() {
  // Track page load performance to measure lazy loading impact
  usePageLoadMonitor('KioskPage');

  const { state } = useSession();
  const { config } = useConfig();

  // Initialize kiosk session (UneeQ, events, state manager, WebSocket)
  const { websocket } = useKioskSession({
    config,
    language: state.language,
    renderMode: state.renderMode as 'cloud' | 'miniprem'
  });

  // Side effects
  useRemoteConnection({
    websocket,
    connectionId: state.remoteInfo?.connectionId ?? null
  });
  useLanguagePersist();

  // Derived data for cards
  const cardProps = useCardData();

  // Render based on session status
  if (state.status === SessionStatus.IDLE || state.status === SessionStatus.READY) {
    return <KioskIdleView config={config} />;
  }

  return <KioskLiveView {...cardProps} />;
}

export default KioskPage;
