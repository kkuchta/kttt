# Kriegspiel Tic Tac Toe - Technical Requirements

## Overview

Web-based multiplayer implementation of Kriegspiel Tic Tac Toe (see `game_rules.md` for game mechanics). Focus on low-friction multiplayer experience via URL sharing and quick matchmaking.

## User Experience Requirements

### Primary User Flows

#### Flow 1: Create & Share Game (Original)

1. Player 1 visits home page and clicks "Create Game"
2. System generates unique game URL and displays it to Player 1
3. Player 1 shares URL with Player 2
4. Player 2 visits URL and joins game
5. Game starts automatically when both players connected
6. Real-time gameplay via WebSocket connection
7. Game ends with winner announcement and full board reveal

#### Flow 2: Quick Match (New)

1. Player visits home page and clicks "Quick Match"
2. Player joins matchmaking queue with "Looking for opponent..." status
3. System matches first two players in queue (FIFO)
4. Both players automatically redirected to new game
5. Game starts immediately with real-time gameplay
6. Game ends with winner announcement and full board reveal

#### Flow 3: Bot Opponent While Waiting (New)

1. Player clicks "Quick Match" and enters matchmaking queue
2. While waiting, player sees "Play vs Bot Instead" option
3. Clicking bot option removes player from queue and starts immediate bot game
4. Bot game uses same UI with "vs Bot" indicator
5. After bot game ends, player can choose to find human opponent or play another bot game

### Home Page Interface

- **"Create Game"** button - generates shareable game link
- **"Quick Match"** button - joins matchmaking queue
- **"Join Game"** option - for joining via shared URL

### Matchmaking Queue Experience

- **Queue Status**: Clear "Looking for opponent..." message
- **Wait Time**: Show elapsed time and estimated wait
- **Cancel Option**: "Cancel" button to leave queue
- **Bot Option**: "Play vs Bot Instead" button for immediate gameplay while waiting
- **Timeout**: Auto-cancel after 2-3 minutes to prevent dead queues
- **Queue Position**: Optional enhancement to show position in line

### URL Structure

#### Frontend Routes

- `/` - Home page with "Create Game" button and a "Join Game" button
- `/game/:gameId` - Game interface (e.g., `/game/H3K8`)

#### API Endpoints

- `POST /api/games` - Creates new game, returns gameId
- `GET /api/games/:gameId` - Get current game state
- WebSocket connection for real-time game moves

### Game ID Format

- 4-character codes combining letters and numbers
- Semi-random generation to prevent trivial guessing
- Example: `H3K8`, `M7R2`, `P4Q9`
- Avoid confusing characters (0/O, 1/I/l)

## Multiplayer Behavior

### Game Capacity

- **2 players connected**: Normal gameplay
- **3rd visitor**: Display "Game full" message, prevent entry
- **Reasoning**: Spectating would break hidden information mechanic

### Reconnection Handling

- Players can refresh browser and rejoin same game
- URL serves as authentication/session identifier
- Game state preserved during temporary disconnections

### Game Completion

- **Recently completed games**: Show final board state to returning players
- **Old/expired games**: Return 404 or redirect to home page
- **Game persistence**: Keep completed games for reasonable time period

## Technical Architecture

### Frontend Requirements

- Real-time updates via WebSocket
- Responsive design for mobile/desktop
- Clear visual distinction between:
  - Own pieces
  - Revealed opponent pieces
  - Empty/unknown squares
- Move feedback system for legal/illegal moves
- Turn indicator

### Backend Requirements

- WebSocket server for real-time communication
- Game state management (server-side truth)
- Room/session management by gameId
- Move validation and game logic
- Player connection tracking

### Data Storage

- In-memory storage for active games (Redis or server RAM)
- No persistent database required for MVP
- Automatic cleanup of old/completed games

## Security & Edge Cases

### Game State Protection

- Server maintains authoritative game state
- Players receive filtered views based on visibility rules
- Move validation happens server-side only

### Connection Management

- Handle player disconnections gracefully
- Timeout inactive games after reasonable period
- Prevent unauthorized access to active games

## Performance Requirements

- Support concurrent games (targeting 10-100 simultaneous games for MVP)
- Responsive UI updates (< 200ms for move feedback)
- Minimal bandwidth usage (small JSON messages)

## Future Considerations (Not MVP)

- Quick match system for random opponents
- Game history/statistics

### Bot Opponent Experience

- **AI Difficulty**: Single random bot difficulty (expandable interface for future)
- **Fair Play**: Bot receives same filtered game state as human players (no cheating)
- **Game Persistence**: Shorter TTL (30 minutes) compared to human games (4 hours)
- **Bot Behavior**: Random valid moves with 500ms delay for natural feel
- **Post-Game Options**: "Find Human Opponent", "Play Another Bot", or "Home"
- **Game Indicators**: Clear "vs Bot" labeling in game UI to distinguish from human games
