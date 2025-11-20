import React, { useState, useMemo, useEffect } from 'react';
import { 
  Brain, Search, ArrowLeft, Play, FileText,
  CheckCircle, HelpCircle, X, Loader2, Plus, 
  RefreshCw, Mic, Zap, BarChart2, Calendar, 
  ChevronRight, ChevronDown, Settings, Home, Network, MessageSquare, Folder, ExternalLink, Pen, Edit2, Eye, EyeOff, FolderPlus
} from 'lucide-react';
import { ThreeGraph } from './components/ThreeGraph';
import { analyzeConcept, generateQuiz, evaluateMetaCognition } from './services/geminiService';
import { INITIAL_NODES, INITIAL_LINKS } from './constants';
import { Node, Link, GraphData, ScreenState, AnalysisResult, QuizData, MetaResult, FolderStructure } from './types';

// Utility to clean markdown
const cleanMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
    .replace(/\*(.*?)\*/g, '$1')     // Italic
    .replace(/__(.*?)__/g, '$1')     // Underline
    .replace(/`/g, '')               // Code
    .replace(/#{1,6}\s/g, '');       // Headers
};

// --- Recursive Sidebar Folder Component ---
const FolderItem = ({ item, level, toggleFolder, onNodeClick, onRename, selectedNodeId, toggleCategoryVisibility, hiddenCategories }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  const handleRename = () => {
    onRename(item.id, editName);
    setIsEditing(false);
  };

  const isHidden = useMemo(() => {
     // If it's a category folder, check if its name is in hiddenCategories
     if (item.type === 'folder' && item.id.startsWith('sub_')) {
         return hiddenCategories.includes(item.name);
     }
     return false;
  }, [item, hiddenCategories]);

  if (item.type === 'file') {
    return (
      <button 
        onClick={() => onNodeClick(item.nodeId)}
        className={`w-full text-left py-1.5 rounded-md flex items-center gap-2 transition-all duration-300 hover:bg-slate-800/50 ${selectedNodeId === item.nodeId ? 'text-indigo-300 font-medium bg-indigo-900/20' : 'text-slate-400'}`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-500 ${selectedNodeId === item.nodeId ? 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-slate-600'}`} />
        <span className="truncate text-sm">{item.name}</span>
      </button>
    );
  }

  return (
    <div>
      <div 
        className="group flex items-center justify-between pr-2 hover:bg-slate-800/30 rounded-lg cursor-pointer transition-colors duration-200"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        <div className="flex items-center gap-2 py-2 flex-1 overflow-hidden" onClick={() => toggleFolder(item.id)}>
          {item.isOpen ? <ChevronDown className="w-3 h-3 text-slate-500" /> : <ChevronRight className="w-3 h-3 text-slate-500" />}
          <Folder className={`w-3.5 h-3.5 transition-colors duration-300 ${item.isOpen ? 'text-indigo-400' : 'text-slate-600'}`} />
          {isEditing ? (
            <input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="bg-black/50 text-white text-sm px-1 rounded border border-indigo-500 w-full"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={`text-sm font-bold truncate transition-colors duration-300 ${item.isOpen ? 'text-slate-200' : 'text-slate-500'}`}>{item.name}</span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Show Filter Toggle only for Category Folders (2nd level, id starts with sub_) */}
            {item.id.startsWith('sub_') && (
                <button 
                    onClick={(e) => { e.stopPropagation(); toggleCategoryVisibility(item.name); }}
                    className={`p-1 transition-colors hover:text-white ${isHidden ? 'text-slate-600' : 'text-indigo-400'}`}
                    title={isHidden ? "Show Category" : "Hide Category"}
                >
                    {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
            )}
            <button 
            onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
            className="p-1 hover:text-indigo-400 text-slate-600 transition-colors"
            >
            <Edit2 className="w-3 h-3" />
            </button>
        </div>
      </div>
      
      {item.isOpen && item.children && (
        <div className="border-l border-slate-800 ml-4 animate-subtle-fade">
          {item.children.map((child: any) => (
            <FolderItem 
              key={child.id} 
              item={child} 
              level={level + 1} 
              toggleFolder={toggleFolder} 
              onNodeClick={onNodeClick}
              onRename={onRename}
              selectedNodeId={selectedNodeId}
              toggleCategoryVisibility={toggleCategoryVisibility}
              hiddenCategories={hiddenCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Directory Selection Modal ---
const SaveLocationModal = ({ isOpen, onClose, onConfirm, existingCategories }: { isOpen: boolean, onClose: () => void, onConfirm: (category: string) => void, existingCategories: string[] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (isCreatingNew && newCategoryName.trim()) {
      onConfirm(newCategoryName.trim());
    } else if (selectedCategory) {
      onConfirm(selectedCategory);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-subtle-fade">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-smooth-appear">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Folder className="w-5 h-5 text-indigo-400" /> 저장 위치 선택
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto custom-scrollbar pr-2">
           <div className="text-xs font-bold text-slate-500 uppercase mb-2 px-1">기존 폴더 (Categories)</div>
           {existingCategories.map(cat => (
             <button 
               key={cat}
               onClick={() => { setSelectedCategory(cat); setIsCreatingNew(false); }}
               className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between border transition-all duration-300 ${selectedCategory === cat && !isCreatingNew ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-750'}`}
             >
               <span className="flex items-center gap-3 font-medium">
                 <Folder className={`w-4 h-4 ${selectedCategory === cat && !isCreatingNew ? 'text-white' : 'text-slate-500'}`} />
                 {cat}
               </span>
               {selectedCategory === cat && !isCreatingNew && <CheckCircle className="w-4 h-4" />}
             </button>
           ))}
        </div>

        <div className="mb-6">
           <button 
             onClick={() => { setIsCreatingNew(true); setSelectedCategory(null); }}
             className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 border transition-all duration-300 ${isCreatingNew ? 'bg-emerald-900/30 border-emerald-500' : 'bg-transparent border-dashed border-slate-600 text-slate-500 hover:text-emerald-400 hover:border-emerald-400'}`}
           >
              <FolderPlus className="w-5 h-5" />
              <span className="font-medium">새 폴더 생성하기</span>
           </button>
           
           {isCreatingNew && (
             <div className="mt-3 pl-2 animate-smooth-slide-up">
               <input 
                 type="text" 
                 placeholder="새로운 카테고리/폴더 이름 입력..." 
                 value={newCategoryName}
                 onChange={(e) => setNewCategoryName(e.target.value)}
                 className="w-full bg-black/40 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                 autoFocus
               />
             </div>
           )}
        </div>

        <button 
          onClick={handleConfirm}
          disabled={(!selectedCategory && !isCreatingNew) || (isCreatingNew && !newCategoryName.trim())}
          className="w-full py-4 bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 hover:shadow-indigo-500/30"
        >
          <CheckCircle className="w-4 h-4" /> 선택한 위치에 저장하기
        </button>
      </div>
    </div>
  );
};


export default function App() {
  const [screen, setScreen] = useState<ScreenState>('onboarding');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: INITIAL_NODES as any, links: INITIAL_LINKS });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Input / Q&A Logic
  const [inputText, setInputText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [editableConcepts, setEditableConcepts] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false); 

  // Save Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Quiz & Meta
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userExplanation, setUserExplanation] = useState('');
  const [metaResult, setMetaResult] = useState<MetaResult | null>(null);

  // Sidebar Logic (Hierarchical & Filtering)
  const [folderData, setFolderData] = useState<FolderStructure[]>([]);
  const [hiddenCategories, setHiddenCategories] = useState<string[]>([]);

  // Unique categories for selection
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(graphData.nodes.map(n => n.category))).sort();
  }, [graphData.nodes]);

  // --- Logic to build academic hierarchy from nodes ---
  useEffect(() => {
    const buildTree = () => {
      const tree: FolderStructure[] = [
        { id: 'root_cs', name: 'Computer Science', type: 'folder', isOpen: true, children: [] },
        { id: 'root_math', name: 'Mathematics', type: 'folder', isOpen: false, children: [] },
        { id: 'root_other', name: 'General Knowledge', type: 'folder', isOpen: true, children: [] }
      ];

      const getParentFolder = (cat: string) => {
        const lower = cat.toLowerCase();
        if (['core', 'architecture', 'infrastructure', 'skill', 'training', 'ai', 'data'].some(k => lower.includes(k))) return tree[0]; // CS
        if (['math', 'concept', 'theory'].some(k => lower.includes(k))) return tree[1]; // Math
        return tree[2];
      };

      graphData.nodes.forEach(node => {
        const root = getParentFolder(node.category);
        
        // 2nd Level: Use Category as Subfolder
        let subFolder = root.children?.find(c => c.name === node.category);
        if (!subFolder) {
          subFolder = { 
            id: `sub_${node.category}`, 
            name: node.category, 
            type: 'folder', 
            isOpen: false, 
            children: [] 
          };
          root.children?.push(subFolder);
        }

        // 3rd Level: The Node itself
        subFolder.children?.push({
          id: `file_${node.id}`,
          name: node.label,
          type: 'file',
          nodeId: node.id
        });
      });

      return tree;
    };

    setFolderData(buildTree());
  }, [graphData.nodes]);

  // --- Handlers ---

  const handleAsk = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setIsSaved(false); 
    const result = await analyzeConcept(inputText);
    setIsLoading(false);
    if (result) {
      setAnalysisResult(result);
      // Initialize editable concepts state
      setEditableConcepts(result.concepts.map(c => ({...c})));
    }
  };

  const handleCategoryEdit = (index: number, newCategory: string) => {
    const updated = [...editableConcepts];
    updated[index].category = newCategory;
    setEditableConcepts(updated);
  };

  // Open Save Modal
  const handleInitialSave = () => {
    if (!analysisResult || isSaved) return;
    setIsSaveModalOpen(true);
  };

  // Execute Save with Selected Directory/Category
  const handleFinalSave = (targetCategory: string) => {
    if (!analysisResult) return;

    const newNodes: Node[] = editableConcepts.map((c, i) => ({
      id: `new_${Date.now()}_${i}`,
      label: c.label,
      status: c.status as any,
      val: 25,
      category: targetCategory, // Overwrite with user selected folder/category
      description: c.description
    }));

    const newLinks: Link[] = [];
    // Find a node to link to in the same category, or root if none
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

  // Sidebar Folder Actions
  const toggleFolder = (id: string) => {
    const toggleRecursive = (items: FolderStructure[]): FolderStructure[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, isOpen: !item.isOpen };
        if (item.children) return { ...item, children: toggleRecursive(item.children) };
        return item;
      });
    };
    setFolderData(prev => toggleRecursive(prev));
  };

  const renameFolder = (id: string, newName: string) => {
    const renameRecursive = (items: FolderStructure[]): FolderStructure[] => {
      return items.map(item => {
        if (item.id === id) return { ...item, name: newName };
        if (item.children) return { ...item, children: renameRecursive(item.children) };
        return item;
      });
    };
    setFolderData(prev => renameRecursive(prev));
  };

  const toggleCategoryVisibility = (categoryName: string) => {
    setHiddenCategories(prev => {
        if (prev.includes(categoryName)) {
            return prev.filter(c => c !== categoryName);
        } else {
            return [...prev, categoryName];
        }
    });
  };

  const startQuiz = async () => {
    if (!selectedNode) return;
    setIsLoading(true);
    const quiz = await generateQuiz(selectedNode.label);
    setIsLoading(false);
    if (quiz) {
      setQuizData(quiz);
      setScreen('quiz');
    }
  };

  const submitMetaCheck = async () => {
    if (!selectedNode) return;
    setIsLoading(true);
    const result = await evaluateMetaCognition(selectedNode.label, userExplanation);
    setIsLoading(false);
    if (result) {
      setMetaResult(result);
      setGraphData(prev => ({
        nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, status: result.status } : n),
        links: prev.links
      }));
    }
  };

  // --- Components ---
  const BackButton = () => (
    <button 
      onClick={() => setScreen(screen === 'graph' ? 'onboarding' : 'graph')}
      className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-full backdrop-blur-md border border-slate-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10"
    >
      {screen === 'graph' ? <Home className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
      <span className="text-sm font-bold">{screen === 'graph' ? '홈으로' : '뒤로가기'}</span>
    </button>
  );

  // --- Render Functions ---

  const renderHome = () => (
    <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.08),transparent_70%)] animate-subtle-fade" />
      
      <div className="z-10 flex flex-col items-center text-center p-6 animate-subtle-fade">
        <div className="mb-10 relative group">
          <div className="w-28 h-28 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/40 shadow-[0_0_60px_rgba(99,102,241,0.2)] transition-all duration-700 group-hover:shadow-[0_0_80px_rgba(99,102,241,0.4)]">
             <Network className="w-12 h-12 text-indigo-300 group-hover:scale-105 transition-transform duration-500" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-2xl animate-smooth-slide-up" style={{animationDelay: '0.1s'}}>
          Second Brain <span className="text-indigo-500">OS</span>
        </h1>
        <p className="text-slate-400 text-lg mb-12 max-w-lg leading-relaxed animate-smooth-slide-up" style={{animationDelay: '0.2s'}}>
          당신의 지식을 3차원 우주로 시각화하세요.<br/>
          질문하고, 탐험하고, 연결하면 기억은 영원해집니다.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-smooth-slide-up" style={{animationDelay: '0.3s'}}>
          <button 
            onClick={() => setScreen('graph')}
            className="flex-1 py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-[0_0_30px_rgba(79,70,229,0.2)] hover:shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:scale-105 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> 뇌 탐험하기
          </button>
          <button 
            onClick={() => setScreen('input')}
            className="flex-1 py-4 px-6 bg-slate-800/80 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg border border-slate-700 backdrop-blur transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover:border-slate-500"
          >
            <MessageSquare className="w-5 h-5 text-emerald-400" /> 질문 & 추가
          </button>
        </div>
      </div>
    </div>
  );

  const renderInput = () => (
    <div className="h-screen bg-[#020617] flex flex-col p-6 pt-20 items-center overflow-y-auto">
      <BackButton />
      
      <div className="w-full max-w-3xl space-y-6 pb-20">
        {/* Chat Input Area */}
        <div className="flex justify-end animate-smooth-slide-up">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tr-sm p-6 max-w-xl shadow-xl w-full">
             <h3 className="text-emerald-400 font-bold text-sm mb-3 flex items-center gap-2">
               <HelpCircle className="w-4 h-4" /> 무엇이 궁금한가요?
             </h3>
             {!analysisResult ? (
               <div className="space-y-4">
                 <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="예: RAG(검색증강생성)가 무엇이고 왜 중요한지 알려줘"
                    className="w-full h-32 bg-black/30 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none text-lg transition-colors"
                  />
                  <button 
                    onClick={handleAsk}
                    disabled={isLoading || !inputText}
                    className="w-full py-3 bg-white text-slate-900 hover:bg-slate-200 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    {isLoading ? "AI가 지식 구조를 분석 중..." : "질문하기"}
                  </button>
               </div>
             ) : (
               <p className="text-white text-lg font-medium">{inputText}</p>
             )}
          </div>
        </div>

        {/* AI Response */}
        {analysisResult && (
          <div className="flex justify-start animate-smooth-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 rounded-2xl rounded-tl-sm p-6 max-w-2xl shadow-2xl w-full">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                 <Brain className="w-5 h-5" /> AI 답변
              </div>
              
              <div className="prose prose-invert mb-6">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {cleanMarkdown(analysisResult.answer)}
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-5 border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">추출된 지식 개념 (임시 분류)</h4>
                <div className="flex flex-wrap gap-2">
                  {editableConcepts.map((c, i) => (
                    <span key={i} className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20 font-medium animate-smooth-appear" style={{animationDelay: `${i * 0.05}s`}}>
                       {c.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3 flex-wrap md:flex-nowrap">
                 <button onClick={() => { setAnalysisResult(null); setIsSaved(false); setInputText(''); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors duration-300">
                   새로운 질문
                 </button>
                 
                 {isSaved ? (
                   <button 
                    onClick={() => setScreen('graph')} 
                    className="flex-[1.5] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2 animate-smooth-appear"
                   >
                     <Play className="w-4 h-4 fill-current" /> 그래프 보러가기
                   </button>
                 ) : (
                   <button 
                    onClick={handleInitialSave} 
                    className="flex-[1.5] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
                   >
                     <Plus className="w-4 h-4" /> 내 뇌(그래프)에 저장
                   </button>
                 )}
              </div>
            </div>
          </div>
        )}
        
        {/* Follow up input */}
        {analysisResult && (
           <div className="mt-4 animate-smooth-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex gap-3 items-center">
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="위 태그를 클릭하거나 추가 질문을 입력하세요..."
                    className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none px-2"
                  />
                  <button 
                    onClick={handleAsk} 
                    disabled={isLoading || !inputText}
                    className={`p-3 rounded-lg text-white transition-colors duration-300 ${isLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  </button>
              </div>
           </div>
        )}
      </div>
      <SaveLocationModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        onConfirm={handleFinalSave}
        existingCategories={uniqueCategories}
      />
    </div>
  );

  const renderGraph = () => (
    <div className="h-screen bg-[#020617] relative overflow-hidden flex">
      <BackButton />
      
      {/* Sidebar with Folders */}
      <div className={`absolute left-0 top-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 z-10 shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out ${screen === 'graph' ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 pt-20 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" /> 지식 보관함
          </h2>
          <div className="mt-4 relative group">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500 group-focus-within:text-white transition-colors duration-300" />
            <input type="text" placeholder="개념 검색..." className="w-full bg-slate-800/50 text-sm text-white rounded-lg pl-10 pr-4 py-2.5 border border-slate-700 focus:border-indigo-500 outline-none transition-all duration-300" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           {folderData.map(item => (
             <FolderItem 
               key={item.id} 
               item={item} 
               level={0} 
               toggleFolder={toggleFolder} 
               onNodeClick={(id: string) => setSelectedNode(graphData.nodes.find(n => n.id === id) || null)}
               onRename={renameFolder}
               selectedNodeId={selectedNode?.id}
               toggleCategoryVisibility={toggleCategoryVisibility}
               hiddenCategories={hiddenCategories}
             />
           ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
           <div className="flex justify-between text-xs text-slate-500 font-bold mb-2">
             <span>MEMORY STATUS</span>
             <span>82%</span>
           </div>
           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
             <div className="bg-indigo-500 h-full w-[82%] rounded-full" />
           </div>
        </div>
      </div>

      {/* 3D Graph Area */}
      <div className={`flex-1 relative transition-all duration-500 ease-in-out ${selectedNode ? 'pr-96' : ''}`}>
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
         
         {/* Add Button */}
         <button 
            onClick={() => setScreen('input')}
            className="absolute bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/60 z-20"
         >
           <Plus className="w-6 h-6" />
         </button>
      </div>

      {/* Right Detail Panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 h-full w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 z-20 shadow-2xl flex flex-col p-6 pt-20 animate-smooth-slide-left overflow-y-auto">
           <div className="flex justify-between items-start mb-6">
             <div>
               <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 border border-indigo-500/30 px-2 py-1 rounded uppercase tracking-wider">
                 {selectedNode.category}
               </span>
               <h2 className="text-2xl font-bold text-white mt-3">{selectedNode.label}</h2>
             </div>
             <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
           </div>

           <div className="space-y-3 mb-8">
             <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedNode.description || "설명이 없습니다."}
                </p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               <button 
                onClick={() => setScreen('metacheck')}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:border-slate-500"
               >
                 <Mic className="w-4 h-4 text-emerald-400" /> 
                 <span>말하기 (메타인지)</span>
               </button>
               <button 
                onClick={startQuiz}
                className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-sm border border-slate-700 transition-all duration-300 flex flex-col items-center justify-center gap-2 hover:border-slate-500"
               >
                 <HelpCircle className="w-4 h-4 text-amber-400" /> 
                 <span>퀴즈 풀기</span>
               </button>
             </div>
           </div>

           <div className="border-t border-slate-800 pt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Connections</h4>
              <div className="space-y-2">
                {graphData.links
                  .filter(l => l.source === selectedNode.id || l.target === selectedNode.id)
                  .map((l, i) => {
                     const targetId = l.source === selectedNode.id ? l.target : l.source;
                     const targetNode = graphData.nodes.find(n => n.id === targetId);
                     return targetNode ? (
                       <button 
                         key={i} 
                         onClick={() => setSelectedNode(targetNode)}
                         className="w-full text-left p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800 border border-slate-800 hover:border-slate-600 transition-all duration-300 flex items-center justify-between group"
                       >
                         <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{targetNode.label}</span>
                         <ArrowLeft className="w-3 h-3 rotate-180 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                       </button>
                     ) : null;
                  })
                }
              </div>
           </div>
        </div>
      )}
    </div>
  );
  
  // --- Metacognition Screen ---
  const renderMetaCheck = () => (
    <div className="h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)] animate-subtle-fade" />
      
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl p-8 relative z-10 animate-smooth-appear">
         <button onClick={() => setScreen('graph')} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
         
         {!metaResult ? (
           <>
             <div className="mb-6">
               <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Metacognition Check</span>
               <h2 className="text-3xl font-bold text-white mt-2">설명할 수 있어야<br/>진짜 아는 것입니다.</h2>
             </div>
             
             <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-6">
               <p className="text-indigo-200 text-sm font-medium">
                 Target Concept: <span className="text-white font-bold underline decoration-indigo-500 underline-offset-4">{selectedNode?.label}</span>
               </p>
             </div>

             <textarea 
               value={userExplanation}
               onChange={(e) => setUserExplanation(e.target.value)}
               placeholder="이 개념을 5살 아이에게 설명한다고 생각하고 적어보세요. 솔직하게 모르면 '모름'이라고 적으세요."
               className="w-full h-48 bg-black/40 border border-slate-600 rounded-xl p-5 text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none mb-6 text-lg leading-relaxed transition-colors"
             />
             
             <button 
               onClick={submitMetaCheck} 
               disabled={isLoading || !userExplanation}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/40"
             >
               {isLoading ? <Loader2 className="animate-spin" /> : <Brain className="w-5 h-5" />}
               {isLoading ? "AI 선생님이 채점 중..." : "평가 받기"}
             </button>
           </>
         ) : (
           <div className="animate-smooth-appear">
              <div className="text-center mb-8">
                 <div className="relative inline-block">
                   <svg className="w-32 h-32 transform -rotate-90">
                     <circle cx="64" cy="64" r="60" fill="transparent" stroke="#1e293b" strokeWidth="8" />
                     <circle cx="64" cy="64" r="60" fill="transparent" stroke={metaResult.score > 80 ? '#10b981' : metaResult.score > 50 ? '#f59e0b' : '#f43f5e'} strokeWidth="8" strokeDasharray={377} strokeDashoffset={377 - (377 * metaResult.score) / 100} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-black text-white">{metaResult.score}</span>
                     <span className="text-xs text-slate-400 uppercase">Score</span>
                   </div>
                 </div>
                 <div className="mt-4">
                   <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${metaResult.status === 'known' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : metaResult.status === 'fuzzy' ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' : 'bg-rose-900/50 text-rose-400 border border-rose-500/30'}`}>
                     Status: {metaResult.status}
                   </span>
                 </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
                   <h4 className="text-slate-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Brain className="w-4 h-4"/> Feedback</h4>
                   <p className="text-slate-200 leading-relaxed text-sm">{cleanMarkdown(metaResult.feedback)}</p>
                </div>
                <div className="bg-indigo-900/20 p-5 rounded-2xl border border-indigo-500/20">
                   <h4 className="text-indigo-400 text-xs font-bold uppercase mb-2 flex items-center gap-2"><Zap className="w-4 h-4"/> Next Step</h4>
                   <p className="text-indigo-100 text-sm">{cleanMarkdown(metaResult.nextStep)}</p>
                </div>
              </div>

              <button onClick={() => setScreen('graph')} className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors duration-300">
                그래프에 반영하고 돌아가기
              </button>
           </div>
         )}
      </div>
    </div>
  );
  
  const renderQuiz = () => (
    <div className="h-screen bg-indigo-600 flex items-center justify-center p-4 relative overflow-hidden">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white,transparent_80%)] opacity-10 animate-subtle-fade" />
       
       <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative animate-smooth-appear text-slate-900">
         <button onClick={() => setScreen('graph')} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5"/></button>
         
         <div className="mb-6">
           <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pop Quiz</span>
         </div>
         
         <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
           {cleanMarkdown(quizData?.question || "")}
         </h2>

         <div className="space-y-3">
           {quizData?.options.map((opt, idx) => (
             <button 
               key={idx}
               onClick={() => {
                 if (idx === quizData.answer) {
                   alert(`정답입니다! \n\n${cleanMarkdown(quizData.feedback)}`);
                   setScreen('graph');
                 } else {
                   alert("오답입니다. 다시 생각해보세요.");
                 }
               }}
               className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-slate-700 font-medium transition-all duration-300 group"
             >
               <span className="mr-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-500 text-xs font-bold group-hover:bg-indigo-200 group-hover:text-indigo-700 transition-colors">{idx + 1}</span> 
               {cleanMarkdown(opt)}
             </button>
           ))}
         </div>
       </div>
    </div>
  );

  // --- Main Switch ---
  switch (screen) {
    case 'onboarding': return renderHome();
    case 'input': return renderInput();
    case 'graph': return renderGraph();
    case 'metacheck': return renderMetaCheck();
    case 'quiz': return renderQuiz();
    default: return renderHome();
  }
}