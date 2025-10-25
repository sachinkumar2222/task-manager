import React, { useState } from 'react';
import Modal from '../common/Modal'; // Import the reusable Modal component
import { createWorkspace } from '../../api/authService'; // Import the API function
import toast from 'react-hot-toast'; // For success/error notifications
import { useAuth } from '../../context/AuthContext'; // To potentially update context later if needed

/**
 * CreateWorkspaceModal
 * A modal form for creating a new workspace.
 * Props:
 * - isOpen: boolean - Controls modal visibility.
 * - onClose: function - Function to call when the modal should close.
 * - onWorkspaceCreated: function - Callback to notify parent when a workspace is created successfully.
 */
const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth(); // Get current user (needed for role assignment in backend)

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    if (!name.trim()) {
      setError('Workspace name is required.');
      return;
    }
    setIsLoading(true);

    try {
      const workspaceData = { name };
      // Call the API function to create the workspace
      // The backend will automatically make the currentUser the ADMIN
      const response = await createWorkspace(workspaceData); 
      
      toast.success(`Workspace "${response.workspace.name}" created successfully!`);
      
      // Notify the parent component (WorkspaceSelectionPage)
      // We need to construct the 'membership' object similar to what getUserWorkspaces returns
      const newMembership = {
          userId: currentUser.id, // Assuming currentUser has id
          workspaceId: response.workspace.id,
          role: 'ADMIN', // The creator is always ADMIN
          workspace: response.workspace 
      };
      onWorkspaceCreated(newMembership); 
      
      handleClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to create workspace:", err);
      const errorMessage = err.message || 'Could not create workspace. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setName('');
    setError('');
    setIsLoading(false);
    onClose(); // Call the parent's onClose function
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Workspace" size="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workspace Name Input */}
        <div>
          <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 mb-1">
            Workspace Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="workspaceName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., My Awesome Team"
            required
            disabled={isLoading}
            autoFocus // Automatically focus on this field when modal opens
          />
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
            {isLoading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
