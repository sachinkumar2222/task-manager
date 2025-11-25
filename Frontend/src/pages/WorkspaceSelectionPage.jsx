import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext';
import { getUserWorkspaces, deleteWorkspace } from '../api/authService'; 
import { PlusCircle, Edit3, Loader2, AlertCircle, Trash2, Zap } from 'lucide-react'; 
import CreateWorkspaceModal from '../components/workspaces/CreateWorkspaceModal'; 
import EditWorkspaceModal from '../components/workspaces/EditWorkspaceModal'; 
import toast from 'react-hot-toast'; 
import "../assets/index.css";

/**
 * WorkspaceSelectionPage
 * Page shown after login to select or manage workspaces.
 * Includes Create, Edit, Delete functionality.
 * Sets the active workspace in AuthContext.
 */
const WorkspaceSelectionPage = () => {
    // Get setActiveWorkspace from context
    const { currentUser, setActiveWorkspace } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); 
    const [selectedWorkspace, setSelectedWorkspace] = useState(null); 
    const navigate = useNavigate();

    // Function to fetch user's workspaces
    const fetchWorkspaces = async () => {
        setIsLoading(true);
        setError('');
        try {
            const fetchedMemberships = await getUserWorkspaces();
            setWorkspaces(fetchedMemberships || []);
        } catch (err) {
            console.error("Failed to fetch workspaces:", err);
            setError(err.message || 'Could not load your workspaces.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch workspaces when the component mounts
    useEffect(() => {
        fetchWorkspaces();
    }, []);

    // --- UPDATED FUNCTION ---
    // Function to handle selecting a workspace
    const handleWorkspaceSelect = (workspaceId, workspaceName, role) => {
        // Update AuthContext with selected workspace details AND ROLE
        // This is crucial for RBAC on other pages
        setActiveWorkspace({ id: workspaceId, name: workspaceName, role: role });
        console.log(`Active workspace set: ${workspaceName} (${role})`);
        // Navigate to the dashboard
        navigate('/dashboard');
    };

    // Callback when a new workspace is created in the modal
    const handleWorkspaceCreated = (newWorkspaceMembership) => {
         setWorkspaces(prev => [...prev, newWorkspaceMembership]);
    };

    // Edit button click handler
    const handleEditClick = (e, membership) => {
        e.stopPropagation();
        setSelectedWorkspace(membership.workspace);
        setIsEditModalOpen(true);
    };

    // Callback when workspace is updated in the modal
    const handleWorkspaceUpdated = (updatedWorkspace) => {
        setWorkspaces(prev => prev.map(m =>
            m.workspace.id === updatedWorkspace.id
            ? { ...m, workspace: updatedWorkspace } 
            : m
        ));
    };

    // Delete button click handler
    const handleDeleteClick = async (e, workspaceId, workspaceName) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the workspace "${workspaceName}"? This action cannot be undone.`)) {
            const deletePromise = deleteWorkspace(workspaceId);
            toast.promise(
                deletePromise,
                {
                    loading: `Deleting "${workspaceName}"...`,
                    success: () => {
                        setWorkspaces(prev => prev.filter(m => m.workspace.id !== workspaceId));
                        return `Workspace "${workspaceName}" deleted.`;
                    },
                    error: (err) => err.message || 'Could not delete workspace.',
                }
            );
        }
    };

    return (
        <div className="min-h-screen backgroundStyle pt-20">
            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  {/* Logo */}
                  <Link to="/workspaces" className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <Zap className="h-7 w-7 text-indigo-600" />
                    <span>Task Master</span>
                  </Link>
                   <div> {/* Placeholder */} </div>
                </div>
              </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Manage Workspaces</h1>
                </div>
                <p className="text-gray-600 mb-8">Hi, {currentUser?.fullName?.split(' ')[0] || currentUser?.email}!</p>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        <span className="ml-3 text-gray-600">Loading workspaces...</span>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2 mb-6" role="alert">
                        <AlertCircle className="h-5 w-5"/>
                        <span className="block sm:inline">Error: {error}</span>
                    </div>
                )}

                {/* Workspaces Grid */}
                {!isLoading && !error && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Workspace Cards */}
                        {workspaces.map((membership) => (
                            <div 
                                key={membership.workspace.id} 
                                // Pass role to the handler
                                onClick={() => handleWorkspaceSelect(membership.workspace.id, membership.workspace.name, membership.role)}
                                className="relative bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 flex flex-col justify-between min-h-[150px]"
                            >
                               <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-lg font-semibold text-gray-800 truncate pr-16">{membership.workspace.name}</h2> 

                                        {/* Action buttons - ONLY FOR ADMIN */}
                                        {membership.role === 'ADMIN' && (
                                            <div className="absolute top-3 right-3 flex space-x-1">
                                                <button 
                                                  onClick={(e) => handleEditClick(e, membership)}
                                                  className="text-gray-400 hover:text-indigo-600 p-1 rounded hover:bg-gray-100"
                                                  aria-label={`Edit ${membership.workspace.name}`}
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                  onClick={(e) => handleDeleteClick(e, membership.workspace.id, membership.workspace.name)}
                                                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                                  aria-label={`Delete ${membership.workspace.name}`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">Role: {membership.role}</p> 
                               </div>
                                <div className="flex space-x-1 mt-auto pt-2">
                                    <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                    <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                    <span className="h-2 w-2 bg-pink-500 rounded-full"></span>
                                </div>
                            </div>
                        ))}
                        
                        {/* Create New Workspace Button - Visible to everyone (anyone can start their own team) */}
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg shadow p-5 flex flex-col items-center justify-center text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400 transition-colors min-h-[150px]"
                        >
                            <PlusCircle size={32} className="mb-2"/>
                            <span className="font-semibold">Create New Workspace</span>
                        </button>
                    </div>
                )}
            </div>

             {/* Modals */}
            <CreateWorkspaceModal
                 isOpen={isCreateModalOpen}
                 onClose={() => setIsCreateModalOpen(false)}
                 onWorkspaceCreated={handleWorkspaceCreated}
            />
            <EditWorkspaceModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                workspace={selectedWorkspace}
                onWorkspaceUpdated={handleWorkspaceUpdated}
            />
        </div>
    );
};

export default WorkspaceSelectionPage;