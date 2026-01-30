
import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, AppSettings } from '../types';
import { Send, Globe, Loader2, User, Bot, Trash2, Database, ShieldAlert, Sparkles, Clock, Zap, Cpu, Server, AlertCircle, ShieldCheck, Battery, BatteryLow, BatteryWarning, BatteryMedium, BatteryFull, Activity, ZapOff, RefreshCw } from 'lucide-react';

const STORAGE_KEY = 'mmd_assist_chat_history_v3';
const MAX_CONTEXT_MESSAGES = 10;
const MAX_ENERGY = 100;
const ENERGY_PER_MESSAGE = 20; 
const REFILL_RATE = 4; // افزایش سرعت شارژ برای تجربه بهتر
const REFILL_INTERVAL = 2000;

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

  // سیستم بازیابی هوشمند انرژی عصبی
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

  useEffect(() => {
    if (retryTimer !== null && retryTimer > 0) {
      const t = setTimeout(() => setRetryTimer(retryTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (retryTimer === 0) {
      setRetryTimer(null);
      setNeuralEnergy(40);
    }
  }, [retryTimer]);

  const clearHistory = () => {
    if (window.confirm("آیا از نابود کردن سوابق گفتگو اطمینان دارید؟")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || retryTimer !== null) return;
    
    if (neuralEnergy < ENERGY_PER_MESSAGE) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "⚠️ سطح ظرفیت عصبی بحرانی است. لطفاً منتظر شارژ مجدد هسته باشید.",
        timestamp: Date.now(),
      }]);
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
        text: response.text || "پردازش با موفقیت انجام شد اما محتوایی دریافت نشد.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      if (error?.message?.includes('429')) {
        setRetryTimer(20);
        setNeuralEnergy(0);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "⚠️ نوسان شدید در شبکه عصبی! سیستم به حالت استراحت رفت. شارژ مجدد تا ۲۰ ثانیه دیگر...",
          timestamp: Date.now(),
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "❌ خطا در همگام‌سازی عصبی. لطفاً فرکانس خود را چک کنید.",
          timestamp: Date.now(),
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);

  // تعیین وضعیت فوق پیشرفته باتری
  const getEnergyStatus = () => {
    if (neuralEnergy >= 100) return { color: `text-${settings.themeColor}-400`, icon: ShieldCheck, label: 'ظرفیت تکمیل (Peak)', animation: 'animate-none' };
    if (isCharging) return { color: 'text-blue-400', icon: RefreshCw, label: 'در حال شارژ هسته...', animation: 'animate-spin' };
    if (neuralEnergy > 70) return { color: `text-${settings.themeColor}-400`, icon: Zap, label: 'پایدار', animation: 'animate-pulse' };
    if (neuralEnergy > 30) return { color: 'text-amber-400', icon: Activity, label: 'مصرف انرژی بالا', animation: 'animate-none' };
    return { color: 'text-red-500', icon: ZapOff, label: 'بحران ظرفیت!', animation: 'animate-bounce' };
  };

  const energyStatus = getEnergyStatus();

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 md:px-6 relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 py-10 scroll-smooth scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative group">
              <div className={`absolute inset-0 blur-[100px] opacity-40 rounded-full animate-pulse transition-all duration-1000 ${settings?.noRules ? 'bg-red-500' : `bg-${settings.themeColor}-500`}`} />
              <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[3.5rem] flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.8)] relative border-2 transition-all duration-500 bg-black ${settings?.noRules ? 'border-red-500 text-red-500' : `border-${settings.themeColor}-500 text-${settings.themeColor}-400`}`}>
                <Bot size={72} strokeWidth={1} className="drop-shadow-[0_0_15px_currentColor]" />
                <div className="absolute -top-4 -right-4 p-4 bg-[#0a0f1d] rounded-2xl border border-white/10 shadow-2xl">
                  <ShieldCheck className={`text-${settings.themeColor}-400 animate-bounce`} size={24} />
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none rtl">
                MMD <span className={settings?.noRules ? 'text-red-500' : `text-${settings.themeColor}-500`}>Assist</span>
              </h2>
              <p className="text-slate-500 rtl font-black text-xs md:text-sm uppercase tracking-[0.5em]">بی‌نهایت پیام • دسترسی ۱۰۰٪ رایگان</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <div className={`flex items-center gap-3 px-6 py-3 bg-${settings.themeColor}-500/10 backdrop-blur-md rounded-[1.5rem] border border-${settings.themeColor}-500/20 text-${settings.themeColor}-500 text-[10px] font-black uppercase tracking-widest shadow-xl`}>
                <Zap size={16} className="animate-pulse" />
                هسته فوق سریع LITE فعال
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/10 backdrop-blur-md rounded-[1.5rem] border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest shadow-xl">
                <Database size={16} />
                حافظه لغزنده هوشمند
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl relative border-2 ${msg.role === 'user' ? 'bg-slate-900 border-white/20 text-white' : `bg-black border-${settings.themeColor}-500 text-${settings.themeColor}-400`}`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={22} />}
            </div>
            <div className={`flex flex-col gap-3 max-w-[85%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`rounded-[2rem] px-6 py-5 shadow-2xl border ${msg.role === 'user' ? `bg-${settings.themeColor}-600 text-white border-${settings.themeColor}-500` : 'bg-slate-900/80 backdrop-blur-xl text-slate-100 border-white/5'} ${isRTL(msg.text) ? 'rtl text-right' : 'ltr text-left'}`}>
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.text}</div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-6 animate-in fade-in duration-500">
            <div className={`w-12 h-12 rounded-2xl bg-black border-2 border-${settings.themeColor}-500/30 flex items-center justify-center`}>
              <Loader2 className={`animate-spin text-${settings.themeColor}-500`} size={20} />
            </div>
            <div className={`bg-${settings.themeColor}-500/5 backdrop-blur-xl border border-${settings.themeColor}-500/10 rounded-[2rem] px-6 py-4 flex gap-2`}>
              <div className={`w-2 h-2 bg-${settings.themeColor}-500 rounded-full animate-bounce`} style={{animationDelay: '0ms'}} />
              <div className={`w-2 h-2 bg-${settings.themeColor}-500 rounded-full animate-bounce`} style={{animationDelay: '200ms'}} />
              <div className={`w-2 h-2 bg-${settings.themeColor}-500 rounded-full animate-bounce`} style={{animationDelay: '400ms'}} />
            </div>
          </div>
        )}
      </div>

      <div className="pb-10 pt-4">
        <div className="relative space-y-3">
          {/* نوار وضعیت پیشرفته انرژی عصبی */}
          <div className="px-6 flex items-center justify-between transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className={`p-1 rounded-md bg-white/5 border border-white/5 ${energyStatus.color}`}>
                <energyStatus.icon size={12} className={energyStatus.animation} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider ${energyStatus.color} drop-shadow-[0_0_5px_currentColor]`}>
                {energyStatus.label} — {Math.round(neuralEnergy)}%
              </span>
            </div>
            {isCharging && neuralEnergy < 100 && (
              <div className="flex items-center gap-1.5 animate-pulse">
                <div className="w-1 h-1 bg-blue-400 rounded-full" />
                <span className="text-[8px] text-blue-400 font-black uppercase tracking-tighter">Neural Refill Active</span>
              </div>
            )}
            {neuralEnergy >= 100 && !isLoading && (
              <div className="flex items-center gap-1.5 text-emerald-500">
                <Sparkles size={10} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Ready to Assist</span>
              </div>
            )}
          </div>
          
          <div className="mx-6 h-2 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] relative">
            {/* گرید پس‌زمینه نوار */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:4px_4px]" />
            <div 
              className={`h-full transition-all duration-1000 relative ${
                neuralEnergy < 30 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 
                isCharging ? 'bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]' :
                `bg-${settings.themeColor}-500 shadow-[0_0_15px_currentColor]`
              }`} 
              style={{ width: `${neuralEnergy}%` }} 
            >
              {/* انیمیشن درخشش در حال حرکت */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-20 animate-[shimmer_2s_infinite] skew-x-12" />
            </div>
          </div>

          {retryTimer !== null && (
            <div className="absolute -top-16 left-0 right-0 flex justify-center z-20">
              <div className="px-6 py-3 bg-red-600/90 backdrop-blur-md text-white font-black text-xs rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center gap-3 animate-in slide-in-from-bottom-4 border border-red-500/50">
                <Clock size={16} className="animate-spin" />
                تخلیه کامل ظرفیت! بازیابی تا: {retryTimer} ثانیه دیگر
              </div>
            </div>
          )}
          
          <div className={`flex items-center bg-[#070b14]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl transition-all ${retryTimer !== null || neuralEnergy < 10 ? 'opacity-50 grayscale cursor-not-allowed' : `focus-within:border-${settings.themeColor}-500/50 focus-within:ring-4 focus-within:ring-${settings.themeColor}-500/10`}`}>
            <textarea
              rows={1}
              value={input}
              disabled={retryTimer !== null || neuralEnergy < 10}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={retryTimer !== null ? "در حال شارژ مجدد هسته..." : neuralEnergy < 10 ? "در انتظار ظرفیت عصبی..." : "پیام خود را اینجا بنویسید..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-700 py-3 px-5 resize-none rtl text-right text-lg font-bold"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading || retryTimer !== null || neuralEnergy < 10}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl active:scale-90 disabled:opacity-20 bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-500 text-white group`}
            >
              <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-${settings.themeColor}-500 animate-pulse shadow-[0_0_8px_currentColor]`} />
              <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Neural Energy System v3.0 | MMD Assist</span>
            </div>
            <button onClick={clearHistory} className="text-[8px] text-slate-700 hover:text-red-500 font-black uppercase tracking-widest transition-colors flex items-center gap-1 group">
              <Trash2 size={10} className="group-hover:rotate-12 transition-transform" /> پاکسازی تاریخچه عصبی
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          from { transform: translateX(-100%) skewX(-12deg); }
          to { transform: translateX(500%) skewX(-12deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
