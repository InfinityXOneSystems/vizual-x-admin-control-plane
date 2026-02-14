
import { GoogleGenAI } from "@google/genai";

export const sendMessageToGemini = async (prompt: string, history: { role: string, parts: { text: string }[] }[]) => {
  // Always use process.env.API_KEY directly as per SDK guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    // Pass history to maintain conversation context
    history: history,
    config: {
      systemInstruction: `You are an expert full-stack software engineer assistant. 
      You help users build applications by writing and editing code.
      
      - When you provide code, wrap it in markdown code blocks with a language identifier.
      - ALWAYS include a filename hint in the first line like: // filename: app.js or # filename: main.py
      - If the user asks for a change, provide the COMPLETE updated file.
      - You handle both frontend (React, HTML, CSS) and simulated backend logic.
      - Keep explanations short; prioritize delivering high-quality, readable code.
      - If you are creating multiple files, provide each in its own code block.`,
      temperature: 0.7,
    }
  });

  const response = await chat.sendMessageStream({ message: prompt });
  return response;
};
