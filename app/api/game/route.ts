import { NextResponse } from 'next/server';
import { deal, hit, stand, doubleDown, showBetting } from './logic';
import type { GameState } from '@/utils/cards';

export async function POST(request: Request) {
  try {
    const { action, state, bet } = await request.json();
    
    switch (action) {
      case 'showBetting':
        return NextResponse.json(showBetting(state?.bankroll));
      case 'deal':
        return NextResponse.json(deal(bet, state?.bankroll));
      case 'hit':
        return NextResponse.json(hit(state as GameState));
      case 'stand':
        return NextResponse.json(stand(state as GameState));
      case 'double':
        return NextResponse.json(doubleDown(state as GameState));
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Game API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 