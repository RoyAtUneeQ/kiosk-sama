import type { SessionContextType } from '@/contexts/SessionContext';
  
export interface EventListenerContext {
    session: SessionContextType;
    execute: (data: any, session: SessionContextType) => void;
  }
