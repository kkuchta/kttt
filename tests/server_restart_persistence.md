# Server Restart Game Persistence Test

## Objective

Test that games remain fully functional after a backend server restart, specifically verifying that UI interactions remain responsive and game state persists through Redis storage.

## Prerequisites

- Redis server running locally
- Frontend dev server running
- Two browser windows/tabs available for testing

## Test Steps

1. Start the backend server with `make dev-server`

2. In Browser Window 1:

   - Navigate to home page (`/`)
   - Click "Create Game" button
   - Copy the generated game URL

3. In Browser Window 2:

   - Navigate to the copied game URL
   - Verify both players are connected and game starts

4. Play several moves to create an in-progress game:

   - Player X (Window 1): Click on position 1 (top-left)
   - Player O (Window 2): Click on position 5 (center)
   - Player X (Window 1): Click on position 3 (top-right)

5. Restart the backend server:

   - Stop the backend server (Ctrl+C)
   - Restart the backend server
   - Wait for server to fully start

6. In both browser windows:

   - Observe reconnection behavior
   - Verify game board displays correctly with previous moves

7. Test UI Responsiveness:

   - In the active player's window, click on an empty position
   - Verify the move is processed and appears on the board
   - Confirm turn switches to the other player

8. Continue playing the game to completion

## Expected Results

- Game state should be identical before and after server restart
- UI should remain fully responsive to clicks
- Moves should be processed normally
- Game can be completed successfully
