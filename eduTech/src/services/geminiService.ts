import OpenAI from "openai";
import { AnalysisResult, QuizData, MetaResult, ChatMessage } from "../utils/types";

const modelId = "gpt-4o-mini";

// Helper function to get OpenAI instance with API key
const getOpenAI = () => {
  const apiKey = import.meta.env.VITE_GPT_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is missing. Please provide a valid API key.');
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

export const analyzeConcept = async (text: string): Promise<AnalysisResult | null> => {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [{
        role: "user",
        content: `User Question: "${text}"
        
        1. Answer the user's question clearly and concisely in Korean. 
        2. **IMPORTANT: Do NOT use any Markdown formatting (no bold **, no italics *, no headers #). Just use plain text.**
        3. Analyze the content of your answer and the question to create a knowledge graph structure.
        4. Extract key concepts, assign a category, and provide a brief description for each.
        
        Return JSON with this exact structure:
        {
          "summary": "A very short summary of the topic (max 10 words)",
          "answer": "The direct answer to the user's question. Plain text only.",
          "concepts": [
            {
              "label": "string",
              "category": "string",
              "status": "unknown" | "fuzzy" | "known",
              "description": "string"
            }
          ],
          "prerequisites": ["string"]
        }`
      }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content) as AnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("OpenAI Analysis Error:", error);
    return null;
  }
};

export const generateQuiz = async (concept: string): Promise<QuizData | null> => {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [{
        role: "user",
        content: `Create a challenging multiple-choice question about the concept: "${concept}". (In Korean, Plain Text only)
        
        Return JSON with this exact structure:
        {
          "question": "string",
          "options": ["option1", "option2", "option3", "option4"],
          "answer": 0,
          "feedback": "Explanation of why the answer is correct"
        }
        
        Note: answer is the index of the correct option (0-3)`
      }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content) as QuizData;
    }
    return null;
  } catch (error) {
    console.error("OpenAI Quiz Error:", error);
    return null;
  }
};

export const evaluateMetaCognition = async (concept: string, explanation: string): Promise<MetaResult | null> => {
  try {
    const openai = getOpenAI();
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [{
        role: "user",
        content: `The user is explaining the concept "${concept}" to test their understanding.
        User Explanation: "${explanation}"
        
        Evaluate their understanding from 0-100 based on accuracy and depth.
        If score > 80, status is 'known'. If > 50, 'fuzzy'. Else 'unknown'.
        Provide brief feedback and a next step for learning (in Korean, Plain Text).
        
        Return JSON with this exact structure:
        {
          "score": 85,
          "status": "known" | "fuzzy" | "unknown",
          "feedback": "string",
          "nextStep": "string"
        }`
      }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content) as MetaResult;
    }
    return null;
  } catch (error) {
    console.error("OpenAI Meta Evaluation Error:", error);
    return null;
  }
};

export const chatWithBot = async (messages: ChatMessage[], activeSubconcept?: string): Promise<{ answer: string; subconcepts: string[] } | null> => {
  try {
    const openai = getOpenAI();
    const history = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
    const context = activeSubconcept ? `Context: The user is asking about the subconcept "${activeSubconcept}".` : '';
    
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [{
        role: "user",
        content: `You are a helpful tutor AI.
        ${context}
        
        Chat History:
        ${history}
        
        User's last message is the last one in history.
        Answer the user's question in Korean.
        Also identify any subconcepts related to the answer.
        
        Return JSON with this exact structure: { "answer": "string", "subconcepts": ["string"] }`
      }],
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content;
    if (content) {
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error("Chat Error", error);
    return null;
  }
};
