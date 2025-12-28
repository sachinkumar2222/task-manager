import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProjects } from '../context/ProjectContext';
import {
    getTasksForProject,
    getProjectDetails,
    deleteTask,
    updateProject,
    deleteProject
} from '../api/taskService';
import { getWorkspaceMembers } from '../api/authService';
import { Loader2, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskSlideOver from '../components/kanban/TaskSlideOver';
import CreateTaskModal from '../components/kanban/CreateTaskModal';
import Modal from '../components/common/Modal';
import ProjectChat from '../components/chat/ProjectChat';

const ProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { activeWorkspace, isAdmin } = useAuth();
    const { fetchProjects } = useProjects();
    const [projectDetails, setProjectDetails] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [editProjectName, setEditProjectName] = useState('');
    const [editProjectDescription, setEditProjectDescription] = useState('');
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);
    const [workspaceMembers, setWorkspaceMembers] = useState([]);
    const [activeTab, setActiveTab] = useState('board'); // 'board', 'chat'

    // Grouping tasks by status
    const groupedTasks = useMemo(() => {
        const groups = {
            TO_DO: [],
            IN_PROGRESS: [],
            REVIEW: [],
            DONE: []
        };
        if (tasks) {
            tasks.forEach(task => {
                if (groups[task.status]) {
                    groups[task.status].push(task);
                } else if (task.status === 'TODO') {
                    groups.TO_DO.push(task);
                }
            });
        }
        return groups;
    }, [tasks]);

    const TASK_STATUSES = {
        TO_DO: 'TO_DO',
        IN_PROGRESS: 'IN_PROGRESS',
        REVIEW: 'REVIEW',
        DONE: 'DONE'
    };

    const fetchProjectData = async () => {
        if (!projectId) return;
        setIsLoading(true);
        setError('');
        try {
            const [detailsData, tasksData, membersData] = await Promise.all([
                getProjectDetails(projectId),
                getTasksForProject(projectId),
                activeWorkspace ? getWorkspaceMembers(activeWorkspace.id) : Promise.resolve({ members: [] })
            ]);
            setProjectDetails(detailsData);
            setEditProjectName(detailsData.name);
            setEditProjectDescription(detailsData.description || '');
            setTasks(tasksData || []);
            setWorkspaceMembers(membersData?.members || []);
        } catch (err) {
            console.error(`Failed to fetch data:`, err);
            if (err.response && err.response.status === 404) {
                setError('Project not found or you do not have access.');
            } else {
                setError(err.message || 'Could not load project data.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [projectId, activeWorkspace]);

    // Handle Deep Linking to Task
    useEffect(() => {
        const taskIdFromUrl = searchParams.get('taskId');
        if (taskIdFromUrl && tasks.length > 0) {
            const taskToOpen = tasks.find(t => t.id === taskIdFromUrl);
            if (taskToOpen) {
                setSelectedTask(taskToOpen);
                setIsDetailsModalOpen(true);
            }
        }
    }, [searchParams, tasks]);

    // Calculate Project Team (Unique Assignees)
    const projectTeam = useMemo(() => {
        if (!tasks.length || !workspaceMembers.length) return [];
        const uniqueAssigneeIds = new Set();
        tasks.forEach(t => t.assigneeIds?.forEach(id => uniqueAssigneeIds.add(id)));
        return workspaceMembers.filter(m => uniqueAssigneeIds.has(m.userId));
    }, [tasks, workspaceMembers]);

    // Event Handlers
    const handleTaskCreated = (newTask) => {
        setTasks(prev => [...prev, newTask]);
        setIsCreateTaskModalOpen(false);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    };

    const handleTaskDeleted = (taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };

    const handleDeleteFromCard = async (taskId) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            await deleteTask(taskId);
            handleTaskDeleted(taskId);
            toast.success('Task deleted');
        } catch (err) {
            toast.error('Failed to delete task');
        }
    };

    const handleProjectUpdate = async (e) => {
        e.preventDefault();
        setIsUpdatingProject(true);
        try {
            const updated = await updateProject(projectId, {
                name: editProjectName,
                description: editProjectDescription
            });
            setProjectDetails(updated);
            setEditProjectName(updated.name);
            setEditProjectDescription(updated.description || '');
            setIsEditProjectModalOpen(false);
            toast.success('Project updated successfully');
            fetchProjects(); // Refresh sidebar
        } catch (err) {
            toast.error('Failed to update project');
        } finally {
            setIsUpdatingProject(false);
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm(`Delete project "${projectDetails.name}"? This cannot be undone.`)) {
            toast.promise(deleteProject(projectId), {
                loading: 'Deleting project...',
                success: () => {
                    fetchProjects(); // Refresh default sidebar list and global state
                    navigate('/dashboard');
                    return 'Project deleted';
                },
                error: 'Failed to delete project'
            });
        }
    };

    if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (error) return <div className="text-red-600 p-4">Error: {error} <Link to="/dashboard" className="underline">Back</Link></div>;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-2 p-6 pb-0">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white truncate">
                            {projectDetails?.name}
                        </h1>
                        {/* Only ADMIN can see Edit/Delete Project buttons */}
                        {isAdmin && (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsEditProjectModalOpen(true)}
                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{projectDetails?.description}</p>

                    {/* Member Avatars */}
                    {projectTeam.length > 0 && (
                        <div className="flex items-center gap-2 mt-3">
                            <div className="flex -space-x-2">
                                {projectTeam.slice(0, 5).map(member => (
                                    <div key={member.id} className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-indigo-500 flex items-center justify-center text-xs text-white font-bold" title={member.fullName}>
                                        {member.fullName.charAt(0)}
                                    </div>
                                ))}
                                {projectTeam.length > 5 && (
                                    <div className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-500 flex items-center justify-center text-xs text-white font-bold">
                                        +{projectTeam.length - 5}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {projectTeam.length} Member{projectTeam.length !== 1 ? 's' : ''} on this project
                            </span>
                        </div>
                    )}

                    {/* TABS Navigation */}
                    <div className="flex items-center gap-6 mt-8 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('board')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'board'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Board
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'chat'
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Team Chat
                        </button>
                    </div>
                </div>

                {/* Only ADMIN can create tasks (Show only on Board tab?) */}
                {activeTab === 'board' && (
                    <button
                        onClick={() => setIsCreateTaskModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 transition flex-shrink-0 mt-2 sm:mt-0"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Add Task
                    </button>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-hidden p-6 pt-2">
                {activeTab === 'board' ? (
                    <div className="flex h-full space-x-4 overflow-x-auto pb-4">
                        {Object.values(TASK_STATUSES).map(status => (
                            <KanbanColumn
                                key={status}
                                title={status.replace('_', ' ')}
                                tasks={groupedTasks[status]}
                                onTaskClick={handleTaskClick}
                                onEditTask={handleTaskClick}
                                onDeleteTask={handleDeleteFromCard}
                                isAdmin={isAdmin}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full">
                        <ProjectChat projectId={projectId} />
                    </div>
                )}
            </div>

            <TaskSlideOver
                task={selectedTask}
                isOpen={isDetailsModalOpen}
                onClose={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedTask(null);
                    setSearchParams({});
                }}
                onTaskDeleted={handleTaskDeleted}
                onTaskUpdated={handleTaskUpdated}
            />
            <CreateTaskModal
                isOpen={isCreateTaskModalOpen}
                onClose={() => setIsCreateTaskModalOpen(false)}
                projectId={projectId}
                onTaskCreated={handleTaskCreated}
            />

            <Modal isOpen={isEditProjectModalOpen} onClose={() => setIsEditProjectModalOpen(false)} title="Edit Project">
                <form onSubmit={handleProjectUpdate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                        <input type="text" value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required disabled={isUpdatingProject} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea value={editProjectDescription} onChange={(e) => setEditProjectDescription(e.target.value)} rows="3" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" disabled={isUpdatingProject} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsEditProjectModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                        <button type="submit" disabled={isUpdatingProject} className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProjectPage;