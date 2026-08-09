require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./lib/config');
const prisma = require('./lib/prisma');
const initializeSocket = require('./sockets/socketHandler');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const stageRoutes = require('./routes/stages');
const noteRoutes = require('./routes/notes');
const githubRoutes = require('./routes/github');
const aiRoutes = require('./routes/ai');

const createApp = () => {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  
  app.use('/api/auth', authRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api', stageRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/github', githubRoutes);
  app.use('/api/ai', aiRoutes);
  app.get('/', (req, res) => {
    res.send('API running');
  });
  
  return app;
};

const app = createApp();

if (require.main === module) {
  (async () => {
    try {
      await prisma.$connect();
      
      const server = http.createServer(app);
      const io = new Server(server, {
        cors: { origin: '*' },
      });

      // Make io accessible globally for services
      app.set('io', io);
      global.io = io;

      initializeSocket(io);

      server.listen(config.port, () => {
        console.log(`Server is running on port ${config.port}`);
      });
    } catch (error) {
      console.error('Failed to connect to the database:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { app, createApp };
