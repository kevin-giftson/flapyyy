
import React from 'react';
import { GameState, ScoreData } from '../types';

interface OverlayProps {
  gameState: GameState;
  score: ScoreData;
  commentary: string;
  isLoadingCommentary: boolean;
  onStart: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ gameState, score, commentary, isLoadingCommentary, onStart }) => {
  if (gameState === GameState.PLAYING) return null;

  const handleStart = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    onStart();
  };

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 z-50">
      
      {gameState === GameState.MENU && (
        <div className="flex flex-col items-center">
          <div className="mb-8 relative">
            <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
              GEMINI<br/><span className="text-blue-500">WINGS</span>
            </h1>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-400 rounded-full animate-bounce flex items-center justify-center border-2 border-white shadow-lg">
              <span className="text-xs font-bold text-black">BIRD</span>
            </div>
          </div>
          
          <button 
            onPointerDown={handleStart}
            className="group relative px-10 py-4 bg-blue-600 text-white font-bold rounded-full text-xl hover:bg-blue-500 transition-all active:scale-95 shadow-xl hover:shadow-blue-500/25"
          >
            START MISSION
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20 pointer-events-none"></div>
          </button>
          
          <p className="mt-8 text-slate-400 text-sm font-medium">
            HIGH SCORE: <span className="text-white">{score.high}</span>
          </p>
        </div>
      )}

      {gameState === GameState.GAME_OVER && (
        <div className="flex flex-col items-center w-full">
          <h2 className="text-4xl font-black text-red-500 mb-2 animate-bounce">CRASHED!</h2>
          
          <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 w-full mb-6 shadow-2xl">
            <div className="flex justify-between mb-4 border-b border-slate-800 pb-4">
              <div className="text-left">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Score</p>
                <p className="text-4xl font-black text-white">{score.current}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Best</p>
                <p className="text-4xl font-black text-blue-400">{score.high}</p>
              </div>
            </div>

            <div className="relative min-h-[60px] flex items-center justify-center">
              {isLoadingCommentary ? (
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : (
                <p className="text-slate-200 italic font-medium leading-tight">
                  "{commentary}"
                </p>
              )}
            </div>
          </div>

          <button 
            onPointerDown={handleStart}
            className="w-full py-4 bg-white text-black font-black rounded-xl text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-xl"
          >
            TRY AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

export default Overlay;
