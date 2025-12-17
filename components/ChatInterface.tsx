
import React, { useState, useRef, useEffect } from 'react';
import { generateChatResponse } from '../services/geminiService';
import { ChatMessage, AppSettings } from '../types';
import { Send, Globe, Loader2, User, Bot, ExternalLink, Trash2, Database, ShieldAlert, Sparkles } from 'lucide-react';

const STORAGE_KEY = 'mmd_assist_chat_history_v2';

interface Props {
  settings?: AppSettings;
}

const ChatInterface: React.FC<Props> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load memory", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const clearHistory = () => {
    if (window.confirm("آیا از پاک کردن حافظه گفتگو اطمینان دارید؟")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

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
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const response = await generateChatResponse(input, history, useSearch, settings);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls = groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title,
      })).filter((item: any) => item.uri) || [];

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "متاسفم، پاسخی دریافت نشد.",
        timestamp: Date.now(),
        groundingUrls: urls,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "خطا در اتصال. لطفا دوباره تلاش کنید.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 py-8 scroll-smooth scrollbar-hide"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl relative ${settings?.noRules ? 'bg-red-500/20 text-red-500' : 'bg-blue-600/20 text-blue-500'}`}>
              <Bot size={40} />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="animate-pulse" size={16} />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-black text-white tracking-tighter">MMD ASSIST</p>
              <p className="text-slate-400 rtl font-medium text-lg">سلام! چطور می‌توانم امروز بهت کمک کنم؟</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Database size={14} />
                Memory Active
              </div>
              {settings?.noRules && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                  <ShieldAlert size={14} />
                  Unrestricted
                </div>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl ring-1 ring-white/10 ${settings?.noRules ? 'bg-red-600' : 'bg-blue-600'}`}>
                <Bot size={20} className="text-white" />
              </div>
            )}
            <div 
              className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-2xl relative ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white font-medium' 
                : 'bg-slate-900/80 backdrop-blur-xl text-slate-100 border border-white/5'
              } ${isRTL(msg.text) ? 'rtl' : 'ltr'}`}
            >
              <div className="whitespace-pre-wrap text-base md:text-lg leading-relaxed">
                {msg.text}
              </div>
              {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Resources:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingUrls.map((link, idx) => (
                      <a 
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all border border-white/5"
                      >
                        <ExternalLink size={12} className="text-blue-400" />
                        <span className="truncate max-w-[150px] font-bold">{link.title || link.uri}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg">
                <User size={20} className="text-slate-400" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 animate-pulse">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${settings?.noRules ? 'bg-red-600' : 'bg-blue-600'}`}>
              <Bot size={20} className="text-white" />
            </div>
            <div className="max-w-[80%] bg-slate-900/50 border border-white/5 rounded-3xl px-6 py-4 flex items-center gap-2">
              <Loader2 className={`animate-spin ${settings?.noRules ? 'text-red-400' : 'text-blue-400'}`} size={20} />
              <span className="text-slate-500 text-sm font-bold rtl">در حال تایپ...</span>
            </div>
          </div>
        )}
      </div>

      <div className="pb-8 pt-4">
        <div className="relative group">
          <div className="absolute -top-12 left-0 right-0 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setUseSearch(!useSearch)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  useSearch 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
                  : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10'
                }`}
              >
                <Globe size={14} />
                {useSearch ? 'Search Live' : 'Enable Search'}
              </button>
            </div>
            {messages.length > 0 && (
              <button 
                onClick={clearHistory}
                className="flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <Trash2 size={14} /> Clear
              </button>
            )}
          </div>
          <div className="flex items-center bg-slate-900/50 backdrop-blur-2xl border border-white/10 rounded-3xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all p-3 shadow-2xl ring-1 ring-white/5 pr-5">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="پیامی بنویسید..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 py-3 px-4 resize-none max-h-40 overflow-y-auto rtl text-right text-lg font-medium"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`w-12 h-12 rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${settings?.noRules ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
