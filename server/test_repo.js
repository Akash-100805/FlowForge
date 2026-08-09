require('dotenv').config();
const { createProject } = require('./src/services/projectService.js');

(async () => {
  try {
    console.log("Starting...");
    await createProject({ name: "Test", description: "Test", userId: "00000000-0000-0000-0000-000000000000" });
    console.log("Success");
  } catch (e) {
    console.error("FAIL:", e);
  }
  process.exit();
})();
