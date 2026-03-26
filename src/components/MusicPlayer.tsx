import React, { useState, useEffect, useRef } from 'react';

const TRACKS = [
  { id: 1, title: 'SYS.REQ.01', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 2, title: 'MEM_DUMP_02', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 3, title: 'CORRUPT_SECTOR_03', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(console.error);
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  const prevTrack = () => setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);

  return (
    <div className="w-full max-w-md border-4 border-cyan-400 bg-black p-6 relative overflow-hidden jarring-border">
      <div className="absolute top-0 left-0 w-full h-full scanlines pointer-events-none z-10"></div>
      
      <audio ref={audioRef} src={currentTrack.url} onEnded={nextTrack} preload="metadata" />
      
      <div className="mb-6 border-b-4 border-magenta-500 pb-2 flex justify-between items-end" style={{ borderColor: '#FF00FF' }}>
        <h2 className="text-3xl text-cyan-400 glitch-text" data-text="AUDIO_STREAM_NODE">AUDIO_STREAM_NODE</h2>
        <span className="text-magenta-500 text-lg animate-pulse" style={{ color: '#FF00FF' }}>
          {isPlaying ? 'TRANSMITTING...' : 'IDLE'}
        </span>
      </div>

      <div className="bg-cyan-900/30 p-4 mb-6 border-2 border-cyan-500 relative">
        <div className="text-sm text-magenta-500 mb-1" style={{ color: '#FF00FF' }}>CURRENT_PAYLOAD:</div>
        <div className="text-2xl text-white truncate">{currentTrack.title}</div>
        {isPlaying && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
            <div className="w-2 bg-cyan-400 animate-[bounce_0.5s_infinite] h-4"></div>
            <div className="w-2 bg-magenta-500 animate-[bounce_0.7s_infinite] h-6" style={{ backgroundColor: '#FF00FF' }}></div>
            <div className="w-2 bg-cyan-400 animate-[bounce_0.6s_infinite] h-3"></div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 relative z-20">
        <div className="flex justify-between gap-4">
          <button onClick={prevTrack} className="flex-1 bg-black border-2 border-cyan-400 text-cyan-400 py-2 hover:bg-cyan-400 hover:text-black transition-colors uppercase text-lg">
            &lt;&lt; PREV
          </button>
          <button onClick={togglePlay} className="flex-1 bg-magenta-500 text-black border-2 border-magenta-500 py-2 hover:bg-black hover:text-magenta-500 transition-colors uppercase font-bold text-xl" style={{ backgroundColor: isPlaying ? '#000' : '#FF00FF', color: isPlaying ? '#FF00FF' : '#000', borderColor: '#FF00FF' }}>
            {isPlaying ? 'HALT' : 'INITIALIZE'}
          </button>
          <button onClick={nextTrack} className="flex-1 bg-black border-2 border-cyan-400 text-cyan-400 py-2 hover:bg-cyan-400 hover:text-black transition-colors uppercase text-lg">
            NEXT &gt;&gt;
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <span className="text-magenta-500 text-xl" style={{ color: '#FF00FF' }}>AMP_LEVEL:</span>
          <input
            type="range" min="0" max="1" step="0.01" value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-4 bg-black border-2 border-cyan-400 appearance-none cursor-pointer"
            style={{ accentColor: '#00FFFF' }}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t-4 border-cyan-900">
        <div className="text-lg text-cyan-600 mb-2">AVAILABLE_SECTORS:</div>
        <div className="flex flex-col gap-2">
          {TRACKS.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => { setCurrentTrackIndex(idx); if (!isPlaying) setIsPlaying(true); }}
              className={`text-left px-3 py-2 text-xl uppercase ${idx === currentTrackIndex ? 'bg-cyan-900 text-cyan-100' : 'text-cyan-700 hover:text-cyan-400 hover:bg-cyan-900/50'}`}
            >
              [{idx}] {track.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
