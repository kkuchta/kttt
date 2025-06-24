# Kriegspiel Tic Tac Toe - Implementation Strategy

## Tech Stack Decision

### Final Choice: Node.js + Socket.io + TypeScript + In-Memory Storage (Redis-ready)

**Backend:**

- Node.js + Express + Socket.io + TypeScript
- In-memory storage with Redis abstraction layer (ready for future Redis implementation)
- Matchmaking queue system for Quick Match feature

**Frontend:**

- React + Socket.io-client + TypeScript
- Vite for build tooling and development server
- Responsive design for mobile/desktop

**Shared:**

- TypeScript type definitions for game state, moves, socket events, and matchmaking
- End-to-end type safety from frontend to backend

### Reasoning

- Bun + native TypeScript: Too bleeding-edge for side project
- Python + FastAPI: Less mature WebSocket ecosystem
- Vanilla JavaScript: No type safety for complex game state
- In-memory + Redis abstraction: Immediate functionality with easy Redis migration path

## Project Structure

- kttt/
  - package.json # Single package for everything
  - tsconfig.json # Shared TypeScript config
  - src/
    - shared/ # Shared TypeScript files
      - types/
        - game.ts # Game state, moves, players
        - socket.ts # Socket event types (includes matchmaking events)
        - matchmaking.ts # Queue and matchmaking types
      - utils/
        - gameLogic.ts # Shared game utilities
    - server/ # Backend Node.js application
      - index.ts # Main server setup and configuration
      - routes/
        - api.ts # REST API endpoints
      - socket/
        - handlers.ts # Socket.io event handlers
        - matchmaking.ts # Matchmaking socket handlers
      - game/
        - GameManager.ts # Game logic and state management
        - MatchmakingManager.ts # Queue management and matching logic
      - storage/ # Game state storage abstraction
        - StorageInterface.ts # Storage interface
        - InMemoryStorage.ts # In-memory implementation
      - middleware/
        - validation.ts # Input validation and security
      - validation/
        - schemas.ts # Zod validation schemas
    - client/ # Frontend React application
      - App.tsx
      - components/ # React components
        - QuickMatch.tsx # Matchmaking queue UI
      - hooks/ # Custom React hooks
        - useMatchmaking.ts # Matchmaking queue hook
      - socket/ # Socket.io client setup
  - dist/ # Build output
    - server/ # Compiled server code
    - client/ # Built React app

## Development Setup

### Prerequisites

- **Node.js 18+**
- **Redis server** (Optional - for future Redis storage implementation)

### Package Management

- **Single package.json** with all dependencies
- **No npm workspaces** - simpler dependency management

### Build Tooling

- **Frontend:** Vite (fast development, TypeScript support)
- **Backend:** tsx with watch mode for development
- **Shared:** Direct TypeScript imports (no separate build step)

### Development Workflow

1. **Start dev servers**: `make dev` (starts both server and client)
2. Server and client import shared TypeScript files directly
3. Hot reload for both client and server during development
4. TypeScript path mapping for clean imports (`@shared/types/game`)
5. **Redis optional**: Current implementation uses in-memory storage

## Deployment Strategy

### Storage Requirements

- **Current**: In-memory storage (automatic cleanup every 60 seconds)
- **Future**: Redis instance (Redis Cloud, AWS ElastiCache, Railway Redis, etc.)
- **Environment variables** for future Redis connection

### Build Process

1. **Client build**: Vite builds static React app
2. **Server build**: TypeScript compilation to JavaScript
3. **Deployment**: Single Node.js app serving static files + Socket.io

### Environment Configuration

```env
# Current - no external dependencies needed
PORT=3001
NODE_ENV=production

# Future Redis configuration
REDIS_URL=redis://localhost:6379  # Development
REDIS_URL=redis://user:pass@host:port  # Production
```

## Key Implementation Decisions

### Server Architecture

- **Modular design:** Separated concerns into focused files
- **GameManager class:** Centralized game logic and state management
- **MatchmakingManager class:** Queue management and player matching
- **Storage abstraction:** Easy swap between in-memory and Redis
- **Route separation:** REST API endpoints in dedicated router
- **Socket handlers:** Real-time game interactions in separate module

### Matchmaking System

- **FIFO Queue:** Simple first-come-first-served matching
- **In-memory queue:** Fast matching with cleanup on disconnect
- **Timeout handling:** Auto-remove players after 2-3 minutes
- **Auto-game creation:** Matched players get new game automatically
- **Queue status:** Real-time updates to waiting players

### Game State Management

- **Server authoritative:** All game logic runs on server
- **In-memory storage:** Fast access with automatic TTL cleanup (4 hours)
- **Client views:** Filtered game state sent to each player
- **Move validation:** Server-side only to prevent cheating

### Storage Strategy

- **Current Implementation:** In-memory with cleanup intervals
- **Active games:** 4 hours TTL (expire after inactivity)
- **Completed games:** Same TTL (players can see final results)
- **Matchmaking queue:** In-memory with disconnect cleanup
- **Storage abstraction:** Interface allows swapping storage implementations
- **Future-ready:** Easy Redis migration via StorageInterface

### WebSocket Communication

- **Socket.io rooms:** One room per game session
- **Matchmaking events:** joinQueue, leaveQueue, matchFound, queueStatus
- **Typed events:** Full TypeScript coverage for all messages
- **Reconnection:** Built-in Socket.io reconnection handling
- **Validation middleware:** Rate limiting and input validation

### Security Approach

- Game ID serves as access control
- No authentication needed for MVP
- Server validates all moves and game state changes
- Rate limiting on all socket events
- Input validation with Zod schemas
- Queue spam protection via rate limiting

### Bot Player Architecture

- **Bot Interface:** Clean abstraction for different AI strategies
- **RandomBot Implementation:** First bot using random valid moves
- **Game Integration:** Bots reuse existing GameManager and game logic
- **Fair Information:** Bots receive same filtered game state as human players
- **No WebSocket:** Bot moves calculated server-side without socket connection
- **Lightweight Storage:** Bot games use shorter TTL (30 minutes vs 4 hours)
- **Queue Integration:** "Play vs Bot" button removes player from matchmaking queue
- **Expandable Design:** Interface supports future SmartBot, HardBot implementations
