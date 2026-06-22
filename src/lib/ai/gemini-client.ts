import { GoogleGenAI } from '@google/genai';

export const geminiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export const EMBEDDING_MODEL = 'gemini-embedding-001';
export const CHAT_MODEL = 'gemini-2.5-flash';
