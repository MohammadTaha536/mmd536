
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, AlertCircle, RefreshCcw, ChevronDown } from 'lucide-react';
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const retryCountRef = useRef(0);
  const urlIndexRef = useRef(0);

  const STATIONS = {
    ava: {
      name: 'رادیو آوا',
      urls: [
        "https://s1.cdn3.iranseda.ir/liveedge/radio-nama-ava/playlist.m3u8",
        "https://p1.iranseda.ir/live-channels/live/radioava/index.m3u8",
        "https://s6.cdn3.iranseda.ir/liveedge/radio-ava/playlist.m3u8",
        "https://shabakeh.iranseda.ir/live-channels/live/radioava/index.m3u8"
      ],
      type: 'hls' as const
    },
    javan: {
      name: 'رادیو جوان',
      urls: [
        "https://s6.cdn3.iranseda.ir/liveedge/radio-javan/playlist.m3u8",
        "https://p1.iranseda.ir/live-channels/live/radiojavan/index.m3u8",
        "https://shabakeh.iranseda.ir/live-channels/live/radiojavan/index.m3u8",
        "https://stream.radiojavan.com/radiojavan"
      ],
      type: 'hls' as const
    }
  };

  const safePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setStatus('loading');
      audio.volume = 1.0;
      audio.muted = false;

      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      setStatus('playing');
      setErrorMsg(null);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn("Audio Play failed:", err.message);
        setStatus('error');
        setErrorMsg("خطا در پخش");
      }
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

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    audio.pause();
    audio.removeAttribute('src');
    audio.load();

    const config = STATIONS[currentStation];
    const url = config.urls[urlIndexRef.current % config.urls.length];

    console.log(`Radio: Attempting source #${(urlIndexRef.current % config.urls.length) + 1} for ${config.name}: ${url}`);

    const isHls = url.includes('.m3u8');

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 120,
        manifestLoadingMaxRetry: 8,
        manifestLoadingRetryDelay: 1000,
        fragLoadingMaxRetry: 8,
        fragLoadingRetryDelay: 1000,
        // Increased timeout to prevent manifestLoadError on slow initial connections
        manifestLoadingTimeOut: 30000, 
        fragLoadingTimeOut: 30000,
      });

      hls.loadSource(url);
      hls.attachMedia(audio);
      hlsRef.current = hls;

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error(`HLS Fatal Error [${data.type}]:`, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If we reach fatal network error (e.g. manifestLoadError), move to next URL immediately
              console.warn("Fatal Network Error (likely Manifest Load Error). Switching to next source...");
              retryCountRef.current = 0;
              urlIndexRef.current++;
              // Delay slightly before re-init to avoid rapid looping
              setTimeout(() => {
                if (isPlaying) initPlayer();
              }, 1000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("HLS Media Error. Recovering...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Unrecoverable error. Retrying with next source.");
              urlIndexRef.current++;
              initPlayer();
              break;
          }
        }
      });
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        retryCountRef.current = 0;
        if (isPlaying) safePlay();
      });
    } else {
      audio.src = url;
      audio.load();
      
      const handleCanPlay = () => {
        if (isPlaying) safePlay();
        audio.removeEventListener('canplay', handleCanPlay);
      };
      
      const handleError = (e: any) => {
        console.error("Native Audio Error, cycling source:", e);
        urlIndexRef.current++;
        initPlayer();
        audio.removeEventListener('error', handleError);
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
    }
  }, [currentStation, isPlaying]);

  useEffect(() => {
    urlIndexRef.current = 0;
    retryCountRef.current = 0;
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentStation]);

  useEffect(() => {
    if (isPlaying) {
      safePlay();
    } else {
      safePause();
    }
  }, [isPlaying]);

  const stationInfo = STATIONS[currentStation];

  return (
    <div className="relative flex items-center gap-2 bg-slate-900/95 border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl backdrop-blur-3xl ring-1 ring-white/10 transition-all duration-300">
      <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />
      
      <div className="flex flex-col items-end rtl select-none min-w-[80px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400">Radio</span>
          <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
            status === 'playing' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 
            status === 'loading' ? 'bg-blue-500 animate-pulse' : 
            status === 'error' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-slate-600'
          }`} />
        </div>
        <button 
          onClick={() => setShowSelector(!showSelector)}
          className="flex items-center gap-1 text-[13px] font-bold text-white hover:text-blue-300 transition-colors"
        >
          <ChevronDown size={12} className={`transition-transform duration-300 ${showSelector ? 'rotate-180' : ''}`} />
          {stationInfo.name}
        </button>
      </div>

      {showSelector && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSelector(false)} />
          <div className="absolute top-full right-0 mt-3 w-40 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 backdrop-blur-3xl">
            {Object.entries(STATIONS).map(([key, info]) => (
              <button
                key={key}
                onClick={() => {
                  onStationChange(key as 'ava' | 'javan');
                  setShowSelector(false);
                }}
                className={`w-full px-4 py-3 text-right text-sm font-bold transition-all border-b border-white/5 last:border-0 ${
                  currentStation === key ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {info.name}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center gap-2 border-r border-white/10 pr-1 mr-1">
        {status === 'playing' && (
          <div className="flex items-end gap-1 h-3.5 mb-0.5 px-1.5">
            <div className="w-0.5 bg-blue-500 animate-[bounce_0.6s_infinite]" />
            <div className="w-0.5 bg-blue-500 animate-[bounce_0.9s_infinite] delay-75" />
            <div className="w-0.5 bg-blue-500 animate-[bounce_0.5s_infinite] delay-150" />
          </div>
        )}
        
        <button
          onClick={() => {
            if (status === 'error' || isPlaying === false) {
              if (status === 'error') {
                urlIndexRef.current++;
                initPlayer();
              }
              onToggle(true);
            } else {
              onToggle(false);
            }
          }}
          title={errorMsg || (isPlaying ? "توقف" : "پخش")}
          className={`p-2.5 rounded-xl transition-all shadow-xl transform active:scale-90 ${
            isPlaying && status !== 'error'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
            : status === 'error' 
              ? 'bg-amber-600 text-white border border-amber-400/50'
              : 'bg-blue-600 text-white border border-blue-400/50 shadow-blue-500/30'
          }`}
        >
          {status === 'loading' ? (
            <RefreshCcw size={16} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={16} />
          ) : status === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default RadioPlayer;
