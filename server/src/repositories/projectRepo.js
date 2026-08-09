const prisma = require('../lib/prisma');

const DEFAULT_STAGES = [
  { name: 'To Do', orderIndex: 0 },
  { name: 'In Progress', orderIndex: 1 },
  { name: 'Review', orderIndex: 2 },
  { name: 'Done', orderIndex: 3 },
];

const createProject = async ({ name, description, userId }) => {
  return await prisma.project.create({
    data: {
      name,
      description,
      members: {
        create: {
          userId,
          role: 'MANAGER',
        },
      },
      stages: {
        create: DEFAULT_STAGES,
      },
    },
  });
};

const getProjectsByUserId = async (userId, tx = prisma) => {
  return await tx.projectMember.findMany({
    where: { userId },
    include: { project: true },
  });
};

const findProjectMember = async ({ projectId, userId }, tx = prisma) => {
  return await tx.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });
};

const getProjectById = async (projectId) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
  });
};

const addProjectMember = async ({ projectId, userId, role }) => {
  return await prisma.projectMember.create({
    data: { projectId, userId, role: role || 'MEMBER' },
  });
};

const updateProjectStatus = async (projectId, status) => {
  return await prisma.project.update({
    where: { id: projectId },
    data: { status },
  });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

module.exports = {
  prisma,
  createProject,
  getProjectsByUserId,
  findProjectMember,
  getProjectById,
  addProjectMember,
  updateProjectStatus,
  findUserByEmail,
};
