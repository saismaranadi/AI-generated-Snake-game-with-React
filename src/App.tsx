import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-cyan-400 flex flex-col items-center py-8 px-4 relative crt-flicker">
      {/* Global Overlays */}
      <div className="fixed inset-0 scanlines z-50 pointer-events-none"></div>
      <div className="fixed inset-0 static-noise z-50 pointer-events-none"></div>

      <header className="mb-12 w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-magenta-500 pb-6" style={{ borderColor: '#FF00FF' }}>
        <div className="text-center md:text-left">
          <h1 className="text-6xl md:text-7xl font-black glitch-text tracking-tighter" data-text="SNAKE.EXE">
            SNAKE.EXE
          </h1>
          <p className="text-magenta-500 text-2xl mt-2 uppercase tracking-widest" style={{ color: '#FF00FF' }}>
            // PROTOCOL: GLITCH_ART_OVERRIDE
          </p>
        </div>
        
        <div className="flex gap-8 bg-black border-4 border-cyan-400 p-4 jarring-border">
          <div className="flex flex-col items-end">
            <span className="text-xl text-cyan-700">CURR_VAL</span>
            <span className="text-5xl text-cyan-400">{score.toString().padStart(4, '0')}</span>
          </div>
          <div className="flex flex-col items-end border-l-4 border-magenta-500 pl-8" style={{ borderColor: '#FF00FF' }}>
            <span className="text-xl text-magenta-700" style={{ color: '#8B008B' }}>MAX_VAL</span>
            <span className="text-5xl text-magenta-500" style={{ color: '#FF00FF' }}>{highScore.toString().padStart(4, '0')}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row gap-16 items-start w-full max-w-6xl justify-center z-10">
        <div className="w-full max-w-[500px] flex-shrink-0">
          <SnakeGame score={score} setScore={setScore} highScore={highScore} setHighScore={setHighScore} />
        </div>

        <div className="w-full max-w-md flex-shrink-0 flex flex-col gap-10">
          <MusicPlayer />
          
          <div className="p-6 border-4 border-magenta-500 bg-black text-cyan-400 jarring-border" style={{ borderColor: '#FF00FF' }}>
            <h3 className="text-magenta-500 text-2xl mb-4 uppercase" style={{ color: '#FF00FF' }}>&gt; MANUAL_OVERRIDE</h3>
            <ul className="space-y-3 text-xl">
              <li>[W,A,S,D] : VECTOR_SHIFT</li>
              <li>[ARROWS]  : VECTOR_SHIFT</li>
              <li>[SPACE]   : EXECUTE_HALT</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
