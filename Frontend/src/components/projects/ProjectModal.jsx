import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal'; // Import the reusable Modal
import { createProject, updateProject } from '../../api/taskService'; // Import updateProject

/**
 * ProjectModal
 * A modal form for creating or updating a project.
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onProjectSaved: function - Callback when project is created/updated.
 * - projectToEdit: object - (Optional) Project object to edit.
 */
const ProjectModal = ({ isOpen, onClose, onProjectSaved, projectToEdit = null }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with project data if editing
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name || '');
      setDescription(projectToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [projectToEdit, isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setIsLoading(true);

    try {
      let savedProject;
      if (projectToEdit) {
        // Update existing project
        savedProject = await updateProject(projectToEdit.id, { name, description });
        toast.success(`Project "${savedProject.name}" updated successfully!`);
      } else {
        // Create new project
        savedProject = await createProject({ name, description });
        toast.success(`Project "${savedProject.name}" created successfully!`);
      }

      onProjectSaved(savedProject); // Notify parent
      handleClose();
    } catch (err) {
      console.error("Failed to save project:", err);
      setError(err.message || 'Could not save project. Please try again.');
      toast.error(err.message || 'Could not save project.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    setIsLoading(false);
    onClose(); // Call the parent's onClose function
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={projectToEdit ? "Edit Project" : "Create New Project"} size="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name Input */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="e.g., Marketing Campaign"
            required
            disabled={isLoading}
          />
        </div>

        {/* Project Description Textarea */}
        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="projectDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Add a brief description of the project"
            disabled={isLoading}
          ></textarea>
        </div>

        {/* Error Message Display */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Modal Footer with Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : (projectToEdit ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
