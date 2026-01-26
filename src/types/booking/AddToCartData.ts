export interface CartItem {
  flightId: string;
  flightNumber: string;
  price: number;
  currency: string;
  fareFamilyType: string;
  origin: string; // Airport code (e.g., "DOH")
  destination: string; // Airport code (e.g., "CDG")
  departureDateTime: string;
  arrivalDateTime: string;
}

export interface AddToCartData {
  items: CartItem[];
  totalPrice: number;
  currency: string;
}
