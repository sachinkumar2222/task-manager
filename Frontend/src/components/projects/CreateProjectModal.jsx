import React, { useState } from 'react';
import Modal from '../common/Modal'; // Import the reusable Modal
import { createProject } from '../../api/taskService'; // Import the API function
import toast from 'react-hot-toast'; // For success/error notifications

/**
 * CreateProjectModal
 * A modal form for creating a new project.
 * Props:
 * - isOpen: boolean - Controls modal visibility.
 * - onClose: function - Function to call when the modal should close.
 * - onProjectCreated: function - Callback to notify parent when a project is created successfully.
 */
const CreateProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }
    setIsLoading(true);

    try {
      const newProjectData = { name, description };
      const createdProject = await createProject(newProjectData); // Call the API
      toast.success(`Project "${createdProject.name}" created successfully!`);
      onProjectCreated(createdProject); // Notify parent component (e.g., Dashboard)
      handleClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to create project:", err);
      setError(err.message || 'Could not create project. Please try again.');
      toast.error(err.message || 'Could not create project.'); // Show error toast
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name Input */}
        <div>
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Marketing Campaign"
            required
            disabled={isLoading}
          />
        </div>

        {/* Project Description Textarea */}
        <div>
          <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="projectDescription"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
