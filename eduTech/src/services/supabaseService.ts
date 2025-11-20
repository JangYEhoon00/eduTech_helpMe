import { supabase } from './supabaseClient';
import { Node, Link, ChatMessage } from '../utils/types';

// ==================== 인증 관련 ====================

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      // 세션이 없거나 만료된 경우 null 반환 (에러 발생시키지 않음)
      if (error.message.includes('Auth session missing') || error.message.includes('Invalid Refresh Token')) {
        return null;
      }
      throw error;
    }
    return user;
  } catch (error) {
    // 그 외 에러는 null 반환하여 호출자가 처리하도록 함 (또는 로그 출력)
    console.warn('Error getting current user:', error);
    return null;
  }
};

/**
 * 이메일로 회원가입
 */
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    console.error('Supabase SignUp Error:', error);
    throw error;
  }
  console.log('Supabase: 회원가입 요청 성공', data);
  return data;
};

/**
 * 이메일로 로그인
 */
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  console.log('Supabase: 로그인 요청 성공', data);
  return data;
};

/**
 * 로그아웃
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * 익명 로그인 (테스트용)
 */
export const signInAnonymously = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
};

// ==================== 노드 관련 ====================

/**
 * 모든 노드 가져오기 (현재 사용자)
 */
export const fetchNodes = async (): Promise<Node[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 특정 노드 가져오기
 */
export const fetchNodeById = async (nodeId: string): Promise<Node | null> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('id', nodeId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

/**
 * 노드 생성
 */
export const createNode = async (node: Node): Promise<Node> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('nodes')
    .insert({
      id: node.id,
      user_id: user.id,
      label: node.label,
      status: node.status,
      val: node.val,
      category: node.category,
      description: node.description || null,
    })
    .select()
    .single();

  if (error) throw error;
  console.log('Supabase: 노드 생성 성공', data);
  return data;
};

/**
 * 여러 노드 한번에 생성
 */
export const createNodes = async (nodes: Node[]): Promise<Node[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const nodesToInsert = nodes.map(node => ({
    id: node.id,
    user_id: user.id,
    label: node.label,
    status: node.status,
    val: node.val,
    category: node.category,
    description: node.description || null,
  }));

  const { data, error } = await supabase
    .from('nodes')
    .insert(nodesToInsert)
    .select();

  if (error) throw error;
  return data || [];
};

/**
 * 노드 업데이트
 */
export const updateNode = async (
  nodeId: string,
  updates: Partial<Node>
): Promise<Node> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('nodes')
    .update({
      label: updates.label,
      status: updates.status,
      val: updates.val,
      category: updates.category,
      description: updates.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', nodeId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 노드 삭제
 */
export const deleteNode = async (nodeId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('nodes')
    .delete()
    .eq('id', nodeId)
    .eq('user_id', user.id);

  if (error) throw error;
};

// ==================== 링크 관련 ====================

/**
 * 모든 링크 가져오기 (현재 사용자)
 */
export const fetchLinks = async (): Promise<Link[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('links')
    .select('source, target')
    .eq('user_id', user.id);

  if (error) throw error;
  return data || [];
};

/**
 * 링크 생성
 */
export const createLink = async (link: Link): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('links')
    .insert({
      user_id: user.id,
      source: link.source,
      target: link.target,
    });

  if (error) throw error;
};

/**
 * 여러 링크 한번에 생성
 */
export const createLinks = async (links: Link[]): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const linksToInsert = links.map(link => ({
    user_id: user.id,
    source: link.source,
    target: link.target,
  }));

  const { error } = await supabase
    .from('links')
    .insert(linksToInsert);

  if (error) throw error;
};

/**
 * 링크 삭제
 */
export const deleteLink = async (source: string, target: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('links')
    .delete()
    .eq('source', source)
    .eq('target', target)
    .eq('user_id', user.id);

  if (error) throw error;
};

// ==================== 노드 콘텐츠 관련 ====================

/**
 * 노드의 콘텐츠 가져오기
 */
export const fetchNodeContent = async (nodeId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('node_contents')
    .select('*')
    .eq('node_id', nodeId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
};

/**
 * 노드 콘텐츠 저장 (생성 또는 업데이트)
 */
export const saveNodeContent = async (
  nodeId: string,
  title: string,
  content: string
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  // Upsert: 있으면 업데이트, 없으면 생성
  const { data, error } = await supabase
    .from('node_contents')
    .upsert({
      node_id: nodeId,
      user_id: user.id,
      title,
      content,
      last_saved: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'node_id,user_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * 노드 콘텐츠 삭제
 */
export const deleteNodeContent = async (nodeId: string): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('node_contents')
    .delete()
    .eq('node_id', nodeId)
    .eq('user_id', user.id);

  if (error) throw error;
};

// ==================== 채팅 메시지 관련 ====================

/**
 * 모든 채팅 메시지 가져오기
 */
export const fetchChatMessages = async (): Promise<ChatMessage[]> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: true });

  if (error) throw error;

  return (data || []).map(msg => ({
    id: msg.id,
    sender: msg.sender as 'user' | 'bot',
    content: msg.content,
    timestamp: new Date(msg.timestamp),
    subconcepts: msg.subconcepts || undefined,
  }));
};

/**
 * 채팅 메시지 저장
 */
export const saveChatMessage = async (message: ChatMessage): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('chat_messages')
    .insert({
      id: message.id,
      user_id: user.id,
      sender: message.sender,
      content: message.content,
      subconcepts: message.subconcepts || null,
      timestamp: message.timestamp.toISOString(),
    });

  if (error) throw error;
  console.log('Supabase: 채팅 메시지 저장 성공');
};

/**
 * 모든 채팅 메시지 삭제
 */
export const clearChatMessages = async (): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
};

// ==================== 메타인지 결과 관련 ====================

/**
 * 특정 노드의 메타인지 결과 가져오기
 */
export const fetchMetaResults = async (nodeId: string) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('meta_results')
    .select('*')
    .eq('node_id', nodeId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * 메타인지 결과 저장
 */
export const saveMetaResult = async (
  nodeId: string,
  score: number,
  status: 'known' | 'fuzzy' | 'unknown',
  feedback: string,
  nextStep: string
) => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('meta_results')
    .insert({
      user_id: user.id,
      node_id: nodeId,
      score,
      status,
      feedback,
      next_step: nextStep,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ==================== 그래프 데이터 일괄 처리 ====================

/**
 * 전체 그래프 데이터 가져오기 (노드 + 링크)
 */
export const fetchGraphData = async () => {
  const [nodes, links] = await Promise.all([
    fetchNodes(),
    fetchLinks(),
  ]);

  return { nodes, links };
};

/**
 * 그래프 데이터 일괄 저장 (노드 + 링크)
 */
export const saveGraphData = async (nodes: Node[], links: Link[]) => {
  await Promise.all([
    createNodes(nodes),
    createLinks(links),
  ]);
};

/**
 * 모든 데이터 삭제 (초기화)
 */
export const clearAllData = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  await Promise.all([
    supabase.from('links').delete().eq('user_id', user.id),
    supabase.from('node_contents').delete().eq('user_id', user.id),
    supabase.from('chat_messages').delete().eq('user_id', user.id),
    supabase.from('meta_results').delete().eq('user_id', user.id),
    supabase.from('nodes').delete().eq('user_id', user.id),
  ]);
};
