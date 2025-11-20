import { useState, useEffect } from 'react';
import { ScreenState, Node, Link } from './utils/types';
import { HomeScreen } from './screens/HomeScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { InputScreen } from './screens/InputScreen';
import { GraphScreen } from './screens/GraphScreen';
import { MetaCheckScreen } from './screens/MetaCheckScreen';
import { QuizScreen } from './screens/QuizScreen';
import { AuthScreen } from './screens/AuthScreen';
import { Chatbot } from './components/Chatbot';
import { useGraphData } from './hooks/useGraphData';
import { useFolderHierarchy } from './hooks/useFolderHierarchy';
import { useInputAnalysis } from './hooks/useInputAnalysis';
import { useQuizAndMeta } from './hooks/useQuizAndMeta';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('onboarding');

  // Authentication
  const { user, loading: authLoading, signIn, signUp, signOut, signInAnonymously } = useAuth();

  // Custom hooks for state management
  const {
    graphData,
    setGraphData,
    selectedNode,
    setSelectedNode,
    hiddenCategories,
    uniqueCategories,
    toggleCategoryVisibility,
    updateNodeStatus,
    addNodesAndLinks,
    isLoading: graphLoading,
    removeNode,
    removeCategory
  } = useGraphData(user?.id);

  const { folderData, toggleFolder, renameFolder } = useFolderHierarchy(graphData.nodes);

  const {
    inputText,
    setInputText,
    analysisResult,
    setAnalysisResult,
    editableConcepts,
    isSaved,
    setIsSaved,
    isSaveModalOpen,
    setIsSaveModalOpen,
    isLoading: inputLoading,
    handleAsk,
    handleInitialSave
  } = useInputAnalysis();

  const {
    quizData,
    userExplanation,
    setUserExplanation,
    metaResult,
    isLoading: quizMetaLoading,
    startQuiz,
    submitMetaCheck
  } = useQuizAndMeta();

  // Redirect to auth screen if not authenticated
  useEffect(() => {
    if (!authLoading && !user && screen !== 'auth') {
      setScreen('auth');
    }
  }, [authLoading, user, screen]);

  // Skip onboarding if user already has data
  useEffect(() => {
    if (user && !graphLoading && screen === 'onboarding' && graphData.nodes.length > 0) {
      setScreen('graph');
    }
  }, [user, graphLoading, graphData.nodes.length, screen]);

  // Execute Save with Selected Directory/Category
  const handleFinalSave = (targetCategory: string) => {
    if (!analysisResult) return;

    const newNodes: Node[] = editableConcepts.map((c, i) => ({
      id: `new_${Date.now()}_${i}`,
      label: c.label,
      status: c.status as any,
      val: 25,
      category: targetCategory,
      description: c.description
    }));

    const newLinks: Link[] = [];
    const sameCatNode = graphData.nodes.find(n => n.category === targetCategory);
    const targetId = sameCatNode ? sameCatNode.id : (graphData.nodes.length > 0 ? graphData.nodes[0].id : 'root');
    
    newNodes.forEach((n, i) => {
      newLinks.push({ source: targetId, target: n.id });
      if (i < newNodes.length - 1) {
        newLinks.push({ source: n.id, target: newNodes[i+1].id });
      }
    });

    addNodesAndLinks(newNodes, newLinks);
    
    setIsSaved(true);
    setIsSaveModalOpen(false);
  };

  // Save concept from chatbot to graph
  const handleSaveConceptToGraph = (concept: string) => {
    const newNode: Node = {
      id: `chatbot_${Date.now()}`,
      label: concept,
      status: 'new',
      val: 25,
      category: graphData.nodes.length > 0 ? graphData.nodes[0].category : '일반',
      description: `챗봇에서 추가된 개념: ${concept}`
    };

    // Link to the first node (root concept) if exists
    const newLinks: Link[] = [];
    if (graphData.nodes.length > 0) {
      newLinks.push({ source: graphData.nodes[0].id, target: newNode.id });
    }

    addNodesAndLinks([newNode], newLinks);

    // Switch to graph screen to show the new node
    setScreen('graph');
  };

  return (
    <>
      {screen === 'auth' && (
        <AuthScreen 
          onSignIn={async (email, password) => {
            try {
              const result = await signIn(email, password);
              if (result) {
                setScreen('onboarding');
                return { success: true };
              }
              return { success: false, error: '로그인에 실패했습니다.' };
            } catch (error: any) {
              console.error('Sign In Error:', error);
              return { success: false, error: error.message || '로그인 중 오류가 발생했습니다.' };
            }
          }}
          onSignUp={async (email, password) => {
            try {
              const result = await signUp(email, password);
              if (result) {
                setScreen('onboarding');
                return { success: true };
              }
              return { success: false, error: '회원가입에 실패했습니다.' };
            } catch (error: any) {
              return { success: false, error: error.message || '회원가입 중 오류가 발생했습니다.' };
            }
          }}
          onAnonymousSignIn={async () => {
            try {
              const result = await signInAnonymously();
              if (result) {
                setScreen('onboarding');
                return { success: true };
              }
              return { success: false, error: '익명 로그인에 실패했습니다.' };
            } catch (error: any) {
              return { success: false, error: error.message || '익명 로그인 중 오류가 발생했습니다.' };
            }
          }}
          loading={authLoading}
        />
      )}
      {screen === 'onboarding' && <HomeScreen setScreen={setScreen} />}
      {screen === 'onboardingFlow' && (
        <OnboardingFlow
          onComplete={(data: any) => {
            // Map onboarding data into initial graph nodes/links and navigate to graph
            const baseCategory = data?.usageType || '일반';
            const newNodes: Node[] = [];
            if (data?.usageType === 'work') {
              newNodes.push({ id: `onboard_${Date.now()}` , label: data.details?.jobField || '업무', status: 'new', val: 25, category: baseCategory, description: '온보딩 - 직무' });
            } else if (data?.usageType === 'personal') {
              const keywords: string[] = data.details?.keywords || [];
              if (keywords.length > 0) {
                keywords.forEach((k, i) => newNodes.push({ id: `onboard_${Date.now()}_${i}`, label: k, status: 'new', val: 20, category: baseCategory, description: '온보딩 - 관심사' }));
              } else {
                newNodes.push({ id: `onboard_${Date.now()}`, label: data.details?.interestText || '관심사', status: 'new', val: 25, category: baseCategory, description: '온보딩 - 관심사' });
              }
            } else if (data?.usageType === 'school') {
              const d = data.details || {};
              const label = d.major || d.subject || '학습';
              newNodes.push({ id: `onboard_${Date.now()}`, label, status: 'new', val: 25, category: baseCategory, description: '온보딩 - 학습' });
            } else {
              newNodes.push({ id: `onboard_${Date.now()}`, label: '사용자', status: 'new', val: 25, category: baseCategory });
            }

            const newLinks: Link[] = [];
            const targetId = graphData.nodes.length > 0 ? graphData.nodes[0].id : (newNodes.length > 0 ? newNodes[0].id : 'root');
            newNodes.forEach((n, i) => {
              if (n.id !== targetId) newLinks.push({ source: targetId, target: n.id });
              if (i < newNodes.length - 1) newLinks.push({ source: n.id, target: newNodes[i + 1].id });
            });

            addNodesAndLinks(newNodes, newLinks);
            setScreen('graph');
          }}
          onBack={() => setScreen('onboarding')}
        />
      )}
      
      {screen === 'input' && (
        <InputScreen 
          inputText={inputText}
          setInputText={setInputText}
          handleAsk={handleAsk}
          isLoading={inputLoading}
          analysisResult={analysisResult}
          setAnalysisResult={setAnalysisResult}
          editableConcepts={editableConcepts}
          isSaved={isSaved}
          setIsSaved={setIsSaved}
          setScreen={setScreen}
          handleInitialSave={handleInitialSave}
          isSaveModalOpen={isSaveModalOpen}
          setIsSaveModalOpen={setIsSaveModalOpen}
          handleFinalSave={handleFinalSave}
          uniqueCategories={uniqueCategories}
        />
      )}

      {screen === 'graph' && (
        <GraphScreen 
          screen={screen}
          setScreen={setScreen}
          folderData={folderData}
          toggleFolder={toggleFolder}
          setSelectedNode={setSelectedNode}
          renameFolder={renameFolder}
          selectedNode={selectedNode}
          toggleCategoryVisibility={toggleCategoryVisibility}
          hiddenCategories={hiddenCategories}
          graphData={graphData}
          startQuiz={() => startQuiz(selectedNode, setScreen)}
          removeNode={removeNode}
          removeCategory={removeCategory}
        />
      )}

      {screen === 'metacheck' && (
        <MetaCheckScreen 
          setScreen={setScreen}
          metaResult={metaResult}
          selectedNode={selectedNode}
          userExplanation={userExplanation}
          setUserExplanation={setUserExplanation}
          submitMetaCheck={() => submitMetaCheck(selectedNode, updateNodeStatus)}
          isLoading={quizMetaLoading}
        />
      )}

      {screen === 'quiz' && (
        <QuizScreen 
          setScreen={setScreen}
          quizData={quizData}
        />
      )}

      {/* Global Chatbot - visible from main page onwards */}
      {screen !== 'onboarding' && screen !== 'auth' && screen !== 'onboardingFlow' && <Chatbot onSaveToGraph={handleSaveConceptToGraph} isDisabled={selectedNode !== null} />}
    </>
  );
}