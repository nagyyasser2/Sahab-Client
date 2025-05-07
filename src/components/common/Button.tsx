import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 disabled:bg-blue-300';
      case 'secondary':
        return 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500 disabled:bg-gray-300';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 disabled:bg-green-300';
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 disabled:bg-red-300';
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500 disabled:bg-blue-300';
    }
  };

  return (
    <button
      className={`font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getVariantClasses()} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};