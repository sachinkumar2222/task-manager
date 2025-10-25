const Project = require('../models/projectModel');
// Import the Analytics client
const { sendAnalyticsEvent } = require('../utils/analyticsClient');

/**
 * Creates a new project and sends an analytics event.
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    // Extract user ID and workspace ID from JWT
    const { userId, workspaceId } = req.userData;
    console.log("this is create project controller ")

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    const newProject = await Project.create({
      name,
      description,
      workspaceId,
      creatorId: userId,
    });

    // --- ANALYTICS LOGIC ---
    // Send an event when a new project is created
    sendAnalyticsEvent({
      eventType: 'PROJECT_CREATED',
      workspaceId,
      userId,
      payload: { projectId: newProject.id, projectName: newProject.name },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Fetches all projects for the user's current workspace.
 */
exports.getProjectsByWorkspace = async (req, res) => {
  try {
    // Extract workspace ID from JWT
    const { workspaceId } = req.userData;
    const projects = await Project.findByWorkspace(workspaceId);
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
