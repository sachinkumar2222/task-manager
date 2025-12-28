import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserTasks } from '../api/taskService';
import { getWorkspaceMembers } from '../api/authService';
import { format } from 'date-fns';
import { CheckCircle2, MessageSquare, Clock, User, Filter, ArrowUpDown } from 'lucide-react';
import TaskSlideOver from '../components/kanban/TaskSlideOver';

const TasksPage = () => {
    // ... existing hooks ...
    const { activeWorkspace, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState(() => {
        return currentUser?.role === 'ADMIN' ? 'workspace' : 'assigned';
    });
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [membersMap, setMembersMap] = useState({});

    // NEW: SlideOver State
    const [selectedTask, setSelectedTask] = useState(null);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

    // Set default tab based on role when user loads
    useEffect(() => {
        if (currentUser) {
            console.log("DEBUG: TasksPage currentUser:", currentUser);
            if (currentUser.role === 'ADMIN') {
                setActiveTab('workspace'); // Admins see ALL workspace tasks
            } else {
                setActiveTab('assigned');
            }
        }
    }, [currentUser]);

    // Fetch members to resolve assignee names and determine current user's role
    useEffect(() => {
        if (activeWorkspace?.id && currentUser?.id) {
            getWorkspaceMembers(activeWorkspace.id)
                .then(members => {
                    const map = {};
                    members.forEach(m => {
                        map[m.userId] = m;
                    });
                    setMembersMap(map);

                    // Determine current user's role in this workspace
                    const me = members.find(m => m.userId === currentUser.id);
                    if (me) {
                        console.log("DEBUG: Found my role:", me.role);
                        if (me.role === 'ADMIN') {
                            setActiveTab('workspace'); // Admins see ALL workspace tasks
                        } else {
                            setActiveTab('assigned');
                        }
                    }
                })
                .catch(err => console.error("Failed to fetch members:", err));
        }
    }, [activeWorkspace, currentUser]);

    // Fetch tasks when tab or workspace changes
    useEffect(() => {
        console.log("DEBUG: Fetch Effect Triggered", { activeWorkspace, activeTab });
        const fetchTasks = async () => {
            if (!activeWorkspace) {
                console.log("DEBUG: No active workspace, skipping fetch");
                return;
            }

            setIsLoading(true);
            try {
                console.log("DEBUG: Fetching tasks for tab:", activeTab);
                const data = await getUserTasks(activeTab);
                console.log("DEBUG: Tasks fetched:", data);
                setTasks(data);
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeWorkspace) {
            fetchTasks();
        } else {
            // If no workspace is active, we shouldn't be loading
            setIsLoading(false);
        }
    }, [activeTab, activeWorkspace]);

    const handleTaskClick = (task) => {
        console.log("DEBUG: Task Clicked:", task);
        setSelectedTask(task);
        setIsSlideOverOpen(true);
    };

    const handleTaskUpdated = (updatedTask) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        setSelectedTask(updatedTask); // Keep detail view updated
    };

    const handleTaskDeleted = (taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setIsSlideOverOpen(false);
        setSelectedTask(null);
    };

    // ... existing render ...
    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* ... Header ... */}

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {/* ... Table Header ... */}

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    // ... Empty State ...
                    <div className="p-12 text-center">...</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => handleTaskClick(task)} // NEW: Click Handler
                                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 cursor-pointer" // Added cursor-pointer
                            >
                                {/* ... Columns ... */}
                                {/* Task Name */}
                                <div className="col-span-5 sm:col-span-4 md:col-span-3 flex items-center gap-3">
                                    <button
                                        className="text-gray-300 hover:text-green-500 transition-colors flex-shrink-0"
                                        onClick={(e) => { e.stopPropagation(); /* Start/Complete logic later */ }}
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                    </button>
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate" title={task.title}>
                                        {task.title}
                                    </span>
                                </div>
                                {/* Comments */}
                                <div className="col-span-2 hidden sm:flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="text-xs">
                                        {task._count?.comments > 0 ? task._count.comments : 'No comments'}
                                    </span>
                                </div>

                                {/* Project */}
                                <div className="col-span-2 hidden md:flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                        {task.project?.name || 'Unknown Project'}
                                    </span>
                                </div>

                                {/* Assignee */}
                                <div className="col-span-3 hidden sm:flex items-center gap-2">
                                    <div className="flex -space-x-2 overflow-hidden">
                                        {task.assigneeIds && task.assigneeIds.length > 0 ? (
                                            task.assigneeIds.map((id) => {
                                                const member = membersMap[id] || { fullName: 'U' };
                                                return (
                                                    <div key={id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700" title={member.fullName}>
                                                        {member.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                                        )}
                                    </div>
                                    {task.assigneeIds && task.assigneeIds.length === 1 && membersMap[task.assigneeIds[0]] && (
                                        <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[100px]">
                                            {membersMap[task.assigneeIds[0]].fullName}
                                        </span>
                                    )}
                                </div>

                                {/* Due Date */}
                                <div className="col-span-2 text-right sm:text-left text-sm">
                                    <span className="text-red-500 font-medium">
                                        {task.createdAt ? format(new Date(task.createdAt), 'MMMM d') : '-'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* NEW: SlideOver Component */}
            <TaskSlideOver
                task={selectedTask}
                isOpen={isSlideOverOpen}
                onClose={() => setIsSlideOverOpen(false)}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
            />
        </div>
    );
};

export default TasksPage;
