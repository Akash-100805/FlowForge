const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const noteController = require('../controllers/noteController');

const router = express.Router();

router.get('/:projectId', protect, noteController.getNote);
router.put('/:projectId', protect, noteController.updateNote);

module.exports = router;
