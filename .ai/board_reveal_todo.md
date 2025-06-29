# Board Reveal Feature - Implementation Todo

The big reveal experience: showing all hidden pieces when the game ends to provide emotional payoff and closure for the Kriegspiel hidden information mechanic.

**Priority: High** - This is the climactic moment that makes the hidden information worthwhile.

Do _not_ do multiple tasks at once. Pause for instruction after each task.

## Phase 1: State Management & Infrastructure

- [ ] Add reveal state management to GamePage

  - [ ] Create RevealState interface with isRevealing, revealedBoard, revealStep, totalSteps
  - [ ] Add useState for reveal state in GamePage component
  - [ ] Add reveal completion callback system

- [ ] Enhance GameBoard component props
  - [ ] Add isInRevealMode prop to GameBoard
  - [ ] Add revealBoard prop (the complete final board)
  - [ ] Add revealStep prop for animation timing
  - [ ] Update GameBoard to conditionally render based on reveal mode

## Phase 2: Cell Component Animation System

- [ ] Add "revealing" cell state to Cell component

  - [ ] Update CellDisplayState type to include 'revealing'
  - [ ] Add revealing state styling (opponent color with fade-in animation)
  - [ ] Update getCellDisplayState function to handle revealing pieces

- [ ] Implement reveal animations in Cell
  - [ ] Add CSS keyframes for piece reveal (fade-in + slight scale)
  - [ ] Add revealing state styles with smooth transitions
  - [ ] Ensure accessibility compliance (prefers-reduced-motion support)
  - [ ] Test animations on different devices/browsers

## Phase 3: Animation Orchestration

- [ ] Create reveal sequence controller

  - [ ] Implement calculateRevealSequence function (determine piece order)
  - [ ] Add timing logic for staggered piece appearance
  - [ ] Create reveal step progression system
  - [ ] Handle both sequential and instant reveal modes

- [ ] Implement reveal phases
  - [ ] Phase 1: Initial pause with board dimming (500ms)
  - [ ] Phase 2: Sequential piece reveal (1500ms total, ~200ms per piece)
  - [ ] Phase 3: Winner line highlight if applicable (500ms)
  - [ ] Phase 4: Show final result UI

## Phase 4: Integration & Flow Control

- [ ] Update GamePage onGameOver handler

  - [ ] Replace immediate alerts/modals with reveal trigger
  - [ ] Store finalBoard data for reveal animation
  - [ ] Coordinate reveal start timing

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
