
// 지식 이해도에 따른 색상
export const COLORS = {
  known: 0x10B981,   // Emerald 500 (이해 완료)
  fuzzy: 0xF59E0B,   // Amber 500 (애매함)
  unknown: 0xF43F5E, // Rose 500 (모름)
  new: 0x3B82F6,     // Blue 500 (새로운 지식)
  default: 0x94A3B8, // Slate 400
  bg: 0x000000       // Pure Black for Space effect
};
// todo 상수화된 데이터 서버 통신으로 데이터 받아오기
export const INITIAL_NODES = [
  { id: 'root', label: 'LLM (대규모언어모델)', status: 'known', val: 30, category: 'Core', description: '방대한 텍스트 데이터로 학습된 인공지능 모델입니다.' },
  { id: 'c1', label: 'Transformer', status: 'fuzzy', val: 25, category: 'Architecture', description: 'Attention 메커니즘을 사용하는 딥러닝 아키텍처입니다.' },
  { id: 'c2', label: 'Attention Mechanism', status: 'unknown', val: 20, category: 'Concept', description: '입력 데이터의 중요한 부분에 가중치를 두는 기술입니다.' },
  { id: 'c3', label: 'RAG (검색증강생성)', status: 'known', val: 28, category: 'Application', description: '외부 지식 베이스를 검색하여 LLM의 답변 정확도를 높이는 기술입니다.' },
  { id: 'c4', label: 'Vector DB', status: 'known', val: 22, category: 'Infrastructure', description: '고차원 벡터 데이터를 효율적으로 저장하고 검색하는 데이터베이스입니다.' },
  { id: 'c5', label: 'Embedding', status: 'fuzzy', val: 18, category: 'Math', description: '텍스트나 이미지를 숫자로 이루어진 벡터로 변환하는 과정입니다.' },
  { id: 'c6', label: 'Fine-tuning', status: 'unknown', val: 15, category: 'Training', description: '사전 학습된 모델을 특정 작업에 맞게 미세 조정하는 것입니다.' },
  { id: 'c7', label: 'Prompt Engineering', status: 'known', val: 20, category: 'Skill', description: 'AI로부터 최적의 결과를 얻기 위해 입력을 설계하는 기술입니다.' },
];

export const INITIAL_LINKS = [
  { source: 'root', target: 'c1' },
  { source: 'c1', target: 'c2' },
  { source: 'root', target: 'c3' },
  { source: 'c3', target: 'c4' },
  { source: 'c4', target: 'c5' },
  { source: 'root', target: 'c6' },
  { source: 'root', target: 'c7' },
  { source: 'c3', target: 'c7' },
];

export const NODE_PLACEHOLDER = {message: `Start typing your notes here... 

You can write anything you want:
• Ideas and thoughts
• Study notes
• Meeting minutes
• Research findings

This is your personal knowledge space.`,
editMessage: "Click 'Start Writing' to begin editing..."
}