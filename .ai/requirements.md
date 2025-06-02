# Kriegspiel Tic Tac Toe - Technical Requirements

## Overview

Web-based multiplayer implementation of Kriegspiel Tic Tac Toe (see `game_rules.md` for game mechanics). Focus on low-friction multiplayer experience via URL sharing.

## User Experience Requirements

### Primary User Flow

1. Player 1 visits home page and clicks "Create Game"
2. System generates unique game URL and displays it to Player 1
3. Player 1 shares URL with Player 2
4. Player 2 visits URL and joins game
5. Game starts automatically when both players connected
6. Real-time gameplay via WebSocket connection
7. Game ends with winner announcement and full board reveal

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
