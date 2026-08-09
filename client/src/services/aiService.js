import API from './api';

export const sendChatMessage = (message, projectId) => API.post('/ai/chat', { message, projectId });
