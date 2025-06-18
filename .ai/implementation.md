# Kriegspiel Tic Tac Toe - Implementation Strategy

## Tech Stack Decision

### Final Choice: Node.js + Socket.io + TypeScript + Redis

**Backend:**

- Node.js + Express + Socket.io + TypeScript
- Redis for persistent game state storage

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
- Redis: Survives deployments, built-in TTL, perfect for ephemeral game state

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
      - storage/ # Game state storage abstraction
        - GameStorage.ts # Storage interface
        - RedisStorage.ts # Redis implementation
    - client/ # Frontend React application
      - App.tsx
      - components/ # React components
      - hooks/ # Custom React hooks
      - socket/ # Socket.io client setup
  - dist/ # Build output
    - server/ # Compiled server code
    - client/ # Built React app

## Development Setup

### Prerequisites

- **Node.js 18+**
- **Redis server** (Docker)

### Package Management

- **Single package.json** with all dependencies
- **No npm workspaces** - simpler dependency management

### Build Tooling

- **Frontend:** Vite (fast development, TypeScript support)
- **Backend:** tsx with watch mode for development
- **Shared:** Direct TypeScript imports (no separate build step)

### Development Workflow

1. **Start Redis**: `docker run -p 6379:6379 redis:alpine` or local Redis server
2. **Start dev servers**: `npm run dev` (starts both server and client)
3. Server and client import shared TypeScript files directly
4. Hot reload for both client and server during development
5. TypeScript path mapping for clean imports (`@shared/types/game`)

## Deployment Strategy

### Storage Requirements

- **Redis instance** (Redis Cloud, AWS ElastiCache, Railway Redis, etc.)
- **Environment variables** for Redis connection

### Build Process

1. **Client build**: Vite builds static React app
2. **Server build**: TypeScript compilation to JavaScript
3. **Deployment**: Single Node.js app serving static files + Socket.io

### Environment Configuration

```env
REDIS_URL=redis://localhost:6379  # Development
REDIS_URL=redis://user:pass@host:port  # Production
PORT=3001
NODE_ENV=production
```

## Key Implementation Decisions

### Game State Management

- **Server authoritative:** All game logic runs on server
- **Redis storage:** Persistent game state with TTL (auto-cleanup)
- **Client views:** Filtered game state sent to each player
- **Move validation:** Server-side only to prevent cheating

### Storage Strategy

- **Active games:** 4 hours TTL (expire after inactivity)
- **Completed games:** 1 hour TTL (players can see final results)
- **Storage abstraction:** Interface allows swapping storage implementations

### WebSocket Communication

- **Socket.io rooms:** One room per game session
- **Typed events:** Full TypeScript coverage for all messages
- **Reconnection:** Built-in Socket.io reconnection handling

### Security Approach

- Game ID serves as access control
- No authentication needed for MVP
- Server validates all moves and game state changes
