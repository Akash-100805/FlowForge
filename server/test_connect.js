const axios = require('axios');
(async () => {
  try {
    const login = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    console.log('Login Token:', login.data.token.substring(0, 10) + '...');
    
    // Try to connect github
    const res = await axios.post('http://127.0.0.1:5000/api/github/connect', {
      projectId: 'f40a0137-d5b3-4db1-be30-d485f0b37883',
      repoUrl: 'https://github.com/Akash-100805/test'
    }, { headers: { Authorization: `Bearer ${login.data.token}` }});
    
    console.log('SUCCESS:', res.data);
  } catch(e) {
    console.error('SERVER RESPONDED WITH ERROR:');
    console.error('Status:', e.response?.status);
    console.error('Data:', e.response?.data);
    console.error('Axios Msg:', e.message);
  }
})();
