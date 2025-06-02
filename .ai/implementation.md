# Kriegspiel Tic Tac Toe - Implementation Strategy

## Tech Stack Decision

### Final Choice: Node.js + Socket.io + TypeScript

**Backend:**

- Node.js + Express + Socket.io + TypeScript

**Frontend:**

- React + Socket.io-client + TypeScript
- Vite for build tooling and development server
- Responsive design for mobile/desktop

**Shared:**

- TypeScript type definitions for game state, moves, and socket events
- End-to-end type safety from frontend to backend

### Reasoning

- Bun + native TypeScript: Too bleeding-edge for side project
- Python + FastAPI: Less mature WebSocket ecosystem
- Vanilla JavaScript: No type safety for complex game state

## Project Structure

- kttt/
  - package.json # Single package for everything
  - tsconfig.json # Shared TypeScript config
  - src/
    - shared/ # Shared TypeScript files
      - types/
        - game.ts # Game state, moves, players
        - socket.ts # Socket event types
      - utils/
        - gameLogic.ts # Shared game utilities
    - server/ # Backend Node.js application
      - index.ts # Express + Socket.io server
      - game/ # Game logic and state management
      - rooms/ # Room/session management
    - client/ # Frontend React application
      - App.tsx
      - components/ # React components
      - hooks/ # Custom React hooks
      - socket/ # Socket.io client setup
  - dist/ # Build output
    - server/ # Compiled server code
    - client/ # Built React app

## Development Setup

### Package Management

- **Single package.json** with all dependencies
- **No npm workspaces** - simpler dependency management

### Build Tooling

- **Frontend:** Vite (fast development, TypeScript support)
- **Backend:** tsx with watch mode for development
- **Shared:** Direct TypeScript imports (no separate build step)

### Development Workflow

1. Start both server and client with `npm run dev`
2. Server and client import shared TypeScript files directly
3. Hot reload for both client and server during development
4. TypeScript path mapping for clean imports (`@shared/types/game`)

## Deployment Strategy

TODO once we have a basic running app

## Key Implementation Decisions

### Game State Management

- **Server authoritative:** All game logic runs on server
- **Client views:** Filtered game state sent to each player
- **Move validation:** Server-side only to prevent cheating

### WebSocket Communication

- **Socket.io rooms:** One room per game session
- **Typed events:** Full TypeScript coverage for all messages
- **Reconnection:** Built-in Socket.io reconnection handling

### Security Approach

- Game ID serves as access control
- No authentication needed for MVP
- Server validates all moves and game state changes
