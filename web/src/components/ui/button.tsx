import React from 'react';

type ButtonProps = {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const Button = ({
  onClick,
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
}: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors duration-200 focus:outline-none';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;