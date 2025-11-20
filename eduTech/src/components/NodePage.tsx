import React, { useState, useRef, useEffect } from 'react';
import { Node } from '../utils/types';
import { Edit3, Mic, BookOpen, Clock, Hash, Save, Type } from 'lucide-react';
import {NODE_PLACEHOLDER} from '../utils/constants';

interface NodePageProps {
  node: Node;
}

export const NodePage = ({ node }: NodePageProps) => {
  const [title, setTitle] = useState(node.label);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleSave = () => {
    setLastSaved(new Date());
    setIsEditing(false); // 저장 후 편집 모드 해제
    // TODO: Save to backend/localStorage
    console.log('Saving content:', { title, content });
  };

  const formatLastSaved = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <div className="h-full w-full bg-[#020617] text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-6 py-8 pt-20">
        {/* Header Section */}
        <header className="mb-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-3 h-3" />
              {node.category}
            </span>
            <span className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Clock className="w-3 h-3" />
              Last saved {formatLastSaved()}
            </span>
          </div>

          {/* Editable Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isEditing}
            className={`text-6xl font-black text-white mb-8 tracking-tight leading-tight bg-transparent border-none outline-none w-full transition-colors ${
              isEditing ? 'focus:text-indigo-400 cursor-text' : 'cursor-default'
            }`}
            placeholder="Untitled"
          />

          <div className="flex flex-wrap gap-4 mb-8">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                isEditing 
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600' 
                  : 'bg-white text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'Editing' : 'Start Writing'}
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400" />
              Voice Note
            </button>
          </div>

          <p className="text-xl text-slate-400 leading-relaxed max-w-3xl font-light border-l-4 border-indigo-500/30 pl-6">
            {node.description || "Start writing your notes below. This is your personal knowledge space."}
          </p>
        </header>

        {/* Main Editor Area */}
        <div className="w-full">
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden min-h-[600px] relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/30 pointer-events-none" />
            
            <div className="p-8 relative z-10">
              <div className="flex items-center justify-between mb-8 text-slate-500 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">Content</span>
                </div>
                <span className="text-xs text-slate-600">
                  {content.length} characters
                </span>
              </div>
              
              {/* Editable Content Area */}
              <textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={!isEditing}
                placeholder={isEditing ? NODE_PLACEHOLDER.message : NODE_PLACEHOLDER.editMessage}
                className={`w-full min-h-[500px] bg-transparent text-slate-200 text-lg leading-relaxed resize-none outline-none border-none placeholder:italic transition-all ${
                  isEditing 
                    ? 'placeholder:text-slate-600 cursor-text' 
                    : 'placeholder:text-slate-700 cursor-default opacity-80'
                }`}
                style={{ 
                  fontFamily: 'inherit',
                  lineHeight: '1.8'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
