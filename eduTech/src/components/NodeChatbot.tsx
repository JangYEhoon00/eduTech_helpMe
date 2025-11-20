import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { Node } from '../utils/types';
import { GoogleGenAI } from '@google/genai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface NodeChatbotProps {
  node: Node;
  onSaveSubconcept?: (subconcept: string) => void;
}

export const NodeChatbot = ({ node, onSaveSubconcept }: NodeChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `안녕하세요! "${node.label}"에 대해 궁금한 점이 있으신가요? 함께 탐구해봅시다! 🚀`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedSubconcepts, setSuggestedSubconcepts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 초기 하위 개념 제안 생성
  useEffect(() => {
    generateInitialSubconcepts();
  }, [node.id]);

  const generateInitialSubconcepts = async () => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `"${node.label}"라는 개념에 대해 학습할 때 알아야 할 핵심 하위 개념 3가지를 추천해주세요. 
      각 개념은 간단명료하게 2-4단어로 표현해주세요.
      
      형식: 개념1, 개념2, 개념3`;

      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt
      });
      const text = result.text || '';
      const concepts = text.split(',').map(c => c.trim()).filter(c => c.length > 0).slice(0, 3);
      setSuggestedSubconcepts(concepts);
    } catch (error) {
      console.error('하위 개념 생성 실패:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다.');
      }

      const ai = new GoogleGenAI({ apiKey });

      const context = `현재 학습 중인 개념: "${node.label}"
카테고리: ${node.category}
설명: ${node.description || '없음'}

이전 대화:
${messages.map(m => `${m.role === 'user' ? '학생' : 'AI'}: ${m.content}`).join('\n')}

학생의 질문: ${input}

위 맥락을 고려하여 "${node.label}"에 대한 학생의 질문에 친절하고 명확하게 답변해주세요.`;

      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: context
      });
      const aiResponse = result.text || '';

      const assistantMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('AI 응답 생성 실패:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubconceptClick = (subconcept: string) => {
    if (onSaveSubconcept) {
      onSaveSubconcept(subconcept);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">AI 학습 도우미</h3>
            <p className="text-slate-400 text-xs">"{node.label}" 전용 채팅</p>
          </div>
        </div>
      </div>

      {/* Suggested Subconcepts */}
      {suggestedSubconcepts.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30">
          <p className="text-slate-400 text-xs font-medium mb-3 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-yellow-400" />
            추천 하위 개념
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedSubconcepts.map((concept, idx) => (
              <button
                key={idx}
                onClick={() => handleSubconceptClick(concept)}
                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 transition-all font-medium"
              >
                + {concept}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`"${node.label}"에 대해 질문하세요...`}
            className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:border-indigo-500 outline-none transition-all text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
