import React from 'react';
import { Network, Play, MessageSquare } from 'lucide-react';
import { ScreenState } from '../utils/types';

interface HomeScreenProps {
  setScreen: (screen: ScreenState) => void;
}

export const HomeScreen = ({ setScreen }: HomeScreenProps) => (
  <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.08),transparent_70%)] animate-subtle-fade" />
    
    <div className="z-10 flex flex-col items-center text-center p-6 animate-subtle-fade">
      <div className="mb-10 relative group">
        <div className="w-28 h-28 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.2)] transition-all duration-700 group-hover:shadow-[0_0_80px_rgba(99,102,241,0.4)]">
           <Network className="w-12 h-12 text-indigo-300 group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>

      <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-2xl animate-smooth-slide-up" style={{animationDelay: '0.1s'}}>
        Second Brain <span className="text-indigo-500">OS</span>
      </h1>
      <p className="text-slate-400 text-lg mb-12 max-w-lg leading-relaxed animate-smooth-slide-up" style={{animationDelay: '0.2s'}}>
        당신의 지식을 3차원 우주로 시각화하세요.<br/>
        질문하고, 탐험하고, 연결하면 기억은 영원해집니다.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-smooth-slide-up" style={{animationDelay: '0.3s'}}>
        <button 
          onClick={() => setScreen('graph')}
          className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105 flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" /> 뇌 탐험하기
        </button>
        <button 
          onClick={() => setScreen('input')}
          className="flex-1 py-4 px-6 bg-slate-800/80 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg border border-slate-700 backdrop-blur transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover:border-slate-500"
        >
          <MessageSquare className="w-5 h-5 text-emerald-400" /> 질문 & 추가
        </button>
      </div>
    </div>
  </div>
);
