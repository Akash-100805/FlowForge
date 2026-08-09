const projectRepo = require('../repositories/projectRepo');

const ensureProjectAccess = async ({ projectId, userId }) => {
  const member = await projectRepo.findProjectMember({ projectId, userId });
  if (!member) {
    throw new Error('Project not found or access denied');
  }
};

const createProject = async ({ name, description, userId }) => {
  return await projectRepo.createProject({
    name: name.trim(),
    description: description?.trim() || null,
    userId,
  });
};

const getUserProjects = async (userId) => {
  const members = await projectRepo.getProjectsByUserId(userId);
  return members.map(member => member.project);
};

const inviteMember = async ({ projectId, email, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  const user = await projectRepo.findUserByEmail(email);
  if (!user) throw new Error('User not found');

  // Check if already a member
  const existing = await projectRepo.findProjectMember({ projectId, userId: user.id });
  if (existing) throw new Error('User is already a member of this project');

  return await projectRepo.addProjectMember({
    projectId,
    userId: user.id,
    role: 'MEMBER',
  });
};

const archiveProject = async ({ projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  const project = await projectRepo.getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  return await projectRepo.updateProjectStatus(projectId, 'ARCHIVED');
};

const unarchiveProject = async ({ projectId, userId }) => {
  await ensureProjectAccess({ projectId, userId });

  const project = await projectRepo.getProjectById(projectId);
  if (!project) throw new Error('Project not found');

  return await projectRepo.updateProjectStatus(projectId, 'ACTIVE');
};

module.exports = {
  createProject,
  getUserProjects,
  inviteMember,
  archiveProject,
  unarchiveProject,
};

