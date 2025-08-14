import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';
import { UserInspectService } from '@/services';
import { useMemo } from 'react';

/**
 * Capture a snapshot of browser/device info for a given connection id.
 */
export function useUserInspect(connectionId: string): RemoteSessionInfo {
  const userInspectService = useMemo(() => new UserInspectService(), []);
  
  const userInfo = useMemo(() => {
    const info = userInspectService.collect(connectionId);
    console.log('[useUserInspect] connectionId:', connectionId, 'userInfo:', info);
    return info;
  }, [connectionId, userInspectService]);

  return userInfo;
}


