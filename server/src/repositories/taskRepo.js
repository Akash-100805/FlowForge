const prisma = require('../lib/prisma');

const createTask = async (data) => {
  return await prisma.task.create({
    data,
    include: { stage: true },
  });
};

const getTasksByProject = async (projectId) => {
  return await prisma.task.findMany({ 
    where: { projectId },
    include: { stage: true },
    orderBy: { createdAt: 'asc' },
  });
};

const updateTaskStage = async (taskId, newStageId) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: { stageId: newStageId },
    include: { stage: true },
  });
};

const getStagesByProject = async (projectId) => {
  return await prisma.workflowStage.findMany({
    where: { projectId },
    orderBy: { orderIndex: 'asc' },
  });
};

const getTaskById = async (taskId) => {
  return await prisma.task.findUnique({
    where: { id: taskId },
    include: { stage: true },
  });
};

const getProjectMember = async ({ projectId, userId }) => {
  return await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};

const updateTask = async (taskId, data) => {
  return await prisma.task.update({
    where: { id: taskId },
    data,
    include: { stage: true },
  });
};

const deleteTask = async (taskId) => {
  return await prisma.task.delete({
    where: { id: taskId },
  });
};

const assignTask = async (taskId, assigneeId) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: { assigneeId },
    include: { stage: true },
  });
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStage,
  getStagesByProject,
  getTaskById,
  getProjectMember,
  updateTask,
  deleteTask,
  assignTask,
};
