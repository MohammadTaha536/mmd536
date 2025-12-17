
import React, { useState, useEffect } from 'react';
import { AppMode, AppSettings } from './types';
import ChatInterface from './components/ChatInterface';
import ImageGenInterface from './components/ImageGenInterface';
import VoiceInterface from './components/VoiceInterface';
import SettingsModal from './components/SettingsModal';
import RadioPlayer from './components/RadioPlayer';
import { MessageSquare, Image as ImageIcon, Mic, Sparkles, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

const STORAGE_SETTINGS_KEY = 'mmd_assist_settings_v6';

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
    radioStation: 'ava'
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...parsed, isRadioPlaying: false });
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

  const Navigation = () => (
    <nav className="flex items-center justify-center gap-1.5 bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-1.5 rounded-3xl shadow-2xl ring-1 ring-white/5">
      {[
        { id: AppMode.CHAT, icon: MessageSquare, label: 'Chat', color: 'bg-blue-600' },
        { id: AppMode.IMAGE, icon: ImageIcon, label: 'Vision', color: 'bg-purple-600' },
        { id: AppMode.VOICE, icon: Mic, label: 'Live', color: 'bg-emerald-600' },
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setMode(tab.id)}
          className={`group flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 ${
            mode === tab.id 
            ? `${tab.color} text-white shadow-lg shadow-white/5` 
            : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <tab.icon size={18} className={mode === tab.id ? 'scale-110 transition-transform' : ''} />
          <span className="hidden lg:inline text-xs tracking-wide">{tab.label}</span>
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex flex-col h-screen bg-[#05080f] overflow-hidden text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] transition-colors duration-1000 ${settings.noRules ? 'bg-red-500/10' : 'bg-blue-600/10'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[150px] transition-colors duration-1000 ${settings.noRules ? 'bg-orange-500/5' : 'bg-cyan-600/10'}`} />
      </div>

      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-slate-950/20 backdrop-blur-2xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-2xl shadow-blue-500/40 relative">
            <Sparkles className="text-white" size={24} />
            <div className="absolute inset-0 rounded-2xl animate-pulse bg-white/20 blur-sm" />
          </div>
          <div className="rtl text-right">
            <h1 className="text-2xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent tracking-tighter uppercase leading-none">MMD ASSIST</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-blue-500 font-black mt-1">توسط MMD CRAFT برای اوشن کرفت</p>
          </div>
        </div>
        
        <Navigation />

        <div className="flex items-center gap-4">
          <RadioPlayer 
            isPlaying={settings.isRadioPlaying} 
            onToggle={handleRadioToggle}
            currentStation={settings.radioStation}
            onStationChange={handleStationChange}
          />
          
          <div className="hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <ShieldCheck size={14} className={settings.noRules ? "text-red-500 animate-pulse" : "text-emerald-500"} />
            {settings.noRules ? "Unlocked" : "Secure"}
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white hover:scale-105 active:scale-95 shadow-lg"
          >
            <SettingsIcon size={22} />
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10 overflow-hidden">
        <div className="h-full w-full">
          {mode === AppMode.CHAT && <ChatInterface settings={settings} />}
          {mode === AppMode.IMAGE && <ImageGenInterface />}
          {mode === AppMode.VOICE && <VoiceInterface settings={settings} />}
        </div>
      </main>

      <footer className="px-8 py-4 border-t border-white/5 text-center bg-slate-950/40 backdrop-blur-xl relative z-20">
        <p className="text-xs text-slate-500 rtl font-medium flex items-center justify-center gap-2">
          <span>ساخته شده با عشق برای</span>
          <span className="text-blue-400 font-black tracking-widest px-2 py-0.5 bg-blue-500/10 rounded-lg">OCEAN CRAFT</span>
          <span>توسط</span>
          <span className="text-slate-200 font-black tracking-widest px-2 py-0.5 bg-white/5 rounded-lg">MMD CRAFT</span>
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
