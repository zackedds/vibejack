import type { CardCode } from '@/components/Card';

export type Suit = 'S' | 'C' | 'H' | 'D';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export type Card = { 
  code: CardCode;
  rank: Rank;
  suit: Suit;
};

export type Hand = {
  cards: Card[];
  score: number;
  isBusted: boolean;
  hasHiddenCard?: boolean;
};

export type GameState = {
  playerHand: Hand;
  dealerHand: Hand;
  deck: Card[];
  gameStatus: 'betting' | 'playing' | 'dealerTurn' | 'gameOver';
  outcome?: 'win' | 'lose' | 'push';
  canDouble: boolean;
  bankroll: number;
  currentBet: number;
  isDoubled: boolean;
  showBettingUI?: boolean;
};

const SUITS: Suit[] = ['S', 'C', 'H', 'D'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const INITIAL_BANKROLL = 1000;
export const BASE_BET = 50;
export const PRESET_BETS = [50, 100, 200, 500] as const;

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ 
        code: `${rank}${suit}` as CardCode,
        rank, 
        suit 
      });
    }
  }
  return deck;
}

export function calculateScore(cards: Card[]): number {
  let score = 0;
  let aces = 0;

  for (const card of cards) {
    if (card.rank === 'A') {
      aces += 1;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      score += 10;
    } else {
      score += parseInt(card.rank);
    }
  }

  // Add all aces as 11 initially
  score += aces * 11;

  // Demote aces from 11 to 1 as needed to avoid busting
  while (score > 21 && aces > 0) {
    score -= 10; // 11 -> 1 = subtract 10
    aces--;
  }

  return score;
}

export function isBusted(score: number): boolean {
  return score > 21;
}

export function createHand(cards: Card[]): Hand {
  const score = calculateScore(cards);
  return {
    cards,
    score,
    isBusted: isBusted(score),
  };
} 