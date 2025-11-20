import React, { useState } from 'react';
import { ScreenState, GraphData, Node, FolderStructure } from '../utils/types';
import { ThreeGraph } from '../components/ThreeGraph';
import { BackButton } from '../components/BackButton';
import { GraphSidebar } from '../components/GraphSidebar';
import { NodeDetailPanel } from '../components/NodeDetailPanel';
import { NodePage } from '../components/NodePage';
import { X } from 'lucide-react';

interface GraphScreenProps {
  screen: ScreenState;
  setScreen: (screen: ScreenState) => void;
  folderData: FolderStructure[];
  toggleFolder: (id: string) => void;
  setSelectedNode: (node: Node | null) => void;
  renameFolder: (id: string, newName: string) => void;
  selectedNode: Node | null;
  toggleCategoryVisibility: (category: string) => void;
  hiddenCategories: string[];
  graphData: GraphData;
  startQuiz: () => void;
  removeNode: (nodeId: string) => void;
  removeCategory: (category: string) => void;
}

export const GraphScreen = ({ 
  screen, setScreen, folderData, toggleFolder, setSelectedNode, renameFolder, 
  selectedNode, toggleCategoryVisibility, hiddenCategories, graphData, startQuiz,
  removeNode, removeCategory
}: GraphScreenProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-[#020617] relative overflow-hidden flex">
      <BackButton screen={screen} setScreen={setScreen} />
      
      <GraphSidebar
        screen={screen}
        folderData={folderData}
        toggleFolder={toggleFolder}
        graphData={graphData}
        setSelectedNode={setSelectedNode}
        renameFolder={renameFolder}
        selectedNode={selectedNode}
        toggleCategoryVisibility={toggleCategoryVisibility}
        hiddenCategories={hiddenCategories}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        removeNode={removeNode}
        removeCategory={removeCategory}
      />

      {/* 3D Graph Area */}
      <div className="flex-1 relative">
        <ThreeGraph 
          data={graphData} 
          onNodeClick={(id) => {
            if (id) {
              const node = graphData.nodes.find(n => n.id === id);
              setSelectedNode(node || null);
            } else {
              setSelectedNode(null);
            }
          }}
          selectedNodeId={selectedNode?.id}
          hiddenCategories={hiddenCategories}
        />
      </div>

      {/* Node Page Overlay - Slides up from bottom like Notion */}
      {selectedNode && (
        <div 
          className={`absolute inset-0 z-20 flex transition-all duration-500 ease-out ${
            selectedNode ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
        >
          {/* Left sidebar spacer - responsive to sidebar collapse state */}
          <div className={`transition-all duration-500 ${isSidebarCollapsed ? 'w-12' : 'w-80'}`} />
          
          {/* Main content area with NodePage and NodeDetailPanel */}
          <div className="flex-1 flex bg-[#020617] shadow-2xl">
            {/* Close button */}
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-6 right-6 z-50 p-3 bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full border border-slate-700 shadow-lg transition-all duration-300 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Node Page - Takes most of the space */}
            <div className="flex-1 overflow-hidden">
              <NodePage node={selectedNode} />
            </div>

            {/* Right Detail Panel */}
            <NodeDetailPanel
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              setScreen={setScreen}
              graphData={graphData}
              startQuiz={startQuiz}
            />
          </div>
        </div>
      )}
    </div>
  );
};

