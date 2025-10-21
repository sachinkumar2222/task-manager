const Project = require('../models/projectModel');
// Analytics client ko import karein
const { sendAnalyticsEvent } = require('../utils/analyticsClient');

/**
 * Ek naya project banata hai aur analytics event bhejta hai.
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    // User ki ID aur Workspace ki ID JWT se nikalo
    const { userId, workspaceId } = req.userData;

    if (!name) {
      return res.status(400).json({ message: 'Project ka naam zaroori hai.' });
    }

    const newProject = await Project.create({
      name,
      description,
      workspaceId,
      creatorId: userId,
    });

    // --- ANALYTICS LOGIC ---
    // Naya project banne ka event bhejo
    sendAnalyticsEvent({
      eventType: 'PROJECT_CREATED',
      workspaceId,
      userId,
      payload: { projectId: newProject.id, projectName: newProject.name },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Project banane mein error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * User ke current workspace ke saare projects ko fetch karta hai.
 */
exports.getProjectsByWorkspace = async (req, res) => {
  try {
    // Workspace ki ID JWT se nikalo
    const { workspaceId } = req.userData;
    const projects = await Project.findByWorkspace(workspaceId);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Projects fetch karne mein error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

