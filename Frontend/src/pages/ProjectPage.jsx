import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { 
    getTasksForProject, 
    getProjectDetails, 
    deleteTask, 
    updateProject, 
    deleteProject 
} from '../api/taskService';
import { Loader2, AlertCircle, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import KanbanColumn from '../components/kanban/KanbanColumn';
import TaskDetailsModal from '../components/kanban/TaskDetailsModal'; 
import CreateTaskModal from '../components/kanban/CreateTaskModal'; 
import Modal from '../components/common/Modal';

const TASK_STATUSES = {
    TO_DO: 'TO_DO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE',
};

const ProjectPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { activeWorkspace } = useAuth(); // Get active workspace
    
    // Check if current user is ADMIN
    const isAdmin = activeWorkspace?.role === 'ADMIN';

    const [tasks, setTasks] = useState([]);
    const [projectDetails, setProjectDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
    const [editProjectName, setEditProjectName] = useState('');
    const [editProjectDescription, setEditProjectDescription] = useState('');
    const [isUpdatingProject, setIsUpdatingProject] = useState(false);

    const fetchProjectData = async () => {
        if (!projectId) return;
        setIsLoading(true);
        setError('');
        try {
            const [detailsData, tasksData] = await Promise.all([
                getProjectDetails(projectId),
                getTasksForProject(projectId)
            ]);
            setProjectDetails(detailsData);
            setEditProjectName(detailsData.name);
            setEditProjectDescription(detailsData.description || '');
            setTasks(tasksData || []);
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
    }, [projectId]);

    const groupedTasks = useMemo(() => {
        const groups = {
            [TASK_STATUSES.TO_DO]: [],
            [TASK_STATUSES.IN_PROGRESS]: [],
            [TASK_STATUSES.DONE]: [],
        };
        tasks.forEach(task => {
            const status = task.status && Object.values(TASK_STATUSES).includes(task.status)
                           ? task.status
                           : TASK_STATUSES.TO_DO;
            groups[status].push(task);
        });
        return groups;
    }, [tasks]);

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };
    const handleTaskCreated = (newTask) => setTasks(prev => [newTask, ...prev]);
    const handleTaskDeleted = (taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setIsDetailsModalOpen(false);
        setSelectedTask(null);
    };
    const handleTaskUpdated = (updatedTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        if (selectedTask && selectedTask.id === updatedTask.id) setSelectedTask(updatedTask);
    };
    
    const handleDeleteFromCard = (task) => {
        if (!isAdmin) return; // Double check security
        if (window.confirm(`Delete task "${task.title}"?`)) {
            toast.promise(deleteTask(task.id), {
                loading: 'Deleting...',
                success: () => {
                    handleTaskDeleted(task.id);
                    return 'Task deleted';
                },
                error: 'Failed to delete'
            });
        }
    };

    const handleProjectUpdate = async (e) => {
        e.preventDefault();
        if (!editProjectName.trim()) return toast.error("Name required");
        setIsUpdatingProject(true);
        try {
            const updated = await updateProject(projectId, {
                name: editProjectName,
                description: editProjectDescription
            });
            setProjectDetails(updated);
            toast.success("Project updated!");
            setIsEditProjectModalOpen(false);
        } catch (err) {
            toast.error(err.message || "Update failed");
        } finally {
            setIsUpdatingProject(false);
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm(`Delete project "${projectDetails.name}"? This cannot be undone.`)) {
            toast.promise(deleteProject(projectId), {
                loading: 'Deleting project...',
                success: () => {
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
        <div className="flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-6">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">
                            {projectDetails?.name}
                        </h1>
                        {/* Only ADMIN can see Edit/Delete Project buttons */}
                        {isAdmin && (
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => setIsEditProjectModalOpen(true)}
                                    className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-gray-100"
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    onClick={handleDeleteProject}
                                    className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 mt-1 text-sm">{projectDetails?.description}</p>
                </div>
                
                {/* Only ADMIN can create tasks (Optional, remove isAdmin check if team members can create) */}
                 {isAdmin && (
                     <button 
                        onClick={() => setIsCreateTaskModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 transition flex-shrink-0"
                    >
                        <PlusCircle className="h-5 w-5" />
                        Add Task
                    </button>
                 )}
            </div>

            <div className="flex-1 flex space-x-4 overflow-x-auto pb-4">
                {Object.values(TASK_STATUSES).map(status => (
                    <KanbanColumn 
                        key={status}
                        title={status.replace('_', ' ')} 
                        tasks={groupedTasks[status]}
                        onTaskClick={handleTaskClick}
                        onEditTask={handleTaskClick}
                        onDeleteTask={handleDeleteFromCard}
                        isAdmin={isAdmin} // --- PASS THIS PROP DOWN ---
                    />
                ))}
            </div>

            <TaskDetailsModal
                task={selectedTask}
                isOpen={isDetailsModalOpen}
                onClose={() => { setIsDetailsModalOpen(false); setSelectedTask(null); }}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" value={editProjectName} onChange={(e) => setEditProjectName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required disabled={isUpdatingProject} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={editProjectDescription} onChange={(e) => setEditProjectDescription(e.target.value)} rows="3" className="w-full px-3 py-2 border rounded-md" disabled={isUpdatingProject} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsEditProjectModalOpen(false)} className="px-4 py-2 text-gray-700 bg-white border rounded-md">Cancel</button>
                        <button type="submit" disabled={isUpdatingProject} className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProjectPage;