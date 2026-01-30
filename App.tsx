
import React, { useState, useEffect } from 'react';
import { AppMode, AppSettings, ThemeColor } from './types';
import ChatInterface from './components/ChatInterface';
import ImageGenInterface from './components/ImageGenInterface';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';
import RadioPlayer from './components/RadioPlayer';
import { MessageSquare, Image as ImageIcon, Mic, Sparkles, Settings as SettingsIcon, Terminal } from 'lucide-react';

const STORAGE_SETTINGS_KEY = 'mmd_assist_settings_v9';

const THEME_MAP: Record<ThemeColor, string> = {
  blue: 'from-blue-600 to-cyan-400',
  purple: 'from-purple-600 to-fuchsia-400',
  emerald: 'from-emerald-600 to-teal-400',
  rose: 'from-rose-600 to-pink-400',
  amber: 'from-amber-600 to-orange-400',
};

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CHAT);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    isInformal: false,
    noRules: false,
    userName: '',
    userJob: '',
    userContext: '',
    isRadioPlaying: false,
    radioStation: 'ava',
    themeColor: 'blue',
    aiCreativity: 0.7,
    responseLength: 'detailed',
    autoSearch: false,
    fontSize: 'medium',
    showTimestamp: true,
    enableThinking: false,
    thinkingBudget: 0,
    modelTier: 'flash',
    systemOverclock: false,
    showDebugLogs: false,
    enableAnimations: true,
    autoClearHistory: false,
    voiceSpeed: 1.0,
    languageMode: 'auto',
    neuralGlow: true,
    glassOpacity: 0.8,
    visualBypass: false
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(prev => ({ ...prev, ...parsed, isRadioPlaying: false }));
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(newSettings));
  };

  const handleRadioToggle = (isPlaying: boolean) => {
    updateSettings({ ...settings, isRadioPlaying: isPlaying });
  };

  const handleStationChange = (station: 'ava' | 'javan') => {
    updateSettings({ ...settings, radioStation: station });
  };

  const NavItems = [
    { id: AppMode.CHAT, icon: MessageSquare, label: 'هسته گفتگو' },
    { id: AppMode.IMAGE, icon: ImageIcon, label: 'موتور تصویر' },
    { id: AppMode.VOICE, icon: Mic, label: 'لینک زنده' },
  ];

  return (
    <div className={`flex flex-col h-[100dvh] bg-[#02040a] overflow-hidden text-slate-200 font-sans selection:bg-${settings.themeColor}-500/30 transition-all duration-700`}>
      {/* Background FX */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-20 transition-all duration-1000 ${settings.noRules ? 'bg-red-600' : `bg-${settings.themeColor}-600`}`} />
        <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[150px] opacity-10 transition-all duration-1000 bg-slate-600`} />
        {settings.enableAnimations && (
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20" />
        )}
      </div>

      <header className="flex items-center justify-between px-4 md:px-10 py-5 md:py-7 border-b border-white/5 bg-slate-950/20 backdrop-blur-3xl z-30 relative ring-1 ring-white/5">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 md:w-14 md:h-14 rounded-[1.5rem] bg-gradient-to-tr ${THEME_MAP[settings.themeColor]} flex items-center justify-center shadow-2xl relative flex-shrink-0 group hover:rotate-6 transition-all duration-500`}>
             <Sparkles className="text-white scale-90 md:scale-110" size={28} />
             <div className="absolute inset-0 rounded-[1.5rem] animate-pulse bg-white/10 blur-md" />
          </div>
          <div className="rtl text-right">
            <h1 className="text-xl md:text-3xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tighter uppercase leading-none italic">
              MMD <span className={settings.noRules ? 'text-red-500' : `text-${settings.themeColor}-500`}>Assist</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${settings.noRules ? 'bg-red-500' : 'bg-emerald-500'}`} />
               <p className={`text-[8px] md:text-[10px] uppercase tracking-[0.4em] font-black text-slate-500`}>سیستم عصبی فعال</p>
            </div>
          </div>
        </div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-2xl border border-white/10 p-2 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5">
          {NavItems.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.8rem] font-black uppercase tracking-widest text-[10px] transition-all duration-500 relative overflow-hidden group ${
                  isActive ? 'bg-white/5 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'text-slate-500 hover:text-white'
                }`}
              >
                {isActive && <div className={`absolute inset-0 bg-${settings.themeColor}-500/10 animate-pulse`} />}
                <tab.icon size={16} className={isActive ? `text-${settings.themeColor}-400` : 'group-hover:scale-110 transition-transform'} />
                <span className="rtl font-bold">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <RadioPlayer 
            isPlaying={settings.isRadioPlaying} 
            onToggle={handleRadioToggle}
            currentStation={settings.radioStation}
            onStationChange={handleStationChange}
          />
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 md:w-14 md:h-14 rounded-2xl md:rounded-[1.5rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white shadow-2xl flex items-center justify-center relative group overflow-hidden"
          >
            <SettingsIcon size={24} className="group-hover:rotate-90 transition-transform duration-700" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10 overflow-hidden pb-[80px] md:pb-0">
        <div className="h-full w-full">
          {mode === AppMode.CHAT && <ChatInterface settings={settings} />}
          {mode === AppMode.IMAGE && <ImageGenInterface settings={settings} />}
          {mode === AppMode.VOICE && <VoiceInterface settings={settings} />}
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-6">
        <nav className="flex items-center justify-around bg-black/60 backdrop-blur-3xl border border-white/10 p-3 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] ring-1 ring-white/10">
          {NavItems.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex flex-col items-center justify-center gap-1.5 px-6 py-3 rounded-2xl transition-all duration-500 ${
                  isActive ? 'bg-white/5 text-white scale-105 shadow-xl' : 'text-slate-600'
                }`}
              >
                <tab.icon size={22} className={isActive ? `text-${settings.themeColor}-400` : ''} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <footer className="hidden md:flex items-center justify-between px-10 py-5 border-t border-white/5 bg-slate-950/20 backdrop-blur-3xl relative z-20">
         <div className="flex items-center gap-3">
            <Terminal size={14} className="text-slate-700" />
            <span className="text-[9px] text-slate-700 font-black uppercase tracking-[0.5em]">وضعیت سیستم: نرمال</span>
         </div>
         <p className="text-[10px] text-slate-600 rtl font-black flex items-center gap-3 italic">
          <span>هویت سازنده:</span>
          <span className={`px-3 py-1 bg-white/5 rounded-lg text-slate-300 font-black uppercase tracking-widest`}>MMDCRAFT</span>
        </p>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export default App;
