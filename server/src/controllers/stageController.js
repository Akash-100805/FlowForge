const stageService = require('../services/stageService');

const addStage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: 'Stage name is required' });
    }

    const stage = await stageService.addStage({ name, projectId, userId });
    res.status(201).json(stage);
  } catch (error) {
    console.error('ADD STAGE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

const renameStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { name } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: 'Stage name is required' });
    }

    const stage = await stageService.renameStage({ stageId, name, userId });
    res.status(200).json(stage);
  } catch (error) {
    console.error('RENAME STAGE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

const reorderStages = async (req, res) => {
  try {
    const { stageId } = req.params;
    const { newOrderIndex } = req.body;
    const userId = req.user.userId;

    if (newOrderIndex === undefined || newOrderIndex === null) {
      return res.status(400).json({ error: 'newOrderIndex is required' });
    }

    const stages = await stageService.reorderStages({ stageId, newOrderIndex, userId });
    res.status(200).json(stages);
  } catch (error) {
    console.error('REORDER STAGES ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

const getStages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const stages = await stageService.getStages({ projectId, userId });
    res.status(200).json(stages);
  } catch (error) {
    console.error('GET STAGES ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getStages,
  addStage,
  renameStage,
  reorderStages,
};
