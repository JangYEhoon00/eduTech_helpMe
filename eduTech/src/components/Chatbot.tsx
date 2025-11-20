import React from 'react';
import { MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useChatbot } from '../hooks/useChatbot';
import { ChatWindow } from './ChatWindow';

interface ChatbotProps {
  onSaveToGraph?: (concept: string) => void;
  isDisabled?: boolean;
}

export const Chatbot = ({ onSaveToGraph, isDisabled = false }: ChatbotProps) => {
  const {
    isOpen,
    messages,
    inputText,
    isLoading,
    activeSubconcept,
    setInputText,
    handleSend,
    handleKeyPress,
    handleSubconceptClick,
    toggleOpen
  } = useChatbot();

  const handleSaveClick = () => {
    if (activeSubconcept && onSaveToGraph) {
      onSaveToGraph(activeSubconcept);
    }
  };

  return (
    <>
      {/* Sidebar Chat Window */}
      <ChatWindow
        messages={messages}
        inputText={inputText}
        isLoading={isLoading}
        activeSubconcept={activeSubconcept}
        isOpen={isOpen}
        isDisabled={isDisabled}
        onInputChange={setInputText}
        onSend={handleSend}
        onKeyPress={handleKeyPress}
        onClose={() => toggleOpen()}
        onSubconceptClick={handleSubconceptClick}
        onSaveToGraph={onSaveToGraph ? handleSaveClick : undefined}
      />

      {/* Toggle Button - Fixed on right edge */}
      <button
        onClick={toggleOpen}
        disabled={isDisabled}
        className={`fixed top-1/2 -translate-y-1/2 text-white shadow-2xl flex items-center justify-center transition-all duration-300 z-40 ${
          isDisabled 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40 hover:shadow-indigo-500/60'
        } ${
          isOpen ? 'right-96' : 'right-0'
        } rounded-l-lg px-2 py-4`}
        title={isDisabled ? '사이드바가 열려있을 때는 사용할 수 없습니다' : (isOpen ? '챗봇 닫기' : '챗봇 열기')}
      >
        {isOpen ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </>
  );
};
