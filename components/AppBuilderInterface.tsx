
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings } from '../types';
import { Code2, Play, Layout, Trash2, Maximize2, Sparkles, Cpu, Globe, Rocket, Terminal, Layers } from 'lucide-react';

interface Props {
  settings: AppSettings;
}

const DEFAULT_CODE = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      background: #020617; 
      color: #38bdf8; 
      font-family: sans-serif; 
      display: flex; 
      flex-direction: column;
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      margin: 0;
    }
    .card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(56, 189, 248, 0.2);
      padding: 2rem;
      border-radius: 1.5rem;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    h1 { margin-top: 0; color: white; }
    button {
      background: #38bdf8;
      color: #020617;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
    }
    button:hover { transform: scale(1.05); background: white; }
  </style>
</head>
<body>
  <div class="card">
    <h1>MMD App Engine</h1>
    <p>باکس شماره انداز هوشمند</p>
    <h2 id="counter">0</h2>
    <button onclick="increment()">افزایش عدد</button>
  </div>

  <script>
    let count = 0;
    function increment() {
      count++;
      document.getElementById('counter').innerText = count;
    }
  </script>
</body>
</html>`;

const AppBuilderInterface: React.FC<Props> = ({ settings }) => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewKey, setPreviewKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runCode = () => {
    setPreviewKey(prev => prev + 1);
    setActiveTab('preview');
  };

  const clearCode = () => {
    if (confirm("آیا از پاک کردن محیط کدنویسی اطمینان دارید؟")) {
      setCode('');
    }
  };

  const loadTemplate = (type: string) => {
    let template = '';
    if (type === 'neon') {
      template = `<style>body{background:#000;color:#0f0;font-family:monospace;display:flex;justify:center;align-items:center;height:100vh}h1{text-shadow:0 0 10px #0f0;border:2px solid #0f0;padding:20px}</style><h1>NEON SYSTEM ACTIVE</h1>`;
    } else if (type === 'gradient') {
      template = `<style>body{background:linear-gradient(45deg,#f06,#48f);color:#fff;display:flex;justify:center;align-items:center;height:100vh;font-family:sans-serif}div{background:rgba(255,255,255,0.1);padding:40px;border-radius:20px;backdrop-filter:blur(10px)}</style><div><h1>Glassmorphism App</h1></div>`;
    }
    setCode(template);
    setActiveTab('editor');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto px-4 md:px-8 py-6 gap-6 overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-[2rem]">
        <div className="flex items-center gap-4 rtl">
          <div className={`w-12 h-12 rounded-2xl bg-${settings.themeColor}-500/10 border border-${settings.themeColor}-500/20 flex items-center justify-center text-${settings.themeColor}-400`}>
            <Code2 size={24} />
          </div>
          <div>
            <h2 className="text-white font-black text-lg uppercase tracking-tight">App Engine v1.0</h2>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Neural Sandbox Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => loadTemplate('neon')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 transition-all"
          >
            Neon Template
          </button>
          <button 
            onClick={() => loadTemplate('gradient')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/5 transition-all"
          >
            Gradient UI
          </button>
          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          <button 
            onClick={clearCode}
            className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all border border-red-500/20"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Editor Section */}
        <div className={`flex-1 flex flex-col bg-slate-950 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 border-b border-white/5">
            <div className="flex items-center gap-3">
              <Terminal size={14} className={`text-${settings.themeColor}-400`} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Source Console</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent p-8 font-mono text-sm text-blue-300 outline-none resize-none scrollbar-hide selection:bg-blue-500/30"
            spellCheck={false}
            placeholder="کد HTML خود را اینجا بنویسید..."
          />
        </div>

        {/* Preview Section */}
        <div className={`flex-1 flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative transition-all ${activeTab === 'editor' ? 'hidden md:flex' : 'flex'}`}>
          <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900 rounded-[2.5rem] z-10" />
          <div className="flex items-center justify-between px-8 py-4 bg-slate-900 text-white z-20">
            <div className="flex items-center gap-3">
              <Globe size={14} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">sandbox.mmd.io</span>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => setPreviewKey(k => k + 1)} className="hover:text-emerald-400 transition-colors">
                 <Rocket size={16} />
               </button>
               <Maximize2 size={16} className="opacity-40" />
            </div>
          </div>
          <iframe
            key={previewKey}
            title="preview"
            srcDoc={code}
            className="flex-1 w-full bg-white"
            sandbox="allow-scripts"
          />
        </div>
      </div>

      {/* Floating Action Bar (Mobile Tabs) */}
      <div className="md:hidden flex bg-slate-900 border border-white/10 rounded-2xl p-1 shadow-2xl">
        <button 
          onClick={() => setActiveTab('editor')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'editor' ? `bg-${settings.themeColor}-600 text-white` : 'text-slate-500'}`}
        >
          <Code2 size={14} /> Editor
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === 'preview' ? `bg-${settings.themeColor}-600 text-white` : 'text-slate-500'}`}
        >
          <Layout size={14} /> Preview
        </button>
      </div>

      {/* Primary Execute Button */}
      <div className="flex justify-center pb-4 md:pb-0">
        <button
          onClick={runCode}
          className={`group relative px-12 py-5 bg-gradient-to-br from-${settings.themeColor}-600 to-${settings.themeColor}-800 rounded-[2rem] text-white font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-${settings.themeColor}-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4`}
        >
          <div className="absolute inset-0 bg-white/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
          <Play size={20} fill="currentColor" />
          اجرای اپلیکیشن
          <Sparkles size={16} className="animate-pulse" />
        </button>
      </div>
    </div>
  );
};

export default AppBuilderInterface;
