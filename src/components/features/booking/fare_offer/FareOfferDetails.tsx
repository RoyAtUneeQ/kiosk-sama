import { useState } from "react";
import { Card } from "@/components/index";
import "./FareOfferDetails.scss";

export default function FareOfferDetails() {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<Card>
			<div
				className={`fare-offer-details ${isExpanded ? "fare-offer-details--expanded" : "fare-offer-details--collapsed"
					}`}
			>
				<div className="fare-title">Economy Classic</div>
				{isExpanded &&
					<ul className="fare-benefits">
						<li>Earn 2038 Avios</li>
						<li>Flight or date changes for a fee</li>
						<li>Cancellation within 24hrs of booking without fees</li>
						<li>Checked baggage: 30 kg</li>
						<li>Hand baggage: 1 piece, 7 kg</li>
						<li>Seat selection for a fee</li>
						<li>Upgrade with Avios</li>
					</ul>
				}
				<div className="fare-footer"> 
					<div className="fare-divider" />
					<div className="fare-footer-content">
						<button
							type="button"
							className="show-more"
							onClick={() => setIsExpanded((prev) => !prev)}
						>
							{isExpanded ? "Show less" : "Show more"}
						</button>

						<div className="price-column">
							<div className="price-strikethrough">QAR 2020</div>
							<div className="price-current">QAR 1860</div>
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
