import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-[6px] transition-all outline-none focus:ring-2 focus:ring-[#0070F3] focus:ring-offset-2 focus:ring-offset-[var(--bg)] disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer';

  const sizeStyles = {
    sm: 'h-[30px] px-3 text-xs gap-1.5',
    md: 'h-[36px] px-[14px] text-[13px] gap-2',
    lg: 'h-[40px] px-4 text-sm gap-2'
  }[size];

  const variantStyles = {
    primary: 'bg-[var(--fg)] text-[var(--bg)] font-semibold hover:opacity-90 active:scale-[0.99]',
    secondary: 'bg-transparent border border-[var(--border-strong)] text-[var(--fg)] hover:bg-[var(--surface-hover)] active:scale-[0.99]',
    ghost: 'bg-transparent text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-hover)] active:scale-[0.99]',
    destructive: 'bg-[var(--danger)] text-white hover:opacity-90 active:scale-[0.99]'
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
