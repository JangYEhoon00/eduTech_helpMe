import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { ScreenState } from '../utils/types';

interface BackButtonProps {
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
}

export const BackButton = ({ screen, setScreen }: BackButtonProps) => (
  <button 
    onClick={() => setScreen(screen === 'graph' ? 'onboarding' : 'graph')}
    className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-full backdrop-blur-md border border-slate-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
  >
    {screen === 'graph' ? <Home className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
    <span className="text-sm font-bold">{screen === 'graph' ? '홈으로' : '뒤로가기'}</span>
  </button>
);
