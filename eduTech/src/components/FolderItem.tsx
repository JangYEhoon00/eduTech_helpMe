import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Folder, Eye, EyeOff, Edit2 } from 'lucide-react';
import { FolderStructure } from '../utils/types';

interface FolderItemProps {
  item: FolderStructure;
  level: number;
  toggleFolder: (id: string) => void;
  onNodeClick: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  selectedNodeId?: string;
  toggleCategoryVisibility: (category: string) => void;
  hiddenCategories: string[];
}

export const FolderItem: React.FC<FolderItemProps> = ({ item, level, toggleFolder, onNodeClick, onRename, selectedNodeId, toggleCategoryVisibility, hiddenCategories }) => {
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
        onClick={() => onNodeClick(item.nodeId!)}
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
