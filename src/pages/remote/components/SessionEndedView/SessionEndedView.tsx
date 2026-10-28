import './SessionEndedView.scss';
import React from 'react';
import { FiPower } from 'react-icons/fi';
import { useTranslation } from '@/hooks';
import type { SessionEndReason } from '@/types/transport';

interface SessionEndedViewProps {
  reason: SessionEndReason;
}

const SessionEndedView: React.FC<SessionEndedViewProps> = ({ reason }) => {
  const { t } = useTranslation();

  return (
    <div className="session-ended" role="status">
      <FiPower className="session-ended__icon" />
      <h2 className="session-ended__title">{t('session.endedTitle')}</h2>
      <p className="session-ended__reason">{t(`session.endedReasons.${reason}`)}</p>
      <p className="session-ended__hint">{t('session.scanNewQr')}</p>
    </div>
  );
};

export default SessionEndedView;
