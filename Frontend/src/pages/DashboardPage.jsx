import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import API functions
import { getProjects } from '../api/taskService';
import { getDashboardStats } from '../api/analyticsService';
import { getWorkspaceMemberCount } from '../api/authService';
import { PlusCircle, AlertCircle, Loader2, UserPlus } from 'lucide-react'; // UserPlus icon wapas laye
import CreateProjectModal from '../components/projects/CreateProjectModal';
import InviteMemberModal from '../components/workspaces/InviteMemberModal'; // Invite Modal import karein

// --- IMPORT REUSABLE DASHBOARD COMPONENTS ---
import TaskTrendChart from '../components/dashboard/TaskTrendChart';
import StatCard from '../components/dashboard/StatCard';

/**
 * DashboardPage
 * Fetches and displays projects, analytics, and team member count.
 * Includes functionality to Create Projects and Invite Members.
 */
const DashboardPage = () => {
    const { currentUser, activeWorkspace } = useAuth();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false); // Invite modal state wapas add kiya

    // Function to fetch data for the active workspace
    const fetchData = async () => {
        if (!activeWorkspace?.id) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const [projectData, statsData, memberCountData] = await Promise.all([
                getProjects(), 
                getDashboardStats(), 
                getWorkspaceMemberCount(activeWorkspace.id) 
            ]);
            
            setProjects(projectData || []);
            setStats({ 
                ...statsData, 
                memberCount: memberCountData.count 
            }); 
            
        } catch (err) {
            console.error(`Failed to fetch dashboard data:`, err);
            setError(err.message || 'Could not load dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeWorkspace]); 

    const handleProjectCreated = (newProject) => {
        setProjects(prevProjects => [...prevProjects, newProject]);
        getDashboardStats()
            .then(statsData => setStats(prevStats => ({...prevStats, ...statsData})))
            .catch(err => console.error("Failed to refetch stats:", err));
    };

    if (isLoading) {
         return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading dashboard...</span>
            </div>
         );
    }

    if (error) {
         return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                <AlertCircle className="h-5 w-5"/>
                <span className="block sm:inline">Error: {error}</span>
                 {!activeWorkspace?.id && (
                     <Link to="/workspaces" className="ml-4 font-medium text-red-800 underline">Select Workspace</Link>
                 )}
            </div>
         );
    }

    if (!activeWorkspace?.id) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="mb-4">Please select a workspace to view the dashboard.</p>
                <Link to="/workspaces" className="text-indigo-600 hover:underline">Go to Workspaces</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                    {activeWorkspace.name}
                </h1>
                
                {/* Action Buttons Container */}
                <div className="flex gap-3">
                    {/* --- INVITE MEMBER BUTTON (RESTORED) --- */}
                   {activeWorkspace?.role === 'ADMIN' && (
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 text-sm font-medium rounded-md shadow-sm hover:bg-indigo-50 transition flex-shrink-0"
                        >
                            <UserPlus className="h-5 w-5" />
                            Invite Member
                        </button>
                    )}

                   {activeWorkspace?.role === 'ADMIN' && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)} 
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out flex-shrink-0"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Create Project
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <>
                {/* Analytics Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Total Projects" value={stats?.totalProjects} />
                    <StatCard title="Active Tasks" value={stats?.activeTasks} />
                    <StatCard title="Team Members" value={stats?.memberCount} /> 
                    
                    <StatCard title="Tasks Created (7 Days)" value={stats?.createdTasksLast7Days} />
                    <StatCard title="Tasks Completed (7 Days)" value={stats?.completedTasksLast7Days} />
                    <StatCard title="Total Completed" value={stats?.completedTasks} />
                </div>

                {/* Task Completion Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Task Completion Trend (Last 7 Days)
                    </h2>
                    <TaskTrendChart data={stats?.taskTrendData} />
                </div>

                {/* Projects List Section */}
                <div className="bg-white p-6 rounded-lg shadow mt-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Projects in this Workspace</h2>
                    {projects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map(project => (
                                <Link
                                    to={`/project/${project.id}`}
                                    key={project.id}
                                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-500 transition duration-150 ease-in-out"
                                >
                                    <h3 className="font-medium text-gray-900 truncate">{project.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 truncate">{project.description || 'No description'}</p>
                                </Link>
                            ))}
                         </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No projects found. Click "Create Project" to get started!</p>
                    )}
                </div>
            </>

            {/* Modals */}
            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={handleProjectCreated}
            />
            
            {/* --- INVITE MODAL (RESTORED) --- */}
            <InviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                workspaceId={activeWorkspace.id}
            />
        </div>
    );
};

export default DashboardPage;