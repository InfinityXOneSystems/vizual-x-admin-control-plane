
import { GoogleGenAI, Modality, Type } from "@google/genai";

/**
 * Helper to implement exponential backoff retry logic.
 */
const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isTransient = error?.status === 503 || error?.code === 503 || error?.message?.includes('503') || error?.message?.includes('UNAVAILABLE');
      if (!isTransient || i === maxRetries - 1) break;
      
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Gemini API 503 detected. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
};

export const sendMessageToGemini = async (prompt: string, history: any[], config: any = {}) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = config.aiModel || 'gemini-3-flash-preview';
    
    const genConfig: any = {
      systemInstruction: config.systemInstruction || `You are Vizual X, a sovereign flagship AI. Follow Google Cloud industry standards.`,
      temperature: config.temperature ?? 0.7,
      topP: config.topP ?? 0.95,
      topK: config.topK ?? 40,
      maxOutputTokens: config.maxTokens,
    };

    if (config.thinkingBudget > 0) {
      genConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    }

    if (config.groundingEnabled) {
      genConfig.tools = [{ googleSearch: {} }];
    }

    if (config.safety) {
      genConfig.safetySettings = [
        { category: 'HATE_SPEECH', threshold: config.safety.hateSpeech },
        { category: 'HARASSMENT', threshold: config.safety.harassment },
        { category: 'SEXUALLY_EXPLICIT', threshold: config.safety.sexuallyExplicit },
        { category: 'DANGEROUS_CONTENT', threshold: config.safety.dangerousContent },
      ];
    }

    const chat = ai.chats.create({
      model: model,
      history: history,
      config: genConfig
    });

    return await chat.sendMessageStream({ message: prompt });
  });
};

export const analyzeCodeForRefactoring = async (fileName: string, code: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following file named "${fileName}" for potential refactoring improvements. Focus on code quality, performance, and readability.
      
      Code:
      ${code}`,
      config: {
        thinkingConfig: { thinkingBudget: 4096 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                description: "Must be 'quality', 'performance', or 'readability'"
              },
              refactoredCode: { type: Type.STRING }
            },
            required: ["id", "title", "description", "category", "refactoredCode"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text.trim());
    } catch (e) {
      console.error("Failed to parse refactor response", e);
      return [];
    }
  });
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  });
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  });
};
