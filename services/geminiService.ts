
import { GoogleGenAI, Modality, Type } from "@google/genai";

// Standardizing Gemini API service with updated guidelines.
// Fresh GoogleGenAI instances are created per request to ensure up-to-date API key retrieval from process.env.API_KEY.

export const sendMessageToGemini = async (prompt: string, history: any[], config: any = {}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = config.thinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const genConfig: any = {
    systemInstruction: config.systemInstruction || `You are Vizual X, a sovereign flagship AI.`,
    temperature: config.temperature || 0.7,
  };

  if (config.thinking) {
    // Guidelines: Gemini 3 Pro supports a max thinking budget of 32768.
    genConfig.thinkingConfig = { thinkingBudget: 32768 };
  }

  if (config.googleSearch) {
    // Guidelines: Only googleSearch is permitted when used for search grounding.
    genConfig.tools = [{ googleSearch: {} }];
  }

  const chat = ai.chats.create({
    model: model,
    history: history,
    config: genConfig
  });

  return await chat.sendMessageStream({ message: prompt });
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1", size: string = "1K") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: { aspectRatio: aspectRatio as any, imageSize: size as any }
    }
  });

  // Iterating through all parts to find the image part as it may not be the first one.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editImage = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
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
  // Guidelines: Append the API key from process.env.API_KEY when fetching the MP4 video resource.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const textToSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;
  
  return base64Audio;
};
