import API from './api';

export const getStages = (projectId) => API.get(`/projects/${projectId}/stages`);
export const addStage = (projectId, data) => API.post(`/projects/${projectId}/stages`, data);
export const renameStage = (stageId, data) => API.put(`/stages/${stageId}`, data);
export const reorderStage = (stageId, data) => API.put(`/stages/${stageId}/reorder`, data);
