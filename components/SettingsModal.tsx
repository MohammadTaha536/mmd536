
import React, { useState, useEffect } from 'react';
import { 
  X, Lock, Settings, UserCheck, ShieldAlert, Check, User, 
  Palette, Brain, Zap, Terminal, Cpu, Database, Activity, 
  Trash2, Layers, Gauge, FlaskConical, ShieldCheck,
  Volume2, History, Eye, EyeOff, Monitor, HardDrive, BarChart, Server,
  Globe
} from 'lucide-react';
import { AppSettings, ThemeColor } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'ai' | 'root'>('profile');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (isUnlocked && settings.showDebugLogs) {
      const interval = setInterval(() => {
        const events = [
          "NEURAL_LINK: ESTABLISHED", "BUFFER_SYNC: SUCCESS", "CONTEXT_SIZE: 128K", "TEMP: " + (30 + Math.random() * 20).toFixed(1) + "C",
          "CORE_USAGE: " + (Math.random() * 100).toFixed(1) + "%", "MEMORY: ACTIVE", "AUTH: ROOT_GRANTED"
        ];
        setLogs(prev => [events[Math.floor(Math.random() * events.length)], ...prev].slice(0, 8));
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isUnlocked, settings.showDebugLogs]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '536') {
      setIsUnlocked(true);
      setPassword('');
    } else {
      alert('خطای احراز هویت: دسترسی غیرمجاز!');
    }
  };

  const updateField = (field: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  const themes: { id: ThemeColor; color: string; label: string }[] = [
    { id: 'blue', color: 'bg-blue-600', label: 'کبالت' },
    { id: 'purple', color: 'bg-purple-600', label: 'نئون' },
    { id: 'emerald', color: 'bg-emerald-600', label: 'زمرد' },
    { id: 'rose', color: 'bg-rose-600', label: 'رز' },
    { id: 'amber', color: 'bg-amber-600', label: 'کهربا' },
  ];

  const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col md:flex-row items-center gap-4 px-4 py-5 md:px-6 md:py-4 rounded-[1.5rem] transition-all duration-500 relative group overflow-hidden ${
        activeTab === id 
        ? `bg-${settings.themeColor}-600/15 text-${settings.themeColor}-400 border border-${settings.themeColor}-500/20` 
        : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : 'group-hover:scale-110 transition-transform'} />
      <span className="hidden md:inline text-[11px] font-black uppercase tracking-widest text-right flex-1 rtl font-bold">{label}</span>
      {activeTab === id && (
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${settings.themeColor}-500`} />
      )}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="bg-[#030712]/95 border border-white/10 w-full max-w-3xl rounded-[2.5rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col h-[90vh] md:max-h-[85vh] relative group">
        
        {/* Decorative elements */}
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[120px] opacity-20 bg-${settings.themeColor}-600 pointer-events-none`} />
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 bg-slate-900/20 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-${settings.themeColor}-500/50 transition-colors`}>
               <Settings size={28} className={`text-${settings.themeColor}-400 animate-[spin_12s_linear_infinite]`} />
               <div className={`absolute inset-0 bg-${settings.themeColor}-500/5 animate-pulse`} />
            </div>
            <div className="rtl text-right">
              <h2 className="text-white font-black text-2xl tracking-tighter uppercase leading-none">پیکربندی هسته عصبی</h2>
              <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-black mt-2">Neural Engine Interface v4.5.0</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all border border-white/5">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* Sidebar */}
          <div className="w-24 md:w-64 border-r border-white/5 bg-black/40 flex flex-col py-8 px-3 gap-3 overflow-y-auto">
            <TabButton id="profile" icon={User} label="پروفایل اپراتور" />
            <TabButton id="appearance" icon={Monitor} label="رابط گرافیکی" />
            <TabButton id="ai" icon={Brain} label="الگوریتم‌های هوش" />
            <TabButton id="root" icon={Terminal} label="دسترسی ریشه" />
            
            <div className="mt-auto p-4 bg-slate-950/50 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-600">
                <span>CPU Load</span>
                <span className="text-emerald-500">Nominal</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div className={`h-full bg-${settings.themeColor}-500 animate-pulse`} style={{width: '34%'}} />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-hide bg-[#05080f]/50">
            
            {activeTab === 'profile' && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 rtl">
                    <UserCheck className={`text-${settings.themeColor}-400`} size={24} />
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">شناسایی اپراتور</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 rtl block text-right font-black uppercase tracking-widest">نام نمایشی سیستم</label>
                      <input 
                        type="text" value={settings.userName} onChange={(e) => updateField('userName', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none rtl text-right text-white font-bold"
                        placeholder="شناسه شما..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 rtl block text-right font-black uppercase tracking-widest">حوزه فعالیت تخصصی</label>
                      <input 
                        type="text" value={settings.userJob} onChange={(e) => updateField('userJob', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none rtl text-right text-white font-bold"
                        placeholder="تخصص شما..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                   <div className="flex items-center justify-between">
                     <div className="rtl text-right">
                       <h4 className="text-white font-bold text-sm">پاک‌سازی زباله‌های حافظه</h4>
                       <p className="text-[10px] text-slate-500 mt-1">تخلیه خودکار کش پس از پایان سشن</p>
                     </div>
                     <button 
                      onClick={() => updateField('autoClearHistory', !settings.autoClearHistory)}
                      className={`w-12 h-7 rounded-full transition-all relative ${settings.autoClearHistory ? `bg-${settings.themeColor}-600` : 'bg-slate-800'}`}
                     >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.autoClearHistory ? 'right-1' : 'right-6'}`} />
                     </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
                <div className="space-y-6">
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 rtl">
                    <Palette size={18} className={`text-${settings.themeColor}-400`} /> پالت طیف نوری
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateField('themeColor', t.id)}
                        className={`aspect-square rounded-[1.5rem] ${t.color} flex flex-col items-center justify-center transition-all transform hover:scale-110 active:scale-90 shadow-2xl relative ${
                          settings.themeColor === t.id ? 'ring-4 ring-white/20 ring-offset-4 ring-offset-[#030712] scale-110' : 'opacity-30 grayscale-[0.8]'
                        }`}
                      >
                        {settings.themeColor === t.id && <Check className="text-white" size={24} />}
                        <span className="absolute -bottom-6 text-[8px] font-black uppercase text-slate-500">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                   <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between">
                      <div className="rtl text-right">
                        <h4 className="text-slate-200 font-black text-xs uppercase tracking-widest">تراکم پیکسلی متن</h4>
                      </div>
                      <select 
                        value={settings.fontSize} onChange={(e) => updateField('fontSize', e.target.value)}
                        className="bg-black border border-white/10 rounded-xl text-[10px] text-white font-black p-2 outline-none uppercase"
                      >
                        <option value="small">Nano</option>
                        <option value="medium">Default</option>
                        <option value="large">Macro</option>
                      </select>
                   </div>
                   <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-between">
                      <div className="rtl text-right">
                        <h4 className="text-slate-200 font-black text-xs uppercase tracking-widest">درخشش نئونی</h4>
                      </div>
                      <button 
                        onClick={() => updateField('neuralGlow', !settings.neuralGlow)}
                        className={`w-12 h-7 rounded-full transition-all relative ${settings.neuralGlow ? `bg-${settings.themeColor}-600 shadow-[0_0_15px_currentColor]` : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.neuralGlow ? 'right-1' : 'right-6'}`} />
                      </button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                <div className="p-8 bg-slate-900/30 border border-white/10 rounded-[2.5rem] space-y-10">
                  <div className="space-y-5">
                    <div className="flex items-center justify-between rtl">
                      <h3 className="text-slate-200 text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
                        <Gauge size={20} className={`text-${settings.themeColor}-400`} /> ضریب انحراف خلاقانه
                      </h3>
                      <span className={`text-xs font-black px-4 py-1.5 bg-${settings.themeColor}-500/20 text-${settings.themeColor}-400 rounded-full border border-${settings.themeColor}-500/30`}>{Math.round(settings.aiCreativity * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" value={settings.aiCreativity}
                      onChange={(e) => updateField('aiCreativity', parseFloat(e.target.value))}
                      className={`w-full h-2.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-${settings.themeColor}-500`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => updateField('isInformal', !settings.isInformal)}
                      className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${settings.isInformal ? `bg-${settings.themeColor}-600/20 border-${settings.themeColor}-500/50` : 'bg-white/5 border-white/10'}`}
                    >
                      <div className="rtl text-right">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest">پروتکل خودمانی</h4>
                        <p className="text-[9px] text-slate-500 mt-1">Slang Engine Active</p>
                      </div>
                      <UserCheck size={20} className={settings.isInformal ? `text-${settings.themeColor}-400` : 'text-slate-600'} />
                    </button>

                    <button 
                      onClick={() => updateField('autoSearch', !settings.autoSearch)}
                      className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${settings.autoSearch ? `bg-emerald-600/20 border-emerald-500/50` : 'bg-white/5 border-white/10'}`}
                    >
                      <div className="rtl text-right">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest">شبکه جهانی زنده</h4>
                        <p className="text-[9px] text-slate-500 mt-1">Real-time Web Grounding</p>
                      </div>
                      {/* Fix: Cannot find name 'Globe2'. Using imported Globe. */}
                      <Globe size={20} className={settings.autoSearch ? 'text-emerald-400' : 'text-slate-600'} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-black/40 rounded-3xl border border-white/5">
                      <div className="rtl text-right">
                        <h4 className="text-white font-black text-xs uppercase tracking-widest">فیلتر زبان مرکزی</h4>
                      </div>
                      <select 
                        value={settings.languageMode} onChange={(e) => updateField('languageMode', e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-xl text-[10px] text-white font-black p-3 outline-none uppercase rtl"
                      >
                        <option value="auto">هوشمند (Adaptive)</option>
                        <option value="farsi">فارسی (Persian)</option>
                        <option value="english">انگلیسی (English)</option>
                      </select>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'root' && (
              <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                {!isUnlocked ? (
                  <form onSubmit={handlePasswordSubmit} className="space-y-8 p-12 bg-black/60 rounded-[3rem] border border-white/10 text-center shadow-inner relative overflow-hidden">
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-${settings.themeColor}-500/50`} />
                    <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-slate-500 shadow-2xl border border-white/5 ring-1 ring-white/10">
                      <Lock size={40} className="animate-pulse" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-white font-black text-2xl uppercase tracking-tighter rtl">تایید صلاحیت اپراتور ارشد</h3>
                      <p className="text-[9px] text-slate-600 uppercase tracking-[0.5em] font-black italic">Security Clearance Level 5 Required</p>
                    </div>
                    <div className="flex flex-col gap-5 max-w-xs mx-auto pt-6">
                      <input
                        type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                        placeholder="ACCESS_KEY"
                        className="bg-black border border-white/10 rounded-2xl px-6 py-5 text-center tracking-[1em] focus:ring-4 focus:ring-red-500/20 outline-none text-white font-black text-3xl shadow-[inset_0_0_30px_rgba(255,0,0,0.05)]"
                      />
                      <button 
                        type="submit"
                        className="w-full py-5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white font-black uppercase tracking-widest text-[11px] border border-white/10 active:scale-95 shadow-xl"
                      >
                        Authorize Root Session
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-8 animate-in zoom-in-95 duration-500 pb-10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: Activity, val: "1.2ms", label: "Latency", color: "text-blue-500" },
                        { icon: Server, val: "3.0 PRO", label: "Model", color: "text-purple-500" },
                        { icon: BarChart, val: "99.2%", label: "Uptime", color: "text-emerald-500" },
                        { icon: HardDrive, val: "84GB", label: "Storage", color: "text-amber-500" }
                      ].map((stat, i) => (
                        <div key={i} className="p-6 bg-black/60 border border-white/5 rounded-[2rem] text-center space-y-2 group hover:border-white/20 transition-all">
                          <stat.icon size={20} className={`mx-auto ${stat.color} group-hover:scale-110 transition-transform`} />
                          <div className="text-[14px] text-white font-black tracking-tight">{stat.val}</div>
                          <div className="text-[7px] text-slate-600 uppercase font-black tracking-widest">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-10 bg-red-600/5 border border-red-500/20 rounded-[3rem] space-y-8 shadow-[0_0_80px_rgba(220,38,38,0.08)] relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
                      <div className="flex items-center gap-5 text-red-500 rtl">
                        <ShieldAlert size={28} className="animate-pulse" />
                        <h3 className="font-black text-xl uppercase tracking-tighter">پروتکل ممنوعه: UNFILTERED</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex items-center justify-between bg-black/60 p-6 rounded-3xl border border-white/5">
                          <div className="rtl text-right">
                            <h4 className="text-red-400 font-black text-xs uppercase tracking-widest">شکستن فیلترها</h4>
                            <p className="text-[8px] text-slate-500 mt-1">Bypass all safety alignments</p>
                          </div>
                          <button 
                            onClick={() => updateField('noRules', !settings.noRules)}
                            className={`w-14 h-8 rounded-full transition-all relative ${settings.noRules ? 'bg-red-600 shadow-[0_0_25px_rgba(220,38,38,0.5)]' : 'bg-slate-800'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.noRules ? 'right-1' : 'right-7'}`} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between bg-black/60 p-6 rounded-3xl border border-white/5">
                          <div className="rtl text-right">
                            <h4 className="text-orange-400 font-black text-xs uppercase tracking-widest">اوورکلاک فرکانس</h4>
                            <p className="text-[8px] text-slate-500 mt-1">Boost processing heat</p>
                          </div>
                          <button 
                            onClick={() => updateField('systemOverclock', !settings.systemOverclock)}
                            className={`w-14 h-8 rounded-full transition-all relative ${settings.systemOverclock ? 'bg-orange-600 shadow-[0_0_25px_rgba(249,115,22,0.5)]' : 'bg-slate-800'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.systemOverclock ? 'right-1' : 'right-7'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-3 rtl">
                          <Terminal size={16} /> مانیتورینگ بلادرنگ سیستم
                        </h4>
                        <div className="flex gap-2">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Link</span>
                        </div>
                      </div>
                      <div className="bg-black/80 rounded-[2rem] p-6 font-mono text-[11px] text-emerald-500/80 h-48 overflow-hidden relative shadow-[inset_0_0_30px_rgba(0,0,0,1)] border border-white/5">
                        {logs.length === 0 && <div className="text-slate-700 italic">Waiting for incoming data stream...</div>}
                        {logs.map((log, i) => (
                          <div key={i} className="mb-1.5 flex items-center gap-3">
                            <span className="text-slate-700">[{new Date().toLocaleTimeString()}]</span>
                            <span className="text-emerald-500/60 font-bold">$</span>
                            <span className="animate-in slide-in-from-left-2 duration-300">{log}</span>
                          </div>
                        ))}
                        <div className="absolute bottom-6 right-6 left-6 flex items-center justify-between bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/5">
                           <button 
                            onClick={() => updateField('showDebugLogs', !settings.showDebugLogs)}
                            className="text-[9px] font-black uppercase tracking-widest text-blue-500 hover:text-white transition-colors rtl"
                           >
                            {settings.showDebugLogs ? 'قطع اتصال' : 'برقراری مانیتورینگ'}
                           </button>
                           <div className="flex gap-1">
                              {[1, 2, 3].map(i => <div key={i} className={`w-1 h-3 bg-emerald-500/20 rounded-full animate-bounce`} style={{animationDelay: `${i*100}ms`}} />)}
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => { if(confirm("آیا از پاک کردن کامل تمام داده‌ها اطمینان دارید؟")) { localStorage.clear(); location.reload(); } }}
                        className="flex-1 py-5 bg-slate-900/50 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-red-600 hover:text-white hover:border-red-500 transition-all shadow-2xl rtl"
                      >
                        <Trash2 size={14} className="inline ml-2" /> نابودی کامل داده‌ها
                      </button>
                      <button 
                        onClick={() => setIsUnlocked(false)}
                        className="flex-1 py-5 bg-slate-900/50 border border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all shadow-2xl rtl"
                      >
                        خروج ایمن از ریشه
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 flex items-center justify-between border-t border-white/5 px-10 relative overflow-hidden">
          <div className={`absolute inset-0 bg-${settings.themeColor}-500/5 pointer-events-none`} />
          <div className="flex items-center gap-4 text-slate-500 text-[11px] font-black tracking-[0.4em] uppercase relative z-10">
            <Cpu size={16} className={`text-${settings.themeColor}-500 animate-pulse`} />
            Engine Core v4.5
          </div>
          <p className="text-[10px] text-slate-400 rtl font-black italic uppercase tracking-[0.2em] relative z-10">
            شناسه توسعه‌دهنده: MMDCRAFT
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
