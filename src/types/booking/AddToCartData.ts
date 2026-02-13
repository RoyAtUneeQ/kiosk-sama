export interface CartItem {
  flightId: string;
  flightNumber: string;
  price: number;
  currency: string;
  fareFamilyType: string;
  origin: {
    name: string;
    city: string;
    iataCode: string;
  };
  destination: {
    name: string;
    city: string;
    iataCode: string;
  };
  departureDateTime: string;
  arrivalDateTime: string;
}

export interface AddToCartData {
  items: CartItem[];
  totalPrice: number;
  currency: string;
}
