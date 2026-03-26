import React, { useEffect, useRef, useState } from 'react';

interface SnakeGameProps {
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  highScore: number;
  setHighScore: React.Dispatch<React.SetStateAction<number>>;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export default function SnakeGame({ score, setScore, highScore, setHighScore }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStateStr, setGameStateStr] = useState<string>('AWAITING_INPUT');
  
  const state = useRef({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    particles: [] as {x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string}[],
    lastMoveTime: 0,
    moveInterval: 100,
    gameOver: false,
    hasStarted: false,
    shakeUntil: 0,
    score: 0
  });

  // Keep score synced
  useEffect(() => {
    setScore(state.current.score);
    if (state.current.score > highScore) {
      setHighScore(state.current.score);
    }
  }, [state.current.score, setScore, highScore, setHighScore]);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      state.current.particles.push({
        x: x * CELL_SIZE + CELL_SIZE/2,
        y: y * CELL_SIZE + CELL_SIZE/2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        maxLife: Math.random() * 0.5 + 0.5,
        color
      });
    }
  };

  const resetGame = () => {
    state.current = {
      ...state.current,
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      dir: { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food: { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) },
      gameOver: false,
      hasStarted: true,
      score: 0,
      particles: []
    };
    setGameStateStr('ACTIVE_STREAM');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      if (state.current.gameOver || !state.current.hasStarted) {
        if (e.key === 'Enter' || e.key === ' ') resetGame();
        return;
      }

      const { dir } = state.current;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (dir.y === 0) state.current.nextDir = { x: 0, y: -1 };
          break;
        case 'ArrowDown': case 's': case 'S':
          if (dir.y === 0) state.current.nextDir = { x: 0, y: 1 };
          break;
        case 'ArrowLeft': case 'a': case 'A':
          if (dir.x === 0) state.current.nextDir = { x: -1, y: 0 };
          break;
        case 'ArrowRight': case 'd': case 'D':
          if (dir.x === 0) state.current.nextDir = { x: 1, y: 0 };
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = (timestamp: number) => {
      const s = state.current;
      
      // Update Logic
      if (s.hasStarted && !s.gameOver) {
        if (timestamp - s.lastMoveTime > s.moveInterval) {
          s.dir = s.nextDir;
          const head = s.snake[0];
          const newHead = { x: head.x + s.dir.x, y: head.y + s.dir.y };

          // Wall collision
          if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
            s.gameOver = true;
            s.shakeUntil = timestamp + 500;
            spawnParticles(head.x, head.y, '#00FFFF', 30);
            setGameStateStr('DATA_CORRUPTION_DETECTED');
          } else if (s.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            // Self collision
            s.gameOver = true;
            s.shakeUntil = timestamp + 500;
            spawnParticles(head.x, head.y, '#00FFFF', 30);
            setGameStateStr('DATA_CORRUPTION_DETECTED');
          } else {
            s.snake.unshift(newHead);
            if (newHead.x === s.food.x && newHead.y === s.food.y) {
              s.score += 10;
              spawnParticles(s.food.x, s.food.y, '#FF00FF', 15);
              s.food = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
              // Increase speed slightly
              s.moveInterval = Math.max(50, s.moveInterval - 2);
            } else {
              s.snake.pop();
            }
          }
          s.lastMoveTime = timestamp;
        }
      }

      // Update particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) s.particles.splice(i, 1);
      }

      // Render Logic
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.save();
      if (timestamp < s.shakeUntil) {
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        ctx.translate(dx, dy);
      }

      // Draw Grid (subtle)
      ctx.strokeStyle = '#00FFFF';
      ctx.globalAlpha = 0.1;
      ctx.lineWidth = 1;
      for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i); ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Draw Food
      if (s.hasStarted && !s.gameOver) {
        ctx.fillStyle = '#FF00FF';
        // Glitchy food
        const foodOffset = Math.random() > 0.9 ? (Math.random() - 0.5) * 4 : 0;
        ctx.fillRect(s.food.x * CELL_SIZE + 2 + foodOffset, s.food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }

      // Draw Snake
      s.snake.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#FFFFFF' : '#00FFFF';
        const glitchX = (Math.random() > 0.95 && !s.gameOver) ? (Math.random() - 0.5) * 4 : 0;
        ctx.fillRect(seg.x * CELL_SIZE + 1 + glitchX, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });

      // Draw Particles
      s.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x, p.y, 4, 4);
      });
      ctx.globalAlpha = 1.0;

      ctx.restore();

      // Draw Scanline over canvas
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.fillRect(0, (timestamp / 5) % CANVAS_SIZE, CANVAS_SIZE, 4);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full flex justify-between mb-2 text-2xl">
        <span className="text-magenta-500" style={{ color: '#FF00FF' }}>STATUS:</span>
        <span className={gameStateStr === 'DATA_CORRUPTION_DETECTED' ? 'text-red-500 animate-pulse' : 'text-cyan-400'}>
          {gameStateStr}
        </span>
      </div>
      <div className="relative p-2 bg-magenta-500" style={{ backgroundColor: '#FF00FF' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-black w-full max-w-[500px] aspect-square block cursor-crosshair"
          style={{ imageRendering: 'pixelated' }}
        />
        {(!state.current.hasStarted || state.current.gameOver) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <button 
              onClick={resetGame}
              className="jarring-border bg-black text-cyan-400 px-8 py-4 text-3xl uppercase hover:bg-cyan-900 transition-colors"
              style={{ color: '#00FFFF' }}
            >
              {state.current.gameOver ? 'REBOOT_SYSTEM' : 'INIT_SEQUENCE'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
