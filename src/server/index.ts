import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../shared';
import { GameManager } from './game/GameManager';
import {
  createConnectionValidationMiddleware,
  createSecurityMiddleware,
} from './middleware/validation';
import { createApiRoutes } from './routes/api';
import { setupSocketHandlers } from './socket/handlers';
import { InMemoryStorage } from './storage/InMemoryStorage';

const PORT = 3001;

// Initialize storage
const storage = new InMemoryStorage();

// Initialize Express app
const app = express();
const server = createServer(app);

// Initialize Socket.io
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Removed 'null' for security
    methods: ['GET', 'POST'],
  },
});

// Initialize Game Manager
const gameManager = new GameManager(storage, io);

// Express middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

// API routes
app.use('/api', createApiRoutes(gameManager));

// Socket.io middleware
io.use(createConnectionValidationMiddleware());
io.use(createSecurityMiddleware());

// Setup Socket.io event handlers
setupSocketHandlers(io, gameManager);

// Cleanup interval for old games
setInterval(async () => {
  try {
    const cleanedCount = await storage.cleanup();
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} inactive games`);
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}, 60000); // Run cleanup every minute

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🆕 Create game: POST http://localhost:${PORT}/api/games`);
  console.log(
    `📋 Get game state: GET http://localhost:${PORT}/api/games/:gameId`
  );
  console.log(`🔌 Socket.io ready for connections`);
});
