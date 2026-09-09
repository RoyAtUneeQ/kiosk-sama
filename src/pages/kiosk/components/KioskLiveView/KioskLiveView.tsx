import { UneeqContainer, RemoteConnectionInfo, LeftSideBar, MediaContainer } from '../';
import { CardContainer } from '../CardContainer/CardContainer';
import { SessionStatus } from '@/contexts/types';
import { QRCode, TopProgressBar } from '@/components';
import { useSession } from '@/contexts/SessionContext';
import { defaultUneeqOptions } from '@/types';
import { MessageCards } from '@/components/features/booking';
import type { Message } from '@/types/transport/Message';
import type { FlightsSearchData, FareSelectionData, BookingSummaryData, GuidedExperienceData, SeatViewerData } from '@/types/booking';

interface KioskLiveViewProps {
  cardData: FlightsSearchData | FareSelectionData | BookingSummaryData | GuidedExperienceData | SeatViewerData | null;
  lastAssistantMessage: Message | null;
  hasCards: boolean;
  onGuidedExperienceConfirm?: () => void;
  useSeatViewerBackground?: boolean;
}

function KioskLiveView({
  cardData,
  lastAssistantMessage,
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
          {!state.remoteInfo && (
            <QRCode
              value={`${window.location.protocol}//${window.location.host}/remote/${state.connectionId}`}
              size={160}
            />
          )}
          {state.remoteInfo && <RemoteConnectionInfo info={state.remoteInfo} />}
          {state.media && <MediaContainer {...state.media} />}
          {hasCards && lastAssistantMessage && cardData && (
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
