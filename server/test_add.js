(async () => {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'akash2@test.com', password: 'password123' })
    });
    const login = await loginRes.json();
    if(!login.token) throw new Error('Login failed: ' + JSON.stringify(login));
    const token = login.token;
    console.log('Login success');

    const prjRes = await fetch('http://localhost:5000/api/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const projects = await prjRes.json();
    if(projects.length === 0) return console.log('No projects');
    const pid = projects[0].project.id;
    console.log('PID:', pid);

    const stageRes = await fetch(`http://localhost:5000/api/projects/${pid}/stages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: 'Stage X' })
    });
    
    // Check if it's returning HTML instead of JSON
    const text = await stageRes.text();
    console.log('Add stage status:', stageRes.status);
    console.log('Add stage res:', text);
  } catch (err) {
    console.log('ERROR:', err.message);
  }
})();
