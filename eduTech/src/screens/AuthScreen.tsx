import React, { useState } from 'react';
import { Sparkles, User } from 'lucide-react';
import { AuthTabs, AuthForm, AuthButton } from '../components/auth';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onAnonymousSignIn: () => Promise<{ success: boolean; error?: string }>;
  loading?: boolean;
}

export const AuthScreen = ({ onSignIn, onSignUp, onAnonymousSignIn, loading }: AuthScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleFormSubmit = async (email: string, password: string) => {
    return isSignUp ? await onSignUp(email, password) : await onSignIn(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
            EduTech
          </h1>
          <p className="text-slate-400 text-sm">
            당신의 학습 여정을 시작하세요
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {/* Tab Switcher */}
          <AuthTabs 
            isSignUp={isSignUp} 
            onToggle={setIsSignUp}
            disabled={loading}
          />

          {/* Auth Form */}
          <AuthForm 
            isSignUp={isSignUp}
            onSubmit={handleFormSubmit}
            loading={loading}
          />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/50 text-slate-500 font-medium">
                또는
              </span>
            </div>
          </div>

          {/* Anonymous Sign In */}
          <AuthButton
            onClick={onAnonymousSignIn}
            variant="secondary"
            disabled={loading}
            icon={User}
          >
            익명으로 시작하기
          </AuthButton>

          {/* Footer Text */}
          <p className="mt-6 text-center text-xs text-slate-500">
            {isSignUp ? '이미 계정이 있으신가요? ' : '계정이 없으신가요? '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
              disabled={loading}
            >
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </p>
        </div>

        {/* Bottom Note */}
        <p className="mt-6 text-center text-xs text-slate-600">
          계속 진행하면 서비스 약관 및 개인정보 보호정책에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
};
