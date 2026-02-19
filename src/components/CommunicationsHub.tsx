
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createLiveSession, encode, decode, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage, LiveSession, Blob } from '@google/genai';

export const CommunicationsHub: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [userTranscript, setUserTranscript] = useState('');
    const [modelTranscript, setModelTranscript] = useState('');
    const [transcriptHistory, setTranscriptHistory] = useState<{ speaker: 'user' | 'model', text: string }[]>([]);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const microphoneStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef<number>(0);

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        audioSourcesRef.current.forEach(source => source.stop());
        audioSourcesRef.current.clear();
        setStatus('idle');
    }, []);
    
    const startConversation = useCallback(async () => {
        setStatus('connecting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = createLiveSession({
                onopen: () => {
                    setStatus('active');
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const int16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) {
                            int16[i] = inputData[i] * 32768;
                        }
                        const pcmBlob: Blob = {
                            data: encode(new Uint8Array(int16.buffer)),
                            mimeType: 'audio/pcm;rate=16000',
                        };
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        setUserTranscript(prev => prev + message.serverContent!.inputTranscription!.text);
                    }
                    if (message.serverContent?.outputTranscription) {
                        setModelTranscript(prev => prev + message.serverContent!.outputTranscription!.text);
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscriptHistory(prev => [...prev, { speaker: 'user', text: userTranscript }, { speaker: 'model', text: modelTranscript }]);
                        setUserTranscript('');
                        setModelTranscript('');
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        const outputContext = outputAudioContextRef.current!;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputContext.currentTime);
                        
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputContext, 24000, 1);
                        const source = outputContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputContext.destination);
                        source.addEventListener('ended', () => audioSourcesRef.current.delete(source));
                        
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live API Error:', e);
                    setStatus('error');
                    stopConversation();
                },
                onclose: (e: CloseEvent) => {
                    stopConversation();
                },
            });
        } catch (error) {
            console.error('Failed to start conversation:', error);
            setStatus('error');
        }
    }, [userTranscript, modelTranscript, stopConversation]);


    return (
        <div className="h-full w-full bg-black p-10 lg:p-12 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
            <div className="max-w-7xl mx-auto space-y-12">
                <header className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-12">
                    <div>
                        <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Comms Hub</h2>
                        <p className="text-[11px] font-bold uppercase tracking-[0.6em] opacity-30 text-cyan-400 mt-2 italic">Gemini Live API Voice Interface</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 p-10 bg-[#05070A] border border-white/5 rounded-[40px] space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black italic uppercase tracking-widest">Live Transcription</h3>
                        </div>
                        <div className="h-80 bg-black/40 border border-white/10 rounded-3xl p-6 text-sm text-white/70 overflow-y-auto custom-scrollbar">
                            {transcriptHistory.map((item, index) => (
                                <p key={index} className="mb-2">
                                    <span className={item.speaker === 'user' ? 'text-cyan-400' : 'text-green-400'}>{item.speaker === 'user' ? 'Operator' : 'Sovereign'}: </span>
                                    {item.text}
                                </p>
                            ))}
                             {userTranscript && <p className="text-cyan-400/70">Operator: {userTranscript}</p>}
                             {modelTranscript && <p className="text-green-400/70">Sovereign: {modelTranscript}</p>}
                        </div>
                    </div>
                    <div className="p-10 bg-[#05070A] border border-white/5 rounded-[40px] space-y-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-black italic uppercase tracking-widest mb-8">Call Status</h3>
                            <div className="text-center space-y-4">
                                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center border-4 ${status === 'active' ? 'border-red-500' : 'border-zinc-700'}`}>
                                    <div className={`w-16 h-16 rounded-full ${status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-zinc-800'}`}></div>
                                </div>
                                <p className="text-lg font-bold uppercase tracking-wider">{status}</p>
                            </div>
                        </div>
                        <button 
                            onClick={status === 'active' ? stopConversation : startConversation}
                            className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest"
                        >
                            {status === 'active' ? "End Session" : "Initiate Conversation"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
