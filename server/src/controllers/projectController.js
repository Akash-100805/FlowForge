const projectService = require('../services/projectService');
const { getStatusForError, getClientMessage } = require('../utils/httpErrors');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const project = await projectService.createProject({ name, description, userId });

    return res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('CREATE PROJECT ERROR:', error);
    return res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await projectService.getUserProjects(userId);
    
    return res.status(200).json(projects);
  } catch (error) {
    console.error('GET PROJECTS ERROR:', error);
    return res.status(getStatusForError(error)).json({ error: getClientMessage(error) });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user.userId;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const member = await projectService.inviteMember({ projectId: id, email, userId });
    return res.status(201).json({ message: 'Member invited successfully', member });
  } catch (error) {
    console.error('INVITE MEMBER ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

const archiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await projectService.archiveProject({ projectId: id, userId });
    return res.status(200).json({ message: 'Project archived successfully', project });
  } catch (error) {
    console.error('ARCHIVE PROJECT ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

const unarchiveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const project = await projectService.unarchiveProject({ projectId: id, userId });
    return res.status(200).json({ message: 'Project unarchived successfully', project });
  } catch (error) {
    console.error('UNARCHIVE PROJECT ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  inviteMember,
  archiveProject,
  unarchiveProject,
};
