const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const taskController = require('../controllers/taskController');

const router = express.Router();

router.post('/:projectId', protect, taskController.createTask);
router.get('/:projectId', protect, taskController.getTasks);
router.put('/:taskId/move', protect, taskController.moveTask);
router.put('/:taskId/assign', protect, taskController.assignTask);
router.put('/:taskId', protect, taskController.updateTask);
router.delete('/:taskId', protect, taskController.deleteTask);

module.exports = router;
