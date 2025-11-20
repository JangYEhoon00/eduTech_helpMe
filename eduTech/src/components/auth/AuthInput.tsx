import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  disabled?: boolean;
}

export const AuthInput = ({ 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon,
  disabled 
}: AuthInputProps) => {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
