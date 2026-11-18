import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initializeCLIP } from './services/embedding.service.js';
import { initSocket } from './sockets/index.js';
import { startExpiryJob } from './jobs/expiry.job.js';

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Nightly Expiry Job
startExpiryJob();

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Warm up CLIP transformer model in background
  initializeCLIP().catch((err) => {
    console.warn('[CLIP] Warmup notice:', err.message);
  });

  server.listen(env.PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 FoundIt Server running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Client URL: ${env.CLIENT_URL}`);
    console.log(`===============================================`);
  });
};

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

export { server };
