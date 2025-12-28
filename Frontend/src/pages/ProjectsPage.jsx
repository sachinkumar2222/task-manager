import React, { useEffect, useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, Folder, Plus, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProjectModal from '../components/projects/ProjectModal';
import { deleteProject } from '../api/taskService';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

const ProjectsPage = () => {
    const { projects, fetchProjects, isLoading, error } = useProjects();
    const { activeWorkspace } = useAuth();
    const isAdmin = activeWorkspace?.role?.toUpperCase() === 'ADMIN';

    // State for Modal and Menu
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    // Close dropdown when clicking outside (simple implementation)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdownId && !event.target.closest('.project-menu-container')) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeDropdownId]);

    const handleCreateClick = () => {
        setEditingProject(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (project) => {
        setEditingProject(project);
        setActiveDropdownId(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (project) => {
        setActiveDropdownId(null);
        if (window.confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`)) {
            try {
                await deleteProject(project.id);
                toast.success('Project deleted successfully');
                fetchProjects();
            } catch (err) {
                toast.error(err.message || 'Failed to delete project');
            }
        }
    };

    const handleProjectSaved = () => {
        fetchProjects();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 py-10">
                <p>Error loading projects: {error}</p>
            </div>
        );
    }

    // -- COLORS FOR CARDS (Similar to screenshot, cycling through a few border colors) --
    // We can use border-l-4 or similar to mimic the colored lines
    const borderColors = [
        'border-blue-500',   // Blue
        'border-red-500',    // Red
        'border-yellow-500', // Yellow/Orange
        'border-green-500',  // Green
        'border-purple-500', // Purple
    ];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage your projects</h1>
                {isAdmin && (
                    <button
                        onClick={handleCreateClick}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out flex-shrink-0"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Create Project
                    </button>
                )}
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No projects yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Get started by creating your first project.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project, index) => {
                        // Cycle through colors
                        const borderColor = borderColors[index % borderColors.length];

                        return (
                            <div
                                key={project.id}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative hover:shadow-md transition-shadow overflow-hidden"
                            >
                                {/* Header: Name and options */}
                                <div className="flex justify-between items-start mb-4 relative">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate pr-8">
                                        <Link to={`/project/${project.id}`} className="hover:text-blue-600 transition-colors">
                                            {project.name}
                                        </Link>
                                    </h3>

                                    {/* Dropdown Menu Trigger - Only for Admin */}
                                    {isAdmin && (
                                        <div className="project-menu-container relative">
                                            <button
                                                onClick={() => setActiveDropdownId(activeDropdownId === project.id ? null : project.id)}
                                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeDropdownId === project.id && (
                                                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-600">
                                                    <button
                                                        onClick={() => handleEditClick(project)}
                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2"
                                                    >
                                                        <Pencil className="h-4 w-4" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(project)}
                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Bottom colored border line */}
                                <div className={`absolute bottom-0 left-0 w-full h-1 ${borderColor.replace('border-', 'bg-')}`}></div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    {/* Members Column */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Members</span>
                                        <div className="flex -space-x-2 overflow-hidden py-1">
                                            {/* Placeholder Avatars - logic to get actual members is complex, using generic for now */}
                                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                                {project.creatorId ? 'C' : '?'}
                                                {/* In future: Fetch members for project */}
                                            </div>
                                            {/* Example of a second member */}
                                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
                                                +
                                            </div>
                                        </div>
                                    </div>

                                    {/* Created Column */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Created</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }).replace("about ", "")}
                                        </span>
                                    </div>

                                    {/* Tasks Column */}
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tasks</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {project._count?.tasks || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Project Modal (Create/Edit) */}
            <ProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onProjectSaved={handleProjectSaved}
                projectToEdit={editingProject}
            />
        </div>
    );
};

export default ProjectsPage;
