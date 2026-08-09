const prisma = require('../lib/prisma');

const getNoteByProjectId = async (projectId) => {
  return await prisma.projectNote.findUnique({
    where: { projectId },
  });
};

const createNote = async (projectId) => {
  return await prisma.projectNote.create({
    data: { projectId },
  });
};

const updateNote = async (projectId, content) => {
  return await prisma.projectNote.update({
    where: { projectId },
    data: { content },
  });
};

module.exports = {
  getNoteByProjectId,
  createNote,
  updateNote,
};
