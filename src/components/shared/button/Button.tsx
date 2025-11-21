import './Button.scss';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({ children, className, onClick, ...props }) => {
  return (
    <button onClick={onClick} className={`button ${className || ''}`} {...props}>
      <span className="buttonText">{children}</span>
      <div className="ambientMovement"></div>
      <div className="glow"></div>
    </button>
  );
};

export interface CircleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  onClick?: () => void;
}

export const CircleButton: React.FC<CircleButtonProps> = ({ icon, className, onClick, ...props }: CircleButtonProps) => {
  return (
    <button onClick={onClick} className={`circleButton ${className || ''}`} {...props} title={props.title || ''}>
      <span className="pulse"></span>
      <span className="circleIcon">{icon}</span>  
    </button>
  );
};

export default Button; 