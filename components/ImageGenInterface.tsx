
import React, { useState, useEffect } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage, AppSettings } from '../types';
import { Image as ImageIcon, Download, Sparkles, Loader2, RefreshCw, Zap, ShieldCheck, Activity, ZapOff, RefreshCw as RefreshIcon, Clock, AlertTriangle } from 'lucide-react';

const MAX_ENERGY = 100;
const ENERGY_PER_IMAGE = 35; 
const REFILL_RATE = 6; 
const REFILL_INTERVAL = 2500;

const ImageGenInterface: React.FC<{ settings?: AppSettings }> = ({ settings }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [neuralEnergy, setNeuralEnergy] = useState(MAX_ENERGY);
  const [isCharging, setIsCharging] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

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

  // تابع اعمال واترمارک هوشمند به تصویر
  const applyWatermark = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64);
          return;
        }

        // رسم تصویر اصلی
        ctx.drawImage(img, 0, 0);

        // تنظیمات استایل واترمارک
        const fontSize = Math.floor(canvas.width * 0.045);
        ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';

        // سایه برای خوانایی بیشتر در پس‌زمینه‌های روشن
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // ایجاد گرادینت رنگی برای واترمارک (مطابق با تم بنفش/صورتی هوش مصنوعی)
        const gradient = ctx.createLinearGradient(
          canvas.width - 250, 
          canvas.height - 100, 
          canvas.width, 
          canvas.height
        );
        gradient.addColorStop(0, '#a855f7'); // Purple 500
        gradient.addColorStop(0.5, '#ec4899'); // Pink 500
        gradient.addColorStop(1, '#3b82f6'); // Blue 500
        
        ctx.fillStyle = gradient;
        
        // رسم متن واترمارک
        const padding = Math.floor(canvas.width * 0.04);
        ctx.fillText('MMD Assist', canvas.width - padding, canvas.height - padding);

        // اضافه کردن یک المان گرافیکی کوچک (نقطه نوری) کنار واترمارک
        ctx.beginPath();
        ctx.arc(canvas.width - padding - (ctx.measureText('MMD Assist').width + 15), canvas.height - padding - (fontSize/3), 6, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    if (neuralEnergy < ENERGY_PER_IMAGE) {
      setLastError("⚠️ ظرفیت عصبی برای رندر تصویر کافی نیست. لطفا منتظر شارژ بمانید.");
      return;
    }

    setLastError(null);
    setIsLoading(true);
    setNeuralEnergy(prev => Math.max(0, prev - ENERGY_PER_IMAGE));
    
    try {
      const { imageUrl, refusalReason } = await generateImage(prompt, settings);
      
      if (imageUrl) {
        // اعمال واترمارک قبل از ذخیره در استیت
        const watermarkedUrl = await applyWatermark(imageUrl);
        
        const newImage: GeneratedImage = {
          url: watermarkedUrl,
          prompt,
          timestamp: Date.now(),
        };
        setImages(prev => [newImage, ...prev]);
        setPrompt('');
      } else if (refusalReason) {
        setLastError(`توقف فرآیند: ${refusalReason}`);
      }
    } catch (error) {
      console.error(error);
      setLastError("خطا در شبکه عصبی تصویرساز. احتمالا محدودیت کلمات یا برند وجود دارد.");
    } finally {
      setIsLoading(false);
    }
  };

  const getEnergyStatus = () => {
    if (neuralEnergy >= 100) return { color: `text-purple-400`, icon: ShieldCheck, label: 'ظرفیت تکمیل (Ready)', animation: 'animate-none' };
    if (isCharging) return { color: 'text-blue-400', icon: RefreshIcon, label: 'در حال بازیابی توان تصویری...', animation: 'animate-spin' };
    if (neuralEnergy > 40) return { color: `text-purple-400`, icon: Zap, label: 'پایدار', animation: 'animate-pulse' };
    return { color: 'text-red-500', icon: ZapOff, label: 'کمبود شدید انرژی!', animation: 'animate-bounce' };
  };

  const energyStatus = getEnergyStatus();

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full px-4 overflow-hidden">
      <div className="py-8 flex flex-col gap-6 flex-1 overflow-hidden">
        
        {/* نوار ظرفیت عصبی مخصوص تصویر */}
        <div className="space-y-3 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <energyStatus.icon size={12} className={`${energyStatus.color} ${energyStatus.animation}`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${energyStatus.color}`}>
                {energyStatus.label} — {Math.round(neuralEnergy)}%
              </span>
            </div>
            {neuralEnergy < ENERGY_PER_IMAGE && (
              <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                <Clock size={10} />
                <span className="text-[8px] font-black uppercase tracking-tighter">در انتظار شارژ...</span>
              </div>
            )}
            {(settings?.visualBypass || settings?.noRules) && (
              <div className="flex items-center gap-1.5 text-orange-500 animate-pulse">
                <Zap size={10} />
                <span className="text-[8px] font-black uppercase tracking-tighter">Bypass Active</span>
              </div>
            )}
          </div>
          <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 relative ${
                neuralEnergy < 30 ? 'bg-red-500' : isCharging ? 'bg-gradient-to-r from-blue-600 to-cyan-400' : 'bg-purple-500'
              }`} 
              style={{ width: `${neuralEnergy}%`, boxShadow: `0 0 15px ${neuralEnergy < 30 ? 'rgba(239,68,68,0.5)' : 'rgba(168,85,247,0.5)'}` }} 
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>

        {lastError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs text-red-400 font-bold rtl text-right leading-relaxed">{lastError}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className={`flex items-center bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-3 shadow-2xl transition-all ${neuralEnergy < 10 ? 'opacity-50 grayscale' : 'focus-within:ring-2 focus-within:ring-purple-500/50'}`}>
            <textarea
              value={prompt}
              disabled={isLoading}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={neuralEnergy < 10 ? "در حال شارژ هسته..." : "توصیف تصویر... (مثال: فضانوردی در میان گل‌ها)"}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 py-3 px-4 resize-none h-24 rtl text-right font-bold text-lg"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading || neuralEnergy < 10}
              className={`px-8 py-4 h-full rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black flex flex-col items-center justify-center gap-1 hover:brightness-110 disabled:opacity-20 transition-all shadow-xl active:scale-95`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={26} /> : <Sparkles size={26} />}
              <span className="text-[10px] uppercase tracking-widest mt-1">Imagine</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pb-10 scrollbar-hide">
          {images.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-40">
              <div className="relative">
                <ImageIcon size={120} strokeWidth={1} />
                <div className="absolute inset-0 blur-2xl bg-purple-500/20 rounded-full" />
              </div>
              <p className="text-2xl font-black rtl">هنوز اثری خلق نشده است</p>
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col items-center justify-center h-48 gap-6 text-purple-400 animate-in fade-in">
              <div className="relative">
                <Loader2 className="animate-spin" size={48} />
                <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-sm font-black tracking-widest uppercase rtl">در حال سنتز پیکسل‌های عصبی...</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img) => (
              <div 
                key={img.timestamp} 
                className="group relative rounded-[2.5rem] overflow-hidden bg-slate-900 border border-white/5 hover:border-purple-500/50 transition-all shadow-2xl aspect-square"
              >
                <img src={img.url} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <p className="text-sm text-white line-clamp-3 mb-6 font-bold rtl text-right leading-relaxed drop-shadow-lg">{img.prompt}</p>
                  <button 
                    onClick={() => { const link = document.createElement('a'); link.href = img.url; link.download = `mmd-art-${Date.now()}.png`; link.click(); }} 
                    className="w-full py-4 bg-white/10 backdrop-blur-2xl rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-white/10 hover:bg-white/20 transition-all shadow-xl"
                  >
                    <Download size={16} /> Save Masterpiece
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ImageGenInterface;
