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
 * Checks for natural blackjack and resolves immediately if found
 */
export function deal(bet: number, bankroll = INITIAL_BANKROLL): GameState {
  if (bet > bankroll) {
    throw new Error('Insufficient funds');
  }
  
  const deck = shuffle(createDeck());
  const playerCards = [deck.pop()!, deck.pop()!];
  const dealerCards = [deck.pop()!, deck.pop()!];
  
  const playerHand = createHand(playerCards);
  const dealerHand = createHand(dealerCards);
  
  // Check for natural blackjack
  if (playerHand.isBlackjack || dealerHand.isBlackjack) {
    const outcome = determineOutcome(playerHand, dealerHand);
    let newBankroll = bankroll;
    
    if (outcome === 'blackjack') {
      // Blackjack pays 3:2
      newBankroll += Math.floor(bet * 1.5);
    } else if (outcome === 'lose') {
      newBankroll -= bet;
    }
    // Push: no change to bankroll
    
    return {
      playerHand,
      dealerHand: {
        ...dealerHand,
        hasHiddenCard: false // Reveal dealer's hand
      },
      deck,
      gameStatus: 'gameOver',
      outcome,
      canDouble: false,
      bankroll: newBankroll,
      currentBet: bet,
      isDoubled: false,
      showBettingUI: false,
    };
  }
  
  return {
    playerHand,
    dealerHand: {
      ...dealerHand,
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
  
  // Clone deck to avoid mutating state
  const deck = [...state.deck];
  const newCard = deck.pop()!;
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
      deck,
      gameStatus: 'gameOver',
      outcome: 'lose',
      canDouble: false,
      bankroll: state.bankroll - state.currentBet,
    };
  }
  
  return {
    ...state,
    playerHand: newPlayerHand,
    deck,
    gameStatus: 'playing',
    canDouble: false,
  };
}

/**
 * Handles dealer's turn and determines game outcome
 */
export function stand(state: GameState): GameState {
  if (state.gameStatus !== 'playing') return state;
  
  // Clone deck to avoid mutating state
  const deck = [...state.deck];
  
  // Reveal dealer's hidden card and complete hand
  const dealerCards = [...state.dealerHand.cards];
  let revealedDealerHand = {
    ...createHand(dealerCards),
    hasHiddenCard: false
  };
  
  // Keep hitting until dealer has 17 or more (soft 17 rule)
  while (revealedDealerHand.score < 17) {
    dealerCards.push(deck.pop()!);
    revealedDealerHand = {
      ...createHand(dealerCards),
      hasHiddenCard: false
    };
  }
  
  const outcome = determineOutcome(state.playerHand, revealedDealerHand);
  
  // Calculate new bankroll based on outcome
  let newBankroll = state.bankroll;
  if (outcome === 'win') {
    newBankroll += state.currentBet;
  } else if (outcome === 'blackjack') {
    // Blackjack pays 3:2 (shouldn't happen in stand, but handle it)
    newBankroll += Math.floor(state.currentBet * 1.5);
  } else if (outcome === 'lose') {
    newBankroll -= state.currentBet;
  }
  // Push: no change to bankroll
  
  return {
    ...state,
    dealerHand: revealedDealerHand,
    deck,
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
  
  // Clone deck to avoid mutating state
  const deck = [...state.deck];
  
  // Draw one card and stand
  const newCard = deck.pop()!;
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
      deck,
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
    deck,
    canDouble: false,
    currentBet: doubledBet,
    isDoubled: true,
  });
}

/**
 * Determines the game outcome by comparing hands
 * Handles natural blackjack cases separately
 */
function determineOutcome(
  playerHand: { score: number; isBusted: boolean; isBlackjack: boolean },
  dealerHand: { score: number; isBusted: boolean; isBlackjack: boolean }
): 'win' | 'lose' | 'push' | 'blackjack' {
  // Handle blackjack cases
  if (playerHand.isBlackjack && dealerHand.isBlackjack) return 'push';
  if (playerHand.isBlackjack) return 'blackjack';
  if (dealerHand.isBlackjack) return 'lose';
  
  // Standard comparison
  if (playerHand.isBusted) return 'lose';
  if (dealerHand.isBusted) return 'win';
  if (playerHand.score > dealerHand.score) return 'win';
  if (playerHand.score < dealerHand.score) return 'lose';
  return 'push';
} 