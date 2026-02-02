
import React, { useState } from 'react';
import { ShieldCheck, User, Zap, Sparkles, Fingerprint, ArrowRight, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  onLogin: (profile: UserProfile) => void;
  themeColor: string;
}

const AuthOverlay: React.FC<Props> = ({ onLogin, themeColor }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<'idle' | 'scanning' | 'syncing' | 'success'>('idle');

  const handleRegister = () => {
    if (!name.trim()) return;
    setStage('scanning');
    setTimeout(() => {
      setStage('syncing');
      setTimeout(() => {
        setStage('success');
        setTimeout(() => {
          onLogin({
            id: 'OP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            name,
            role: role || 'System Operator',
            isLoggedIn: true,
            registrationDate: Date.now()
          });
        }, 1200);
      }, 2000);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#010206] p-4 overflow-hidden">
      <div className={`absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[180px] opacity-30 bg-${themeColor}-600/50`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.8),#010206)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />

      <div className="w-full max-w-xl glass-panel rounded-[3.5rem] p-12 lg:p-16 border-white/10 relative overflow-hidden animate-in zoom-in-95 duration-700">
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-${themeColor}-500 to-transparent shadow-[0_0_20px_currentColor]`} />
        
        <div className="flex flex-col items-center text-center space-y-12">
          <div className={`w-28 h-28 lg:w-36 lg:h-36 rounded-[2.5rem] bg-${themeColor}-500/10 border-2 border-${themeColor}-500/30 flex items-center justify-center relative group`}>
            {stage === 'scanning' ? (
              <Fingerprint size={64} className={`text-${themeColor}-400 animate-pulse`} />
            ) : stage === 'syncing' ? (
              <Globe size={64} className={`text-blue-400 animate-spin`} />
            ) : stage === 'success' ? (
              <CheckCircle2 size={64} className="text-emerald-400 animate-bounce" />
            ) : (
              <ShieldCheck size={64} className={`text-${themeColor}-400 drop-shadow-[0_0_20px_currentColor]`} />
            )}
            <div className={`absolute inset-0 rounded-[2.5rem] animate-pulse opacity-20 bg-${themeColor}-500`} />
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl lg:text-7xl font-black text-white uppercase tracking-tighter italic leading-none">NEURAL LOGIN</h2>
            <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] animate-pulse">
              {stage === 'scanning' ? 'Scanning Operator Profile...' : stage === 'syncing' ? 'Initializing Core Environment...' : stage === 'success' ? 'Access Granted' : 'Identity Verification Required'}
            </p>
          </div>

          <div className={`w-full space-y-8 transition-all duration-700 ${stage !== 'idle' ? 'opacity-10 blur-xl pointer-events-none' : 'opacity-100'}`}>
            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block text-right rtl">نام کاربری اپراتور</label>
              <input 
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 px-8 text-white font-black text-xl outline-none focus:ring-4 focus:ring-blue-500/20 transition-all rtl text-right"
                placeholder="نام خود را وارد کنید..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block text-right rtl">رول یا تخصص سیستمی</label>
              <input 
                type="text" value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-6 px-8 text-white font-black text-xl outline-none focus:ring-4 focus:ring-blue-500/20 transition-all rtl text-right"
                placeholder="تخصص (مثلاً: توسعه‌دهنده)"
              />
            </div>
          </div>

          <div className="w-full">
            <button 
              onClick={handleRegister}
              disabled={!name.trim() || stage !== 'idle'}
              className={`w-full py-7 rounded-3xl bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 transition-all transform active:scale-95 shadow-2xl disabled:opacity-30`}
            >
              {stage === 'idle' ? (
                <>Establish Link <ArrowRight size={22} /></>
              ) : (
                <Loader2 className="animate-spin" size={24} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-800">
            <Sparkles size={16} />
            <span className="text-[9px] font-black uppercase tracking-[0.6em]">Neural Engine v4.5.1 Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthOverlay;
