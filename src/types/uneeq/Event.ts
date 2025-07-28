import { EventType } from "./EventType";

/**
 * Interface for Uneeq event structure.
 */
export interface Event {
  uneeqMessageType: EventType;
  data?: any;
  speechEvent?: {
    event_name: string;
    param_name: string;
    param_value: string;
  };
}