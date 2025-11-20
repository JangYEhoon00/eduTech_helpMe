import React from 'react';
import { X } from 'lucide-react';
import { ScreenState, QuizData } from '../utils/types';
import { cleanMarkdown } from '../utils/markdownUtils';

interface QuizScreenProps {
  setScreen: (screen: ScreenState) => void;
  quizData: QuizData | null;
}

export const QuizScreen = ({ setScreen, quizData }: QuizScreenProps) => (
  <div className="h-screen bg-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white,transparent_80%)] opacity-10 animate-subtle-fade" />
     
     <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-smooth-appear text-slate-900">
       <button onClick={() => setScreen('graph')} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5"/></button>
       
       <div className="mb-6">
         <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pop Quiz</span>
       </div>
       
       <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
         {cleanMarkdown(quizData?.question || "")}
       </h2>

       <div className="space-y-3">
         {quizData?.options.map((opt, idx) => (
           <button 
             key={idx}
             onClick={() => {
               if (idx === quizData.answer) {
                 alert(`정답입니다! \n\n${cleanMarkdown(quizData.feedback)}`);
                 setScreen('graph');
               } else {
                 alert("오답입니다. 다시 생각해보세요.");
               }
             }}
             className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 font-medium transition-all duration-300 group"
           >
             <span className="mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-colors">{idx + 1}</span> 
             {cleanMarkdown(opt)}
           </button>
         ))}
       </div>
     </div>
  </div>
);
