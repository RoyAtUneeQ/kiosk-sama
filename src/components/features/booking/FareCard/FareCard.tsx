import { useState } from "react";
import { Card } from "@/components/index";
import type { FareData } from "@/types/booking";
import "./FareCard.scss";

interface FareCardProps {
  fare: FareData;
  onBoundIdClick?: (boundId: string) => void;
}

export default function FareCard({ fare, onBoundIdClick }: FareCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const featuresList = fare.features
    ? (fare.features.includes('|')
      ? fare.features.split('|').map((f: string) => f.trim()).filter((f: string) => f.length > 0)
      : [fare.features])
    : [];

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const formatFareFamilyCode = (code: string | undefined): string => {
    if (!code) return 'Fare';
    return code
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fareTitle = formatFareFamilyCode(fare.fareFamilyType);

  const handleCardClick = () => {
    if (onBoundIdClick) {
      console.log('[FareCard] Sending boundId:', fare.boundId);
      onBoundIdClick(fare.boundId);
    } else {
      console.warn('[FareCard] onBoundIdClick callback not provided');
    }
  };

  return (
    <Card>
      <div
        className={`fare-card ${isExpanded ? "fare-card--expanded" : "fare-card--collapsed"}`}
        onClick={handleCardClick}
        style={{ cursor: 'pointer' }}
      >
        <div className="fare-title">{fareTitle}</div>
        {isExpanded && featuresList.length > 0 && (
          <ul className="fare-benefits">
            {featuresList.map((feature: string, index: number) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        )}
        <div className="fare-footer">
          <div className="fare-divider" />
          <div className="fare-footer-content">
            <button
              type="button"
              className="show-more"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((prev) => !prev);
              }}
              disabled={featuresList.length === 0}
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
            <div className="price-column">
              <div className="price-current">
                {formatPrice(fare.priceTotal, fare.priceCurrency)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
