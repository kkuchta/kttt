# Multi-Player Game Creation and Join Flow Test

## Objective

Test the complete flow of creating a game in one browser window and joining it from another window.

## Prerequisites

- Development server running (`make dev`)
- Two browser windows/tabs available

## Test Steps

### Part A: Create Game (Window 1)

1. Navigate to `http://localhost:3000`
2. Verify page loads with title "Kriegspiel Tic Tac Toe"
3. Verify "🟢 Connected to server" status is shown
4. Click "Create Game" button
5. Verify navigation to game URL (format: `/game/[4-character-ID]`)
6. Verify game ID is displayed prominently
7. Verify "⏳ Waiting for another player to join..." message
8. Verify game board is disabled (all buttons grayed out)
9. Note the 4-character game ID for joining

### Part B: Join Game (Window 2)

10. Open new browser window/tab
11. Navigate to `http://localhost:3000`
12. Enter the 4-character game ID in the "Enter Game ID" textbox
13. Click "Join" button
14. Verify both windows show active game state
15. Verify game board becomes enabled in both windows
16. Verify player assignments (X/O) are displayed in both windows

## Expected Results

- ✅ Game creation generates unique 4-character ID
- ✅ Game URL is shareable and functional
- ✅ Both players can see the game board
- ✅ Game transitions from "waiting" to "active" state
- ✅ Players are assigned X and O roles

## Notes

- Game IDs should be unique 4-character codes
- Both windows should maintain real-time sync
- Connection status should remain green throughout
