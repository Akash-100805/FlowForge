const noteRepo = require('../repositories/noteRepo');
const projectRepo = require('../repositories/projectRepo');
const { getIO } = require('../sockets/io');

const ensureProjectAccess = async ({ projectId, userId }) => {
  const member = await projectRepo.findProjectMember({ projectId, userId });
  if (!member) {
    throw new Error('Project not found or access denied');
  }
};

const getNote = async ({ projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  let note = await noteRepo.getNoteByProjectId(projectId);
  if (!note) {
    note = await noteRepo.createNote(projectId);
  }

  return note;
};

const updateNote = async ({ projectId, content, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  // Auto-create if missing
  let note = await noteRepo.getNoteByProjectId(projectId);
  if (!note) {
    await noteRepo.createNote(projectId);
  }

  const updatedNote = await noteRepo.updateNote(projectId, content);

  const io = getIO();
  if (io) io.to(projectId).emit('note:updated', { projectId, content });

  return updatedNote;
};

module.exports = {
  getNote,
  updateNote,
};
