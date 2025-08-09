import type { ActionBase } from './ActionBase';

/**
 * Action to get connection ID from server
 */
export interface ActionGetConnectionId extends ActionBase {
  type: 'getConnectionId';
}