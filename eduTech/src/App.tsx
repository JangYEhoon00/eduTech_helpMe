import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { Node, Link } from './utils/types';
import { generateUUID } from './utils/uuid';
import { HomeScreen } from './screens/HomeScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { InputScreen } from './screens/InputScreen';
import { GraphScreen } from './screens/GraphScreen';
import { MetaCheckScreen } from './screens/MetaCheckScreen';
import { QuizScreen } from './screens/QuizScreen';
import { AuthScreen } from './screens/AuthScreen';
import { NodePage } from './components/NodePage';
import { NodeChatbot } from './components/NodeChatbot';
import { useGraphData } from './hooks/useGraphData';
import { useFolderHierarchy } from './hooks/useFolderHierarchy';
import { useInputAnalysis } from './hooks/useInputAnalysis';
import { useQuizAndMeta } from './hooks/useQuizAndMeta';
import { useAuth } from './hooks/useAuth';
import { clearAllData } from './services/supabaseService';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Handle authentication and initial routing - SIMPLIFIED
  useEffect(() => {
    if (authLoading) return;

    // Not logged in - redirect to auth
    if (!user && location.pathname !== '/auth') {
      navigate('/auth', { replace: true });
      return;
    }

    // Logged in but on auth page - redirect away
    if (user && location.pathname === '/auth') {
      if (graphLoading) return; // Wait for data to load
      
      if (graphData.nodes.length > 0) {
        navigate('/graph', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [authLoading, user, location.pathname, graphLoading, graphData.nodes.length, navigate]);

  // Execute Save with Selected Directory/Category
  const handleFinalSave = (targetCategory: string) => {
    if (!analysisResult) return;

    const newNodes: Node[] = editableConcepts.map((c, i) => ({
      id: generateUUID(),
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
      id: generateUUID(),
      label: concept,
      status: 'new',
      val: 25,
      category: graphData.nodes.length > 0 ? graphData.nodes[0].category : '일반',
      description: `챗봇에서 추가된 개념: ${concept}`
    };

    const newLinks: Link[] = [];
    if (graphData.nodes.length > 0) {
      newLinks.push({ source: graphData.nodes[0].id, target: newNode.id });
    }

    addNodesAndLinks([newNode], newLinks);

    navigate('/graph');
  };

  // Clear all data
  const handleClearAllData = async () => {
    try {
      await clearAllData();
      setGraphData({ nodes: [], links: [] });
      setSelectedNode(null);
      console.log('모든 데이터가 삭제되었습니다.');
    } catch (error) {
      console.error('데이터 삭제 실패:', error);
      alert('데이터 삭제에 실패했습니다.');
    }
  };

  // Show loading screen while auth is loading
  if (authLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* Auth Route */}
        <Route path="/auth" element={
          <AuthScreen 
            onSignIn={async (email, password) => {
              try {
                const result = await signIn(email, password);
                if (result) {
                  // Don't navigate here - let useEffect handle it
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
                  // New users go to onboarding
                  navigate('/onboarding');
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
                  // Don't navigate here - let useEffect handle it
                  return { success: true };
                }
                return { success: false, error: '익명 로그인에 실패했습니다.' };
              } catch (error: any) {
                return { success: false, error: error.message || '익명 로그인 중 오류가 발생했습니다.' };
              }
            }}
            loading={authLoading}
          />
        } />

        {/* Onboarding Route */}
        <Route path="/onboarding" element={
          !user ? <Navigate to="/auth" replace /> : (
            <OnboardingFlow
              onComplete={(data: any) => {
                const baseCategory = data?.usageType || '일반';
                const newNodes: Node[] = [];
                if (data?.usageType === 'work') {
                  newNodes.push({ id: generateUUID(), label: data.details?.jobField || '업무', status: 'new', val: 25, category: baseCategory, description: '온보딩 - 직무' });
                } else if (data?.usageType === 'personal') {
                  const keywords: string[] = data.details?.keywords || [];
                  if (keywords.length > 0) {
                    keywords.forEach((k, i) => newNodes.push({ id: generateUUID(), label: k, status: 'new', val: 20, category: baseCategory, description: '온보딩 - 관심사' }));
                  } else {
                    newNodes.push({ id: generateUUID(), label: data.details?.interestText || '관심사', status: 'new', val: 25, category: baseCategory, description: '온보딩 - 관심사' });
                  }
                } else if (data?.usageType === 'school') {
                  const d = data.details || {};
                  const label = d.major || d.subject || '학습';
                  newNodes.push({ id: generateUUID(), label, status: 'new', val: 25, category: baseCategory, description: '온보딩 - 학습' });
                } else {
                  newNodes.push({ id: generateUUID(), label: '사용자', status: 'new', val: 25, category: baseCategory });
                }

                const newLinks: Link[] = [];
                const targetId = graphData.nodes.length > 0 ? graphData.nodes[0].id : (newNodes.length > 0 ? newNodes[0].id : 'root');
                newNodes.forEach((n, i) => {
                  if (n.id !== targetId) newLinks.push({ source: targetId, target: n.id });
                  if (i < newNodes.length - 1) newLinks.push({ source: n.id, target: newNodes[i + 1].id });
                });

                addNodesAndLinks(newNodes, newLinks);
                navigate('/graph');
              }}
              onBack={() => {
                navigate('/auth');
              }}
            />
          )
        } />
        
        {/* Input Route */}
        <Route path="/input" element={
          !user ? <Navigate to="/auth" replace /> : (
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
              setScreen={() => {}} // Not used anymore
              handleInitialSave={handleInitialSave}
              isSaveModalOpen={isSaveModalOpen}
              setIsSaveModalOpen={setIsSaveModalOpen}
              handleFinalSave={handleFinalSave}
              uniqueCategories={uniqueCategories}
            />
          )
        } />

        {/* Graph Route */}
        <Route path="/graph" element={
          !user ? <Navigate to="/auth" replace /> : (
            <GraphScreen 
              screen="graph"
              setScreen={() => {}} // Not used anymore
              folderData={folderData}
              toggleFolder={toggleFolder}
              setSelectedNode={(node) => {
                setSelectedNode(node);
                if (node) {
                  navigate(`/node/${encodeURIComponent(node.label)}`);
                }
              }}
              renameFolder={renameFolder}
              selectedNode={selectedNode}
              toggleCategoryVisibility={toggleCategoryVisibility}
              hiddenCategories={hiddenCategories}
              graphData={graphData}
              startQuiz={() => startQuiz(selectedNode, () => navigate('/quiz'))}
              removeNode={removeNode}
              removeCategory={removeCategory}
              addNodesAndLinks={addNodesAndLinks}
              onSignOut={async () => {
                await signOut();
                navigate('/auth');
              }}
              onClearAllData={handleClearAllData}
            />
          )
        } />

        {/* Node Page Route */}
        <Route path="/node/:nodeName" element={
          !user ? <Navigate to="/auth" replace /> : (
            <NodePageRoute 
              graphData={graphData}
              addNodesAndLinks={addNodesAndLinks}
              setSelectedNode={setSelectedNode}
            />
          )
        } />

        {/* MetaCheck Route */}
        <Route path="/metacheck" element={
          !user ? <Navigate to="/auth" replace /> : (
            <MetaCheckScreen 
              setScreen={() => {}} // Not used anymore
              metaResult={metaResult}
              selectedNode={selectedNode}
              userExplanation={userExplanation}
              setUserExplanation={setUserExplanation}
              submitMetaCheck={() => submitMetaCheck(selectedNode, updateNodeStatus)}
              isLoading={quizMetaLoading}
            />
          )
        } />

        {/* Quiz Route */}
        <Route path="/quiz" element={
          !user ? <Navigate to="/auth" replace /> : (
            <QuizScreen 
              setScreen={() => {}} // Not used anymore
              quizData={quizData}
            />
          )
        } />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
}

// Separate component for node page route
function NodePageRoute({ graphData, addNodesAndLinks, setSelectedNode }: { graphData: any; addNodesAndLinks: any; setSelectedNode: any }) {
  const { nodeName } = useParams<{ nodeName: string }>();
  const navigate = useNavigate();
  const node = graphData.nodes.find((n: Node) => n.label === decodeURIComponent(nodeName || ''));

  // Set selected node when component mounts
  useEffect(() => {
    if (node) {
      setSelectedNode(node);
    }
  }, [node, setSelectedNode]);

  if (!node) {
    return (
      <div className="h-screen w-full bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">노드를 찾을 수 없습니다</h1>
          <button
            onClick={() => navigate('/graph')}
            className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl font-bold transition-colors"
          >
            그래프로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleSaveSubconcept = (subconcept: string) => {
    const newNode: Node = {
      id: generateUUID(),
      label: subconcept,
      status: 'new',
      val: 20,
      category: node.category,
      description: `"${node.label}"의 하위 개념`
    };

    const newLinks: Link[] = [{ source: node.id, target: newNode.id }];
    addNodesAndLinks([newNode], newLinks);
    
    // Show success toast
    toast.success(`"${subconcept}" 하위개념이 추가되었습니다! 🎉`, {
      style: {
        background: '#1e293b',
        color: '#fff',
        border: '1px solid #10b981',
      },
    });
  };

  return (
    <div className="h-screen w-full flex">
      {/* Back button */}
      <button
        onClick={() => navigate('/graph')}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm border border-slate-700 transition-colors"
      >
        ← 그래프로 돌아가기
      </button>

      {/* Node Page - Left Side */}
      <div className="flex-1 overflow-hidden">
        <NodePage node={node} />
      </div>

      {/* Node Chatbot - Right Side */}
      <div className="w-[400px] border-l border-slate-800">
        <NodeChatbot node={node} onSaveSubconcept={handleSaveSubconcept} />
      </div>
    </div>
  );
}

export default function App() {
  return <AppContent />;
}