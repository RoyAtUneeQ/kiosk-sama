import { UneeqContainer, RemoteConnectionInfo, RemoteReconnectNotice, LeftSideBar, MediaContainer } from '../';
import { REMOTE_RECONNECT_GRACE_MS } from '../../hooks/useKioskSessionLifecycle';
import { CardContainer } from '../CardContainer/CardContainer';
import { SessionStatus } from '@/contexts/types';
import { QRCode, TopProgressBar } from '@/components';
import { useSession } from '@/contexts/SessionContext';
import { defaultUneeqOptions } from '@/types';
import { MessageCards } from '@/components/features/booking';
import type { MessageCardSet } from '@/types/booking';

interface KioskLiveViewProps {
  cardData: MessageCardSet | null;
  hasCards: boolean;
  onGuidedExperienceConfirm?: () => void;
  useSeatViewerBackground?: boolean;
}

function KioskLiveView({
  cardData,
  hasCards,
  onGuidedExperienceConfirm,
  useSeatViewerBackground
}: KioskLiveViewProps) {
  const { state } = useSession();

  return (
    <div>
      {/* Top progress bar for awaiting response */}
      <TopProgressBar
        isVisible={state.awaitingPromptResponse}
        height={0.5}
        animationSpeed={6}
      />
      <UneeqContainer uneeqContainerId={defaultUneeqOptions.containedElementIdName} />
      {state.status === SessionStatus.LIVE && (
        <>
          <LeftSideBar />
          {!state.remoteInfo && state.remoteDisconnectedAt !== null && (
            <RemoteReconnectNotice disconnectedAt={state.remoteDisconnectedAt} graceMs={REMOTE_RECONNECT_GRACE_MS} />
          )}
          {!state.remoteInfo && state.remoteDisconnectedAt === null && (
            <QRCode
              value={`${window.location.protocol}//${window.location.host}/remote/${state.connectionId}?session=${state.sessionToken}`}
              size={160}
            />
          )}
          {state.remoteInfo && <RemoteConnectionInfo info={state.remoteInfo} />}
          {state.media && <MediaContainer {...state.media} />}
          {hasCards && cardData && (
            <CardContainer>
              <MessageCards
                cardData={cardData}
                onGuidedExperienceConfirm={onGuidedExperienceConfirm}
                useSeatViewerBackground={useSeatViewerBackground}
              />
            </CardContainer>
          )}
        </>
      )}
    </div>
  );
}

export default KioskLiveView;
