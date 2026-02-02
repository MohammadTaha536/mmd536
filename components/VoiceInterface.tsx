
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, PhoneOff, Loader2, Volume2, Info, ShieldAlert, Zap, ShieldCheck, Activity, ZapOff, RefreshCw, Clock } from 'lucide-react';
import { encodePCM, decodePCM, decodeAudioData } from '../services/geminiService';
import { AppSettings } from '../types';

const MAX_ENERGY = 100;
const ENERGY_TO_START = 25; 
const REFILL_RATE = 5;
const REFILL_INTERVAL = 2000;

interface Props {
  settings?: AppSettings;
}

const VoiceInterface: React.FC<Props> = ({ settings }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [neuralEnergy, setNeuralEnergy] = useState(MAX_ENERGY);
  const [isCharging, setIsCharging] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptRef = useRef({ user: '', model: '' });

  // سیستم بازیابی انرژی
  useEffect(() => {
    const timer = setInterval(() => {
      setNeuralEnergy(prev => {
        if (prev < MAX_ENERGY) {
          setIsCharging(true);
          return Math.min(prev + REFILL_RATE, MAX_ENERGY);
        }
        setIsCharging(false);
        return prev;
      });
    }, REFILL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  }, []);

  const startSession = async () => {
    if (neuralEnergy < ENERGY_TO_START) {
      alert("⚠️ ظرفیت عصبی برای برقراری لینک زنده کافی نیست.");
      return;
    }

    setIsConnecting(true);
    setNeuralEnergy(prev => Math.max(0, prev - ENERGY_TO_START));
    
    try {
      // Create a new GoogleGenAI instance right before making an API call per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      let systemInstruction = 'You are MMD ASSIST, a friendly AI created by MMDCRAFT.';
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmData = encodePCM(new Uint8Array(int16.buffer));
              // Use sessionPromise.then to avoid race conditions as per guidelines
              sessionPromise.then(session => session.sendRealtimeInput({ media: { data: pcmData, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtxRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioCtxRef.current) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
              const buffer = await decodeAudioData(decodePCM(audioData), outputAudioCtxRef.current, 24000, 1);
              const source = outputAudioCtxRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioCtxRef.current.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
          onerror: (e) => stopSession(),
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsConnecting(false);
      alert('Could not start voice session.');
    }
  };

  useEffect(() => { return () => stopSession(); }, [stopSession]);

  const getEnergyStatus = () => {
    if (neuralEnergy >= 100) return { color: `text-blue-400`, icon: ShieldCheck, label: 'لینک آماده (Stable)', animation: 'animate-none' };
    if (isCharging) return { color: 'text-cyan-400', icon: RefreshCw, label: 'شارژ فرکانس عصبی...', animation: 'animate-spin' };
    if (neuralEnergy > 40) return { color: `text-blue-400`, icon: Activity, label: 'اتصال فعال', animation: 'animate-pulse' };
    return { color: 'text-red-500', icon: ZapOff, label: 'ظرفیت رو به اتمام!', animation: 'animate-bounce' };
  };

  const energyStatus = getEnergyStatus();

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full px-4">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-white uppercase tracking-tight">MMD Live Assist</h2>
        <p className="text-slate-400 rtl">تجربه گفتگوی زنده توسط MMDCRAFT</p>
      </div>

      {/* نوار انرژی زنده */}
      <div className="w-full max-w-xs mb-10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <energyStatus.icon size={12} className={`${energyStatus.color} ${energyStatus.animation}`} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${energyStatus.color}`}>{energyStatus.label}</span>
          </div>
          <span className={`text-[9px] font-bold ${energyStatus.color}`}>{Math.round(neuralEnergy)}%</span>
        </div>
        <div className="h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all duration-1000 ${neuralEnergy < 30 ? 'bg-red-500' : 'bg-blue-500'}`} 
            style={{ width: `${neuralEnergy}%`, boxShadow: `0 0 8px ${neuralEnergy < 30 ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}` }} 
          />
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-12">
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`absolute w-48 h-48 rounded-full animate-ping bg-blue-500/10`} />
            <div className={`absolute w-64 h-64 rounded-full animate-pulse bg-blue-500/5`} />
          </div>
        )}
        
        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting || (neuralEnergy < ENERGY_TO_START && !isActive)}
          className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
            isActive ? 'bg-red-500' : (neuralEnergy < ENERGY_TO_START ? 'bg-slate-800' : 'bg-blue-600 hover:bg-blue-500')
          } ${isConnecting ? 'opacity-50' : ''}`}
        >
          {isConnecting ? <Loader2 className="animate-spin text-white" size={48} /> : isActive ? <PhoneOff size={48} className="text-white" /> : <Mic size={48} className="text-white" />}
        </button>
      </div>

      <div className="w-full flex-1 overflow-y-auto max-h-[30vh] space-y-4 px-4 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 shadow-inner">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase border-b border-slate-800 pb-2">
          <Info size={14} /> LIVE LOG INTERFACE
        </div>
        <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-40 py-10">
          <Volume2 size={32} className="mb-2" />
          <p className="text-xs rtl">در انتظار برقراری اتصال عصبی...</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
