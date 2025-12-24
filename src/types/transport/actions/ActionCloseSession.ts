import type { ActionBase } from './ActionBase';

export interface ActionCloseSession extends ActionBase {
  type: 'closeSession';
}