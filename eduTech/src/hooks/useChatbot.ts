import { useState } from 'react';
import { ChatMessage } from '../utils/types';
import { chatWithBot } from '../../services/geminiService';

export const useChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubconcept, setActiveSubconcept] = useState<string | null>(null);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    const botResponse = await chatWithBot(updatedMessages, activeSubconcept || undefined);
    
    if (botResponse) {
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        content: botResponse.answer,
        timestamp: new Date(),
        subconcepts: botResponse.subconcepts
      };
      setMessages([...updatedMessages, botMessage]);
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSubconceptClick = (subconcept: string) => {
    setActiveSubconcept(prev => prev === subconcept ? null : subconcept);
  };

  const toggleOpen = () => setIsOpen(!isOpen);

  return {
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
  };
};
