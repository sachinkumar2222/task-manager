import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserWorkspaces } from '../api/authService'; // API function ko import karein
import { PlusCircle, Edit3, Loader2, AlertCircle, Building2 } from 'lucide-react'; // Icons
import CreateWorkspaceModal from '../components/workspaces/CreateWorkspaceModal'; // Modal component (hum agle step mein banayenge)

/**
 * WorkspaceSelectionPage
 * Login ke baad dikhne wala page jahan user apne workspaces dekh sakta hai ya naya bana sakta hai.
 */
const WorkspaceSelectionPage = () => {
    const { currentUser } = useAuth();
    const [workspaces, setWorkspaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    // Function to fetch user's workspaces
    const fetchWorkspaces = async () => {
        setIsLoading(true);
        setError('');
        try {
            const fetchedMemberships = await getUserWorkspaces();
            setWorkspaces(fetchedMemberships || []); // Ensure it's always an array
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
    }, []); // Empty dependency array means run once on mount

    // Function to handle selecting a workspace
    const handleWorkspaceSelect = (workspaceId) => {
        // TODO: Update AuthContext with selected workspaceId
        console.log(`Workspace selected: ${workspaceId}`);
        // Navigate to the dashboard for that workspace
        // We might need to pass the workspaceId or fetch details first
        navigate('/dashboard'); // Temporarily navigate to generic dashboard
    };

    // Callback when a new workspace is created in the modal
    const handleWorkspaceCreated = (newWorkspaceMembership) => {
        // Option 1: Add workspace directly to state
         setWorkspaces(prev => [...prev, newWorkspaceMembership]);
         // Option 2: Refetch all workspaces
         // fetchWorkspaces();
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6 sm:p-10">
            {/* Simple Header */}
             <header className="mb-8 flex justify-between items-center">
                 <h1 className="text-2xl font-bold text-gray-800">Manage Workspaces</h1>
                {/* Logout Button can be added here */}
            </header>

            {/* Welcome Message */}
            <p className="text-gray-600 mb-6">Hi, {currentUser?.fullName?.split(' ')[0] || currentUser?.email}!</p>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    <span className="ml-3 text-gray-600">Loading workspaces...</span>
                </div>
            )}

            {/* Error State */}
            {error && (
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
                            onClick={() => handleWorkspaceSelect(membership.workspace.id)}
                            className="bg-white rounded-lg shadow p-5 cursor-pointer hover:shadow-lg transition-shadow border border-gray-200 flex flex-col justify-between min-h-[150px]" // Added min-height
                        >
                           <div>
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-lg font-semibold text-gray-800 truncate">{membership.workspace.name}</h2>
                                    {/* Show edit icon only if user is ADMIN */}
                                    {membership.role === 'ADMIN' && (
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); /* TODO: Open edit modal */ console.log('Edit clicked'); }}
                                          className="text-gray-400 hover:text-indigo-600 p-1 rounded"
                                          aria-label={`Edit ${membership.workspace.name}`}
                                        >
                                            <Edit3 size={18} />
                                        </button>
                                    )}
                                </div>
                                {/* Placeholder for content inside the card (e.g., member count, recent activity) */}
                                <p className="text-sm text-gray-500">Role: {membership.role}</p> 
                           </div>
                            {/* Placeholder dots or icons */}
                             <div className="flex space-x-1 mt-auto pt-2">
                                <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                                <span className="h-2 w-2 bg-purple-500 rounded-full"></span>
                                <span className="h-2 w-2 bg-pink-500 rounded-full"></span>
                            </div>
                        </div>
                    ))}

                    {/* Create New Workspace Button/Card */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg shadow p-5 flex flex-col items-center justify-center text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400 transition-colors min-h-[150px]"
                    >
                        <PlusCircle size={32} className="mb-2"/>
                        <span className="font-semibold">Create New Workspace</span>
                    </button>
                </div>
            )}

             {/* Create Workspace Modal */}
            <CreateWorkspaceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onWorkspaceCreated={handleWorkspaceCreated} 
            />
        </div>
    );
};

export default WorkspaceSelectionPage;
