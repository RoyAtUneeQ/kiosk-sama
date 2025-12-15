import React from 'react';
import { KioskStartForm } from '../index';
import { DebugPanel } from '@/components';
import type { Config } from '@/types';

interface KioskIdleViewProps {
  config?: Config;
}

const KioskIdleView: React.FC<KioskIdleViewProps> = ({ config }) => {
  return (
    <>
      <KioskStartForm />
      {/* Development DebugPanel - shows based on config.app.environment */}
      <DebugPanel show={config?.app?.environment === 'development'} />
    </>
  );
};

export default KioskIdleView;
