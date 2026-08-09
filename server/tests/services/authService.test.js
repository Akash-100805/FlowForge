const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5433/agile_workspace';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { loadWithMocks } = require('../helpers/loadWithMocks');

test('registerUser normalizes email and omits passwordHash from the response', async () => {
  const repoMock = {
    findUserByEmail: async () => null,
    createUser: async (data) => ({
      id: 'user-1',
      ...data,
      createdAt: new Date('2026-04-02T00:00:00.000Z'),
    }),
  };

  const { module: authService, restore } = loadWithMocks('src/services/authService.js', {
    '../repositories/authRepo': repoMock,
  });

  const user = await authService.registerUser({
    email: '  USER@Example.com ',
    password: 'password123',
    name: '  Akash  ',
  });

  assert.equal(user.email, 'user@example.com');
  assert.equal(user.name, 'Akash');
  assert.equal('passwordHash' in user, false);

  restore();
});
