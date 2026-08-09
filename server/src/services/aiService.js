const { GoogleGenerativeAI } = require('@google/generative-ai');
const prisma = require('../lib/prisma');
const githubService = require('./githubService');

const getSystemPrompt = () => {
  return "You are a software engineering assistant helping users manage projects, tasks, and repositories. Provide concise, technical, and actionable responses.";
};

const generateResponse = async ({ message, userId, projectId }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'placeholder') {
    throw new Error('GEMINI_API_KEY is not configured or is a placeholder.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.5-flash as the standard efficient model
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: getSystemPrompt() });

  let contextString = '';

  if (projectId) {
    // Fetch project context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        stages: { orderBy: { orderIndex: 'asc' } },
        tasks: { include: { stage: true } },
        note: true,
      }
    });

    if (project) {
      contextString += `\n\n--- PROJECT CONTEXT ---\nProject Name: ${project.name}\n`;
      
      if (project.stages.length > 0) {
        contextString += `Stages: ${project.stages.map(s => s.name).join(', ')}\n`;
      }
      
      if (project.tasks.length > 0) {
        contextString += `Tasks:\n` + project.tasks.map(t => `- [${t.stage.name}] ${t.title} (Priority: ${t.priority})`).join('\n') + '\n';
      }

      if (project.note && project.note.content) {
        // limit note content if too long
        const noteSnip = project.note.content.substring(0, 1000);
        contextString += `Project Notes:\n${noteSnip}\n`;
      }

      if (project.repoUrl) {
        contextString += `\n--- GITHUB CONTEXT ---\nRepository: ${project.repoUrl}\n`;
        try {
          // Fetch high level commits for context (optional, fail-safe)
          const commits = await githubService.getRepoCommits(project.repoUrl);
          if (commits && commits.length > 0) {
            contextString += `Recent Commits:\n` + commits.slice(0, 5).map(c => `- ${c.commit.message}`).join('\n') + '\n';
          }
        } catch (err) {
          // gracefully fail github context fetch if token is bad or repo unavailable
          contextString += `(Unable to fetch repository details)\n`;
        }
      }
    }
  }

  const fullPrompt = `${contextString ? contextString + '\n\n' : ''}User Message: ${message}`;
  
  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("AI Generation Error:", err);
    throw new Error("Failed to generate response from AI");
  }
};

module.exports = {
  generateResponse
};
