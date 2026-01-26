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

  const item = cartData.items[0]; // Display first item (typically only one)
  const fareFamilyType = formatFareFamilyType(item.fareFamilyType);
  const route = `${item.origin} To ${item.destination}`;
  const departureTime = formatTime(item.departureDateTime);
  const arrivalTime = formatTime(item.arrivalDateTime);
  const date = formatDate(item.departureDateTime);
  const segmentPrice = formatPrice(item.price, item.currency);
  const totalPrice = formatPrice(cartData.totalPrice, cartData.currency);

  return (
      <Card>
        <div className="add-to-cart-card">
          <div className="cart-fare-type">{fareFamilyType}</div>
          
          <div className="cart-route-section">
            <div className="cart-route">{route}</div>
            <div className="cart-time-date-row">
              <div className="cart-time-date">
                {departureTime} - {arrivalTime} • {date}
              </div>
              <div className="cart-segment-price">{segmentPrice}</div>
            </div>
          </div>

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
