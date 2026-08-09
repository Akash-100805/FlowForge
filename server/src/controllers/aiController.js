const aiService = require('../services/aiService');

const chat = async (req, res) => {
  try {
    const { message, projectId } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const reply = await aiService.generateResponse({ message, userId, projectId });
    res.status(200).json({ reply });
  } catch (error) {
    console.error('AI CHAT ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  chat,
};
