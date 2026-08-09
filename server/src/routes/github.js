const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const githubController = require('../controllers/githubController');

const router = express.Router();

router.post('/connect', protect, githubController.connectRepo);
router.get('/:projectId/files', protect, githubController.getFiles);
router.get('/:projectId/commits', protect, githubController.getCommits);
router.post('/:projectId/upload', protect, githubController.uploadFile);

module.exports = router;
