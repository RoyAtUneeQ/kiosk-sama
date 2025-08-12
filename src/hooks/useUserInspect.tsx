import type { RemoteSessionInfo } from '@/types/transport/RemoteSessionInfo';
import UserInspectService from '@/services/UserInspectService';

export function useUserInspect(connectionId: string): RemoteSessionInfo {
  const userInfo = UserInspectService.collect(connectionId);
  console.log('[useUserInspect] connectionId:', connectionId, 'userInfo:', userInfo);
  return userInfo;
}

export default useUserInspect; 