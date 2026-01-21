
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, ScoreData } from './types';
import FlappyBird from './components/FlappyBird';
import Overlay from './components/Overlay';
import { getGameCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState<ScoreData>({ current: 0, high: 0 });
  const [commentary, setCommentary] = useState<string>("");
  const [isLoadingCommentary, setIsLoadingCommentary] = useState(false);

  // Load high score from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gemini-wings-high-score');
    if (saved) {
      setScore(prev => ({ ...prev, high: parseInt(saved, 10) }));
    }
  }, []);

  const handleScoreUpdate = useCallback((currentScore: number) => {
    setScore(prev => ({ ...prev, current: currentScore }));
  }, []);

  const handleGameOver = useCallback(async (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    setIsLoadingCommentary(true);
    
    // Update score state
    setScore(prev => {
      const newHigh = Math.max(prev.high, finalScore);
      localStorage.setItem('gemini-wings-high-score', newHigh.toString());
      return { current: finalScore, high: newHigh };
    });

    // Get AI commentary
    const aiText = await getGameCommentary(finalScore, score.high);
    setCommentary(aiText);
    setIsLoadingCommentary(false);
  }, [score.high]);

  const startGame = useCallback(() => {
    setGameState(GameState.PLAYING);
    setCommentary("");
    setScore(prev => ({ ...prev, current: 0 }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 flex items-center justify-center overflow-hidden select-none">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900 via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[400px] aspect-[9/16] bg-black shadow-2xl overflow-hidden border-4 border-slate-800 rounded-xl">
        <FlappyBird 
          gameState={gameState} 
          onGameOver={handleGameOver} 
          onScoreUpdate={handleScoreUpdate}
        />
        
        <Overlay 
          gameState={gameState} 
          score={score} 
          commentary={commentary}
          isLoadingCommentary={isLoadingCommentary}
          onStart={startGame} 
        />

        {/* HUD */}
        {gameState === GameState.PLAYING && (
          <div className="absolute top-8 left-0 w-full text-center pointer-events-none">
            <span className="text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              {score.current}
            </span>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-slate-500 text-xs text-center hidden md:block">
        Use <span className="text-slate-300 font-bold">Space</span>, <span className="text-slate-300 font-bold">Up Arrow</span>, or <span className="text-slate-300 font-bold">Click/Tap</span> to fly
      </div>
    </div>
  );
};

export default App;
