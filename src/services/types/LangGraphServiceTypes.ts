import type { MultitaskStrategy } from '@/types/utils/Config';

export interface LangGraphServiceOptions {
  baseUrl: string;
  assistantId: string;
  multitaskStrategy?: MultitaskStrategy;
}

export interface LangGraphServiceCallbacks {
  onTurnSent?: (runId: string) => void;
  onError?: (error: unknown) => void;
}

export interface LangGraphRun {
  run_id: string;
  thread_id: string;
  status: string;
}
