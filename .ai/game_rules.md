# Kriegspiel Tic Tac Toe - Game Rules

## Overview

Kriegspiel Tic Tac Toe is a hidden information variant of classic tic-tac-toe where players cannot see their opponent's moves until they accidentally try to place a piece on an occupied space.

## Setup

- 3x3 grid
- Two players: X (goes first) and O
- Each player can only see their own pieces on the board
- Empty spaces appear blank to both players

## Core Mechanics

### Visibility Rules

- Players can only see their own pieces (X or O)
- Opponent pieces are invisible until revealed
- Empty spaces appear the same to both players

### Move Resolution

1. Player attempts to place their piece on any square
2. **If the square is empty**: Piece is placed successfully, turn passes to opponent
3. **If the square contains opponent's piece**:
   - Move is rejected
   - Player loses their turn
   - Opponent's piece on that square is permanently revealed to both players
   - Turn passes to opponent

### Turn Structure

- Players alternate turns (X goes first)
- A player can lose their turn by attempting to place on an occupied square
- Game continues with the other player regardless

## Win Conditions

### Standard Win

- First player to get three of their pieces in a row (horizontal, vertical, or diagonal)
- Win is declared immediately when achieved
- Both players can see all pieces when game ends

### Draw Conditions

- All 9 squares are filled with no winner
- Note: Draws are less likely due to the hidden information and turn-loss mechanic

## Special Cases

### Simultaneous Win Detection

- If a player achieves three in a row, they win immediately
- Game ends even if opponent would have won on their next turn

## Example Game Flow

1. X places on center (5) - visible to X only
2. O attempts center (5) - rejected, X's piece revealed, O loses turn
3. X places on corner (1) - visible to X only
4. O places on corner (9) - visible to O only
5. X places on (3) - completes top row, X wins!
