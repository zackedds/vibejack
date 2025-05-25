import Image from 'next/image';
import { useState } from 'react';

export type CardCode = `${string}${string}`; // e.g. "AS", "10H"

interface CardProps {
  /** Card code (e.g. "AS" for Ace of Spades, "10H" for 10 of Hearts) */
  code: CardCode;
  /** Whether the card should be shown face down */
  faceDown?: boolean;
  /** Whether to apply the flip animation */
  shouldFlip?: boolean;
}

/**
 * Card component that displays a playing card with proper styling and animations.
 * Falls back to text representation if image fails to load.
 */
export default function Card({ code, faceDown = false, shouldFlip = false }: CardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Convert code to text fallback (e.g. "AS" -> "A♠")
  const getTextFallback = (code: string) => {
    const rank = code.slice(0, -1);
    const suit = code.slice(-1);
    const suitMap: Record<string, string> = {
      'S': '♠',
      'H': '♥',
      'D': '♦',
      'C': '♣'
    };
    return `${rank}${suitMap[suit]}`;
  };

  if (imageError) {
    return (
      <div 
        className={`
          w-[100px] h-[140px] flex items-center justify-center
          bg-white rounded-lg shadow-md text-2xl
          ${shouldFlip ? 'animate-flip' : 'animate-deal'}
          ${code.endsWith('H') || code.endsWith('D') ? 'text-red-600' : 'text-black'}
        `}
      >
        {faceDown ? '🂠' : getTextFallback(code)}
      </div>
    );
  }

  return (
    <div 
      className={`
        relative w-[100px] h-[140px] rounded-lg shadow-md overflow-hidden
        ${shouldFlip ? 'animate-flip' : 'animate-deal'}
      `}
    >
      <Image
        src={`https://unpkg.com/png-cards@latest/${faceDown ? 'BACK' : code}.png`}
        alt={faceDown ? 'Card back' : getTextFallback(code)}
        fill
        className="object-contain"
        onError={() => setImageError(true)}
        priority
      />
    </div>
  );
} 