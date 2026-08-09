const express = require('express');
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, projectController.createProject);
router.get('/', protect, projectController.getProjects);
router.post('/:id/members', protect, projectController.inviteMember);
router.put('/:id/archive', protect, projectController.archiveProject);
router.put('/:id/unarchive', protect, projectController.unarchiveProject);

module.exports = router;
