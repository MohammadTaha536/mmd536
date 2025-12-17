
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { GeneratedImage } from '../types';
import { Image as ImageIcon, Download, Sparkles, Loader2, RefreshCw } from 'lucide-react';

const ImageGenInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const url = await generateImage(prompt);
      const newImage: GeneratedImage = {
        url,
        prompt,
        timestamp: Date.now(),
      };
      setImages(prev => [newImage, ...prev]);
      setPrompt('');
    } catch (error) {
      console.error(error);
      alert("خطا در ساخت تصویر. لطفا دوباره تلاش کنید. توجه داشته باشید که برخی عبارات ممکن است توسط فیلترهای ایمنی مسدود شوند.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full max-w-6xl mx-auto w-full px-4 overflow-hidden">
      <div className="py-8 flex flex-col gap-8 flex-1 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex items-center bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-3 shadow-2xl ring-1 ring-white/5 focus-within:ring-purple-500/50 transition-all">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="توصیف تصویری که در ذهن دارید... (رایگان)"
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-600 py-3 px-4 resize-none h-24 rtl text-right font-medium text-lg"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="px-8 py-4 h-full rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-black flex flex-col items-center justify-center gap-1 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
            >
              {isLoading ? <Loader2 className="animate-spin" size={26} /> : <Sparkles size={26} />}
              <span className="text-[10px] uppercase tracking-widest mt-1">Imagine</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 text-center rtl">قدرت گرفته از هسته هوشمند MMD CRAFT (بهینه‌سازی شده برای سرعت و دسترسی رایگان)</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-8 pb-10 scrollbar-hide">
          {images.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 opacity-40">
              <ImageIcon size={100} strokeWidth={1} />
              <p className="text-2xl font-black rtl">آماده خلق هنر هستیم</p>
            </div>
          )}

          {isLoading && images.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-purple-400">
              <div className="relative">
                <Loader2 className="animate-spin" size={64} />
                <Sparkles size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <p className="text-xl font-black tracking-widest uppercase rtl">در حال ترسیم شاهکار شما...</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((img) => (
              <div 
                key={img.timestamp} 
                className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-white/5 hover:border-purple-500/50 transition-all shadow-2xl"
              >
                <img 
                  src={img.url} 
                  alt={img.prompt} 
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                  <p className="text-sm text-white line-clamp-3 mb-5 font-bold rtl text-right leading-relaxed">
                    {img.prompt}
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleDownload(img.url, `mmd-art-${img.timestamp}.png`)}
                      className="flex-1 py-3 bg-white/10 backdrop-blur-xl rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all border border-white/10"
                    >
                      <Download size={16} /> Download
                    </button>
                    <button 
                      onClick={() => { setPrompt(img.prompt); handleGenerate(); }}
                      className="p-3 bg-white/10 backdrop-blur-xl rounded-xl text-white hover:bg-white/20 transition-all border border-white/10"
                      title="تولید مجدد"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenInterface;
