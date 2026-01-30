
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, AlertCircle, RefreshCcw, ChevronDown, Volume2, VolumeX, Volume1 } from 'lucide-react';
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
    <div className="flex items-center gap-2 md:gap-3">
      {/* Radio Unit Body */}
      <div className="relative flex items-center gap-1.5 md:gap-3 bg-[#1e293b] border border-[#334155] md:border-2 p-1 md:p-2 rounded-lg md:rounded-xl shadow-2xl ring-1 ring-white/10 z-20">
        <audio ref={audioRef} crossOrigin="anonymous" />
        
        <div className="flex flex-col items-center justify-center bg-[#0f172a] border border-blue-500/20 px-2 md:px-3 py-0.5 md:py-1 rounded-md md:rounded-lg w-16 md:w-28 h-8 md:h-10 shadow-inner overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
          <div className="flex items-center justify-between w-full">
             <span className="text-[6px] md:text-[8px] font-mono text-blue-500/60 leading-none tracking-widest">{STATIONS[currentStation].freq}</span>
             <div className={`w-1 h-1 rounded-full ${status === 'playing' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]' : 'bg-slate-700'}`} />
          </div>
          <div className="text-[9px] md:text-[11px] font-mono font-black text-blue-400 tracking-tighter truncate w-full text-center">
            {status === 'loading' ? 'TUNING...' : STATIONS[currentStation].name}
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-1.5">
          <button 
            onClick={() => setShowSelector(!showSelector)}
            className="p-1.5 md:p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-all active:scale-90"
            title="انتخاب رادیو"
          >
            <ChevronDown size={14} className={showSelector ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>

          <div className="relative flex items-center">
             <button 
              onMouseEnter={() => setShowVolumeSlider(true)}
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-1.5 md:p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-all active:scale-90"
            >
              {volume === 0 ? <VolumeX size={14} /> : volume < 0.5 ? <Volume1 size={14} /> : <Volume2 size={14} />}
            </button>
            
            {showVolumeSlider && (
              <div onMouseLeave={() => setShowVolumeSlider(false)} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in slide-in-from-bottom-2">
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="h-24 appearance-none bg-slate-700 rounded-lg cursor-pointer" style={{ WebkitAppearance: 'slider-vertical' } as any} />
              </div>
            )}
          </div>

          <button
            onClick={() => { if (status === 'error') initPlayer(); onToggle(!isPlaying); }}
            className={`w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center transition-all transform active:scale-90 border-2 ${
              isPlaying && status !== 'error'
              ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
              : status === 'error' ? 'bg-amber-600 border-amber-400 text-white animate-pulse' : 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
            }`}
          >
            {status === 'loading' ? <RefreshCcw size={16} className="animate-spin" /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </button>
        </div>
      </div>

      {showSelector && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />
          <div className="absolute top-full right-0 mt-3 w-40 md:w-44 bg-[#1e293b] border-2 border-[#334155] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 backdrop-blur-xl">
            {Object.entries(STATIONS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => { onStationChange(key as any); setShowSelector(false); }}
                className={`w-full px-4 py-3 text-right text-xs md:text-sm font-black transition-all border-b border-white/5 last:border-0 flex items-center justify-between ${currentStation === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}
              >
                <span className="text-[9px] font-mono opacity-60 tracking-tighter">{info.freq}</span>
                <span>{info.faName}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RadioPlayer;
