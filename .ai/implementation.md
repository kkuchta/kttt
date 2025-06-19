# Kriegspiel Tic Tac Toe - Implementation Strategy

## Tech Stack Decision

### Final Choice: Node.js + Socket.io + TypeScript + In-Memory Storage (Redis-ready)

**Backend:**

- Node.js + Express + Socket.io + TypeScript
- In-memory storage with Redis abstraction layer (ready for future Redis implementation)

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
- In-memory + Redis abstraction: Immediate functionality with easy Redis migration path

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
      - index.ts # Main server setup and configuration
      - routes/
        - api.ts # REST API endpoints
      - socket/
        - handlers.ts # Socket.io event handlers
      - game/
        - GameManager.ts # Game logic and state management
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
      - hooks/ # Custom React hooks
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
- **Storage abstraction:** Easy swap between in-memory and Redis
- **Route separation:** REST API endpoints in dedicated router
- **Socket handlers:** Real-time game interactions in separate module

### Game State Management

- **Server authoritative:** All game logic runs on server
- **In-memory storage:** Fast access with automatic TTL cleanup (4 hours)
- **Client views:** Filtered game state sent to each player
- **Move validation:** Server-side only to prevent cheating

### Storage Strategy

- **Current Implementation:** In-memory with cleanup intervals
- **Active games:** 4 hours TTL (expire after inactivity)
- **Completed games:** Same TTL (players can see final results)
- **Storage abstraction:** Interface allows swapping storage implementations
- **Future-ready:** Easy Redis migration via StorageInterface

### WebSocket Communication

- **Socket.io rooms:** One room per game session
- **Typed events:** Full TypeScript coverage for all messages
- **Reconnection:** Built-in Socket.io reconnection handling
- **Validation middleware:** Rate limiting and input validation

### Security Approach

- Game ID serves as access control
- No authentication needed for MVP
- Server validates all moves and game state changes
- Rate limiting on all socket events
- Input validation with Zod schemas
