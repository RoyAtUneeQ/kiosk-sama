import { UneeqEventType } from "./UneeqEventType";

export interface UneeqEvent {
  type: UneeqEventType;
  data?: any;
}