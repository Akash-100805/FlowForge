const axios = require('axios');
const prisma = require('../lib/prisma');
const { getStatusForError } = require('../utils/httpErrors');

const GITHUB_API_URL = 'https://api.github.com';

const getHeaders = () => {
  const token = process.env.GITHUB_TOKEN;
  const headers = {
    'User-Agent': 'AgileWorkspace-App',
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token && token !== 'placeholder') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const extractRepoOwnerAndName = (repoUrl) => {
  if (!repoUrl) throw new Error('Repository URL is required');
  
  // Simple regex to extract github.com/owner/repo
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (!match) {
    throw new Error('Invalid GitHub repository URL');
  }
  return { owner: match[1], repo: match[2] };
};

const connectRepo = async ({ projectId, repoUrl }) => {
  if (!repoUrl) throw new Error('repoUrl is required');
  const { owner, repo } = extractRepoOwnerAndName(repoUrl);

  try {
    const res = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}`, { headers: getHeaders() });
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { repoUrl },
    });

    return { message: 'Repository connected successfully', repo: res.data };
  } catch (err) {
    if (err.response) {
      if (err.response.status === 404) {
         throw new Error('Repository not found. Double check the URL, or ensure your Personal Access Token is valid and has "repo" scope if it is private.');
      }
      if (err.response.status === 401) {
         throw new Error('GitHub Authorization Failed. Your Personal Access Token is missing, expired, or corrupted.');
      }
      if (err.response.status === 403) {
         throw new Error('GitHub API Rate Limit exceeded or Forbidden. Double check your token.');
      }
      throw new Error(`GitHub Error: ${err.response.data?.message || err.response.statusText}`);
    }
    throw new Error('Failed to connect to GitHub repository: ' + err.message);
  }
};

const getRepoContents = async (repoUrl, path = '') => {
  const { owner, repo } = extractRepoOwnerAndName(repoUrl);

  try {
    const res = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
      headers: getHeaders()
    });
    return res.data;
  } catch (err) {
    throw new Error('Failed to fetch repository contents');
  }
};

const getRepoCommits = async (repoUrl) => {
  const { owner, repo } = extractRepoOwnerAndName(repoUrl);

  try {
    const res = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/commits`, {
      headers: getHeaders(),
      params: { per_page: 15 } // fetch recent 15 commits for summary
    });
    return res.data;
  } catch (err) {
    throw new Error('Failed to fetch recent commits');
  }
};

const uploadFile = async ({ repoUrl, path, content }) => {
  if (!path.endsWith('.txt') && !path.endsWith('.md')) {
    throw new Error('Only .txt and .md files are supported for upload');
  }

  const { owner, repo } = extractRepoOwnerAndName(repoUrl);
  
  // We need to fetch the file first to get its SHA if it exists (for updating rather than creating)
  let sha;
  try {
    const fileRes = await axios.get(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, { headers: getHeaders() });
    sha = fileRes.data.sha;
  } catch (err) {
    // If it's a 404, file doesn't exist, which is fine for a fresh upload
    if (err.response?.status !== 404) {
      throw err;
    }
  }

  try {
    const res = await axios.put(`${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
      message: `Create/Update ${path} via Agile Workspace`,
      content: Buffer.from(content).toString('base64'),
      ...(sha && { sha })
    }, {
      headers: getHeaders()
    });
    return res.data;
  } catch (err) {
    throw new Error(`Failed to upload file: ${err.response?.data?.message || err.message}`);
  }
};

module.exports = {
  connectRepo,
  getRepoContents,
  getRepoCommits,
  uploadFile,
  extractRepoOwnerAndName,
};
