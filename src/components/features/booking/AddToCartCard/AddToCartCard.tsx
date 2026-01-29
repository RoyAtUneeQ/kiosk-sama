import { Card } from "@/components/index";
import type { AddToCartData } from "@/types/booking";
import "./AddToCartCard.scss";

interface AddToCartCardProps {
  cartData: AddToCartData;
}

function formatPrice(price: number, currency: string): string {
  return `${currency} ${price.toLocaleString()}`;
}

function formatTime(dateTimeString: string): string {
  if (!dateTimeString) return '--:--';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(dateTimeString: string): string {
  if (!dateTimeString) return 'Date TBD';
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return 'Date TBD';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function formatFareFamilyType(fareFamilyType: string): string {
  if (!fareFamilyType) return 'Fare';
  return fareFamilyType
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function AddToCartCard({ cartData }: AddToCartCardProps) {
  if (!cartData.items || cartData.items.length === 0) {
    return null;
  }

  const isRoundTrip = cartData.items.length > 1;
  const outboundItem = cartData.items[0];
  const inboundItem = isRoundTrip ? cartData.items[1] : null;

  const fareFamilyType = formatFareFamilyType(outboundItem.fareFamilyType);
  const totalPrice = formatPrice(cartData.totalPrice, cartData.currency);

  // Outbound flight details
  const outboundRoute = `${outboundItem.origin} To ${outboundItem.destination}`;
  const outboundDepartureTime = formatTime(outboundItem.departureDateTime);
  const outboundArrivalTime = formatTime(outboundItem.arrivalDateTime);
  const outboundDate = formatDate(outboundItem.departureDateTime);
  const outboundPrice = formatPrice(outboundItem.price, outboundItem.currency);

  // Inbound flight details (if round trip)
  const inboundRoute = inboundItem ? `${inboundItem.origin} To ${inboundItem.destination}` : null;
  const inboundDepartureTime = inboundItem ? formatTime(inboundItem.departureDateTime) : null;
  const inboundArrivalTime = inboundItem ? formatTime(inboundItem.arrivalDateTime) : null;
  const inboundDate = inboundItem ? formatDate(inboundItem.departureDateTime) : null;
  const inboundPrice = inboundItem ? formatPrice(inboundItem.price, inboundItem.currency) : null;

  return (
      <Card>
        <div className="add-to-cart-card">
          <div className="cart-fare-type">{fareFamilyType}</div>

          {/* Outbound Flight */}
          <div className="cart-route-section">
            <div className="cart-route">{outboundRoute}</div>
            <div className="cart-time-date-row">
              <div className="cart-time-date">
                {outboundDepartureTime} - {outboundArrivalTime} • {outboundDate}
              </div>
              <div className="cart-segment-price">{outboundPrice}</div>
            </div>
          </div>

          {/* Inbound Flight (if round trip) */}
          {isRoundTrip && inboundItem && (
            <div className="cart-route-section">
              <div className="cart-route">{inboundRoute}</div>
              <div className="cart-time-date-row">
                <div className="cart-time-date">
                  {inboundDepartureTime} - {inboundArrivalTime} • {inboundDate}
                </div>
                <div className="cart-segment-price">{inboundPrice}</div>
              </div>
            </div>
          )}

          <div className="cart-divider">
            <div className="left-cut" />
            <div className="line"><div className="dashed-top" /></div>
            <div className="right-cut" />
          </div>

          <div className="cart-total-section">
            <div className="cart-total-label">Total for all passengers</div>
            <div className="cart-total-price">{totalPrice}</div>
          </div>
        </div>
      </Card>
  );
}
