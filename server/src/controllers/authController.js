const authService = require('../services/authService');
const { getStatusForError, getClientMessage } = require('../utils/httpErrors');

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const user = await authService.registerUser({ email, password, name });
    
    return res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { user, token } = await authService.loginUser({ email, password });
    
    return res.status(200).json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

module.exports = {
  register,
  login,
  
};
