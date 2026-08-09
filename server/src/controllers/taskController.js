const taskService = require('../services/taskService');
const { getStatusForError, getClientMessage } = require('../utils/httpErrors');

const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, stageId } = req.body;
    const userId = req.user.userId;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const task = await taskService.createTask({ title, description, stageId, projectId, userId });
    res.status(201).json(task);
  } catch (error) {
    console.error('CREATE TASK ERROR:', error);
    res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const tasks = await taskService.getTasks({ projectId, userId });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('GET TASKS ERROR:', error);
    res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

const moveTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStageId } = req.body;
    const userId = req.user.userId;
    
    if (!newStageId) {
      return res.status(400).json({ error: 'newStageId is required' });
    }

    const updatedTask = await taskService.moveTask({ taskId, newStageId, userId });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('MOVE TASK ERROR:', error);
    res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate } = req.body;
    const userId = req.user.userId;

    const updatedTask = await taskService.updateTask({ taskId, title, description, priority, dueDate, userId });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('UPDATE TASK ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    await taskService.deleteTask({ taskId, userId });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('DELETE TASK ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assigneeId } = req.body;
    const userId = req.user.userId;

    const updatedTask = await taskService.assignTask({ taskId, assigneeId, userId });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('ASSIGN TASK ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  moveTask,
  updateTask,
  deleteTask,
  assignTask,
};
