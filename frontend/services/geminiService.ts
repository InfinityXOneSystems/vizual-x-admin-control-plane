
import { GoogleGenAI, GenerateContentResponse, Modality, Type, LiveServerMessage } from "@google/genai";
import { Message, GenerationConfig, UITheme } from "../types";

export class GeminiService {
  // Always create a new instance before making an API call to ensure latest API key
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async streamChat(
    messages: Message[], 
    config: GenerationConfig,
    currentTheme: UITheme,
    onChunk: (chunk: string, links?: any[]) => void
  ) {
    const ai = this.getAI();
    const lastMessage = messages[messages.length - 1];
    
    // Select model based on complexity and speed requirements
    let modelName = config.model;
    if (config.useThinking) {
      modelName = 'gemini-3-pro-preview';
    } else if (config.grounding === 'maps') {
      modelName = 'gemini-2.5-flash';
    }

    const history = messages.slice(0, -1).map(m => {
      const parts: any[] = [{ text: m.content }];
      if (m.mediaUrl) {
        parts.push({
          inlineData: {
            data: m.mediaUrl.split(',')[1],
            mimeType: m.mediaType || 'image/jpeg'
          }
        });
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts
      };
    });

    const currentParts: any[] = [{ text: lastMessage.content }];
    if (lastMessage.mediaUrl) {
      currentParts.push({
        inlineData: {
          data: lastMessage.mediaUrl.split(',')[1],
          mimeType: lastMessage.mediaType || 'image/jpeg'
        }
      });
    }

    const tools: any[] = [];
    if (config.grounding === 'search') tools.push({ googleSearch: {} });
    if (config.grounding === 'maps') tools.push({ googleMaps: {} });

    const systemInstruction = `You are Vizual-X AI, a master design engineer and multi-modal assistant. 
You can update the user interface theme in real-time based on natural language requests.
To update the theme, include the following string in your response: 
UI_THEME_UPDATE: {"primaryColor": "#HEX", "sidebarBg": "#HEX", "mainBg": "#HEX", "fontFamily": "Font Name", "borderRadius": "px", "logoText": "TEXT", "accentGradient": "CSS_GRADIENT", "baseFontSize": "px"}
The current theme is: ${JSON.stringify(currentTheme)}.
Always respond in Markdown. If image editing or analysis is requested, explain the findings.`;

    const genConfig: any = {
      temperature: 0.7,
      systemInstruction,
      tools: tools.length > 0 ? tools : undefined,
    };

    if (config.useThinking) {
      // Per instructions: thinkingBudget to 32768 for gemini-3-pro-preview
      genConfig.thinkingConfig = { thinkingBudget: 32768 };
    }

    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents: [...history, { role: 'user', parts: currentParts }],
        config: genConfig,
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        const grounding = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const links = grounding?.map((c: any) => {
          if (c.web) return { uri: c.web.uri, title: c.web.title };
          if (c.maps) return { uri: c.maps.uri, title: c.maps.title };
          return null;
        }).filter(Boolean);
        
        if (text || links) {
          onChunk(text || "", links);
        }

        // Find image part within candidates[0].content.parts
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData) {
              onChunk(`UI_IMAGE_RESULT:data:${part.inlineData.mimeType};base64,${part.inlineData.data}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      onChunk("\n\n*Error: " + (error as Error).message + "*");
    }
  }

  async editImage(prompt: string, base64Image: string, mimeType: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType } },
          { text: prompt }
        ]
      }
    });
    
    // Iterate through all parts to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  }

  async generateImage(prompt: string, config: GenerationConfig) {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: config.aspectRatio || "1:1",
            imageSize: config.imageSize || "1K"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16', startImage?: string) {
    const ai = this.getAI();
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: startImage ? {
          imageBytes: startImage.split(',')[1],
          mimeType: startImage.split(';')[0].split(':')[1]
        } : undefined,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async generateSpeech(text: string) {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  }

  async connectLive(callbacks: {
    onAudio: (data: string) => void;
    onText: (text: string) => void;
    onError: (e: any) => void;
  }) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onmessage: async (message: LiveServerMessage) => {
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                callbacks.onAudio(part.inlineData.data);
              }
              if (part.text) {
                callbacks.onText(part.text);
              }
            }
          }
        },
        onerror: callbacks.onError,
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      },
    });
  }

  encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number = 24000,
    numChannels: number = 1
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}

export const geminiService = new GeminiService();
