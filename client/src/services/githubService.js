import API from './api';

export const connectRepo = (projectId, repoUrl) => API.post('/github/connect', { projectId, repoUrl });
export const getRepoFiles = (projectId, path = '') => API.get(`/github/${projectId}/files`, { params: { path } });
export const getRepoCommits = (projectId) => API.get(`/github/${projectId}/commits`);
export const uploadRepoFile = (projectId, path, content) => API.post(`/github/${projectId}/upload`, { path, content });
