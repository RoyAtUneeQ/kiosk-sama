import './EndSessionButton.scss';
import React, { useState } from 'react';
import { FiPower } from 'react-icons/fi';
import { useTranslation } from '@/hooks';

interface EndSessionButtonProps {
  onEndSession: () => void;
  disabled?: boolean;
}

const EndSessionButton: React.FC<EndSessionButtonProps> = ({ onEndSession, disabled }) => {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="end-session">
      <button
        className="icon-button end-session-button"
        onClick={() => setConfirming((value) => !value)}
        aria-label={t('session.endSession')}
        title={t('session.endSession')}
        disabled={disabled}
      >
        <FiPower />
      </button>
      {confirming && (
        <div className="end-session-confirm" role="dialog">
          <p className="end-session-confirm__text">{t('session.endSessionConfirm')}</p>
          <div className="end-session-confirm__actions">
            <button className="end-session-confirm__cancel" onClick={() => setConfirming(false)}>
              {t('session.cancel')}
            </button>
            <button
              className="end-session-confirm__end"
              onClick={() => {
                setConfirming(false);
                onEndSession();
              }}
            >
              {t('session.endSession')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EndSessionButton;
