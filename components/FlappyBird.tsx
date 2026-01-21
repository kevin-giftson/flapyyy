
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState, Pipe } from '../types';
import { 
  GRAVITY, 
  JUMP_STRENGTH, 
  PIPE_SPEED, 
  PIPE_SPAWN_RATE, 
  PIPE_WIDTH, 
  PIPE_GAP, 
  BIRD_X, 
  BIRD_SIZE,
  THEME_COLORS
} from '../constants';

interface FlappyBirdProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const FlappyBird: React.FC<FlappyBirdProps> = ({ gameState, onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef({
    birdY: 300,
    birdVel: 0,
    pipes: [] as Pipe[],
    frameCount: 0,
    score: 0,
    animationId: 0,
    lastTime: 0
  });

  // Keep refs for callbacks to avoid re-triggering the main effect loop
  const callbacksRef = useRef({ onGameOver, onScoreUpdate });
  useEffect(() => {
    callbacksRef.current = { onGameOver, onScoreUpdate };
  });

  const resetGameData = useCallback(() => {
    gameRef.current = {
      birdY: 300,
      birdVel: 0,
      pipes: [],
      frameCount: 0,
      score: 0,
      animationId: 0,
      lastTime: 0
    };
  }, []);

  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      gameRef.current.birdVel = JUMP_STRENGTH;
    }
  }, [gameState]);

  // Handle Keyboard - Global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // Handle Pointer/Click - Canvas specific
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    // Only jump if we are playing
    if (gameState === GameState.PLAYING) {
      jump();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDestroyed = false;

    const draw = () => {
      if (isDestroyed) return;
      
      const { width, height } = canvas;
      const game = gameRef.current;

      // --- Background Rendering ---
      ctx.fillStyle = THEME_COLORS.background;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      if (gameState === GameState.MENU) {
        // Just draw a static preview bird
        ctx.fillStyle = THEME_COLORS.bird;
        ctx.fillRect(BIRD_X, 300, BIRD_SIZE, BIRD_SIZE);
        return;
      }

      // --- Physics Update ---
      if (gameState === GameState.PLAYING) {
        game.birdVel += GRAVITY;
        game.birdY += game.birdVel;
        game.frameCount++;

        if (game.frameCount % PIPE_SPAWN_RATE === 0) {
          const minH = 50;
          const maxH = height - PIPE_GAP - minH;
          const topHeight = Math.floor(Math.random() * (maxH - minH + 1) + minH);
          game.pipes.push({ x: width, topHeight, width: PIPE_WIDTH, passed: false });
        }

        game.pipes.forEach(pipe => {
          pipe.x -= PIPE_SPEED;
          if (!pipe.passed && pipe.x + pipe.width < BIRD_X) {
            pipe.passed = true;
            game.score++;
            callbacksRef.current.onScoreUpdate(game.score);
          }
        });

        game.pipes = game.pipes.filter(pipe => pipe.x + pipe.width > 0);

        const birdRect = {
          left: BIRD_X,
          right: BIRD_X + BIRD_SIZE,
          top: game.birdY,
          bottom: game.birdY + BIRD_SIZE
        };

        if (birdRect.bottom > height || birdRect.top < 0) {
          callbacksRef.current.onGameOver(game.score);
          return; // Stop physics on game over
        }

        for (const pipe of game.pipes) {
          const topRect = { left: pipe.x, right: pipe.x + pipe.width, top: 0, bottom: pipe.topHeight };
          const bottomRect = { left: pipe.x, right: pipe.x + pipe.width, top: pipe.topHeight + PIPE_GAP, bottom: height };
          const checkCollision = (r1: any, r2: any) => !(r1.left > r2.right || r1.right < r2.left || r1.top > r2.bottom || r1.bottom < r2.top);
          
          if (checkCollision(birdRect, topRect) || checkCollision(birdRect, bottomRect)) {
            callbacksRef.current.onGameOver(game.score);
            return;
          }
        }
      }

      // --- Rendering Entities ---
      game.pipes.forEach(pipe => {
        const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
        pipeGrad.addColorStop(0, '#059669');
        pipeGrad.addColorStop(0.5, '#10b981');
        pipeGrad.addColorStop(1, '#059669');
        ctx.fillStyle = pipeGrad;
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, pipe.width, height - (pipe.topHeight + PIPE_GAP));
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(pipe.x - 2, pipe.topHeight - 15, pipe.width + 4, 15);
        ctx.fillRect(pipe.x - 2, pipe.topHeight + PIPE_GAP, pipe.width + 4, 15);
      });

      ctx.save();
      ctx.translate(BIRD_X + BIRD_SIZE / 2, game.birdY + BIRD_SIZE / 2);
      const rotation = gameState === GameState.PLAYING ? Math.min(Math.PI / 4, Math.max(-Math.PI / 4, game.birdVel * 0.1)) : 0;
      ctx.rotate(rotation);
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
      ctx.fillStyle = THEME_COLORS.bird;
      ctx.beginPath();
      ctx.roundRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE, 8);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(BIRD_SIZE / 4, -BIRD_SIZE / 6, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(BIRD_SIZE / 4 + 2, -BIRD_SIZE / 6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(-BIRD_SIZE / 4, BIRD_SIZE / 8, 10, 6, -rotation, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (gameState === GameState.PLAYING) {
        game.animationId = requestAnimationFrame(draw);
      }
    };

    if (gameState === GameState.PLAYING) {
      resetGameData();
      gameRef.current.animationId = requestAnimationFrame(draw);
    } else {
      // Draw a static frame for Menu/Game Over
      draw();
    }

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(gameRef.current.animationId);
    };
  }, [gameState, resetGameData]);

  return (
    <canvas 
      ref={canvasRef} 
      width={400} 
      height={711} 
      onPointerDown={handlePointerDown}
      className="block w-full h-full cursor-pointer touch-none"
    />
  );
};

export default FlappyBird;
