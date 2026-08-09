const isPrismaAuthError = (error) => error?.code === 'P1000';

const isPrismaUnavailableError = (error) => error?.code === 'P1001';

const getStatusForError = (error) => {
  if (isPrismaAuthError(error) || isPrismaUnavailableError(error)) {
    return 503;
  }

  if (error?.message === 'User already exists') {
    return 409;
  }

  if (error?.message === 'Invalid email or password') {
    return 401;
  }

  if (
    error?.message === 'Project not found or access denied' ||
    error?.message === 'Task not found' ||
    error?.message === 'Invalid stage' ||
    error?.message === 'Invalid move: Can only progress one stage forward at a time'
  ) {
    return 400;
  }

  return 500;
};

const getClientMessage = (error) => {
  if (isPrismaAuthError(error)) {
    return 'Database authentication failed. Check DATABASE_URL credentials in .env.';
  }

  if (isPrismaUnavailableError(error)) {
    return 'Database is unavailable. Check that PostgreSQL is running and reachable.';
  }

  return error?.message || 'Internal server error';
};

module.exports = {
  getStatusForError,
  getClientMessage,
};
