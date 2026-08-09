import API from './api';

export const getTasks = (projectId) => API.get(`/tasks/${projectId}`);
export const createTask = (projectId, data) => API.post(`/tasks/${projectId}`, data);
export const updateTask = (taskId, data) => API.put(`/tasks/${taskId}`, data);
export const moveTask = (taskId, data) => API.put(`/tasks/${taskId}/move`, data);
export const assignTask = (taskId, data) => API.put(`/tasks/${taskId}/assign`, data);
export const deleteTask = (taskId) => API.delete(`/tasks/${taskId}`);
