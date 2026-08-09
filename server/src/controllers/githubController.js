const githubService = require('../services/githubService');
const prisma = require('../lib/prisma');

const connectRepo = async (req, res) => {
  try {
    const { projectId } = req.body;
    const { repoUrl } = req.body;

    const data = await githubService.connectRepo({ projectId, repoUrl });
    res.status(200).json(data);
  } catch (error) {
    console.error('CONNECT_REPO ERROR:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const getFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path } = req.query; // optional sub-path

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !project.repoUrl) {
      return res.status(404).json({ error: 'No repository connected to this project' });
    }

    const contents = await githubService.getRepoContents(project.repoUrl, path);
    res.status(200).json(contents);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getCommits = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !project.repoUrl) {
      return res.status(404).json({ error: 'No repository connected to this project' });
    }

    const commits = await githubService.getRepoCommits(project.repoUrl);
    res.status(200).json(commits);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path, content } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !project.repoUrl) {
      return res.status(404).json({ error: 'No repository connected to this project' });
    }

    const result = await githubService.uploadFile({ repoUrl: project.repoUrl, path, content });
    res.status(200).json({ message: 'File uploaded successfully', result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  connectRepo,
  getFiles,
  getCommits,
  uploadFile,
};
