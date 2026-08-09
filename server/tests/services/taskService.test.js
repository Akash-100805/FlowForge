const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/loadWithMocks');

test('createTask denies access when user is not a project member', async () => {
  const repoMock = {
    getProjectMember: async () => null,
  };

  const { module: taskService, restore } = loadWithMocks('src/services/taskService.js', {
    '../repositories/taskRepo': repoMock,
  });

  await assert.rejects(
    () => taskService.createTask({
      title: 'Write docs',
      description: 'Add onboarding docs',
      projectId: 'project-1',
      userId: 'user-1',
    }),
    /Project not found or access denied/
  );

  restore();
});

test('createTask assigns the first workflow stage and trims inputs', async () => {
  const repoMock = {
    getProjectMember: async () => ({ id: 'membership-1' }),
    getStagesByProject: async () => [
      { id: 'stage-1', orderIndex: 0 },
      { id: 'stage-2', orderIndex: 1 },
    ],
    createTask: async (data) => data,
  };

  const { module: taskService, restore } = loadWithMocks('src/services/taskService.js', {
    '../repositories/taskRepo': repoMock,
  });

  const createdTask = await taskService.createTask({
    title: '  Build API  ',
    description: '  Finish task endpoint  ',
    projectId: 'project-1',
    userId: 'user-1',
  });

  assert.deepEqual(createdTask, {
    title: 'Build API',
    description: 'Finish task endpoint',
    projectId: 'project-1',
    stageId: 'stage-1',
  });

  restore();
});

test('getTasks requires project membership before listing tasks', async () => {
  let tasksRequested = false;
  const repoMock = {
    getProjectMember: async () => null,
    getTasksByProject: async () => {
      tasksRequested = true;
      return [];
    },
  };

  const { module: taskService, restore } = loadWithMocks('src/services/taskService.js', {
    '../repositories/taskRepo': repoMock,
  });

  await assert.rejects(
    () => taskService.getTasks({ projectId: 'project-1', userId: 'user-1' }),
    /Project not found or access denied/
  );

  assert.equal(tasksRequested, false);
  restore();
});

test('moveTask only allows one-step forward progression', async () => {
  const repoMock = {
    getTaskById: async () => ({
      id: 'task-1',
      projectId: 'project-1',
      stageId: 'stage-1',
    }),
    getProjectMember: async () => ({ id: 'membership-1' }),
    getStagesByProject: async () => [
      { id: 'stage-1', orderIndex: 0 },
      { id: 'stage-2', orderIndex: 1 },
      { id: 'stage-3', orderIndex: 2 },
    ],
  };

  const { module: taskService, restore } = loadWithMocks('src/services/taskService.js', {
    '../repositories/taskRepo': repoMock,
  });

  await assert.rejects(
    () => taskService.moveTask({
      taskId: 'task-1',
      newStageId: 'stage-3',
      userId: 'user-1',
    }),
    /Can only progress one stage forward at a time/
  );

  restore();
});

test('moveTask updates the task when the destination stage is valid', async () => {
  const repoMock = {
    getTaskById: async () => ({
      id: 'task-1',
      projectId: 'project-1',
      stageId: 'stage-1',
    }),
    getProjectMember: async () => ({ id: 'membership-1' }),
    getStagesByProject: async () => [
      { id: 'stage-1', orderIndex: 0 },
      { id: 'stage-2', orderIndex: 1 },
    ],
    updateTaskStage: async (taskId, newStageId) => ({
      id: taskId,
      stageId: newStageId,
    }),
  };

  const { module: taskService, restore } = loadWithMocks('src/services/taskService.js', {
    '../repositories/taskRepo': repoMock,
  });

  const updatedTask = await taskService.moveTask({
    taskId: 'task-1',
    newStageId: 'stage-2',
    userId: 'user-1',
  });

  assert.deepEqual(updatedTask, {
    id: 'task-1',
    stageId: 'stage-2',
  });

  restore();
});
