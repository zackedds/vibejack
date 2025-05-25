import { Card, GameState, createDeck, createHand } from '@/utils/cards';

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deals initial cards and creates new game state
 */
export function deal(): GameState {
  const deck = shuffle(createDeck());
  const playerCards = [deck.pop()!, deck.pop()!];
  const dealerCards = [deck.pop()!, deck.pop()!];
  
  return {
    playerHand: createHand(playerCards),
    dealerHand: createHand([dealerCards[0]]), // Only show first dealer card
    deck,
    gameStatus: 'playing',
    canDouble: true,
  };
}

/**
 * Handles player hitting (drawing one card)
 */
export function hit(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  
  const newCard = state.deck.pop()!;
  const newPlayerCards = [...state.playerHand.cards, newCard];
  const newPlayerHand = createHand(newPlayerCards);
  
  return {
    ...state,
    playerHand: newPlayerHand,
    deck: state.deck,
    gameStatus: newPlayerHand.isBusted ? 'gameOver' : 'playing',
    outcome: newPlayerHand.isBusted ? 'lose' : undefined,
    canDouble: false,
  };
}

/**
 * Handles dealer's turn and determines game outcome
 */
export function stand(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  
  // Reveal dealer's hidden card
  const dealerCards = [...state.dealerHand.cards];
  
  // Keep hitting until dealer has 17 or more (soft 17 rule)
  while (createHand(dealerCards).score < 17) {
    dealerCards.push(state.deck.pop()!);
  }
  
  const finalDealerHand = createHand(dealerCards);
  const outcome = determineOutcome(state.playerHand, finalDealerHand);
  
  return {
    ...state,
    dealerHand: finalDealerHand,
    deck: state.deck,
    gameStatus: 'gameOver',
    outcome,
    canDouble: false,
  };
}

/**
 * Handles double down action
 */
export function doubleDown(state: GameState): GameState {
  if (!state.canDouble || state.gameStatus !== 'playing') return state;
  
  // Draw one card and stand
  const newCard = state.deck.pop()!;
  const newPlayerCards = [...state.playerHand.cards, newCard];
  const newPlayerHand = createHand(newPlayerCards);
  
  if (newPlayerHand.isBusted) {
    return {
      ...state,
      playerHand: newPlayerHand,
      deck: state.deck,
      gameStatus: 'gameOver',
      outcome: 'lose',
      canDouble: false,
    };
  }
  
  // Stand automatically after double down
  return stand({
    ...state,
    playerHand: newPlayerHand,
    deck: state.deck,
    canDouble: false,
  });
}

/**
 * Determines the game outcome by comparing hands
 */
function determineOutcome(playerHand: { score: number, isBusted: boolean }, dealerHand: { score: number, isBusted: boolean }): 'win' | 'lose' | 'push' {
  if (playerHand.isBusted) return 'lose';
  if (dealerHand.isBusted) return 'win';
  if (playerHand.score > dealerHand.score) return 'win';
  if (playerHand.score < dealerHand.score) return 'lose';
  return 'push';
} 