import { useState } from "react";
import { Card } from "@/components/index";
import "./FlightSearchDetail.scss";

const collapsedContent = (
  <>
    <div className="flight-count">1 flight</div>

    <div className="flight-route-row">
      <div className="route">DOH To CDG</div>
      <div className="price-strikethrough">QAR 2020</div>
    </div>

    <div className="flight-time-row">
      <div className="time-date">01:25 - 06:35 • December 2</div>
      <div className="price-current">QAR 1860</div>
    </div>

    <div className="airline">Operated by Qatar Airways</div>
  </>
);

const expandedContent = (
  <>
    <div className="route">Doha (DOH) To Paris (CDG)</div>

    <div className="flight-summary">
      <div className="airline-mark">
        <span className="airline-logo">Q</span>
      </div>
      <div className="time-details">
        <div className="time-range">01:25 - 06:35</div>
        <div className="duration">07h 10m</div>
      </div>
    </div>

    <div className="airline airline-detailed">
      <span className="dot" />
      Operated by Qatar Airways
    </div>
  </>
);

export default function FlightSearchDetail() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <div
        className={`flight-search-detail ${
          isExpanded ? "flight-search-detail--expanded" : "flight-search-detail--collapsed"
        }`}
      >
        {isExpanded ? expandedContent : collapsedContent}

        <button
          type="button"
          className="show-more"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>

        {isExpanded && (
          <>
            <div className="cutout">
              <div className="left-cut" />
              <div className="line"><div className="dashed-top" /></div>
              <div className="right-cut" />
            </div>

            <div className="expanded-content">
              <div className="total-label">Total for all passengers</div>
              <div className="price-column">
                <div className="price-strikethrough">QAR 2020</div>
                <div className="price-current">QAR 1860</div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}