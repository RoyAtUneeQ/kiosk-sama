import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";

export class FlightSearchListener implements CustomEventListener {
    type = "flight_search"; 
    async execute(_: any, session: SessionContextType): Promise<void> {
        session.state.persist?.get("flight_search_data")
        console.log('Flight Search Listener');
    }
}