import type { ActionBase } from './ActionBase';

export interface ActionPing extends ActionBase {
  type: 'ping';
  timestamp: number;
}
