import './Card.scss';
import React from 'react';  
export default function Card( { children }: { children: React.ReactNode } ): React.ReactNode | null  {
  if (!children) return null;
  return (
    <div className="card">
      {children}
    </div>
  );
}