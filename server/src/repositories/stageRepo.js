const prisma = require('../lib/prisma');

const createStage = async ({ name, projectId, orderIndex }) => {
  return await prisma.workflowStage.create({
    data: { name, projectId, orderIndex },
  });
};

const getStageById = async (stageId) => {
  return await prisma.workflowStage.findUnique({
    where: { id: stageId },
  });
};

const updateStageName = async (stageId, name) => {
  return await prisma.workflowStage.update({
    where: { id: stageId },
    data: { name },
  });
};

const updateStageOrder = async (stageId, orderIndex) => {
  return await prisma.workflowStage.update({
    where: { id: stageId },
    data: { orderIndex },
  });
};

const getStagesByProject = async (projectId) => {
  return await prisma.workflowStage.findMany({
    where: { projectId },
    orderBy: { orderIndex: 'asc' },
  });
};

module.exports = {
  createStage,
  getStageById,
  updateStageName,
  updateStageOrder,
  getStagesByProject,
};
