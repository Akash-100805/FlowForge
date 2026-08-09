const test = require('node:test');
const assert = require('node:assert/strict');

const { loadWithMocks } = require('../helpers/loadWithMocks');

test('createProject trims fields and creates owner-managed default project', async () => {
  const repoMock = {
    createProject: async (data) => data,
  };

  const { module: projectService, restore } = loadWithMocks('src/services/projectService.js', {
    '../repositories/projectRepo': repoMock,
  });

  const project = await projectService.createProject({
    name: '  Sprint Board  ',
    description: '  Internal planning board  ',
    userId: 'user-1',
  });

  assert.deepEqual(project, {
    name: 'Sprint Board',
    description: 'Internal planning board',
    userId: 'user-1',
  });

  restore();
});
