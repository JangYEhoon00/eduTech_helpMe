import React from 'react';
import { ChatMessage as ChatMessageType } from '../utils/types';

interface ChatMessageProps {
  message: ChatMessageType;
  key?: React.Key;
  activeSubconcept?: string | null;
  onSubconceptClick?: (subconcept: string) => void;
}

export const ChatMessageBubble = ({ message, activeSubconcept, onSubconceptClick }: ChatMessageProps) => (
  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
    <div className="max-w-[80%]">
      <div
        className={`rounded-2xl px-4 py-2.5 ${
          message.sender === 'user'
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-800 text-slate-200 border border-slate-700'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
      
      {/* Subconcept Buttons - only for bot messages */}
      {message.sender === 'bot' && message.subconcepts && message.subconcepts.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.subconcepts.map((subconcept, index) => (
            <button
              key={index}
              onClick={() => onSubconceptClick?.(subconcept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                activeSubconcept === subconcept
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              {subconcept}
            </button>
          ))}
        </div>
      )}
    </div>
  </div>
);
