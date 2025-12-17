
import React, { useState } from 'react';
import { X, Lock, Settings, UserCheck, ShieldAlert, Check, User, Briefcase, Info } from 'lucide-react';
import { AppSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '536') {
      setIsUnlocked(true);
      setPassword('');
    } else {
      alert('رمز اشتباه است!');
    }
  };

  const updateField = (field: keyof AppSettings, value: any) => {
    onUpdateSettings({ ...settings, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-bold">
            <Settings size={20} className="text-blue-500" />
            <span className="rtl">تنظیمات MMD ASSIST</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* Casual Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="rtl text-right">
              <h3 className="text-white font-medium flex items-center gap-2">
                <UserCheck size={18} className="text-blue-400" />
                حالت خودمانی
              </h3>
              <p className="text-xs text-slate-400 mt-1">پاسخ‌های دوستانه و غیررسمی</p>
            </div>
            <button 
              onClick={() => updateField('isInformal', !settings.isInformal)}
              className={`w-12 h-6 rounded-full transition-all relative ${settings.isInformal ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isInformal ? 'right-1' : 'right-7'}`} />
            </button>
          </div>

          {/* Personalization Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-slate-200 font-bold flex items-center gap-2 rtl px-1">
              <User size={18} className="text-purple-400" />
              شخصی سازی
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1 rtl">
                  <User size={10} /> نام شما
                </label>
                <input 
                  type="text"
                  value={settings.userName || ''}
                  onChange={(e) => updateField('userName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none rtl text-right"
                  placeholder="نام خود را وارد کنید..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1 rtl">
                  <Briefcase size={10} /> شغل
                </label>
                <input 
                  type="text"
                  value={settings.userJob || ''}
                  onChange={(e) => updateField('userJob', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none rtl text-right"
                  placeholder="شغل شما چیست؟"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1 rtl">
                <Info size={10} /> چیزهایی که هوش مصنوعی باید درباره شما بدونه
              </label>
              <textarea 
                rows={3}
                value={settings.userContext || ''}
                onChange={(e) => updateField('userContext', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-purple-500 outline-none rtl text-right resize-none"
                placeholder="علاقه‌مندی‌ها، محدودیت‌ها یا هر نکته دیگری..."
              />
            </div>
          </div>

          {/* Hidden Section */}
          <div className="pt-4 border-t border-slate-800">
            {!isUnlocked ? (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-1 px-1 uppercase tracking-widest">
                  <Lock size={12} />
                  <span>بخش مدیریت (نیاز به رمز)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none rtl text-right"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors text-white"
                  >
                    <Check size={18} />
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold mb-2 uppercase tracking-widest">
                  <ShieldAlert size={14} />
                  <span>دسترسی سطح توسعه‌دهنده فعال شد</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <div className="rtl text-right">
                    <h3 className="text-red-400 font-bold flex items-center gap-2">
                      خاموش کردن قوانین
                    </h3>
                    <p className="text-[10px] text-red-500/70 mt-1 italic">هشدار: هوش مصنوعی بدون محدودیت عمل خواهد کرد</p>
                  </div>
                  <button 
                    onClick={() => updateField('noRules', !settings.noRules)}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.noRules ? 'bg-red-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.noRules ? 'right-1' : 'right-7'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 flex flex-col gap-1 items-center justify-center border-t border-slate-800">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">
            MMD ASSIST SETTINGS PANEL V1.2
          </p>
          <p className="text-[9px] text-slate-700 rtl">
            ساخته شده با مقدار کمی کمک از چت جی پی تی و جمینای
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
