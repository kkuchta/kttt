import cors from 'cors';
import express from 'express';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Kriegspiel Tic Tac Toe server is running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
