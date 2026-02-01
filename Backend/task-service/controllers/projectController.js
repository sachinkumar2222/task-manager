const Project = require('../models/projectModel');
// Import the Analytics client
const { sendAnalyticsEvent } = require('../utils/analyticsClient');

/**
 * Creates a new project and sends an analytics event.
 */
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    // Extract user ID and workspace ID from JWT/header
    const { userId, workspaceId } = req.userData; // Assuming checkAuth adds workspaceId

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    // Ensure workspaceId is present
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is missing.' });
    }


    const newProject = await Project.create({
      name,
      description,
      workspaceId, 
      creatorId: userId,
    });

    // --- ANALYTICS LOGIC ---
    sendAnalyticsEvent({
      eventType: 'PROJECT_CREATED',
      workspaceId,
      userId,
      payload: { projectId: newProject.id, projectName: newProject.name },
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    // Handle potential Prisma validation errors more gracefully
    if (error.code === 'P2002') { // Example: Unique constraint failed (adjust if needed)
      return res.status(409).json({ message: 'Project creation failed due to conflict.' });
    }
    res.status(500).json({ message: 'Internal server error while creating project.' }); // Generic message for other errors
  }
};

/**
 * Fetches all projects for the user's current workspace.
 */
exports.getProjectsByWorkspace = async (req, res) => {
  try {
    // Extract workspace ID from JWT/header
    // Extract workspace ID and role from JWT/header
    const { workspaceId, role, userId } = req.userData;
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is missing.' });
    }

    let projects;
    if (role === 'ADMIN') {
      // Admins see all projects
      projects = await Project.findByWorkspace(workspaceId);
    } else {
      // Members see only projects they have tasks in
      projects = await Project.findByWorkspaceAndUser(workspaceId, userId);
    }

    res.status(200).json(projects || []);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: 'Internal server error while fetching projects.' });
  }
};

/**
 * Fetches details for a single project by its ID.
 * Ensures the project belongs to the user's current workspace.
 */
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { workspaceId } = req.userData; // Get workspaceId from authenticated user data

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is missing.' });
    }

    // Call a model function to find the project by ID *and* workspaceId
    const project = await Project.findByIdAndWorkspace(projectId, workspaceId);

    if (!project) {
      // If project doesn't exist or doesn't belong to the user's workspace
      return res.status(404).json({ message: 'Project not found in this workspace.' });
    }

    // Return the found project details
    res.status(200).json(project);

  } catch (error) {
    console.error(`Error fetching project ${req.params.projectId}:`, error);
    res.status(500).json({ message: 'Internal server error while fetching project details.' });
  }
};

/**
 * Updates an existing project. (NEW FUNCTION)
 * Ensures the project belongs to the user's current workspace.
 */
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const { userId, workspaceId } = req.userData; // For security check

    if (!name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is missing.' });
    }

    const project = await Project.findByIdAndWorkspace(projectId, workspaceId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found in this workspace.' });
    }


    const updatedProject = await Project.update(projectId, { name, description });
    res.status(200).json(updatedProject);

  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: 'Internal server error while updating project' });
  }
};

/**
 * Deletes a project. (NEW FUNCTION)
 * Ensures the project belongs to the user's current workspace.
 */
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, workspaceId } = req.userData; // For security check

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is missing.' });
    }

    // Security Check: Find the project first to ensure it's in their workspace
    const project = await Project.findByIdAndWorkspace(projectId, workspaceId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found in this workspace.' });
    }

    // TODO: Add role-based check (e.g., only ADMIN or project creator (project.creatorId === userId))

    // Call model to delete
    await Project.delete(projectId);

    // Send analytics event (optional)
    sendAnalyticsEvent({
      eventType: 'PROJECT_DELETED', // Make sure analytics service handles this
      workspaceId,
      userId,
      payload: { projectId },
    });

    res.status(204).send(); // 204 No Content - standard for successful delete
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: 'Internal server error while deleting project' });
  }
};

/**
 * Fetches real-time stats for the workspace from the database.
 * Serves as the single source of truth for "Absolute Counts".
 */
exports.getWorkspaceStats = async (req, res) => {
  try {
    const { workspaceId } = req.userData;
    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is missing.' });
    }

    const Project = require('../models/projectModel');
    const Task = require('../models/taskModel');

    // Fetch counts in parallel
    const [totalProjects, totalTasks, completedTasks] = await Promise.all([
      Project.countByWorkspace(workspaceId),
      Task.countByWorkspace(workspaceId),
      Task.countCompletedByWorkspace(workspaceId)
    ]);

    const activeTasks = totalTasks - completedTasks;

    res.status(200).json({
      totalProjects,
      totalTasks,
      activeTasks,
      completedTasks
    });

  } catch (error) {
    console.error("Error fetching workspace stats FULL ERROR:", error);
    res.status(500).json({ message: 'Internal server error while fetching stats.', error: error.message });
  }
};

