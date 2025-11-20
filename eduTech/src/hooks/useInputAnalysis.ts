import { useState } from 'react';
import { AnalysisResult } from '../utils/types';
import { analyzeConcept } from '../services/geminiService';

export const useInputAnalysis = () => {
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editableConcepts, setEditableConcepts] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setIsSaved(false);
    const result = await analyzeConcept(inputText);
    setIsLoading(false);
    if (result) {
      setAnalysisResult(result);
      setEditableConcepts(result.concepts.map(c => ({...c})));
    }
  };

  const handleInitialSave = () => {
    if (!analysisResult || isSaved) return;
    setIsSaveModalOpen(true);
  };

  return {
    inputText,
    setInputText,
    analysisResult,
    setAnalysisResult,
    editableConcepts,
    isSaved,
    setIsSaved,
    isSaveModalOpen,
    setIsSaveModalOpen,
    isLoading,
    handleAsk,
    handleInitialSave
  };
};
