const jwt = require('jsonwebtoken');
const prisma = require('./src/lib/prisma');
const config = require('./src/lib/config');

(async () => {
  try {
    const user = await prisma.user.findFirst();
    if (!user) throw new Error('No user found in DB');
    
    // Generate valid token directly
    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '1y' });
    
    const project = await prisma.project.findFirst();
    if (!project) throw new Error('No project found in DB');
    
    console.log('Sending Add Stage request for project:', project.id);
    
    const res = await fetch(`http://localhost:5000/api/projects/${project.id}/stages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'Stage Random 999' })
    });
    
    const text = await res.text();
    console.log(`STATUS: ${res.status}`);
    console.log(`RESPONSE: ${text}`);
  } catch (err) {
    console.log('ERROR:', err.message);
  }
})();
