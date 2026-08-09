const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join_project', (projectId) => {
      socket.join(projectId);
      console.log(`Socket ${socket.id} joined project ${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(projectId);
      console.log(`Socket ${socket.id} left project ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = initializeSocket;
