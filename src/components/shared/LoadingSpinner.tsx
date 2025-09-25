import React from 'react';
import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm' | 'lg';
  variant?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  variant = 'primary',
  className = ''
}) => {
  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`}>
      <Spinner
        animation="border"
        role="status"
        variant={variant}
        size={size}
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;