import "./StatusPanel.scss";
import React from 'react';

export interface StatusItem {
  id: string;
  label: string;
  value: string;
  status: 'ready' | 'not-ready' | 'warning' | 'info';
  href?: string;
  target?: string;
  className?: string;
}

export interface StatusPanelProps {
  /** Array of status items to display */
  items: StatusItem[];
  /** Custom className for the container */
  className?: string;
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Whether to show the panel */
  visible?: boolean;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({
  items,
  className = '',
  orientation = 'vertical',
  visible = true,
}) => {
  if (!visible || items.length === 0) {
    return null;
  }

  const renderStatusItem = (item: StatusItem) => {
    const content = (
      <div key={item.id} className={`status-item ${item.className || ''}`}>
        <span className="status-label">{item.label}: &nbsp;</span>
        <span className={`status-value status-${item.status}`}>
          {item.value}
        </span>
      </div>
    );

    if (item.href) {
      return (
        <a 
          key={item.id}
          href={item.href} 
          target={item.target || '_self'} 
          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
          className="status-link"
        >
          {content}
        </a>
      );
    }

    return content;
  };

  const renderStatusRow = (rowItems: StatusItem[]) => {
    if (rowItems.length === 1) {
      return renderStatusItem(rowItems[0]);
    }

    return (
      <div key={rowItems.map(item => item.id).join('-')} className="status-row">
        {rowItems.map((item, index) => (
          <React.Fragment key={item.id}>
            {renderStatusItem(item)}
            {index < rowItems.length - 1 && (
              <span className="status-separator">&nbsp; | &nbsp;</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Group items for horizontal layout
  const groupedItems = orientation === 'horizontal' 
    ? items.reduce<StatusItem[][]>((acc, item, index) => {
        const groupIndex = Math.floor(index / 2); // Group by 2s
        if (!acc[groupIndex]) {
          acc[groupIndex] = [];
        }
        acc[groupIndex].push(item);
        return acc;
      }, [])
    : items.map(item => [item]);

  return (
    <div className={`status-panel status-panel--${orientation} ${className}`}>
      {groupedItems.map((group) => renderStatusRow(group))}
    </div>
  );
};

export default StatusPanel;
