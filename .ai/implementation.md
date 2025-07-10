# Kriegspiel Tic Tac Toe - Implementation Strategy

## Tech Stack Decision

### Final Choice: Node.js + Socket.io + TypeScript + Redis Storage

**Backend:**

- Node.js + Express + Socket.io + TypeScript
- Redis storage for game state persistence (Upstash Redis via Fly.io)
- Matchmaking queue system for Quick Match feature

**Frontend:**

- React + Socket.io-client + TypeScript
- Vite for build tooling and development server
- Lucide React for consistent icon system
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
- **Redis server** (Required - Docker Compose provided for local development)

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
5. **Redis required**: Local Docker Redis for development, Upstash for production

## Deployment Strategy

### Platform: Fly.io

**Live Application**: https://kttt.io

### Storage Requirements

- **Production**: Redis storage via Upstash (managed by Fly.io)
- **Development**: Local Redis via Docker Compose
- **Automatic cleanup**: TTL-based game expiration (4 hours)

### Build Process

1. **Client build**: Vite builds static React app to `dist/client`
2. **Server build**: TypeScript compilation to JavaScript in `dist/server`
3. **Deployment**: Single Node.js app serving static files + Socket.io via Fly.io

### Environment Configuration

```env
# Production (Fly.io)
PORT=3000
NODE_ENV=production
REDIS_URL=redis://upstash-redis-url  # Managed by Fly.io secrets
REDIS_TTL_SECONDS=14400  # 4 hours
REDIS_CONNECTION_TIMEOUT_MS=5000

# Development
PORT=3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379  # Local Docker Redis
```

### Deployment Commands

```bash
# Deploy to Fly.io
fly deploy

# View logs
fly logs

# Open in browser
fly open
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

- **Production:** Redis storage with Upstash (managed by Fly.io)
- **Development:** Local Redis via Docker Compose
- **Active games:** 4 hours TTL (expire after inactivity)
- **Completed games:** Same TTL (players can see final results)
- **Matchmaking queue:** In-memory with disconnect cleanup
- **Storage abstraction:** Interface allows swapping storage implementations
- **Implemented:** Redis production deployment complete

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

### UI/UX Strategy

- **Anti-Emoji Philosophy:** No emoji in user-facing interfaces for professional appearance
- **Icon System:** Lucide React for consistent, accessible icons across components
- **Typography Focus:** Clean text-based communication with Inter/Space Grotesk fonts
- **Color-Based States:** Use color constants and CSS for visual feedback instead of symbols
- **Accessibility:** Screen reader friendly with proper ARIA labels and semantic markup

### Storybook Setup

- **Purpose:** Responsive testing and component preview across viewport sizes
- **Simplified Structure:** Each component has 4 stories (default + 3 responsive variants)
- **Key Viewports:** SmallMobile (320px), LargeMobile (414px), Laptop (1024px)
- **Storybook 9.0:** Uses modern viewport configuration with `globals.viewport.value`
- **Usage:** `make storybook` to start, then visit a page like http://localhost:6006/?path=/story/pages-homepage--default-large-mobile
- **Focus:** Mobile-first responsive testing across critical screen sizes
