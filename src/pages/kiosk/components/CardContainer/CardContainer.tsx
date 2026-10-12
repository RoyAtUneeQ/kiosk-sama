import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './CardContainer.scss';

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || node.parentElement !== document.body) return;
    if (document.body.lastElementChild !== node) {
      document.body.appendChild(node);
    }
  });

  return createPortal(
    <div ref={ref} className="card-container">
      {children}
    </div>,
    document.body
  );
};
