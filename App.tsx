
import React, { useState, useEffect } from 'react';
import { AppMode, AppSettings, ThemeColor, UserProfile } from './types';
import ChatInterface from './components/ChatInterface';
import ImageGenInterface from './components/ImageGenInterface';
import VoiceInterface from './components/VoiceInterface';
import AppBuilderInterface from './components/AppBuilderInterface';
import SettingsModal from './components/SettingsModal';
import AuthOverlay from './components/AuthOverlay';
import RadioPlayer from './components/RadioPlayer';
import { MessageSquare, Image as ImageIcon, Mic, Sparkles, Settings as SettingsIcon, Terminal, Code2, ShieldCheck, Activity, Command } from 'lucide-react';

const STORAGE_SETTINGS_KEY = 'mmd_assist_settings_v10';

const THEME_MAP: Record<ThemeColor, string> = {
  blue: 'from-blue-600 via-blue-500 to-cyan-400',
  purple: 'from-purple-600 via-purple-500 to-fuchsia-400',
  emerald: 'from-emerald-600 via-emerald-500 to-teal-400',
  rose: 'from-rose-600 via-rose-500 to-pink-400',
  amber: 'from-amber-600 via-amber-500 to-orange-400',
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
    visualBypass: false,
    userProfile: { id: '', name: '', role: '', isLoggedIn: false, registrationDate: 0 }
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

  const handleLogin = (profile: UserProfile) => {
    updateSettings({ 
      ...settings, 
      userProfile: profile,
      userName: profile.name,
      userJob: profile.role
    });
  };

  const NavItems = [
    { id: AppMode.CHAT, icon: MessageSquare, label: 'گفتگو' },
    { id: AppMode.IMAGE, icon: ImageIcon, label: 'تصویر' },
    { id: AppMode.APPS, icon: Code2, label: 'اپلیکیشن' },
    { id: AppMode.VOICE, icon: Mic, label: 'صدا' },
  ];

  if (!settings.userProfile.isLoggedIn) {
    return <AuthOverlay themeColor={settings.themeColor} onLogin={handleLogin} />;
  }

  const accentColor = settings.noRules ? 'red' : settings.themeColor;

  return (
    <div className={`flex flex-col h-[100dvh] bg-[#02040a] overflow-hidden text-slate-200 selection:bg-${accentColor}-500/30 transition-all duration-700`}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full blur-[180px] opacity-20 transition-all duration-1000 bg-${accentColor}-600/40`} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full blur-[150px] opacity-10 bg-slate-600/30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <header className="flex items-center justify-between px-6 md:px-12 py-6 bg-slate-950/40 backdrop-blur-3xl z-30 border-b border-white/5 relative">
        <div className="flex items-center gap-6">
          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-gradient-to-tr ${THEME_MAP[settings.themeColor]} p-[1px] shadow-2xl group transition-all duration-500 hover:rotate-6`}>
             <div className="w-full h-full bg-slate-950 rounded-[calc(1.5rem-1px)] flex items-center justify-center relative overflow-hidden">
                <Sparkles className={`text-${settings.themeColor}-400 group-hover:scale-110 transition-transform`} size={28} />
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
             </div>
          </div>
          <div className="text-right">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-2">
              <span className="text-white">MMD</span>
              <span className={settings.noRules ? 'text-red-500 text-glow' : `text-${settings.themeColor}-400 text-glow`}>Assist</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
               <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-lg">
                  <Activity size={10} className="text-emerald-500" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Stable</span>
               </div>
               <p className="text-[9px] uppercase tracking-[0.4em] font-black text-slate-500">OP: {settings.userProfile.name}</p>
            </div>
          </div>
        </div>
        
        <nav className="hidden lg:flex items-center gap-2 bg-black/40 backdrop-blur-2xl border border-white/10 p-1.5 rounded-[2rem] shadow-2xl">
          {NavItems.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-3 px-8 py-4 rounded-[1.6rem] transition-all duration-500 relative group overflow-hidden ${
                  isActive ? 'bg-white/10 text-white shadow-xl' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {isActive && <div className={`absolute inset-0 bg-${accentColor}-500/10 animate-pulse`} />}
                <tab.icon size={18} className={isActive ? `text-${accentColor}-400` : 'group-hover:scale-110 transition-transform'} />
                <span className="font-black text-[11px] uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden md:block">
            <RadioPlayer 
              isPlaying={settings.isRadioPlaying} 
              onToggle={(p) => updateSettings({...settings, isRadioPlaying: p})}
              currentStation={settings.radioStation}
              onStationChange={(s) => updateSettings({...settings, radioStation: s})}
            />
          </div>
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 h-12 md:w-16 md:h-16 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-slate-400 hover:text-white shadow-2xl flex items-center justify-center group overflow-hidden"
          >
            <SettingsIcon size={26} className="group-hover:rotate-90 transition-transform duration-700" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10 overflow-hidden pb-[100px] lg:pb-0">
        <div className="h-full w-full">
          {mode === AppMode.CHAT && <ChatInterface settings={settings} />}
          {mode === AppMode.IMAGE && <ImageGenInterface settings={settings} />}
          {mode === AppMode.APPS && <AppBuilderInterface settings={settings} />}
          {mode === AppMode.VOICE && <VoiceInterface settings={settings} />}
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-6 pb-8">
        <nav className="flex items-center justify-around bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-2.5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {NavItems.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-3xl transition-all duration-500 ${
                  isActive ? 'bg-white/10 text-white scale-105' : 'text-slate-600'
                }`}
              >
                <tab.icon size={24} className={isActive ? `text-${accentColor}-400` : ''} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <footer className="hidden lg:flex items-center justify-between px-12 py-6 border-t border-white/5 bg-slate-950/40 backdrop-blur-3xl relative z-20">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-slate-600" />
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Core v4.5.1</span>
            </div>
            <div className="w-[1px] h-4 bg-white/5" />
            <div className="flex items-center gap-2">
              <Command size={14} className="text-slate-600" />
              <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Neural Encryption: Enabled</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
           <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Created by</span>
           <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-black text-xs uppercase tracking-[0.3em] shadow-inner">
             MMDCRAFT
           </div>
         </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdateSettings={updateSettings}
      />
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        .text-glow {
          text-shadow: 0 0 20px currentColor;
        }
      `}</style>
    </div>
  );
};

export default App;
