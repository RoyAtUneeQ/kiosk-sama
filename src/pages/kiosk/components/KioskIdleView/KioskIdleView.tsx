import React from 'react';
import { KioskStartForm } from '../index';
import type { Config } from '@/types';

interface KioskIdleViewProps {
  config?: Config;
}

const KioskIdleView: React.FC<KioskIdleViewProps> = () => {
  return (
    <>
      <KioskStartForm />
    </>
  );
};

export default KioskIdleView;
