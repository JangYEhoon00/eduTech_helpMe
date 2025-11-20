import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthButtonProps {
  onClick?: () => void;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AuthButton = ({ 
  onClick, 
  type = 'button',
  variant = 'primary',
  disabled, 
  loading,
  icon: Icon,
  children,
  fullWidth = true
}: AuthButtonProps) => {
  const baseClasses = `${fullWidth ? 'w-full' : ''} py-3 px-6 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`;
  
  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70'
    : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses} group`}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>처리 중...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-5 h-5" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
