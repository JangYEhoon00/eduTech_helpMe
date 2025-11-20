import React from 'react';
import { HelpCircle, Loader2, Zap, Brain, Play, Plus } from 'lucide-react';
import { ScreenState, AnalysisResult } from '../utils/types';
import { cleanMarkdown } from '../utils/markdownUtils';
import { BackButton } from '../components/BackButton';
import { SaveLocationModal } from '../components/SaveLocationModal';

interface InputScreenProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleAsk: () => void;
  isLoading: boolean;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  editableConcepts: any[];
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
  setScreen: (screen: ScreenState) => void;
  handleInitialSave: () => void;
  isSaveModalOpen: boolean;
  setIsSaveModalOpen: (open: boolean) => void;
  handleFinalSave: (category: string) => void;
  uniqueCategories: string[];
}

export const InputScreen = ({ 
  inputText, setInputText, handleAsk, isLoading, analysisResult, setAnalysisResult, 
  editableConcepts, isSaved, setIsSaved, setScreen, handleInitialSave, 
  isSaveModalOpen, setIsSaveModalOpen, handleFinalSave, uniqueCategories 
}: InputScreenProps) => (
  <div className="h-screen bg-[#020617] flex flex-col p-6 pt-20 items-center overflow-y-auto">
    <BackButton screen="input" setScreen={setScreen} />
    
    <div className="w-full max-w-3xl space-y-6 pb-20">
      {/* Chat Input Area */}
      <div className="flex justify-end animate-smooth-slide-up">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tr-sm p-6 max-w-xl shadow-xl w-full">
           <h3 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
             <HelpCircle className="w-4 h-4" /> 무엇이 궁금한가요?
           </h3>
           {!analysisResult ? (
             <div className="space-y-4">
               <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="예: RAG(검색증강생성)가 무엇이고 왜 중요한지 알려줘"
                  className="w-full h-32 bg-black/30 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none text-lg transition-colors"
                />
                <button 
                  onClick={handleAsk}
                  disabled={isLoading || !inputText}
                  className="w-full py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                >
                  {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
                  {isLoading ? "AI가 지식 구조를 분석 중..." : "질문하기"}
                </button>
             </div>
           ) : (
             <p className="text-white text-lg font-medium">{inputText}</p>
           )}
        </div>
      </div>

      {/* AI Response */}
      {analysisResult && (
        <div className="flex justify-start animate-smooth-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-2xl rounded-tl-sm p-6 max-w-2xl shadow-2xl w-full">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
               <Brain className="w-5 h-5" /> AI 답변
            </div>
            
            <div className="prose prose-invert mb-6">
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {cleanMarkdown(analysisResult.answer)}
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-5 border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">추출된 지식 개념 (임시 분류)</h4>
              <div className="flex flex-wrap gap-2">
                {editableConcepts.map((c, i) => (
                  <span key={i} className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 font-medium animate-smooth-appear" style={{animationDelay: `${i * 0.05}s`}}>
                     {c.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3 flex-wrap md:flex-nowrap">
               <button onClick={() => { setAnalysisResult(null); setIsSaved(false); setInputText(''); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors duration-300">
                 새로운 질문
               </button>
               
               {isSaved ? (
                 <button 
                  onClick={() => setScreen('graph')} 
                  className="flex-[1.5] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 animate-smooth-appear"
                 >
                   <Play className="w-4 h-4 fill-current" /> 그래프 보러가기
                 </button>
               ) : (
                 <button 
                  onClick={handleInitialSave} 
                  className="flex-[1.5] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
                 >
                   <Plus className="w-4 h-4" /> 내 뇌(그래프)에 저장
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
      
      {/* Follow up input */}
      {analysisResult && (
         <div className="mt-4 animate-smooth-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex gap-3 items-center">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                  placeholder="위 태그를 클릭하거나 추가 질문을 입력하세요..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none px-2"
                />
                <button 
                  onClick={handleAsk} 
                  disabled={isLoading || !inputText}
                  className={`p-3 rounded-lg text-white transition-colors duration-300 ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                </button>
            </div>
         </div>
      )}
    </div>
    <SaveLocationModal 
      isOpen={isSaveModalOpen} 
      onClose={() => setIsSaveModalOpen(false)} 
      onConfirm={handleFinalSave}
      existingCategories={uniqueCategories}
    />
  </div>
);
