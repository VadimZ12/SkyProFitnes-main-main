import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'inactive';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
}) => {
  const baseStyles = "font-roboto h-[52px] font-normal text-lg leading-[110%] text-center rounded-[46px] transition-all duration-300 ease-in-out cursor-pointer";

  const variantStyles = {
    primary: "bg-primary text-black hover:bg-primary-hover active:bg-black active:text-white",
    secondary: "bg-white text-black border border-black hover:bg-secondary active:bg-secondary-active",
    inactive: "bg-secondary text-gray border border-gray cursor-not-allowed",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={disabled || variant === 'inactive'}
    >
      {children}
    </button>
  );
};

export default Button;