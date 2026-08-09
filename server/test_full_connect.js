const axios = require('axios');
(async () => {
  try {
    let token;
    try {
      const registerRes = await axios.post('http://127.0.0.1:5000/api/auth/register', {
        name: 'tester2', email: 'test2@agile.com', password: 'password123'
      });
      token = registerRes.data.token;
    } catch(err) {
      if(err.response?.status === 400) {
        // already registered, login instead
        const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
          email: 'test2@agile.com', password: 'password123'
        });
        token = loginRes.data.token;
      } else {
        throw err;
      }
    }
    
    console.log('Got Auth Token');

    // Create a dummy project first to ensure project exists
    let projectId;
    try {
      const projectRes = await axios.post('http://127.0.0.1:5000/api/projects', {
        name: 'Github Test Project'
      }, { headers: { Authorization: `Bearer ${token}` }});
      projectId = projectRes.data.id;
      console.log('Created project', projectId);
    } catch(err) {
       console.error('Failed to create project', err.response?.data);
       return;
    }
    
    // Try to connect github
    const res = await axios.post('http://127.0.0.1:5000/api/github/connect', {
      projectId: projectId,
      repoUrl: 'https://github.com/Akash-100805/test'
    }, { headers: { Authorization: `Bearer ${token}` }});
    
    console.log('SUCCESS:', res.data);
  } catch(e) {
    console.error('SERVER RESPONDED WITH ERROR:');
    console.error('Status:', e.response?.status);
    console.error('Data:', JSON.stringify(e.response?.data));
  }
})();
