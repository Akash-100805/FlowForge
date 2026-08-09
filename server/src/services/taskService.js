const taskRepo = require('../repositories/taskRepo');
const { getIO } = require('../sockets/io');

const ensureProjectAccess = async ({ projectId, userId }) => {
  const member = await taskRepo.getProjectMember({ projectId, userId });

  if (!member) {
    throw new Error('Project not found or access denied');
  }
};

const createTask = async ({ title, description, stageId, projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  let targetStageId = stageId;
  if (!targetStageId) {
    const stages = await taskRepo.getStagesByProject(projectId);
    if (!stages || stages.length === 0) {
      throw new Error('No stages found for project. Create default stages first.');
    }
    targetStageId = stages[0].id;
  }

  const task = await taskRepo.createTask({
    title: title.trim(),
    description: description?.trim() || null,
    projectId,
    stageId: targetStageId,
  });

  const io = getIO();
  if (io) io.to(projectId).emit('task:created', task);

  return task;
};

const getTasks = async ({ projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });
  return await taskRepo.getTasksByProject(projectId);
};

const moveTask = async ({ taskId, newStageId, userId }) => {
  const task = await taskRepo.getTaskById(taskId);
  if (!task) throw new Error('Task not found');

  await ensureProjectAccess({ projectId: task.projectId, userId });

  const stages = await taskRepo.getStagesByProject(task.projectId);
  const currentStage = stages.find(s => s.id === task.stageId);
  const newStage = stages.find(s => s.id === newStageId);

  if (!currentStage || !newStage) {
    throw new Error('Invalid stage');
  }

  // Validate directional movement rules
  // Rule: Can only jump forward by 1 maximum (or backwards freely)
  if (newStage.orderIndex > currentStage.orderIndex + 1) {
    throw new Error('Invalid move: Can only progress one stage forward at a time');
  }

  const updatedTask = await taskRepo.updateTaskStage(taskId, newStageId);

  const io = getIO();
  if (io) io.to(task.projectId).emit('task:moved', { taskId, newStageId });

  return updatedTask;
};

const updateTask = async ({ taskId, title, description, priority, dueDate, userId }) => {
  const task = await taskRepo.getTaskById(taskId);
  if (!task) throw new Error('Task not found');

  await ensureProjectAccess({ projectId: task.projectId, userId });

  const data = {};
  if (title !== undefined) data.title = title.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (priority !== undefined) data.priority = priority.trim();
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

  const updatedTask = await taskRepo.updateTask(taskId, data);

  const io = getIO();
  if (io) io.to(task.projectId).emit('task:updated', updatedTask);

  return updatedTask;
};

const deleteTask = async ({ taskId, userId }) => {
  const task = await taskRepo.getTaskById(taskId);
  if (!task) throw new Error('Task not found');

  await ensureProjectAccess({ projectId: task.projectId, userId });

  await taskRepo.deleteTask(taskId);

  const io = getIO();
  if (io) io.to(task.projectId).emit('task:deleted', { taskId });
};

const assignTask = async ({ taskId, assigneeId, userId }) => {
  const task = await taskRepo.getTaskById(taskId);
  if (!task) throw new Error('Task not found');

  await ensureProjectAccess({ projectId: task.projectId, userId });

  // Verify assignee is a member of the project
  if (assigneeId) {
    const assigneeMember = await taskRepo.getProjectMember({
      projectId: task.projectId,
      userId: assigneeId,
    });
    if (!assigneeMember) throw new Error('Assignee is not a member of this project');
  }

  return await taskRepo.assignTask(taskId, assigneeId);
};

module.exports = {
  createTask,
  getTasks,
  moveTask,
  updateTask,
  deleteTask,
  assignTask,
};
