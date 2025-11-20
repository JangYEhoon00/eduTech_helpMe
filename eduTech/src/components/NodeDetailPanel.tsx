import React from 'react';
import { X, Mic, HelpCircle, ArrowLeft } from 'lucide-react';
import { Node, GraphData, ScreenState } from '../utils/types';

interface NodeDetailPanelProps {
  selectedNode: Node;
  setSelectedNode: (node: Node | null) => void;
  setScreen: (screen: ScreenState) => void;
  graphData: GraphData;
  startQuiz: () => void;
}

export const NodeDetailPanel = ({
  selectedNode,
  setSelectedNode,
  setScreen,
  graphData,
  startQuiz
}: NodeDetailPanelProps) => (
  <div className="w-96 h-full bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col p-6 pt-20 overflow-y-auto custom-scrollbar">
    <div className="mb-6">
      <div>
        <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-2 py-1 rounded uppercase tracking-wider">
          {selectedNode.category}
        </span>
        <h2 className="text-2xl font-bold text-white mt-3">{selectedNode.label}</h2>
      </div>
    </div>

    <div className="space-y-3 mb-8">
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h4>
        <p className="text-slate-300 text-sm leading-relaxed">
          {selectedNode.description || "설명이 없습니다."}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setScreen('metacheck')}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:border-slate-500"
        >
          <Mic className="w-4 h-4 text-emerald-400" /> 
          <span>말하기 (메타인지)</span>
        </button>
        <button 
          onClick={startQuiz}
          className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:border-slate-500"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" /> 
          <span>퀴즈 풀기</span>
        </button>
      </div>
    </div>

    <div className="border-t border-slate-800 pt-6">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Connections</h4>
      <div className="space-y-2">
        {graphData.links
          .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
          .map((l, i) => {
            const targetId = l.source === selectedNode.id ? l.target : l.source;
            const targetNode = graphData.nodes.find(n => n.id === targetId);
            return targetNode ? (
              <button 
                key={i} 
                onClick={() => setSelectedNode(targetNode)}
                className="w-full text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all duration-300 flex items-center justify-between group"
              >
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{targetNode.label}</span>
                <ArrowLeft className="w-3 h-3 rotate-180 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              </button>
            ) : null;
          })
        }
      </div>
    </div>
  </div>
);
