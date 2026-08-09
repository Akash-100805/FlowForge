const express = require('express');
const app = express();

const router1 = express.Router();
router1.post('/', (req, res) => res.send('router1 post root'));
router1.post('/:id/members', (req, res) => res.send('router1 members'));

const router2 = express.Router();
router2.post('/projects/:projectId/stages', (req, res) => res.send('router2 stages'));

app.use('/api/projects', router1);
app.use('/api', router2);

const request = require('supertest');

request(app)
  .post('/api/projects/123/stages')
  .expect(200)
  .end((err, res) => {
    if (err) console.error("FAILED:", err);
    console.log("RESULT:", res?.text);
  });
