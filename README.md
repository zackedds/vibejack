# Blackjack MVP

A simple Blackjack game built with Next.js 13, TypeScript, and Tailwind CSS.

## Features

- Single-player gameplay against a dealer
- Core Blackjack actions: Deal, Hit, Stand, Double Down
- Responsive design for desktop and mobile
- In-memory game state management
- Professional card assets from png-cards CDN
- Smooth CSS animations for dealing and card reveals

## Getting Started

### Prerequisites

- Node.js 18.16.0 or later
- npm 9.5.1 or later

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd blackjack-mvp
```

2. Install dependencies:
```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to start playing.

## Game Rules

- The game follows standard Blackjack rules
- Dealer must hit on 16 and stand on 17 (including soft 17)
- Double Down is available on initial hand only
- No splits or insurance available in this MVP version
- Aces are valued as 1 or 11 automatically for optimal score

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- React Hooks for state management
- Next.js API Routes for game logic
- Card assets from png-cards CDN

## Project Structure

```
blackjack-mvp/
├─ app/
│  ├─ layout.tsx           # Root layout with Tailwind imports
│  ├─ page.tsx            # Main game UI
│  └─ api/
│     └─ game/            # Next.js API Route folder
│        ├─ route.ts      # API route handler
│        └─ logic.ts      # Game logic functions
├─ components/
│  └─ Card.tsx           # Reusable card component with animations
├─ utils/
│  └─ cards.ts           # Types and deck utilities
├─ styles/
│  └─ globals.css        # Global styles and Tailwind imports
└─ README.md
```

## Customization

### Card Assets
The game uses card images from the png-cards CDN. To use different card assets:
1. Update the image URL in `components/Card.tsx`
2. Ensure the new assets follow the same naming convention (e.g., "AS.png" for Ace of Spades)
3. Update the card dimensions in the component if needed

### Animations
Card animations are defined in `tailwind.config.ts`. You can customize:
- Deal animation: Adjust the fadeInUp keyframes and timing
- Flip animation: Modify the flipY keyframes and timing
- Add new animations by extending the keyframes and animation configurations

## Future Improvements

- Add animations for card dealing and actions
- Implement persistent scoreboard
- Add sound effects
- Support for splits and insurance
- Multiplayer support
- Enhanced UI with card graphics
- Unit tests and integration tests
