import './RemoteReconnectNotice.scss';
import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks';

interface RemoteReconnectNoticeProps {
  disconnectedAt: number;
  graceMs: number;
}

const formatRemaining = (ms: number): string => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const RemoteReconnectNotice: React.FC<RemoteReconnectNoticeProps> = ({ disconnectedAt, graceMs }) => {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const remaining = Math.max(0, disconnectedAt + graceMs - now);

  return (
    <div className="remote-reconnect-notice" role="status">
      <span className="remote-reconnect-notice__text">{t('session.waitingForRemote')}</span>
      <span className="remote-reconnect-notice__timer">{formatRemaining(remaining)}</span>
    </div>
  );
};

export default RemoteReconnectNotice;
