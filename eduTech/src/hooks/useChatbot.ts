import { useState, useEffect } from 'react';
import { ChatMessage } from '../utils/types';
import { chatWithBot } from '../../services/geminiService';
import { fetchChatMessages, saveChatMessage } from '../services/supabaseService';

export const useChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSubconcept, setActiveSubconcept] = useState<string | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchChatMessages();
        if (history && history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    // Optimistic update
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    // Save user message
    try {
      await saveChatMessage(userMessage);
    } catch (error) {
      console.error('Failed to save user message:', error);
    }

    const botResponse = await chatWithBot(updatedMessages, activeSubconcept || undefined);
    
    if (botResponse) {
      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        content: botResponse.answer,
        timestamp: new Date(),
        subconcepts: botResponse.subconcepts
      };
      
      setMessages(prev => [...prev, botMessage]);

      // Save bot message
      try {
        await saveChatMessage(botMessage);
      } catch (error) {
        console.error('Failed to save bot message:', error);
      }
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
