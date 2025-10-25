    import React, { useEffect, useState } from 'react';
    import { Link } from 'react-router-dom'; // Import Link for project links
    import { useAuth } from '../context/AuthContext';
    // Import API functions
    import { getProjects } from '../api/taskService';
    import { getDashboardStats } from '../api/analyticsService';
    import { PlusCircle, AlertCircle, Loader2 } from 'lucide-react'; // Import more icons
    import CreateProjectModal from '../components/projects/CreateProjectModal'; // Import the modal

    /**
     * DashboardPage
     * The main page displayed after a user logs in.
     * Fetches and displays projects and analytics stats. Allows project creation.
     */
    const DashboardPage = () => {
        const { currentUser } = useAuth(); // Get current user info from context
        const [projects, setProjects] = useState([]); // State for projects
        const [stats, setStats] = useState(null); // State for analytics stats
        const [isLoading, setIsLoading] = useState(true); // Start in loading state
        const [error, setError] = useState(''); // State for error messages
        const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // State for modal visibility

        // Function to fetch data
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Fetch projects and stats in parallel
                const [projectData, statsData] = await Promise.all([
                    getProjects(), // Fetch projects from taskService
                    getDashboardStats() // Fetch stats from analyticsService
                ]);
                setProjects(projectData || []); // Ensure projects is always an array
                setStats(statsData);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError(err.message || 'Could not load dashboard data.');
            } finally {
                setIsLoading(false);
            }
        };


        // useEffect hook to fetch data when the component mounts
        useEffect(() => {
            fetchData();
        }, []); // Empty dependency array ensures this runs only once on mount

        // Callback function for when a new project is created in the modal
        const handleProjectCreated = (newProject) => {
            // Option 1: Add project directly to state (simpler)
            setProjects(prevProjects => [...prevProjects, newProject]);
            // Option 2: Refetch all data (ensures consistency if stats change)
            // fetchData(); 
        };

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {/* UPDATED: Prioritize fullName over email */}
                        Welcome back, {currentUser?.fullName || currentUser?.email || 'User'}!
                    </h1>
                    {/* Create Project Button */}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} // Open the modal on click
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                        <PlusCircle className="h-5 w-5" />
                        Create Project
                    </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                        <span className="ml-3 text-gray-600">Loading dashboard...</span>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                        <AlertCircle className="h-5 w-5"/>
                        <span className="block sm:inline">Error: {error}</span>
                    </div>
                )}

                {/* Content Area - Displays when not loading and no error */}
                {!isLoading && !error && (
                    <>
                        {/* Analytics Stats Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Projects" value={stats?.totalProjects} />
                            <StatCard title="Active Tasks" value={stats?.activeTasks} />
                            <StatCard title="Completed Tasks" value={stats?.completedTasks} />
                            <StatCard title="Team Members" value={'-'} /> {/* Placeholder */}
                        </div>

                        {/* Projects List Section */}
                        <div className="bg-white p-6 rounded-lg shadow mt-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h2>
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
                                <p className="text-gray-500 text-center py-4">You haven't created any projects yet. Click "Create Project" to get started!</p>
                            )}
                        </div>
                    </>
                )}

                {/* Create Project Modal */}
                <CreateProjectModal 
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onProjectCreated={handleProjectCreated} // Pass the callback
                />
            </div>
        );
    };

    // Simple reusable component for Stat Cards
    const StatCard = ({ title, value }) => {
        return (
            <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500 truncate">{title}</h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{value ?? '-'}</p>
            </div>
        );
    };


    export default DashboardPage;

