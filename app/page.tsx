'use client';

import { useState, useEffect } from 'react';
import type { GameState } from '@/utils/cards';
import { INITIAL_BANKROLL, BASE_BET, PRESET_BETS } from '@/utils/cards';
import Card from '@/components/Card';

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [customBet, setCustomBet] = useState('');
  const [lastBet, setLastBet] = useState(BASE_BET);

  // Update cardKey when new cards are dealt or when game status changes
  useEffect(() => {
    if (gameState) {
      setCardKey(prev => prev + 1);
    }
  }, [
    gameState?.playerHand.cards.length,
    gameState?.dealerHand.cards.length,
    gameState?.gameStatus
  ]);

  // Update lastBet when a bet is placed
  useEffect(() => {
    if (gameState && gameState.currentBet && gameState.gameStatus === 'playing') {
      setLastBet(gameState.currentBet);
      // If the last bet was a custom bet, update the input field
      if (!PRESET_BETS.includes(gameState.currentBet as any)) {
        setCustomBet(gameState.currentBet.toString());
      }
    }
  }, [gameState?.currentBet, gameState?.gameStatus]);

  async function handleAction(action: 'showBetting' | 'deal' | 'hit' | 'stand' | 'double', bet?: number) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action,
          bet,
          state: action === 'showBetting' ? { bankroll: gameState?.bankroll ?? INITIAL_BANKROLL } : gameState 
        }),
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

  const handleCustomBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomBet(value);
  };

  const handleCustomBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bet = parseInt(customBet);
    if (bet && bet > 0 && bet <= (gameState?.bankroll ?? INITIAL_BANKROLL)) {
      handleAction('deal', bet);
    }
  };

  const isGameInProgress = gameState?.gameStatus === 'playing';
  const canPlaceBets = !gameState || gameState.gameStatus === 'betting' || gameState.gameStatus === 'gameOver';

  return (
    <main className="min-h-screen bg-green-800 p-4">
      <div className="max-w-lg mx-auto bg-green-700 rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Blackjack</h1>
          <div className="text-right">
            <div className="text-yellow-400 font-bold">Bankroll: ${gameState?.bankroll ?? INITIAL_BANKROLL}</div>
          </div>
        </div>

        {/* Betting UI - Always visible */}
        <div className={`text-center space-y-4 mb-8 ${!canPlaceBets ? 'opacity-50 pointer-events-none' : ''}`}>
          <h2 className="text-xl text-white mb-4">Place Your Bet</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {PRESET_BETS.map(amount => (
              <button
                key={amount}
                onClick={() => handleAction('deal', amount)}
                disabled={isLoading || amount > (gameState?.bankroll ?? INITIAL_BANKROLL) || !canPlaceBets}
                className={`bg-yellow-500 text-black font-bold py-2 px-4 rounded-full hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed
                  ${amount === lastBet && canPlaceBets ? 'ring-2 ring-white' : ''}`}
              >
                ${amount}
              </button>
            ))}
          </div>
          <form onSubmit={handleCustomBetSubmit} className="flex justify-center gap-2">
            <input
              type="text"
              value={customBet}
              onChange={handleCustomBetChange}
              placeholder="Custom"
              disabled={!canPlaceBets}
              className="w-24 px-3 py-2 rounded-full text-center disabled:opacity-50"
              pattern="[0-9]*"
            />
            <button
              type="submit"
              disabled={!customBet || parseInt(customBet) > (gameState?.bankroll ?? INITIAL_BANKROLL) || !canPlaceBets}
              className="bg-yellow-500 text-black font-bold py-2 px-4 rounded-full hover:bg-yellow-400 disabled:opacity-50"
            >
              Bet
            </button>
          </form>
        </div>
        
        {gameState && gameState.gameStatus !== 'betting' && (
          <>
            {/* Dealer's Hand */}
            <div className="mb-8">
              <h2 className="text-white mb-2">
                Dealer's Hand {!gameState.dealerHand.hasHiddenCard && `(${gameState.dealerHand.score})`}
              </h2>
              <div className="bg-green-600 p-4 rounded-lg min-h-[160px] flex gap-2 items-center">
                {gameState.dealerHand.cards.map((card, index) => (
                  <Card
                    key={`${cardKey}-dealer-${index}`}
                    code={card.code}
                    faceDown={index === 1 && gameState.dealerHand.hasHiddenCard}
                  />
                ))}
              </div>
            </div>
            
            {/* Player's Hand */}
            <div className="mb-8">
              <h2 className="text-white mb-2">
                Your Hand ({gameState.playerHand.score})
                <span className="text-yellow-300 text-sm ml-4">Current Bet: ${gameState.currentBet}</span>
                {gameState.isDoubled && <span className="text-yellow-300 text-sm ml-2">(Doubled)</span>}
              </h2>
              <div className="bg-green-600 p-4 rounded-lg min-h-[160px] flex gap-2 items-center">
                {gameState.playerHand.cards.map((card, index) => (
                  <Card
                    key={`${cardKey}-player-${index}`}
                    code={card.code}
                  />
                ))}
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
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                {gameState.gameStatus === 'gameOver' ? (
                  <button
                    onClick={() => handleAction('deal', lastBet)}
                    disabled={isLoading || lastBet > (gameState?.bankroll ?? INITIAL_BANKROLL)}
                    className="bg-yellow-500 text-black font-bold py-2 px-6 rounded-full hover:bg-yellow-400 disabled:opacity-50"
                  >
                    Play Again (${lastBet})
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction('hit')}
                      disabled={isLoading}
                      className="bg-blue-500 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-400 disabled:opacity-50"
                    >
                      Hit
                    </button>
                    <button
                      onClick={() => handleAction('stand')}
                      disabled={isLoading}
                      className="bg-red-500 text-white font-bold py-2 px-6 rounded-full hover:bg-red-400 disabled:opacity-50"
                    >
                      Stand
                    </button>
                  </>
                )}
              </div>
              
              {/* Double Down Button - Separate Row */}
              {isGameInProgress && gameState.canDouble && (
                <div className="flex justify-center">
                  <button
                    onClick={() => handleAction('double')}
                    disabled={isLoading || !gameState.canDouble || gameState.bankroll < gameState.currentBet * 2}
                    className="bg-purple-500 text-white font-bold py-2 px-6 rounded-full hover:bg-purple-400 disabled:opacity-50"
                  >
                    Double Down (${gameState.currentBet * 2})
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
