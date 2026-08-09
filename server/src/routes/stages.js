const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const stageController = require('../controllers/stageController');

const router = express.Router();

router.get('/projects/:projectId/stages', protect, stageController.getStages);
router.post('/projects/:projectId/stages', protect, stageController.addStage);
router.put('/stages/:stageId', protect, stageController.renameStage);
router.put('/stages/:stageId/reorder', protect, stageController.reorderStages);

module.exports = router;
