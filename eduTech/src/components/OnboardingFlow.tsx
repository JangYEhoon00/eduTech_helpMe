import React, { useState } from 'react';
import { Building2, Home, GraduationCap, ArrowRight, Check, Sparkles, Briefcase, BookOpen, School, ChevronRight, Loader2 } from 'lucide-react';

// Client-side keyword extraction (simple fallback)
const suggestInterests = async (text: string): Promise<string[]> => {
    // Split text into tokens and extract unique keywords
    const tokens = text
        .split(/[^\p{L}\p{N}]+/u)
        .map(t => t.trim())
        .filter(t => t.length > 1);
    
    const uniq: string[] = [];
    for (const t of tokens) {
        if (!uniq.includes(t)) uniq.push(t);
        if (uniq.length >= 10) break;
    }
    
    return uniq.slice(0, 8);
};
interface OnboardingFlowProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
}

type UsageType = 'work' | 'personal' | 'school' | null;
type SchoolType = 'college' | 'highschool' | null;

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState(1);
    const [usageType, setUsageType] = useState<UsageType>(null);

    // Work State
    const [jobField, setJobField] = useState('');

    // Personal State
    const [interestText, setInterestText] = useState('');
    const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // School State
    const [schoolType, setSchoolType] = useState<SchoolType>(null);
    const [major, setMajor] = useState(''); // For college
    const [subject, setSubject] = useState(''); // For high school

    const handleUsageSelect = (type: UsageType) => {
        setUsageType(type);
        setStep(2);
    };

    const handleAnalyzeInterests = async () => {
        if (!interestText.trim()) return;
        setIsAnalyzing(true);
        const keywords = await suggestInterests(interestText);
        setSuggestedKeywords(keywords);
        setSelectedKeywords([]); // Reset selection when new keywords are generated
        setIsAnalyzing(false);
    };

    const toggleKeyword = (keyword: string) => {
        setSelectedKeywords(prev =>
            prev.includes(keyword)
                ? prev.filter(k => k !== keyword)
                : [...prev, keyword]
        );
    };

    const handleFinish = () => {
        const data = {
            usageType,
            details: usageType === 'work' ? { jobField }
                : usageType === 'personal' ? { interestText, keywords: selectedKeywords }
                    : { schoolType, major: schoolType === 'college' ? major : undefined, subject: schoolType === 'highschool' ? subject : undefined }
        };
        onComplete(data);
    };

    const renderStep1 = () => (
        <div className="w-full max-w-4xl mx-auto animate-smooth-appear">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
                어떤 용도로 사용하시나요?
            </h2>
            <p className="text-slate-400 text-center mb-12 text-lg">
                사용 목적에 맞춰 최적화된 경험을 제공해 드립니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                    onClick={() => handleUsageSelect('work')}
                    className="group relative p-8 rounded-3xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500 transition-all duration-300 flex flex-col items-center text-center gap-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20"
                >
                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                        <Building2 className="w-10 h-10 text-indigo-400 group-hover:text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">업무용</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            프로젝트 관리, 회의록,<br />업무 지식 정리
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => handleUsageSelect('personal')}
                    className="group relative p-8 rounded-3xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500 transition-all duration-300 flex flex-col items-center text-center gap-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20"
                >
                    <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <Home className="w-10 h-10 text-emerald-400 group-hover:text-emerald-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">개인용</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            관심사 탐구, 아이디어,<br />개인 기록 정리
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => handleUsageSelect('school')}
                    className="group relative p-8 rounded-3xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500 transition-all duration-300 flex flex-col items-center text-center gap-6 hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-500/20"
                >
                    <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <GraduationCap className="w-10 h-10 text-amber-400 group-hover:text-amber-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">학습용</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            전공 공부, 강의 노트,<br />시험 대비
                        </p>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="w-full max-w-2xl mx-auto animate-smooth-appear">
            <button
                onClick={() => { setStep(1); setUsageType(null); }}
                className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
            >
                <ArrowRight className="w-4 h-4 rotate-180" /> 다른 용도 선택하기
            </button>

            {usageType === 'work' && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">직무 분야 선택</h3>
                            <p className="text-slate-400 text-sm">주로 어떤 업무를 하시나요?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {['기획/PM', '소프트웨어 개발', '디자인', '마케팅', '영업/세일즈', '경영/비즈니스', '데이터 분석', '기타'].map(job => (
                            <button
                                key={job}
                                onClick={() => setJobField(job)}
                                className={`p-4 rounded-xl border text-left transition-all duration-200 ${jobField === job ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                            >
                                <span className="font-medium">{job}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {usageType === 'personal' && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">관심사 입력</h3>
                            <p className="text-slate-400 text-sm">요즘 푹 빠져있는 것이 무엇인가요?</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <textarea
                            value={interestText}
                            onChange={(e) => setInterestText(e.target.value)}
                            placeholder="예: 요즘 커피 내리는 법이랑 베이킹에 관심이 많아. 그리고 주말엔 등산도 자주 가."
                            className="w-full h-32 bg-black/30 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:border-emerald-500 outline-none resize-none transition-colors"
                        />
                        <button
                            onClick={handleAnalyzeInterests}
                            disabled={isAnalyzing || !interestText.trim()}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            AI 키워드 추출하기
                        </button>
                    </div>

                    {suggestedKeywords.length > 0 && (
                        <div className="animate-smooth-slide-up">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">추천 키워드 (클릭하여 선택)</h4>
                            <div className="flex flex-wrap gap-2">
                                {suggestedKeywords.map((k, i) => (
                                    <button
                                        key={i}
                                        onClick={() => toggleKeyword(k)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${selectedKeywords.includes(k)
                                            ? 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg shadow-emerald-500/30'
                                            : 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-800/50'
                                            }`}
                                    >
                                        {selectedKeywords.includes(k) && <Check className="w-3 h-3 inline mr-1" />}
                                        {k}
                                    </button>
                                ))}
                            </div>
                            {selectedKeywords.length > 0 && (
                                <p className="text-xs text-emerald-400 mt-3">
                                    {selectedKeywords.length}개 선택됨
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {usageType === 'school' && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">학습 과정 선택</h3>
                            <p className="text-slate-400 text-sm">현재 어떤 공부를 하고 계신가요?</p>
                        </div>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => setSchoolType('college')}
                            className={`flex-1 p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 ${schoolType === 'college' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            <School className="w-8 h-8" />
                            <span className="font-bold">대학용</span>
                        </button>
                        <button
                            onClick={() => setSchoolType('highschool')}
                            className={`flex-1 p-4 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 ${schoolType === 'highschool' ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                            <BookOpen className="w-8 h-8" />
                            <span className="font-bold">고등용</span>
                        </button>
                    </div>

                    {schoolType === 'college' && (
                        <div className="animate-smooth-slide-up">
                            <label className="block text-sm font-bold text-slate-400 mb-2">전공 선택</label>
                            <input
                                type="text"
                                value={major}
                                onChange={(e) => setMajor(e.target.value)}
                                placeholder="예: 컴퓨터공학, 경영학, 심리학..."
                                className="w-full bg-black/30 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                            />
                        </div>
                    )}

                    {schoolType === 'highschool' && (
                        <div className="animate-smooth-slide-up">
                            <label className="block text-sm font-bold text-slate-400 mb-2">주요 학습 과목</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="예: 수학, 영어, 물리..."
                                className="w-full bg-black/30 border border-slate-600 rounded-xl px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleFinish}
                    disabled={
                        (usageType === 'work' && !jobField) ||
                        (usageType === 'personal' && !interestText) ||
                        (usageType === 'school' && (!schoolType || (schoolType === 'college' && !major) || (schoolType === 'highschool' && !subject)))
                    }
                    className="py-4 px-8 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                    시작하기 <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]" />

            <div className="z-10 w-full">
                {step === 1 ? renderStep1() : renderStep2()}
            </div>
        </div>
    );
};
