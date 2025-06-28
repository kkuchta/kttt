import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from '../shared';
import { createStorage, getStorageConfig } from './config/storage';
import { GameManager } from './game/GameManager';
import { MatchmakingManager } from './game/MatchmakingManager';
import {
  createConnectionValidationMiddleware,
  createSecurityMiddleware,
} from './middleware/validation';
import { createApiRoutes } from './routes/api';
import { setupSocketHandlers } from './socket/handlers';
import { RedisStorage } from './storage/RedisStorage';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// Initialize storage based on configuration
const storageConfig = getStorageConfig();
const storage = createStorage(storageConfig);

console.log(`🗄️  Using Redis storage`);
console.log(`🔗 Redis URL: ${storageConfig.redis.url}`);

// Initialize Express app
const app = express();
const server = createServer(app);

// Configure CORS origins based on environment
const corsOrigins =
  process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || 'https://your-app.railway.app']
    : ['http://localhost:3000', 'http://localhost:5173'];

// Initialize Socket.io
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
});

// Initialize Game Manager and Matchmaking Manager
const gameManager = new GameManager(storage, io);
const matchmakingManager = new MatchmakingManager(gameManager, io);

// Express middleware
app.use(
  cors({
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  })
);
app.use(express.json());

// API routes
app.use('/api', createApiRoutes(gameManager));

// Serve static files from client build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist/client'));

  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist/client/index.html'));
  });
}

// Socket.io middleware
io.use(createConnectionValidationMiddleware());
io.use(createSecurityMiddleware());

// Setup Socket.io event handlers
setupSocketHandlers(io, gameManager, matchmakingManager);

// Connect to Redis if using Redis storage
async function initializeStorage() {
  if (storage instanceof RedisStorage) {
    try {
      await storage.connect();
      console.log('✅ Redis storage connected successfully');
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      console.log('💡 Make sure Redis is running: make redis-up');
      process.exit(1);
    }
  }
}

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

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');

  // Cleanup matchmaking manager
  matchmakingManager.destroy();

  if (storage instanceof RedisStorage) {
    await storage.disconnect();
    console.log('✅ Redis connection closed');
  }

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Initialize and start server
async function startServer() {
  await initializeStorage();

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🆕 Create game: POST http://localhost:${PORT}/api/games`);
    console.log(
      `📋 Get game state: GET http://localhost:${PORT}/api/games/:gameId`
    );
    console.log(`🔌 Socket.io ready for connections`);
  });
}

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
