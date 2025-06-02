# Worklog

This is a log of ongoing work. It contains the tasks we've done and the tasks we've yet to do. Whenever we think of something new we'll need to do, we'll add it here. Whenever starting on a task, break it down into sub-tasks (if it's not already tiny) and put those in here.

Do _not_ do multiple tasks at once. Pause for instruction after each task.

- [ ] Project Setup
  - [x] Git initialization
  - [x] Create folder structure (src/server/, src/client/, src/shared/)
  - [x] Initialize single package.json with all dependencies
  - [ ] Set up TypeScript config with path mapping
  - [ ] Install core dependencies (Express, Socket.io, React, Vite, tsx)
  - [ ] Set up ESLint + Prettier for code formatting
  - [ ] Create basic README with setup instructions
- [ ] Shared Type Definitions
  - [ ] Define game state interfaces in src/shared/types/
  - [ ] Define player and move types
  - [ ] Define Socket.io event types
  - [ ] Create shared game utility functions
- [ ] Backend Foundation
  - [ ] Basic Express server setup
  - [ ] Socket.io integration and room management
  - [ ] Game ID generation and validation
  - [ ] Basic API endpoints (create game, get game state)
- [ ] Frontend Foundation
  - [ ] React app with Vite setup
  - [ ] Socket.io client integration
  - [ ] Basic routing (home page, game page)
  - [ ] Game board component structure
- [ ] Core Game Logic
  - [ ] Server-side game state management
  - [ ] Move validation and turn logic
  - [ ] Win condition detection
  - [ ] Kriegspiel visibility rules (hidden pieces, reveals)
  - [ ] Basic unit tests for game logic functions
- [ ] Real-time Multiplayer
  - [ ] Player connection and room joining
  - [ ] Live move synchronization
  - [ ] Game state updates and filtered views
  - [ ] Reconnection handling
- [ ] UI/UX Polish
  - [ ] Responsive game board design
  - [ ] Move feedback and animations
  - [ ] Game status indicators (turn, winner, etc.)
  - [ ] Error handling and user messaging
- [ ] Deployment
  - [ ] Production build setup
  - [ ] Environment configuration
  - [ ] Deploy to hosting platform
  - [ ] Testing and validation
