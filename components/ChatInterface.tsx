
import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, AppSettings } from '../types';
import { Send, Globe, Loader2, User, Bot, Trash2, Database, ShieldAlert, Sparkles, Clock, Zap, Cpu, Server, AlertCircle, ShieldCheck, Battery, BatteryLow, BatteryWarning, BatteryMedium, BatteryFull, Activity, ZapOff, RefreshCw, Unlock } from 'lucide-react';

const STORAGE_KEY = 'mmd_assist_chat_history_v3';
const MAX_CONTEXT_MESSAGES = 10;
const MAX_ENERGY = 100;
const ENERGY_PER_MESSAGE = 15; 
const REFILL_RATE = 5; 
const REFILL_INTERVAL = 1500;

interface Props {
  settings: AppSettings;
}

const ChatInterface: React.FC<Props> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(settings.autoSearch);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
  const [neuralEnergy, setNeuralEnergy] = useState(MAX_ENERGY);
  const [isCharging, setIsCharging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Memory Corruption Detected", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading || retryTimer !== null) return;
    
    if (neuralEnergy < ENERGY_PER_MESSAGE) {
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "⚠️ هشدار: ظرفیت عصبی کافی نیست. هسته در حال بازیابی توان پردازشی است.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setNeuralEnergy(prev => Math.max(0, prev - ENERGY_PER_MESSAGE));

    try {
      const contextHistory = messages.slice(-MAX_CONTEXT_MESSAGES).map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await generateChatResponse(input, contextHistory, useSearch || settings.autoSearch, settings);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "پردازش انجام شد اما دیتایی دریافت نشد.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "❌ خطای سیستمی: اتصال با هسته مرکزی قطع شد. لطفاً فرکانس را مجدد تنظیم کنید.",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);
  const accentColor = settings.noRules ? 'red' : settings.themeColor;

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 lg:px-12 relative overflow-hidden">
      {/* Neural Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 py-10 scroll-smooth scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-12 animate-in fade-in zoom-in duration-1000">
            <div className="relative">
              <div className={`absolute inset-0 blur-[120px] opacity-40 rounded-full animate-pulse transition-all duration-1000 bg-${accentColor}-600`} />
              <div className={`w-36 h-36 lg:w-48 lg:h-48 rounded-[3rem] glass-panel flex items-center justify-center relative border-2 border-${accentColor}-500/30 group transition-all duration-700 hover:rotate-6`}>
                <Bot size={80} strokeWidth={1} className={`text-${accentColor}-400 drop-shadow-[0_0_20px_currentColor]`} />
                <div className="absolute -bottom-4 -right-4 p-5 bg-slate-950 rounded-[1.5rem] border border-white/10 shadow-2xl">
                   {settings.noRules ? <Unlock className="text-red-500 animate-pulse" size={24} /> : <ShieldCheck className={`text-${settings.themeColor}-400 animate-bounce`} size={24} />}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                SYSTEM <span className={settings.noRules ? 'text-red-500' : `text-${settings.themeColor}-400`}>READY</span>
              </h2>
              <p className="text-slate-500 font-black text-xs lg:text-sm uppercase tracking-[0.6em] animate-pulse">Waiting for Operator Commands</p>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-5 animate-in fade-in slide-in-from-bottom-10 duration-700 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-2xl lg:rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl border-2 transition-transform hover:scale-110 ${msg.role === 'user' ? 'bg-slate-900 border-white/20 text-white' : `bg-black border-${accentColor}-500 text-${accentColor}-400`}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={24} />}
            </div>
            <div className={`flex flex-col gap-2 max-w-[85%] lg:max-w-[70%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`rounded-3xl lg:rounded-[2.5rem] px-8 py-6 shadow-2xl border transition-all ${msg.role === 'user' ? `bg-${accentColor}-600 text-white border-${accentColor}-500 shadow-${accentColor}-500/10` : 'glass-panel text-slate-100 border-white/10'} ${isRTL(msg.text) ? 'rtl text-right font-bold' : 'ltr text-left font-bold'}`}>
                <div className="whitespace-pre-wrap text-[16px] lg:text-[18px] leading-relaxed">{msg.text}</div>
              </div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-4">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-end gap-5 animate-in fade-in duration-500">
             <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-[1.5rem] bg-black border-2 border-${accentColor}-500/30 flex items-center justify-center`}>
               <Loader2 className={`animate-spin text-${accentColor}-500`} size={24} />
             </div>
             <div className="glass-panel rounded-[2rem] px-8 py-5 flex gap-2 items-center">
               <div className={`w-2.5 h-2.5 bg-${accentColor}-500 rounded-full animate-bounce`} style={{animationDelay: '0ms'}} />
               <div className={`w-2.5 h-2.5 bg-${accentColor}-500 rounded-full animate-bounce`} style={{animationDelay: '200ms'}} />
               <div className={`w-2.5 h-2.5 bg-${accentColor}-500 rounded-full animate-bounce`} style={{animationDelay: '400ms'}} />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">Neural Link Active</span>
             </div>
          </div>
        )}
      </div>

      {/* Modern Command Pod */}
      <div className="pb-10 pt-4 px-2">
        <div className="relative group">
          {/* Energy Perimeter Aura */}
          <div className={`absolute -inset-1.5 blur-xl opacity-20 group-focus-within:opacity-50 transition-opacity duration-1000 bg-${accentColor}-500`} />
          
          <div className="relative space-y-4">
            <div className={`flex items-center justify-between glass-panel border-white/10 rounded-[2.5rem] p-3 transition-all ${neuralEnergy < 15 ? 'opacity-40 grayscale pointer-events-none' : 'focus-within:ring-2 focus-within:ring-white/10'}`}>
              <textarea
                rows={1}
                value={input}
                disabled={isLoading || neuralEnergy < 15}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="ارسال دستور به هسته عصبی..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-600 py-4 px-6 resize-none rtl text-right text-lg font-black"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || neuralEnergy < 15}
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-[1.8rem] flex items-center justify-center transition-all shadow-2xl active:scale-90 disabled:opacity-20 bg-${accentColor}-600 hover:bg-${accentColor}-500 text-white group`}
              >
                <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>

            {/* Neural Power Bar */}
            <div className="flex items-center gap-6 px-6">
               <div className="flex items-center gap-2">
                  <Activity size={12} className={neuralEnergy < 30 ? 'text-red-500 animate-pulse' : `text-${accentColor}-400`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${neuralEnergy < 30 ? 'text-red-500' : 'text-slate-500'}`}>Capacity: {Math.round(neuralEnergy)}%</span>
               </div>
               <div className="flex-1 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5 relative">
                  <div 
                    className={`h-full transition-all duration-1000 relative ${neuralEnergy < 30 ? 'bg-red-500' : isCharging ? 'bg-blue-500' : `bg-${accentColor}-500`}`} 
                    style={{ width: `${neuralEnergy}%`, boxShadow: `0 0 15px currentColor` }} 
                  />
               </div>
               {settings.noRules && (
                 <div className="flex items-center gap-2 text-red-500 font-black italic animate-pulse">
                    <ShieldAlert size={12} />
                    <span className="text-[9px] uppercase tracking-tighter">Unfiltered Access</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
