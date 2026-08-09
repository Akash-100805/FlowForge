const axios = require('axios');
require('dotenv').config();

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

(async () => {
  try {
    const res = await axios.get(`${GITHUB_API_URL}/repos/Akash-100805/test`, { headers: getHeaders() });
    console.log('SUCCESS');
  } catch(e) { 
    console.error('ERROR STATUS:', e.response?.status);
    console.error('ERROR DATA:', e.response?.data);
  }
})();
