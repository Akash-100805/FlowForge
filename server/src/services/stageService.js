const stageRepo = require('../repositories/stageRepo');
const projectRepo = require('../repositories/projectRepo');

const ensureProjectAccess = async ({ projectId, userId }) => {
  const member = await projectRepo.findProjectMember({ projectId, userId });
  if (!member) {
    throw new Error('Project not found or access denied');
  }
};

const addStage = async ({ name, projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  const stages = await stageRepo.getStagesByProject(projectId);
  const maxOrder = stages.length > 0
    ? Math.max(...stages.map(s => s.orderIndex))
    : -1;

  return await stageRepo.createStage({
    name: name.trim(),
    projectId,
    orderIndex: maxOrder + 1,
  });
};

const renameStage = async ({ stageId, name, userId }) => {
  const stage = await stageRepo.getStageById(stageId);
  if (!stage) throw new Error('Stage not found');

  await ensureProjectAccess({ projectId: stage.projectId, userId });

  return await stageRepo.updateStageName(stageId, name.trim());
};

const reorderStages = async ({ stageId, newOrderIndex, userId }) => {
  const stage = await stageRepo.getStageById(stageId);
  if (!stage) throw new Error('Stage not found');

  await ensureProjectAccess({ projectId: stage.projectId, userId });

  const stages = await stageRepo.getStagesByProject(stage.projectId);
  const currentOrderIndex = stage.orderIndex;

  if (newOrderIndex < 0 || newOrderIndex >= stages.length) {
    throw new Error('Invalid order index');
  }

  if (currentOrderIndex === newOrderIndex) {
    return stages;
  }

  // Use a temporary index to avoid unique constraint violations
  // Set target stage to a temp value first
  const tempIndex = -999;
  await stageRepo.updateStageOrder(stageId, tempIndex);

  if (newOrderIndex > currentOrderIndex) {
    // Moving forward: decrement intermediate stages
    for (const s of stages) {
      if (s.orderIndex > currentOrderIndex && s.orderIndex <= newOrderIndex) {
        await stageRepo.updateStageOrder(s.id, s.orderIndex - 1);
      }
    }
  } else {
    // Moving backward: increment intermediate stages
    for (const s of stages.reverse()) {
      if (s.orderIndex >= newOrderIndex && s.orderIndex < currentOrderIndex) {
        await stageRepo.updateStageOrder(s.id, s.orderIndex + 1);
      }
    }
  }

  // Set target stage to final position
  await stageRepo.updateStageOrder(stageId, newOrderIndex);

  return await stageRepo.getStagesByProject(stage.projectId);
};

const getStages = async ({ projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });
  return await stageRepo.getStagesByProject(projectId);
};

module.exports = {
  getStages,
  addStage,
  renameStage,
  reorderStages,
};
