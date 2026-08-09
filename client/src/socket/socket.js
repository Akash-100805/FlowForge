import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const joinProject = (projectId) => {
  if (socket) socket.emit('join_project', projectId);
};

export const leaveProject = (projectId) => {
  if (socket) socket.emit('leave_project', projectId);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
