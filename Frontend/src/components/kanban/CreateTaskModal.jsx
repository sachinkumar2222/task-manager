import React, { useState } from 'react';
import Modal from '../common/Modal'; // Import the reusable Modal
import { createTask } from '../../api/taskService'; // Import the API function
import toast from 'react-hot-toast'; // For success/error notifications

/**
 * CreateTaskModal
 * A modal form for creating a new task within a project.
 * Props:
 * - isOpen: boolean - Controls modal visibility.
 * - onClose: function - Function to call when the modal should close.
 * - onTaskCreated: function - Callback to notify parent when a task is created successfully.
 * - projectId: string - The ID of the project this task belongs to.
 */
const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // Future state: const [assigneeId, setAssigneeId] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    if (!projectId) {
        setError('Project ID is missing. Cannot create task.');
        return;
    }
    setIsLoading(true);

    try {
      const newTaskData = {
        title,
        description,
        projectId,
        // assigneeId: assigneeId, // Add this later
        // status: 'TO_DO' // Backend should handle default status
      };
      
      const createdTask = await createTask(newTaskData); // Call the API
      
      toast.success(`Task "${createdTask.title}" created successfully!`);
      onTaskCreated(createdTask); // Notify parent component (ProjectPage)
      handleClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to create task:", err);
      const errorMessage = err.message || 'Could not create task. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setTitle('');
    setDescription('');
    setError('');
    setIsLoading(false);
    onClose(); // Call the parent's onClose function
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Task" size="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title Input */}
        <div>
          <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="taskTitle"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Design the login page mockup"
            required
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Task Description Textarea */}
        <div>
          <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="taskDescription"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Add a more detailed description..."
            disabled={isLoading}
          ></textarea>
        </div>

        {/* TODO: Add Assignee Dropdown here */}

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
            {isLoading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
