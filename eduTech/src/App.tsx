import React, { useState } from 'react';
import { ScreenState, Node, Link } from './utils/types';
import { HomeScreen } from './screens/HomeScreen';
import { InputScreen } from './screens/InputScreen';
import { GraphScreen } from './screens/GraphScreen';
import { MetaCheckScreen } from './screens/MetaCheckScreen';
import { QuizScreen } from './screens/QuizScreen';
import { Chatbot } from './components/Chatbot';
import { useGraphData } from './hooks/useGraphData';
import { useFolderHierarchy } from './hooks/useFolderHierarchy';
import { useInputAnalysis } from './hooks/useInputAnalysis';
import { useQuizAndMeta } from './hooks/useQuizAndMeta';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('onboarding');

  // Custom hooks for state management
  const {
    graphData,
    setGraphData,
    selectedNode,
    setSelectedNode,
    hiddenCategories,
    uniqueCategories,
    toggleCategoryVisibility,
    updateNodeStatus
  } = useGraphData();

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

    setGraphData(prev => ({
      nodes: [...prev.nodes, ...newNodes],
      links: [...prev.links, ...newLinks]
    }));
    
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

    setGraphData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, ...newLinks]
    }));

    // Switch to graph screen to show the new node
    setScreen('graph');
  };

  return (
    <>
      {screen === 'onboarding' && <HomeScreen setScreen={setScreen} />}
      
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
      {screen !== 'onboarding' && <Chatbot onSaveToGraph={handleSaveConceptToGraph} isDisabled={selectedNode !== null} />}
    </>
  );
}