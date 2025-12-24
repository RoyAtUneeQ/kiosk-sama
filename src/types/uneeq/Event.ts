import { EventType } from "./EventType";

export interface Event {
  uneeqMessageType: EventType;
  data?: any;
  speechEvent?: {
    event_name: string;
    param_name: string;
    param_value: string;
  };
  promptResult?: {
    type: string;
    success: boolean;
    response: {
      text: string;
      metadata: any;
    };
  };    
}