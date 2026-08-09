const prisma = require('./src/lib/prisma');
(async () => {
  try {
    const project = await prisma.project.findFirst();
    if (!project) return console.log('No project found');
    console.log('Project ID:', project.id);
    
    const stages = await prisma.workflowStage.findMany({ where: { projectId: project.id }});
    console.log('Existing stages:', stages.map(s => s.name));
    
    // Simulate what the service does
    const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.orderIndex)) : -1;
    
    const newStage = await prisma.workflowStage.create({
      data: {
        name: 'Stage 2 Random',
        projectId: project.id,
        orderIndex: maxOrder + 1
      }
    });
    console.log('Created stage:', newStage);
  } catch (error) {
    console.log('Prisma error:', error);
  }
})();
