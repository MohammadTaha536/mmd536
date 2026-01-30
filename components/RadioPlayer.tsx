
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, AlertCircle, RefreshCcw, ChevronDown, Volume2, VolumeX, Volume1, Radio as RadioIcon } from 'lucide-react';
import Hls from 'hls.js';

interface Props {
  isPlaying: boolean;
  onToggle: (state: boolean) => void;
  currentStation: 'ava' | 'javan';
  onStationChange: (station: 'ava' | 'javan') => void;
}

const RadioPlayer: React.FC<Props> = ({ isPlaying, onToggle, currentStation, onStationChange }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const [showSelector, setShowSelector] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const urlIndexRef = useRef(0);

  const STATIONS = {
    ava: {
      name: 'RADIO AVA',
      faName: 'رادیو آوا',
      freq: '93.5 FM',
      urls: [
        "https://s1.cdn3.iranseda.ir/liveedge/radio-nama-ava/playlist.m3u8",
        "https://p1.iranseda.ir/live-channels/live/radioava/index.m3u8",
        "https://s6.cdn3.iranseda.ir/liveedge/radio-ava/playlist.m3u8"
      ]
    },
    javan: {
      name: 'RADIO JAVAN',
      faName: 'رادیو جوان',
      freq: '88.0 FM',
      urls: [
        "https://s6.cdn3.iranseda.ir/liveedge/radio-javan/playlist.m3u8",
        "https://p1.iranseda.ir/live-channels/live/radiojavan/index.m3u8"
      ]
    }
  };

  const safePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setStatus('loading');
      audio.volume = volume;
      audio.muted = false;

      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      setStatus('playing');
    } catch (err: any) {
      if (err.name !== 'AbortError') setStatus('error');
    } finally {
      playPromiseRef.current = null;
    }
  };

  const safePause = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playPromiseRef.current) {
      try { await playPromiseRef.current; } catch (e) {}
    }
    audio.pause();
    setStatus('idle');
  };

  const initPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (hlsRef.current) hlsRef.current.destroy();
    
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    const config = STATIONS[currentStation];
    const url = config.urls[urlIndexRef.current % config.urls.length];

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(audio);
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, () => { if (isPlaying) safePlay(); });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          urlIndexRef.current++;
          initPlayer();
        }
      });
    } else {
      audio.src = url;
      audio.load();
      if (isPlaying) safePlay();
    }
  }, [currentStation, isPlaying]);

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [currentStation]);

  useEffect(() => {
    if (isPlaying) safePlay(); else safePause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="flex items-center gap-2 md:gap-4">
      {/* --- CLASSIC RADIO UNIT --- */}
      <div className="relative flex items-center bg-gradient-to-b from-[#334155] to-[#0f172a] border-t border-white/20 border-x border-[#1e293b] p-1.5 md:p-2 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] z-20 overflow-hidden ring-1 ring-black group">
        
        {/* Decorative Metallic Screw (Top Left) */}
        <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-slate-500 shadow-inner opacity-40" />
        
        <audio ref={audioRef} crossOrigin="anonymous" />
        
        {/* Left Speaker Grille */}
        <div className="hidden md:flex w-10 h-10 flex-col justify-between gap-1 opacity-40 mr-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[2px] w-full bg-black rounded-full shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
          ))}
        </div>

        {/* Digital Tuning Display (The Radio Screen) */}
        <div className="relative flex flex-col items-center justify-center bg-[#050810] border-2 border-black rounded-xl w-24 md:w-36 h-10 md:h-12 shadow-[inset_0_2px_10px_rgba(0,0,0,1)] overflow-hidden">
          {/* CRT/LCD Glow Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent)] pointer-events-none" />
          {/* Scanline pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_2px] pointer-events-none opacity-20" />
          
          <div className="flex items-center justify-between w-full px-2">
             <span className="text-[6px] md:text-[8px] font-mono text-blue-500/40 leading-none tracking-[0.2em] italic">{STATIONS[currentStation].freq}</span>
             <div className="flex items-center gap-1">
               {status === 'playing' && (
                 <div className="flex items-end gap-[1px] h-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-[1.5px] bg-emerald-500 animate-pulse" style={{ height: `${Math.random()*100}%`, animationDelay: `${i*150}ms` }} />
                   ))}
                 </div>
               )}
               <div className={`w-1.5 h-1.5 rounded-full ${status === 'playing' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse' : 'bg-slate-900'}`} />
             </div>
          </div>
          <div className="text-[10px] md:text-[13px] font-mono font-black text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)] tracking-tighter truncate w-full text-center uppercase">
            {status === 'loading' ? 'TUNING...' : STATIONS[currentStation].name}
          </div>
        </div>

        {/* Control Cluster */}
        <div className="flex items-center gap-1 md:gap-2 ml-2 md:ml-3">
          
          {/* Volume Knob Lookalike Button */}
          <div className="relative flex items-center">
             <button 
              onMouseEnter={() => setShowVolumeSlider(true)}
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 border border-black shadow-[0_2px_5px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all active:scale-90"
            >
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-blue-500/50 rounded-full" style={{ transform: `rotate(${volume * 360}deg)`, transformOrigin: 'center 4px' }} />
              {volume === 0 ? <VolumeX size={14} /> : volume < 0.5 ? <Volume1 size={14} /> : <Volume2 size={14} />}
            </button>
            
            {showVolumeSlider && (
              <div onMouseLeave={() => setShowVolumeSlider(false)} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-4 bg-[#0f172a]/95 backdrop-blur-xl border-2 border-[#334155] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in slide-in-from-bottom-2">
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="h-32 appearance-none bg-slate-800 rounded-full cursor-pointer accent-blue-500" style={{ WebkitAppearance: 'slider-vertical' } as any} />
              </div>
            )}
          </div>

          {/* Station Switcher Button */}
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-800 border border-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_2px_5px_rgba(0,0,0,0.5)] flex items-center justify-center text-slate-500 hover:text-white transition-all active:translate-y-0.5"
            title="انتخاب ایستگاه"
          >
            <RadioIcon size={16} className={status === 'loading' ? 'animate-spin' : ''} />
          </button>

          {/* Main Play/Pause Button (The "Engage" Button) */}
          <button
            onClick={() => { if (status === 'error') initPlayer(); onToggle(!isPlaying); }}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all transform shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 ${
              isPlaying && status !== 'error'
              ? 'bg-gradient-to-br from-red-600 to-red-900 border-red-500 text-white active:shadow-inner active:translate-y-0.5' 
              : status === 'error' ? 'bg-amber-600 border-amber-400 text-white animate-pulse' : 'bg-gradient-to-br from-blue-600 to-blue-900 border-blue-500 text-white hover:brightness-110 active:shadow-inner active:translate-y-0.5'
            }`}
          >
            {status === 'loading' ? <RefreshCcw size={18} className="animate-spin" /> : isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
        </div>

        {/* Right Speaker Grille */}
        <div className="hidden md:flex w-10 h-10 flex-col justify-between gap-1 opacity-40 ml-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[2px] w-full bg-black rounded-full shadow-[0_1px_0_rgba(255,255,255,0.05)]" />
          ))}
        </div>
      </div>

      {showSelector && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />
          <div className="absolute top-full right-0 mt-4 w-48 bg-[#0f172a]/95 backdrop-blur-2xl border-2 border-[#1e293b] rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,1)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="p-4 bg-slate-900/50 border-b border-white/5">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Select Station</span>
            </div>
            {Object.entries(STATIONS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => { onStationChange(key as any); setShowSelector(false); }}
                className={`w-full px-6 py-4 text-right text-sm font-black transition-all border-b border-white/5 last:border-0 flex items-center justify-between group ${currentStation === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-blue-400'}`}
              >
                <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${currentStation === key ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
                   <span className="text-[9px] font-mono opacity-60 tracking-tighter">{info.freq}</span>
                </div>
                <span className="font-bold rtl">{info.faName}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RadioPlayer;
