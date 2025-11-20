import React, { useState, useRef, useEffect } from 'react';
import { Node } from '../utils/types';
import { Edit3, Mic, Clock, Hash, Save, Type, CheckCircle, AlertCircle } from 'lucide-react';
import { NODE_PLACEHOLDER } from '../utils/constants';
import { fetchNodeContent, saveNodeContent } from '../services/supabaseService';

interface NodePageProps {
  node: Node;
}

export const NodePage = ({ node }: NodePageProps) => {
  const [title, setTitle] = useState(node.label);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // STT 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // STT 초기화
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'ko-KR'; // 한국어 설정

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            setContent(prev => {
              const newContent = prev ? `${prev}\n${finalTranscript}` : finalTranscript;
              return newContent;
            });
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          // 의도적으로 끈 게 아니면 다시 시작할 수도 있지만, 여기서는 일단 멈춤 상태로 둠
          if (isRecording) {
             // setIsRecording(false); // 상태 동기화
          }
        };
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      setIsEditing(true); // 녹음 시작하면 편집 모드로 전환
    }
  };

  // 노드 콘텐츠 불러오기
  useEffect(() => {
    const loadContent = async () => {
      try {
        setIsLoading(true);
        const data = await fetchNodeContent(node.id);
        if (data) {
          setTitle(data.title);
          setContent(data.content);
          setLastSaved(new Date(data.last_saved));
        }
      } catch (error) {
        console.error('콘텐츠 불러오기 실패:', error);
        setSaveError('콘텐츠를 불러올 수 없습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [node.id]);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // 자동 저장 (3초마다)
  useEffect(() => {
    if (!isEditing) return;

    // 기존 타이머 취소
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 3초 후 자동 저장
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(false); // 자동 저장은 편집 모드 유지
    }, 3000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, content, isEditing]);

  const handleSave = async (exitEditMode = true) => {
    try {
      setIsSaving(true);
      setSaveError(null);
      
      await saveNodeContent(node.id, title, content);
      
      setLastSaved(new Date());
      if (exitEditMode) {
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error('저장 실패:', JSON.stringify(error, null, 2));
      setSaveError(error.message || '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastSaved = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (isLoading) {
    return (
      <div className="h-full w-full bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-slate-400">콘텐츠 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#020617] text-white overflow-y-auto custom-scrollbar">
      <div className="max-w-7xl mx-auto px-6 py-8 pt-20">
        {/* Header Section */}
        <header className="mb-12 relative">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-3 h-3" />
              {node.category}
            </span>
            
            {/* 저장 상태 표시 */}
            <span className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Clock className="w-3 h-3" />
              Last saved {formatLastSaved()}
            </span>
            
            {isSaving && (
              <span className="flex items-center gap-2 text-yellow-400 text-xs font-medium animate-pulse">
                <Save className="w-3 h-3" />
                저장 중...
              </span>
            )}
            
            {!isSaving && !saveError && isEditing && (
              <span className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                자동 저장 활성화
              </span>
            )}
            
            {saveError && (
              <span className="flex items-center gap-2 text-red-400 text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                {saveError}
              </span>
            )}
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
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '저장 중...' : 'Save'}
            </button>
            <button 
              onClick={toggleRecording}
              className={`px-6 py-3 rounded-xl font-bold text-sm border transition-all flex items-center gap-2 ${
                isRecording 
                  ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' 
                  : 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'text-red-400' : 'text-emerald-400'}`} />
              {isRecording ? 'Recording...' : 'Voice Note'}
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
