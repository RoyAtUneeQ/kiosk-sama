import type { ActionBase } from './ActionBase';

/**
 * Action to close session
 */
export interface ActionCloseSession extends ActionBase {
  type: 'closeSession';
}