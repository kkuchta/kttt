# Server Restart Bug Investigation

## Problem

After restarting the backend server (while frontend stays running), the frontend appears to reconnect but becomes unresponsive to user interactions. Button clicks don't register, moves aren't processed.

## Current Theories

- [x] **Socket.io room membership not being restored after server restart** ← This is it!
- [ ] WebSocket reconnection not properly re-establishing event handlers
- [ ] Client-side state not syncing with server state after reconnection
- [ ] Event listeners being duplicated or not properly cleaned up

## What We've Tried

### Dec 22 - Initial confirmation & log analysis

- **Tried**: Followed test plan, analyzed server logs and browser console
- **Result**: Found the root cause! Server logs show:
  - Before restart: Players had socket IDs `HNqKme8T0J4d63XsAAAB` and `nUTjLXHQTfBI6_A3AAAF`, successfully in game `2ZSF`
  - After restart: New socket IDs assigned (`hSBF5wsDhCMMVyR_AAAD`, etc.)
  - When trying to make moves: `❌ Player hSBF5wsDhCMMVyR_AAAD not in any game`
  - Browser shows: `ERR_CONNECTION_REFUSED` (connection retry attempts)
- **Next**: Fix the player-to-game association on reconnection

### Dec 22 - Technical analysis

- **Tried**: Analyzed the codebase to understand the socket-game mapping
- **Result**: Found the technical details:
  - `GameState.players.X/O` store socket IDs directly
  - Socket-to-game mapping (`setSocketGame`) has shorter TTL (1h vs 4h for games)
  - On restart: game persists, but socket mappings are lost + new socket IDs assigned
  - `joinGame` only recognizes existing players if socket ID matches exactly
  - New socket IDs don't match stored socket IDs → player not recognized
- **Next**: Implement reconnection logic to handle socket ID changes

### Dec 22 - Implementation Complete ✅

- **Tried**: Implemented full reconnection solution with localStorage persistence
- **Result**: Added complete reconnection flow:
  - **Client**: Stores player identity (X/O) in localStorage when joining
  - **Client**: Sends stored player identity when reconnecting after server restart
  - **Server**: Accepts optional `rejoinAsPlayer` parameter in join-game
  - **Server**: Updates socket IDs in existing games when reconnecting
  - **Cleanup**: Removes localStorage on game end and component unmount
- **Next**: Test the fix with the original test plan

### Dec 22 - New Issue: Game Full Error ❌

- **Tried**: Tested the reconnection fix with server restart
- **Result**: New problem discovered:
  - Both players get "Game is full" error immediately after server restart
  - Server logs show `🚫 Game full: G9MD` for both reconnection attempts
  - Client logs show players attempting to rejoin with correct stored player identities
  - The rejoinAsPlayer logic isn't working as expected
- **Next**: Fix the validation schema and reconnection logic in GameManager

### Dec 22 - Validation and Logic Fixes 🔧

- **Tried**: Fixed validation schema and added debug logging to GameManager
- **Result**: Applied two fixes:
  - **Validation fix**: Changed join-game handler to use `withErrorHandling` instead of `withValidation` to handle multiple parameters properly
  - **Debug logging**: Added extensive logging to GameManager.joinGame to trace why reconnection logic fails
  - **Schema simplification**: Simplified join-game validation to use manual validation in handler
- **Next**: Test with server restart to see debug output and verify fixes work

### Dec 22 - SUCCESS! Bug Resolved ✅

- **Tried**: Tested server restart scenario with the fixes applied
- **Result**: **Perfect success!** Server logs show:
  - Both players successfully reconnected after server restart
  - localStorage correctly preserved player identities (X/O)
  - Server detected reconnection attempts with `rejoin as X/O`
  - Socket IDs properly updated: old IDs → new IDs
  - Game continued seamlessly with moves working normally
  - No "Game full" errors, no UI unresponsiveness
- **Conclusion**: **Server restart bug completely resolved!**

---

## Notes

**Root Cause Identified**:

- Game state persists in Redis ✓
- Socket IDs change on reconnection (expected)
- Socket-to-game mapping is lost (shorter TTL)
- Game stores old socket IDs in `players.X/O` fields
- Server doesn't recognize new socket IDs as belonging to existing players
- Need reconnection logic to update socket IDs in existing games

**Technical Solution Implemented**:

1. **Client persistence**: Store player identity in localStorage when joining
2. **Reconnection detection**: Client sends player identity when rejoining
3. **Socket ID update**: Server updates game's socket IDs for reconnecting players
4. **Room re-establishment**: Socket joins correct game room on reconnection

**Files Modified**:

- `src/shared/types/socket.ts` - Added rejoinAsPlayer parameter
- `src/client/socket/client.ts` - Updated joinGame helper
- `src/client/hooks/useSocket.ts` - Pass through rejoinAsPlayer parameter
- `src/client/components/GamePage.tsx` - localStorage persistence and cleanup
- `src/server/socket/handlers.ts` - Accept rejoinAsPlayer parameter with manual validation
- `src/server/game/GameManager.ts` - Core reconnection logic with debug logging
- `src/server/validation/schemas.ts` - Simplified validation schema

**✅ RESOLVED**: Server restart no longer interrupts games. Players can continue seamlessly after backend restarts.
