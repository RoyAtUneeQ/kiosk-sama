import type { UneeqOptions } from '@/types';
import { useUneeqSdkLifecycle } from './useUneeqSdkLifecycle';
import { useUneeqMessageQueue } from './useUneeqMessageQueue';
import { useUneeqControls } from './useUneeqControls';
import { useUneeqEvents } from './useUneeqEvents';

export const useUneeq = (
  options: UneeqOptions,
  language: string = 'en',
  type: 'cloud' | 'miniprem' = 'cloud'
) => {
  useUneeqSdkLifecycle(options, language, type);
  useUneeqMessageQueue();
  useUneeqEvents();
  useUneeqControls({ showClosedCaptions: options.showClosedCaptions });
};
