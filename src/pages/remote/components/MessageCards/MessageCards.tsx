import React from 'react';
import type { Message } from '@/types/transport/Message';
import { MessageSender } from '@/types';
import type { BookingData } from '@/types/booking';
import FlightCards from '../FlightCards/FlightCards';

/**
 * Props for MessageCards component
 */
interface MessageCardsProps {
  message: Message;
  bookingData: BookingData | null;
  isLastAssistantMessage: boolean;
}

/**
 * MessageCards component determines and renders appropriate cards
 * based on the message content and current state.
 * 
 * This component is extensible - add new card types here as needed.
 * 
 * Cards are shown only after assistant messages that trigger them.
 * For example, FlightCards are shown after the assistant's response about available flights.
 */
export default function MessageCards({ message, bookingData, isLastAssistantMessage }: MessageCardsProps) {
  // Only show cards after assistant messages
  if (message.sender !== MessageSender.Assistant) {
    return null;
  }

  // Show FlightCards if bookingData is available and this is the last assistant message
  // This ensures cards appear only after the specific assistant response that triggered them
  if (isLastAssistantMessage && bookingData && bookingData.data && bookingData.data.length > 0) {
    return <FlightCards />;
  }

  // Future: Add other card types here based on message content or state
  // Example:
  // if (isLastAssistantMessage && shouldShowHotelCards(message, state)) {
  //   return <HotelCards />;
  // }

  return null;
}

