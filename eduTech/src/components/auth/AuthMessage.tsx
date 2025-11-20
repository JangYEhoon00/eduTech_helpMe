import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthMessageProps {
  type: 'error' | 'success';
  message: string;
}

export const AuthMessage = ({ type, message }: AuthMessageProps) => {
  const isError = type === 'error';
  
  return (
    <div className={`p-3 rounded-xl flex items-center gap-2 text-sm ${
      isError 
        ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
    }`}>
      {isError ? (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};
