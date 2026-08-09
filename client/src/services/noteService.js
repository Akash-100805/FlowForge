import API from './api';

export const getNote = (projectId) => API.get(`/notes/${projectId}`);
export const updateNote = (projectId, data) => API.put(`/notes/${projectId}`, data);
