import { Card } from "@/components/index";
import "./FareDetails.scss";

export default function FareDetails() {
	return (
		<Card>
			<div className="fare-details">
			<div className="fare-class">Economy Classic</div>
				<div className="fare-details__top">
					<div className="fare-details__left">
						<div className="fare-route">DOH To CDG</div>
						<div className="fare-time-date">01:25 - 06:35 • December 4</div>
					</div>
					<div className="fare-details__right">
						<div className="price-column">
							<div className="price-strikethrough">QAR 2020</div>
							<div className="price-current">QAR 1860</div>
						</div>
					</div>
				</div>

				<div className="cutout">
					<div className="left-cut" />
					<div className="line">
						<div className="dashed-top" />
					</div>
					<div className="right-cut" />
				</div>

				<div className="fare-details__bottom">
					<div className="total-label">Total for all passengers</div>
					<div className="price-column">
						<div className="price-strikethrough">QAR 2020</div>
						<div className="price-current">QAR 1860</div>
					</div>
				</div>
			</div>
		</Card>
	);
}

