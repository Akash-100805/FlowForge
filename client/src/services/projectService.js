import API from './api';

export const getProjects = () => API.get('/projects');
export const createProject = (data) => API.post('/projects', data);
export const inviteMember = (projectId, data) => API.post(`/projects/${projectId}/members`, data);
export const archiveProject = (projectId) => API.put(`/projects/${projectId}/archive`);
export const unarchiveProject = (projectId) => API.put(`/projects/${projectId}/unarchive`);
