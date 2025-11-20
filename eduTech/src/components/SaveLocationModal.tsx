import React, { useState } from 'react';
import { Folder, X, CheckCircle, FolderPlus } from 'lucide-react';

interface SaveLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (category: string) => void;
  existingCategories: string[];
}

export const SaveLocationModal = ({ isOpen, onClose, onConfirm, existingCategories }: SaveLocationModalProps) => {
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
