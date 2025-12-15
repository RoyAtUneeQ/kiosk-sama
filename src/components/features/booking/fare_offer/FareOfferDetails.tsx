import { useState } from "react";
import { Card } from "@/components/index";
import type { FareData } from "@/types/fare";
import "./FareOfferDetails.scss";

interface FareOfferDetailsProps {
	fare: FareData;
	onBoundIdClick?: (boundId: string) => void;
}

export default function FareOfferDetails({ fare, onBoundIdClick }: FareOfferDetailsProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	// Parse features string into array if it's a delimited string, otherwise use as single item
	const featuresList = fare.features 
		? (fare.features.includes('|') 
			? fare.features.split('|').map(f => f.trim()).filter(f => f.length > 0)
			: [fare.features])
		: [];

	// Format price with currency
	const formatPrice = (price: number, currency: string) => {
		return `${currency} ${price.toLocaleString()}`;
	};

	// Format fareFamilyCode from "BUSINESS_COMFORT" to "Business Comfort"
	const formatFareFamilyCode = (code: string | undefined): string => {
		if (!code) return 'Fare';
		return code
			.split('_')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(' ');
	};

	// Get fare title from fareFamilyCode
	const fareTitle = formatFareFamilyCode(fare.fareFamilyCode);

	const handleCardClick = () => {
		// Send boundId via WebSocket without adding to chat history
		if (onBoundIdClick) {
			console.log('[FareOfferDetails] Sending boundId:', fare.boundId);
			onBoundIdClick(fare.boundId);
		} else {
			console.warn('[FareOfferDetails] onBoundIdClick callback not provided');
		}
	};

	return (
		<Card>
			<div
				className={`fare-offer-details ${isExpanded ? "fare-offer-details--expanded" : "fare-offer-details--collapsed"
					}`}
				onClick={handleCardClick}
				style={{ cursor: 'pointer' }}
			>
				<div className="fare-title">{fareTitle}</div>
				{isExpanded && featuresList.length > 0 && (
					<ul className="fare-benefits">
						{featuresList.map((feature, index) => (
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
