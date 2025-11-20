import React from 'react';

interface AuthTabsProps {
  isSignUp: boolean;
  onToggle: (isSignUp: boolean) => void;
  disabled?: boolean;
}

export const AuthTabs = ({ isSignUp, onToggle, disabled }: AuthTabsProps) => {
  return (
    <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
      <button
        type="button"
        onClick={() => onToggle(false)}
        disabled={disabled}
        className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
          !isSignUp
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        로그인
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        disabled={disabled}
        className={`flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
          isSignUp
            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
            : 'text-slate-400 hover:text-white'
        }`}
      >
        회원가입
      </button>
    </div>
  );
};
