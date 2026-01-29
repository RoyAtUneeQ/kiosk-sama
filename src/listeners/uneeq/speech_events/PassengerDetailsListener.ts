import { type SessionContextType } from "@/contexts/SessionContext";
import { type CustomEventListener } from "@/listeners/types/CustomEventListener";
import type { PassengerDetailsData } from "@/types/booking";

export class PassengerDetailsListener implements CustomEventListener {
  type = "passenger_details";
  async execute(data: any, session: SessionContextType): Promise<void> {
    console.log('[PassengerDetailsListener] 🎯 Event triggered', { eventType: this.type });
    console.dir(data);

    try {
      if (!session.state.stateManager) {
        console.log('[PassengerDetailsListener] ⚠️  State manager not available');
        return;
      }

      // Get passengers data from state manager (always an array)
      console.log('[PassengerDetailsListener] 📊 Fetching from state manager', { key: 'passengers' });
      const passengersStateData = await session.state.stateManager.get<PassengerDetailsData[]>('passengers');

      if (!passengersStateData || !Array.isArray(passengersStateData) || passengersStateData.length === 0) {
        console.log('[PassengerDetailsListener] ⚠️  No passengers found in state manager');
        session.actions.setPassengerDetailsData(null);
        return;
      }

      // Get the first passenger
      const passenger = passengersStateData[0];

      console.log('[PassengerDetailsListener] ✅ Passenger data retrieved', {
        passengerCount: passengersStateData.length,
        primaryPassenger: {
          passengerId: passenger.passengerId,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          passengerType: passenger.passengerType,
        }
      });

      // Ensure all required fields are present
      const passengerDetailsData: PassengerDetailsData = {
        passengerId: passenger.passengerId,
        title: passenger.title || '',
        gender: passenger.gender || '',
        firstName: passenger.firstName || '',
        lastName: passenger.lastName || '',
        dateOfBirth: passenger.dateOfBirth || '',
        nationality: passenger.nationality || '',
        passengerType: passenger.passengerType || '',
      };


      // Set in state
      session.actions.setPassengerDetailsData(passengerDetailsData);

      // Send to remote
      session.actions.sendRemoteMessage({
        type: 'passenger_details',
        payload: {
          data: passengerDetailsData
        }
      });

      console.log('[PassengerDetailsListener] 📤 Remote message sent', { type: 'passenger_details', passengerId: passengerDetailsData.passengerId });
    } catch (error) {
      console.error('[PassengerDetailsListener] ❌ Error processing passenger details:', error);
      session.actions.setPassengerDetailsData(null);
    }
  }
}
