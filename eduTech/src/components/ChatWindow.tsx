import React from 'react';
import { MessageCircle, X, Send, Save } from 'lucide-react';
import { ChatMessage } from '../utils/types';
import { ChatMessageBubble } from './ChatMessageBubble';

interface ChatWindowProps {
  messages: ChatMessage[];
  inputText: string;
  isLoading: boolean;
  activeSubconcept: string | null;
  isOpen: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onClose: () => void;
  onSubconceptClick: (subconcept: string) => void;
  onSaveToGraph?: () => void;
}

export const ChatWindow = ({
  messages,
  inputText,
  isLoading,
  activeSubconcept,
  isOpen,
  onInputChange,
  onSend,
  onKeyPress,
  onClose,
  onSubconceptClick,
  onSaveToGraph
}: ChatWindowProps) => (
  <div 
    className={`fixed top-0 right-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}
  >
    {/* Header */}
    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold">AI 튜터</h3>
          <p className="text-xs text-slate-400">무엇이든 물어보세요</p>
        </div>
      </div>
      <button 
        onClick={onClose}
        className="text-slate-500 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {messages.length === 0 ? (
        <div className="text-center text-slate-500 mt-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">대화를 시작해보세요!</p>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessageBubble 
            key={msg.id} 
            message={msg}
            activeSubconcept={activeSubconcept}
            onSubconceptClick={onSubconceptClick}
          />
        ))
      )}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Active Subconcept Indicator & Save Button */}
    {activeSubconcept && (
      <div className="px-4 py-2 border-t border-slate-800 bg-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-300">
            선택된 개념: <span className="text-indigo-400 font-medium">{activeSubconcept}</span>
          </span>
        </div>
        {onSaveToGraph && (
          <button
            onClick={onSaveToGraph}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/30"
          >
            <Save className="w-3.5 h-3.5" />
            저장
          </button>
        )}
      </div>
    )}

    {/* Input */}
    <div className="p-4 border-t border-slate-800">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="메시지를 입력하세요..."
          className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-2.5 border border-slate-700 focus:border-indigo-500 outline-none transition-all duration-300 text-sm"
          disabled={isLoading}
        />
        <button
          onClick={onSend}
          disabled={!inputText.trim() || isLoading}
          className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-300"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);
