
import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, AppSettings } from '../types';
import { Send, Globe, Loader2, User, Bot, Trash2, Database, ShieldAlert, Sparkles, Clock, Zap, Cpu, Server, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'mmd_assist_chat_history_v3';
// حداکثر پیام‌هایی که در هر بار برای مدل فرستاده می‌شود تا حافظه پر نشود (بی‌نهایت کردن چت)
const MAX_CONTEXT_MESSAGES = 12; 

interface Props {
  settings: AppSettings;
}

const ChatInterface: React.FC<Props> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(settings.autoSearch);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
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

    return () => {
      if (settings.autoClearHistory) {
        localStorage.removeItem(STORAGE_KEY);
      }
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm("آیا از نابود کردن سوابق گفتگو اطمینان دارید؟ این عملیات غیرقابل بازگشت است.")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setErrorStatus(null);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // پیاده‌سازی Sliding Window برای ارسال به API (بی‌نهایت کردن چت)
      // فقط آخرین پیام‌های حیاتی را برای مدل می‌فرستیم تا محدودیت توکن پیش نیاید
      const contextHistory = messages.slice(-MAX_CONTEXT_MESSAGES).map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await generateChatResponse(input, contextHistory, useSearch || settings.autoSearch, settings);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "خطای پردازشی: پاسخی تولید نشد.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error(error);
      let errorMessage = "خطا در برقراری ارتباط با شبکه عصبی.";
      
      if (error?.message?.includes('429')) {
        errorMessage = "سهمیه ثانیه‌ای رایگان پر شد! لطفا ۵ الی ۱۰ ثانیه صبر کنید و دوباره پیام بدهید. (محدودیت Rate-Limit)";
        setErrorStatus("RATE_LIMIT");
      } else if (error?.message?.includes('context')) {
        errorMessage = "محیط گفتگو بیش از حد سنگین شده است. در حال بازنشانی خودکار حافظه...";
        setMessages(prev => prev.slice(-4)); // کاهش دستی حافظه در صورت خطا
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: errorMessage,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'small': return 'text-[14px] leading-relaxed';
      case 'large': return 'text-[20px] leading-relaxed';
      default: return 'text-[16px] leading-relaxed';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto w-full px-4 md:px-6 relative">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-10 py-10 scroll-smooth scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-10 animate-in fade-in zoom-in duration-1000">
            <div className="relative group">
              {settings.neuralGlow && (
                <div className={`absolute inset-0 blur-[80px] opacity-40 rounded-full animate-pulse transition-all duration-1000 ${settings?.noRules ? 'bg-red-500' : `bg-${settings.themeColor}-500`}`} />
              )}
              <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[3rem] flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.8)] relative border-2 transition-all duration-500 ${settings?.noRules ? 'bg-black border-red-500 text-red-500' : `bg-black border-${settings.themeColor}-500/50 text-${settings.themeColor}-400 group-hover:border-${settings.themeColor}-400`}`}>
                <Bot size={72} strokeWidth={1} className="drop-shadow-[0_0_15px_currentColor]" />
                <div className="absolute -top-4 -right-4 p-4 bg-[#0a0f1d] rounded-2xl border border-white/10 shadow-2xl group-hover:rotate-12 transition-transform">
                  <Sparkles className="text-amber-400 animate-pulse" size={24} />
                </div>
                <div className="absolute -bottom-4 -left-4 p-3 bg-[#0a0f1d] rounded-2xl border border-white/10 shadow-2xl">
                  <Cpu className={`text-${settings.themeColor}-400 animate-pulse`} size={20} />
                </div>
              </div>
            </div>
            
            <div className="space-y-5">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none rtl font-bold">
                MMD <span className={settings?.noRules ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : `text-${settings.themeColor}-500 drop-shadow-[0_0_20px_currentColor]`}>Assist</span>
              </h2>
              <div className="flex items-center justify-center gap-4">
                 <div className="h-[1px] w-12 bg-white/10" />
                 <p className="text-slate-500 rtl font-black text-xs md:text-sm uppercase tracking-[0.5em] font-bold">هوش مصنوعی با دسترسی بی‌نهایت</p>
                 <div className="h-[1px] w-12 bg-white/10" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-6">
              {[
                { icon: Database, label: "حافظه لغزنده فعال", color: "blue" },
                { icon: Zap, label: "پردازش رایگان", color: "amber" },
                { icon: Server, label: "هسته نسخه 4.5", color: "purple" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-[1.5rem] border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors shadow-xl">
                  <item.icon size={16} className={`text-${item.color}-500`} />
                  {item.label}
                </div>
              ))}
              {settings?.noRules && (
                <div className="flex items-center gap-3 px-6 py-3 bg-red-500/10 backdrop-blur-md rounded-[1.5rem] border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse shadow-2xl shadow-red-500/10">
                  <ShieldAlert size={16} />
                  دسترسی نامحدود
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.5rem] flex items-center justify-center flex-shrink-0 shadow-2xl relative border-2 transition-all duration-500 ${
              msg.role === 'user' 
              ? 'bg-slate-900 border-white/20 text-white' 
              : settings?.noRules ? 'bg-black border-red-500 text-red-500' : `bg-black border-${settings.themeColor}-500 text-${settings.themeColor}-400`
            }`}>
              {msg.role === 'user' ? <User size={24} /> : <Bot size={26} className="drop-shadow-[0_0_8px_currentColor]" />}
              {msg.role === 'model' && (
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${settings.noRules ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              )}
            </div>

            <div className={`flex flex-col gap-3 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div 
                className={`relative rounded-[2.5rem] px-8 py-6 shadow-[0_40px_100px_rgba(0,0,0,0.6)] border transition-all duration-500 ${
                  msg.role === 'user' 
                  ? `bg-gradient-to-br ${settings.noRules ? 'from-red-600 to-red-800' : `from-${settings.themeColor}-600 to-${settings.themeColor}-800`} text-white border-white/20` 
                  : 'bg-[#0a0f1d]/80 backdrop-blur-3xl text-slate-100 border-white/10'
                } ${isRTL(msg.text) ? 'rtl text-right' : 'ltr text-left'}`}
              >
                {msg.role === 'model' && settings.neuralGlow && (
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 pointer-events-none bg-${settings.themeColor}-500`} />
                )}
                
                <div className={`whitespace-pre-wrap font-medium tracking-tight ${getFontSizeClass()}`}>
                  {msg.text}
                </div>
              </div>
              
              {settings.showTimestamp && (
                <div className="flex items-center gap-2 text-[10px] text-slate-600 font-black uppercase tracking-widest px-6">
                  <Clock size={12} />
                  {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-6 animate-in fade-in slide-in-from-left-6 duration-700">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.5rem] flex items-center justify-center bg-black border-2 border-slate-800 text-slate-500`}>
              <Bot size={26} className="animate-pulse" />
            </div>
            <div className="bg-[#0a0f1d]/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] px-8 py-6 flex flex-col gap-4 shadow-2xl min-w-[200px]">
               <div className="flex items-center gap-4">
                 <Loader2 className={`animate-spin ${settings.noRules ? 'text-red-500' : `text-${settings.themeColor}-400`}`} size={20} />
                 <span className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] rtl font-bold">در حال پردازش عصبی...</span>
               </div>
               <div className="flex gap-2 items-center">
                 <div className={`w-3 h-3 rounded-full animate-bounce bg-${settings.themeColor}-500 shadow-[0_0_10px_currentColor]`} style={{animationDelay: '0ms'}} />
                 <div className={`w-3 h-3 rounded-full animate-bounce bg-${settings.themeColor}-500 shadow-[0_0_10px_currentColor]`} style={{animationDelay: '200ms'}} />
                 <div className={`w-3 h-3 rounded-full animate-bounce bg-${settings.themeColor}-500 shadow-[0_0_10px_currentColor]`} style={{animationDelay: '400ms'}} />
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="pb-10 pt-4">
        <div className="relative group">
          <div className="absolute -top-14 left-0 right-0 flex items-center justify-between px-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setUseSearch(!useSearch)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                  useSearch || settings.autoSearch
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                  : 'bg-black/60 text-slate-600 border-white/5 hover:text-slate-300'
                }`}
              >
                <Globe size={14} />
                Grounding: {useSearch || settings.autoSearch ? 'Online' : 'Offline'}
              </button>
              {errorStatus === "RATE_LIMIT" && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black border border-amber-500/20 animate-pulse rtl">
                  <AlertCircle size={14} />
                  تأخیر اجباری: چند ثانیه صبر کنید...
                </div>
              )}
            </div>
            {messages.length > 0 && (
              <button 
                onClick={clearHistory}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
              >
                <Trash2 size={14} /> Purge Memory
              </button>
            )}
          </div>

          <div className={`flex items-center bg-[#070b14]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all ring-1 ring-white/10 focus-within:ring-4 focus-within:ring-${settings.themeColor}-500/30 group-hover:border-white/20`}>
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="هر چه می‌خواهید بپرسید... (بی‌نهایت و رایگان)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-800 py-4 px-6 resize-none max-h-48 rtl text-right text-xl font-bold"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-16 h-16 rounded-[2rem] flex items-center justify-center transition-all shadow-2xl active:scale-90 disabled:opacity-30 flex-shrink-0 group/btn ${
                settings?.noRules 
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' 
                : `bg-${settings.themeColor}-600 hover:bg-${settings.themeColor}-500 shadow-${settings.themeColor}-500/30`
              }`}
            >
              <Send size={28} className="text-white group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
