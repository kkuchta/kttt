# Kriegspiel Tic Tac Toe

A web-based multiplayer implementation of Kriegspiel Tic Tac Toe - a hidden information variant of classic tic-tac-toe where players cannot see their opponent's moves until they accidentally try to place a piece on an occupied space.

## 🎮 Game Rules

- **Hidden Information**: Players can only see their own pieces on the board
- **Move Resolution**: Attempting to place on an opponent's piece reveals it and costs your turn
- **Victory**: First to get three in a row wins
- **Multiplayer**: Share a game URL to play with friends

For detailed game rules, see [Game Rules](/.ai/game_rules.md).

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm
- make (optional, but recommended)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd kttt

# Install dependencies
make install
# or: npm install

# Start development servers
make dev
# or: npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## 🛠️ Development

### Available Commands

We provide both Makefile targets and npm scripts for all development tasks:

#### Core Development

```bash
make dev          # Start both client and server in development mode
make dev-client   # Start only the client (Vite dev server)
make dev-server   # Start only the server (tsx watch mode)
make build        # Build for production
make start        # Start production server
```

#### Code Quality

```bash
make lint         # Check code with ESLint
make lint-fix     # Auto-fix ESLint issues
make format       # Format code with Prettier
make format-check # Check formatting without changes
make check        # Run both linting and format checks
```

#### Workflow Shortcuts

```bash
make setup        # Initial project setup
make pre-commit   # Format, fix, and check before committing
make ci           # Full CI pipeline (install, check, build)
make clean        # Clean all build artifacts and dependencies
make clean-dist   # Clean only build artifacts
```

#### Help

```bash
make help         # Show all available targets
```

### Project Structure

```
kttt/
├── src/
│   ├── client/          # React frontend application
│   ├── server/          # Express + Socket.io backend
│   └── shared/          # Shared TypeScript types and utilities
├── dist/                # Build output
├── .ai/                 # Project documentation and planning
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
├── .eslintrc.cjs        # ESLint configuration
├── .prettierrc          # Prettier configuration
└── Makefile             # Development automation
```

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io + TypeScript
- **Build Tools**: Vite (client), tsx (server)
- **Code Quality**: ESLint + Prettier + TypeScript

### Development Philosophy

- **Single Package**: Simplified dependency management
- **Shared Types**: End-to-end type safety
- **Real-time**: WebSocket-based multiplayer
- **Server Authoritative**: All game logic on server

## 🌐 Deployment

```bash
# Build for production
make build

# Start production server
make start
```

The built application will be in the `dist/` directory.

## 🧪 Code Quality

This project uses ESLint and Prettier for code quality and formatting:

- **ESLint**: TypeScript and React linting rules
- **Prettier**: Consistent code formatting
- **Pre-commit checks**: Automated formatting and linting

### Pre-commit Workflow

```bash
# Before committing, run:
make pre-commit

# This will:
# 1. Auto-fix any fixable ESLint issues
# 2. Format code with Prettier
# 3. Check for remaining issues
```

## 📁 Configuration Files

- **TypeScript**: `tsconfig.json`, `tsconfig.server.json`, `tsconfig.node.json`
- **ESLint**: `.eslintrc.cjs`
- **Prettier**: `.prettierrc`, `.prettierignore`
- **Vite**: `vite.config.ts`
- **Git**: `.gitignore`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `make pre-commit` to ensure code quality
5. Submit a pull request

## 📋 Development Status

See [Worklog](/.ai/worklog.md) for current development progress and planned features.

## 📄 License

MIT License - see LICENSE file for details.
