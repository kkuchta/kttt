# Board Reveal Feature - Implementation Todo

The big reveal experience: showing all hidden pieces when the game ends to provide emotional payoff and closure for the Kriegspiel hidden information mechanic.

**Priority: High** - This is the climactic moment that makes the hidden information worthwhile.

Do _not_ do multiple tasks at once. Pause for instruction after each task.

## Phase 1: State Management & Infrastructure

- [x] Add reveal state management to GamePage

  - [x] Create RevealState interface with isRevealing, revealedBoard, revealStep, totalSteps
  - [x] Add useState for reveal state in GamePage component
  - [x] Add reveal completion callback system

- [x] Enhance GameBoard component props
  - [x] Add isInRevealMode prop to GameBoard
  - [x] Add revealBoard prop (the complete final board)
  - [x] Add revealStep prop for animation timing
  - [x] Update GameBoard to conditionally render based on reveal mode

## Phase 2: Cell Component Animation System

- [x] Add "revealing" cell state to Cell component

  - [x] Update CellDisplayState type to include 'revealing'
  - [x] Add revealing state styling (opponent color with fade-in animation)
  - [x] Update getCellDisplayState function to handle revealing pieces

- [x] Implement reveal animations in Cell
  - [x] Add CSS keyframes for piece reveal (fade-in + slight scale)
  - [x] Add revealing state styles with smooth transitions
  - [x] Ensure accessibility compliance (prefers-reduced-motion support)
  - [ ] Test animations on different devices/browsers

## Phase 3: Animation Orchestration

- [x] Create reveal sequence controller

  - [x] Implement calculateRevealSequence function (determine piece order)
  - [x] Add timing logic for staggered piece appearance
  - [x] Create reveal step progression system
  - [x] Handle both sequential and instant reveal modes

- [x] Implement reveal phases
  - [x] Phase 1: Initial pause with board dimming (500ms)
  - [x] Phase 2: Sequential piece reveal (1500ms total, ~200ms per piece)
  - [ ] Phase 3: Winner line highlight if applicable (500ms)
  - [x] Phase 4: Show final result UI

## Phase 4: Integration & Flow Control

- [x] Update GamePage onGameOver handler

  - [x] Replace immediate alerts/modals with reveal trigger
  - [x] Store finalBoard data for reveal animation
  - [x] Coordinate reveal start timing

- [ ] Modify GameStatus component behavior

  - [ ] Hide result announcement during reveal animation
  - [ ] Show result banner after reveal completes
  - [ ] Ensure proper styling for post-reveal state

- [ ] Update PostBotGameOptions modal timing
  - [ ] Delay modal appearance until after reveal
  - [ ] Ensure smooth transition from reveal to options
  - [ ] Test bot game flow end-to-end

## Phase 5: Polish & Edge Cases

- [ ] Handle edge cases gracefully

  - [ ] Very quick games (1-2 moves) - still do full reveal
  - [ ] Draw games - reveal all pieces, emphasize full board
  - [ ] Disconnection during reveal - store reveal state, show on reconnect
  - [ ] Multiple rapid game endings - queue/cancel reveals properly

- [ ] Visual enhancements
  - [ ] Add subtle particle effects or glow trails for piece reveals
  - [ ] Ensure winning line highlight is prominent but not jarring
  - [ ] Test color contrast and visibility in all game states
  - [ ] Optimize animation performance (60fps target)

## Phase 6: Testing & Validation

- [ ] Test reveal experience thoroughly

  - [ ] Test with different game outcomes (X wins, O wins, draw)
  - [ ] Test with both bot and human games
  - [ ] Test accessibility features (reduced motion, screen readers)
  - [ ] Test on mobile devices and different screen sizes

- [ ] User experience validation
  - [ ] Verify emotional impact ("aha!" moment works)
  - [ ] Ensure reveal answers player questions about rejected moves
  - [ ] Confirm timing feels natural (not too fast/slow)
  - [ ] Test that reveal enhances rather than delays gratification

## Implementation Notes

- **Data Already Available**: Server sends `finalBoard` in game-over event - no backend changes needed
- **Animation Strategy**: Use CSS transitions/transforms for GPU acceleration
- **Accessibility First**: Always provide instant reveal option for reduced motion
- **Performance**: Minimize DOM updates, use efficient animation techniques
- **User Testing**: This is the payoff moment - get feedback on timing and impact

## Success Criteria

- [ ] Players can see the complete game state after ending
- [ ] Hidden opponent pieces are revealed in a satisfying sequence
- [ ] Winning combinations are clearly highlighted
- [ ] Animation respects accessibility preferences
- [ ] The reveal feels like a reward, not a delay
- [ ] All edge cases (draws, quick games, disconnects) work smoothly
