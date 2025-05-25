'use client';

import { useState } from 'react';
import type { GameState } from '@/utils/cards';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAction(action: 'deal' | 'hit' | 'stand' | 'double') {
    try {
      setIsLoading(true);
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, state: gameState }),
      });
      
      if (!response.ok) throw new Error('Game action failed');
      const newState = await response.json();
      setGameState(newState);
    } catch (error) {
      console.error('Game action error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function renderHand(cards: { rank: string; suit: string; }[], hideSecond = false) {
    return cards.map((card, index) => {
      if (hideSecond && index === 1) return <span key="hidden" className="mx-1">🂠</span>;
      return (
        <span
          key={`${card.rank}${card.suit}`}
          className={`mx-1 ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-black'}`}
        >
          {card.rank}{card.suit}
        </span>
      );
    });
  }

  return (
    <main className="min-h-screen bg-green-800 p-4">
      <div className="max-w-lg mx-auto bg-green-700 rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Blackjack</h1>
        
        {!gameState ? (
          <div className="text-center">
            <button
              onClick={() => handleAction('deal')}
              disabled={isLoading}
              className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-full hover:bg-yellow-400 disabled:opacity-50"
            >
              Deal Cards
            </button>
          </div>
        ) : (
          <>
            {/* Dealer's Hand */}
            <div className="mb-8">
              <h2 className="text-white mb-2">Dealer's Hand {gameState.gameStatus === 'gameOver' && `(${gameState.dealerHand.score})`}</h2>
              <div className="bg-green-600 p-4 rounded-lg text-2xl">
                {renderHand(gameState.dealerHand.cards, gameState.gameStatus !== 'gameOver')}
              </div>
            </div>
            
            {/* Player's Hand */}
            <div className="mb-8">
              <h2 className="text-white mb-2">Your Hand ({gameState.playerHand.score})</h2>
              <div className="bg-green-600 p-4 rounded-lg text-2xl">
                {renderHand(gameState.playerHand.cards)}
              </div>
            </div>
            
            {/* Game Outcome */}
            {gameState.outcome && (
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {gameState.outcome === 'win' && 'You Win! 🎉'}
                  {gameState.outcome === 'lose' && 'Dealer Wins 😢'}
                  {gameState.outcome === 'push' && "It's a Push 🤝"}
                </h2>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              {gameState.gameStatus === 'gameOver' ? (
                <button
                  onClick={() => handleAction('deal')}
                  disabled={isLoading}
                  className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-full hover:bg-yellow-400 disabled:opacity-50"
                >
                  New Game
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleAction('hit')}
                    disabled={isLoading || gameState.gameStatus !== 'playing'}
                    className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-400 disabled:opacity-50"
                  >
                    Hit
                  </button>
                  <button
                    onClick={() => handleAction('stand')}
                    disabled={isLoading || gameState.gameStatus !== 'playing'}
                    className="bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-400 disabled:opacity-50"
                  >
                    Stand
                  </button>
                  {gameState.canDouble && (
                    <button
                      onClick={() => handleAction('double')}
                      disabled={isLoading || !gameState.canDouble}
                      className="bg-purple-500 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-400 disabled:opacity-50"
                    >
                      Double
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
