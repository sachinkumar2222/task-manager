// frontend/src/components/workspaces/EditWorkspaceModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal'; // Import the reusable Modal component
import { updateWorkspace } from '../../api/authService'; // Import the API function
import toast from 'react-hot-toast';

/**
 * EditWorkspaceModal
 * A modal form for editing an existing workspace's name.
 * Props:
 * - isOpen: boolean - Controls modal visibility.
 * - onClose: function - Function to call when the modal should close.
 * - workspace: object - The workspace object being edited { id, name }.
 * - onWorkspaceUpdated: function - Callback to notify parent when update is successful.
 */
const EditWorkspaceModal = ({ isOpen, onClose, workspace, onWorkspaceUpdated }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update state when the workspace prop changes (when modal opens)
  useEffect(() => {
    if (workspace) {
      setName(workspace.name || ''); // Set initial name
    }
  }, [workspace]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Workspace name cannot be empty.');
      return;
    }
    // Prevent submitting if name hasn't changed (optional)
    if (name.trim() === workspace?.name) {
        handleClose(); // Just close if no change
        return;
    }
    
    setIsLoading(true);

    try {
      const updatedData = { name: name.trim() };
      const response = await updateWorkspace(workspace.id, updatedData); // Call the API
      toast.success(`Workspace renamed to "${response.workspace.name}"!`);
      onWorkspaceUpdated(response.workspace); // Notify parent component
      handleClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to update workspace:", err);
      const errorMessage = err.message || 'Could not update workspace. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setError(''); // Clear errors on close
    // Reset name based on prop in case user cancels
    if(workspace) setName(workspace.name || ''); 
    setIsLoading(false);
    onClose(); 
  };
  
  // Don't render if workspace data isn't available yet
  if (!workspace) return null; 

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Edit Workspace: ${workspace.name}`} size="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Workspace Name Input */}
        <div>
          <label htmlFor="editWorkspaceName" className="block text-sm font-medium text-gray-700 mb-1">
            Workspace Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="editWorkspaceName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
            disabled={isLoading}
            autoFocus
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
            disabled={isLoading || name.trim() === workspace.name} // Disable if loading or name hasn't changed
            className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${isLoading ? 'cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditWorkspaceModal;