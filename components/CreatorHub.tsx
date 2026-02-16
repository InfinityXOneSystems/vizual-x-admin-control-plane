
import React, { useState, useRef } from 'react';
import { CreatorTool } from '../types';
import { generateImagePro, generateVideoVeo, editImageWithFlash, textToSpeech } from '../services/geminiService';

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9", "21:9"];
const IMAGE_SIZES = ["1K", "2K", "4K"];

export const CreatorHub: React.FC<{ tool: CreatorTool }> = ({ tool: initialTool }) => {
  const [tool, setTool] = useState<CreatorTool>(initialTool);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [selectedImage, setSelectedImage] = useState<{data: string, mime: string} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImage({ data: base64, mime: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt.trim() && !selectedImage) return;
    setIsProcessing(true);
    try {
      if (tool === 'image') {
        const res = await generateImagePro(prompt, aspectRatio, imageSize);
        setOutput(res);
      } else if (tool === 'video') {
        const res = await generateVideoVeo(prompt, aspectRatio as any, selectedImage?.data);
        setOutput(res);
      } else if (tool === 'builder') { // Used as Image Edit for this context
        if (selectedImage) {
          const res = await editImageWithFlash(prompt, selectedImage.data, selectedImage.mime);
          setOutput(res);
        }
      } else if (tool === 'creative') { // Used as TTS
        const data = await textToSpeech(prompt);
        if (data) setOutput(`data:audio/wav;base64,${data}`);
      }
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="flex-1 flex flex-col p-8 lg:p-16 overflow-auto bg-[var(--bg-absolute)] animate-in fade-in duration-700 h-screen custom-scrollbar">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter italic leading-none">{tool.toUpperCase()} SYNTHESIS</h2>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30 text-[#2AF5FF] mt-4">Sovereign Multi-Modal Engine</p>
        </div>
        <div className="flex bg-black/40 rounded-2xl p-1 border border-white/10">
          {(['image', 'video', 'builder', 'creative'] as CreatorTool[]).map(t => (
            <button key={t} onClick={() => {setTool(t); setOutput(null);}} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tool === t ? 'bg-[#1E90FF] text-white' : 'opacity-40 hover:opacity-100'}`}>
              {t === 'image' ? 'Image Pro' : t === 'video' ? 'Veo Video' : t === 'builder' ? 'Edit Image' : 'TTS'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 flex-1">
        <div className="space-y-8 glass-panel p-10 rounded-[40px] border border-white/10 shadow-2xl">
          {(tool === 'video' || tool === 'builder') && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Source Asset</label>
              <div onClick={() => fileInputRef.current?.click()} className="h-40 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all">
                {selectedImage ? <img src={`data:${selectedImage.mime};base64,${selectedImage.data}`} className="h-full object-contain" /> : <span className="text-3xl">📤</span>}
                <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} accept="image/*" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Parameters</label>
            <div className="flex gap-4">
               <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="bg-black border border-white/10 p-3 rounded-xl text-xs font-bold text-white flex-1">
                 {ASPECT_RATIOS.map(r => <option key={r} value={r}>Ratio: {r}</option>)}
               </select>
               {tool === 'image' && (
                 <select value={imageSize} onChange={(e) => setImageSize(e.target.value)} className="bg-black border border-white/10 p-3 rounded-xl text-xs font-bold text-white flex-1">
                   {IMAGE_SIZES.map(s => <option key={s} value={s}>Size: {s}</option>)}
                 </select>
               )}
            </div>
          </div>

          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="DIRECTIVE COMMAND..." className="w-full bg-black border border-white/10 rounded-3xl p-8 text-sm font-bold min-h-[160px] outline-none focus:border-[#2AF5FF] transition-all text-white placeholder:text-white/10" />
          
          <button onClick={handleAction} disabled={isProcessing} className="w-full py-8 electric-gradient text-white rounded-[32px] font-black uppercase tracking-[0.5em] text-[11px] shadow-2xl transition-all active:scale-95 disabled:opacity-30">
            {isProcessing ? 'SYNTHESIZING...' : 'INITIALIZE GENERATION'}
          </button>
        </div>

        <div className="glass-panel p-10 rounded-[40px] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden bg-black/40">
           {!output && !isProcessing && <p className="text-[10px] font-black uppercase tracking-[1em] opacity-10 italic">Core Buffer Standby</p>}
           {isProcessing && <div className="w-20 h-20 border-4 border-[#2AF5FF] border-t-transparent rounded-full animate-spin"></div>}
           {output && !isProcessing && (
             <div className="w-full h-full flex flex-col items-center justify-center">
               {tool === 'video' ? <video src={output} controls className="max-w-full max-h-full rounded-2xl shadow-glow" /> : 
                tool === 'creative' ? <audio src={output} controls className="w-full" /> :
                <img src={output} className="max-w-full max-h-full rounded-2xl shadow-glow" />}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
