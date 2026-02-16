
import { GoogleGenAI, Type, Modality } from "@google/genai";

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
      systemInstruction: config.systemInstruction || "You are Vizual X, a flagship AI workspace.",
      temperature: config.temperature ?? 0.7,
    };

    if (config.thinking) {
      genConfig.thinkingConfig = { thinkingBudget: 32768 };
      // Note: No maxOutputTokens as per guidelines when using max budget
    }

    if (config.useSearch) {
      genConfig.tools = [{ googleSearch: {} }];
    } else if (config.useMaps) {
      genConfig.tools = [{ googleMaps: {} }];
    }

    const chat = ai.chats.create({
      model: model,
      history: history,
      config: genConfig
    });

    return await chat.sendMessageStream({ message: prompt });
  });
};

export const generateImagePro = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
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
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  });
};

export const editImageWithFlash = async (prompt: string, base64Image: string, mimeType: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: prompt }
        ]
      }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  });
};

export const generateVideoVeo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', imageBase64?: string) => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const videoConfig: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio }
    };

    if (imageBase64) {
      videoConfig.image = { imageBytes: imageBase64, mimeType: 'image/png' };
    }

    let operation = await ai.models.generateVideos(videoConfig);
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

export const textToSpeech = async (text: string, voice: string = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

export const transcribeAudio = async (base64Audio: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
        { text: "Transcribe this audio accurately." }
      ]
    }
  });
  return response.text;
};

export const analyzeMedia = async (prompt: string, base64Data: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType } },
        { text: prompt }
      ]
    }
  });
  return response.text;
};
