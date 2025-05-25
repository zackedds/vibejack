import {GameState, createDeck, createHand, INITIAL_BANKROLL, BASE_BET, calculateScore } from '@/utils/cards';

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
 * Shows betting UI
 */
export function showBetting(bankroll = INITIAL_BANKROLL): GameState {
  return {
    playerHand: createHand([]),
    dealerHand: createHand([]),
    deck: [],
    gameStatus: 'betting',
    canDouble: false,
    bankroll,
    currentBet: BASE_BET,
    isDoubled: false,
    showBettingUI: true,
  };
}

/**
 * Deals initial cards and creates new game state
 */
export function deal(bet: number, bankroll = INITIAL_BANKROLL): GameState {
  if (bet > bankroll) {
    throw new Error('Insufficient funds');
  }
  
  const deck = shuffle(createDeck());
  const playerCards = [deck.pop()!, deck.pop()!];
  const dealerCards = [deck.pop()!, deck.pop()!];
  
  return {
    playerHand: createHand(playerCards),
    dealerHand: {
      ...createHand(dealerCards),
      score: calculateScore([dealerCards[0]]), // Only count visible card in score
      hasHiddenCard: true
    },
    deck,
    gameStatus: 'playing',
    canDouble: bet * 2 <= bankroll, // Only allow double if player has enough funds
    bankroll,
    currentBet: bet,
    isDoubled: false,
    showBettingUI: false,
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
  
  if (newPlayerHand.isBusted) {
    // Reveal dealer's hand on bust
    return {
      ...state,
      playerHand: newPlayerHand,
      dealerHand: {
        ...state.dealerHand,
        hasHiddenCard: false,
        score: calculateScore(state.dealerHand.cards)
      },
      deck: state.deck,
      gameStatus: 'gameOver',
      outcome: 'lose',
      canDouble: false,
      bankroll: state.bankroll - state.currentBet,
    };
  }
  
  return {
    ...state,
    playerHand: newPlayerHand,
    deck: state.deck,
    gameStatus: 'playing',
    canDouble: false,
  };
}

/**
 * Handles dealer's turn and determines game outcome
 */
export function stand(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  
  // Reveal dealer's hidden card and complete hand
  const dealerCards = [...state.dealerHand.cards];
  const revealedDealerHand = {
    ...createHand(dealerCards),
    hasHiddenCard: false
  };
  
  // Keep hitting until dealer has 17 or more (soft 17 rule)
  while (revealedDealerHand.score < 17) {
    dealerCards.push(state.deck.pop()!);
    Object.assign(revealedDealerHand, createHand(dealerCards));
  }
  
  const outcome = determineOutcome(state.playerHand, revealedDealerHand);
  
  // Calculate new bankroll based on outcome
  let newBankroll = state.bankroll;
  if (outcome === 'win') {
    newBankroll += state.currentBet;
  } else if (outcome === 'lose') {
    newBankroll -= state.currentBet;
  }
  
  return {
    ...state,
    dealerHand: revealedDealerHand,
    deck: state.deck,
    gameStatus: 'gameOver',
    outcome,
    canDouble: false,
    bankroll: newBankroll,
  };
}

/**
 * Handles double down action
 */
export function doubleDown(state: GameState): GameState {
  if (!state.canDouble || state.gameStatus !== 'playing') return state;
  
  // Double the bet
  const doubledBet = state.currentBet * 2;
  
  // Draw one card and stand
  const newCard = state.deck.pop()!;
  const newPlayerCards = [...state.playerHand.cards, newCard];
  const newPlayerHand = createHand(newPlayerCards);
  
  if (newPlayerHand.isBusted) {
    return {
      ...state,
      playerHand: newPlayerHand,
      dealerHand: {
        ...state.dealerHand,
        hasHiddenCard: false,
        score: calculateScore(state.dealerHand.cards)
      },
      deck: state.deck,
      gameStatus: 'gameOver',
      outcome: 'lose',
      canDouble: false,
      currentBet: doubledBet,
      isDoubled: true,
      bankroll: state.bankroll - doubledBet,
    };
  }
  
  // Stand automatically after double down
  return stand({
    ...state,
    playerHand: newPlayerHand,
    deck: state.deck,
    canDouble: false,
    currentBet: doubledBet,
    isDoubled: true,
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