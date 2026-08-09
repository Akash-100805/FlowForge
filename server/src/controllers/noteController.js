const noteService = require('../services/noteService');

const getNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const note = await noteService.getNote({ projectId, userId });
    res.status(200).json(note);
  } catch (error) {
    console.error('GET NOTE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const note = await noteService.updateNote({ projectId, content, userId });
    res.status(200).json(note);
  } catch (error) {
    console.error('UPDATE NOTE ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getNote,
  updateNote,
};
