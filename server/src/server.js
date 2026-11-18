import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

const server = http.createServer(app);

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

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
