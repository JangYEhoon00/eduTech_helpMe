
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, QuizData, MetaResult } from "../utils/types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelId = "gemini-2.5-flash";

export const analyzeConcept = async (text: string): Promise<AnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `User Question: "${text}"
      
      1. Answer the user's question clearly and concisely in Korean. 
      2. **IMPORTANT: Do NOT use any Markdown formatting (no bold **, no italics *, no headers #). Just use plain text.**
      3. Analyze the content of your answer and the question to create a knowledge graph structure.
      4. Extract key concepts, assign a category, and provide a brief description for each.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A very short summary of the topic (max 10 words)" },
            answer: { type: Type.STRING, description: "The direct answer to the user's question. Plain text only." },
            concepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  category: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['unknown', 'fuzzy', 'known'] },
                  description: { type: Type.STRING }
                },
                required: ['label', 'category', 'status', 'description']
              }
            },
            prerequisites: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const generateQuiz = async (concept: string): Promise<QuizData | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create a challenging multiple-choice question about the concept: "${concept}". (In Korean, Plain Text only)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            answer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
            feedback: { type: Type.STRING, description: "Explanation of why the answer is correct" }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizData;
    }
    return null;
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return null;
  }
};

export const evaluateMetaCognition = async (concept: string, explanation: string): Promise<MetaResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `The user is explaining the concept "${concept}" to test their understanding.
      User Explanation: "${explanation}"
      
      Evaluate their understanding from 0-100 based on accuracy and depth.
      If score > 80, status is 'known'. If > 50, 'fuzzy'. Else 'unknown'.
      Provide brief feedback and a next step for learning (in Korean, Plain Text).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            status: { type: Type.STRING, enum: ['known', 'fuzzy', 'unknown'] },
            feedback: { type: Type.STRING },
            nextStep: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as MetaResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini Meta Evaluation Error:", error);
    return null;
  }
};
