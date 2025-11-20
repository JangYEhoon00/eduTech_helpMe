import { useState } from 'react';
import { QuizData, MetaResult, Node } from '../utils/types';
import { generateQuiz, evaluateMetaCognition } from '../services/geminiService';
import { saveMetaResult } from '../services/supabaseService';

export const useQuizAndMeta = () => {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userExplanation, setUserExplanation] = useState('');
  const [metaResult, setMetaResult] = useState<MetaResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startQuiz = async (selectedNode: Node | null, setScreen: (screen: any) => void) => {
    if (!selectedNode) return;
    setIsLoading(true);
    const quiz = await generateQuiz(selectedNode.label);
    setIsLoading(false);
    if (quiz) {
      setQuizData(quiz);
      setScreen('quiz');
    }
  };

  const submitMetaCheck = async (
    selectedNode: Node | null, 
    updateNodeStatus: (nodeId: string, status: 'known' | 'fuzzy' | 'unknown') => void
  ) => {
    if (!selectedNode) return;
    setIsLoading(true);
    const result = await evaluateMetaCognition(selectedNode.label, userExplanation);
    setIsLoading(false);
    if (result) {
      setMetaResult(result);
      updateNodeStatus(selectedNode.id, result.status);

      // Save detailed meta result to Supabase
      try {
        await saveMetaResult(
          selectedNode.id,
          result.score,
          result.status,
          result.feedback,
          result.nextStep
        );
      } catch (error) {
        console.error('Failed to save meta result:', error);
      }
    }
  };

  return {
    quizData,
    userExplanation,
    setUserExplanation,
    metaResult,
    isLoading,
    startQuiz,
    submitMetaCheck
  };
};
