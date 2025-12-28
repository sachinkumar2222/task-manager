import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Calendar, User, Tag, Paperclip, Download, FileText, Send, MessageSquare, CheckCircle2, Clock, ListTodo, Plus, CheckSquare, Square } from 'lucide-react';
import { updateTask, getCommentsForTask, createComment, deleteTask, deleteComment, createSubtask, getSubtasks, updateSubtask, deleteSubtask } from '../../api/taskService';
import { uploadFile, getFilesForTask, downloadFile } from '../../api/fileService';
import { getWorkspaceMembers } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TaskSlideOver = ({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }) => {
    const { activeWorkspace, currentUser } = useAuth();
    const isAdmin = activeWorkspace?.role?.toUpperCase() === 'ADMIN';

    // State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('TO_DO');
    const [assigneeIds, setAssigneeIds] = useState([]);
    const [createdAt, setCreatedAt] = useState(null);
    const [dueDate, setDueDate] = useState(null); // Assuming due date might be added later, for now we use created or just show a picker

    // Data State
    const [comments, setComments] = useState([]);
    const [files, setFiles] = useState([]);
    const [members, setMembers] = useState([]);
    const [subtasks, setSubtasks] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

    // Loading State
    const [isLoading, setIsLoading] = useState(false);
    const [isFilesLoading, setIsFilesLoading] = useState(false);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    const fileInputRef = useRef(null);

    // Initial Load
    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'TO_DO');
            setCreatedAt(task.createdAt);
            setDueDate(task.dueDate);

            let initialAssignees = [];
            if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
                initialAssignees = task.assigneeIds;
            } else if (task.assigneeId) {
                initialAssignees = [task.assigneeId];
            }
            setAssigneeIds(initialAssignees);

            fetchComments(task.id);
            fetchFiles(task.id);
            fetchSubtasks(task.id);
            if (activeWorkspace?.id) fetchMembers(activeWorkspace.id);
        }
    }, [task, isOpen, activeWorkspace]);

    // Data Fetchers
    const fetchComments = async (taskId) => {
        setIsCommentsLoading(true);
        try {
            const data = await getCommentsForTask(taskId);
            setComments(data || []);
        } catch (error) { console.error(error); } finally { setIsCommentsLoading(false); }
    };

    const fetchFiles = async (taskId) => {
        setIsFilesLoading(true);
        try {
            const data = await getFilesForTask(taskId);
            setFiles(data || []);
        } catch (error) { console.error(error); } finally { setIsFilesLoading(false); }
    };

    const fetchMembers = async (workspaceId) => {
        try {
            const data = await getWorkspaceMembers(workspaceId);
            setMembers(data || []);
        } catch (error) { console.error(error); }
    };

    const fetchSubtasks = async (taskId) => {
        try {
            const data = await getSubtasks(taskId);
            setSubtasks(data || []);
        } catch (error) { console.error(error); }
    };

    // Actions
    const handleSave = async (updates = {}) => {
        // Auto-save wrapper or manual save
        const dataToUpdate = { ...updates };
        try {
            const updated = await updateTask(task.id, dataToUpdate);
            onTaskUpdated(updated);
            toast.success("Updated!");
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    const handleStatusChange = async (newStatus) => {
        setStatus(newStatus);
        await handleSave({ status: newStatus });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) return toast.error("File > 10MB");

        const toastId = toast.loading("Uploading...");
        try {
            await uploadFile(file, task.id);
            toast.success("Uploaded!", { id: toastId });
            fetchFiles(task.id);
        } catch (error) {
            toast.error("Upload failed", { id: toastId });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete task?")) return;
        try {
            await deleteTask(task.id);
            onTaskDeleted(task.id);
            onClose();
            toast.success("Deleted");
        } catch (error) { toast.error("Failed to delete"); }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await createComment(task.id, newComment);
            setNewComment('');
            fetchComments(task.id);
        } catch (e) { toast.error("Failed to post"); }
    };

    const handleAddSubtask = async (e) => {
        if (e.key === 'Enter' && newSubtask.trim()) {
            e.preventDefault();
            try {
                await createSubtask(task.id, newSubtask);
                setNewSubtask('');
                fetchSubtasks(task.id);
                toast.success("Subtask added");
            } catch (error) {
                toast.error("Failed to add subtask");
            }
        }
    };

    const handleToggleSubtask = async (subtaskId, currentStatus) => {
        try {
            // Optimistic update
            setSubtasks(prev => prev.map(st => st.id === subtaskId ? { ...st, isCompleted: !currentStatus } : st));
            await updateSubtask(subtaskId, { isCompleted: !currentStatus });
            fetchSubtasks(task.id); // Refresh to be sure
        } catch (error) {
            toast.error("Failed to update subtask");
            fetchSubtasks(task.id); // Revert
        }
    };

    const handleDeleteSubtask = async (subtaskId) => {
        if (!window.confirm("Delete this subtask?")) return;
        try {
            await deleteSubtask(subtaskId);
            setSubtasks(prev => prev.filter(st => st.id !== subtaskId));
            toast.success("Subtask deleted");
        } catch (error) {
            toast.error("Failed to delete subtask");
        }
    };

    if (!isOpen) return null;

    // Helpers
    const getAssigneeName = () => {
        if (!assigneeIds.length) return "Unassigned";
        // Just show first one for now or 'Multiple'
        const m = members.find(m => m.userId === assigneeIds[0]);
        return m ? m.fullName : 'Unknown';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`fixed inset-y-0 right-0 w-full md:w-1/2 max-w-none bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">

                    {/* Header Controls */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        {/* Status Dropdown - Pill Shape */}
                        {/* Status Dropdown - Custom UI */}
                        <div className="relative">
                            <button
                                onClick={() => !isAdmin && setIsStatusOpen(!isStatusOpen)}
                                disabled={isAdmin}
                                className={`flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isAdmin ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${status === 'DONE' ? 'bg-[#dcfce7] text-[#166534] dark:bg-green-900/30 dark:text-green-400' :
                                    status === 'REVIEW' ? 'bg-[#ffedd5] text-[#9a3412] dark:bg-orange-900/30 dark:text-orange-400' :
                                        status === 'IN_PROGRESS' ? 'bg-[#f3f4f6] text-[#1f2937] dark:bg-gray-800 dark:text-gray-300' :
                                            'bg-white border border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                    }`}
                            >
                                {status === 'DONE' && <CheckCircle2 size={16} />}
                                {status === 'REVIEW' && <FileText size={16} />}
                                {status === 'IN_PROGRESS' && <Clock size={16} className="text-gray-500 dark:text-gray-400" />}
                                {status === 'TO_DO' && <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />}

                                <span>
                                    {status === 'TO_DO' ? 'To Do' :
                                        status === 'IN_PROGRESS' ? 'In Progress' :
                                            status === 'REVIEW' ? 'Review' : 'Completed'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {isStatusOpen && !isAdmin && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                    {[
                                        { value: 'TO_DO', label: 'To Do', icon: <div className="w-4 h-4 border-2 border-gray-400 rounded-full" /> },
                                        { value: 'IN_PROGRESS', label: 'In Progress', icon: <Clock size={16} className="text-gray-500 dark:text-gray-400" /> },
                                        { value: 'REVIEW', label: 'Review', icon: <FileText size={16} className="text-orange-500 dark:text-orange-400" /> },
                                        { value: 'DONE', label: 'Completed', icon: <CheckCircle2 size={16} className="text-green-600 dark:text-green-500" /> }
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                handleStatusChange(option.value);
                                                setIsStatusOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-all ${status === option.value
                                                ? 'bg-gray-50 dark:bg-gray-700/50 font-medium text-gray-900 dark:text-white'
                                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <span className="flex-shrink-0">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Backdrop to close */}
                            {isStatusOpen && (
                                <div className="fixed inset-0 z-40" onClick={() => setIsStatusOpen(false)} />
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="px-8 pb-8 space-y-8">

                        {/* Title Section */}
                        <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white mb-2">Task</div>
                            {isAdmin ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={() => handleSave({ title })}
                                    className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-0 border-b border-transparent focus:border-gray-300 focus:ring-0 px-0 placeholder-gray-300"
                                    placeholder="Task Title"
                                />
                            ) : (
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-[100px_1fr] gap-y-6 items-center">

                            {/* Assignee */}
                            <span className="text-sm text-gray-500 dark:text-gray-400">Assignee</span>
                            <div className="relative">
                                <div
                                    onClick={() => isAdmin && setIsAssigneeOpen(!isAssigneeOpen)}
                                    className={`flex items-center gap-2 px-2 py-1 -ml-2 rounded-lg transition-colors ${isAdmin ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800' : ''}`}
                                >
                                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                        {assigneeIds.length > 0 ? getAssigneeName().charAt(0).toUpperCase() : <User size={14} />}
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">
                                        {getAssigneeName()}
                                    </span>
                                </div>

                                {/* Assignee Dropdown */}
                                {isAssigneeOpen && isAdmin && (
                                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Member</div>

                                        {/* Unassign Option */}
                                        <button
                                            onClick={() => {
                                                setAssigneeIds([]);
                                                handleSave({ assigneeIds: [] });
                                                setIsAssigneeOpen(false);
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-gray-700 dark:text-slate-200 transition-colors"
                                        >
                                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center">
                                                <X size={12} className="text-gray-400" />
                                            </div>
                                            Unassigned
                                        </button>

                                        {/* Member List */}
                                        {members.map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => {
                                                    setAssigneeIds([m.userId]);
                                                    handleSave({ assigneeIds: [m.userId] });
                                                    setIsAssigneeOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${assigneeIds.includes(m.userId) ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-slate-200'
                                                    }`}
                                            >
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                                    {m.fullName.charAt(0)}
                                                </div>
                                                {m.fullName}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Backdrop */}
                                {isAssigneeOpen && <div className="fixed inset-0 z-40" onClick={() => setIsAssigneeOpen(false)} />}
                            </div>

                            {/* Due Date */}
                            <span className="text-sm text-gray-500 dark:text-gray-400">Due date</span>
                            <div>
                                {isAdmin ? (
                                    <input
                                        type="date"
                                        value={dueDate ? format(new Date(dueDate), 'yyyy-MM-dd') : ''}
                                        onChange={(e) => {
                                            const newDate = e.target.value;
                                            setDueDate(newDate); // Update local state immediately
                                            handleSave({ dueDate: newDate }); // Save to backend
                                        }}
                                        className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-500 dark:[color-scheme:dark]"
                                    />
                                ) : (
                                    <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                                        <Calendar size={14} className="mr-2 text-gray-400" />
                                        <span>{dueDate ? format(new Date(dueDate), 'MMM d, yyyy') : 'No date'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Project */}
                            <span className="text-sm text-gray-500 dark:text-gray-400">Project</span>
                            <div>
                                <div className="inline-flex items-center px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-sm font-medium border border-red-100 dark:border-red-900/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                                    {task.project?.name || 'Project'}
                                </div>
                            </div>
                        </div>

                        {/* Subtasks Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <ListTodo size={18} className="text-gray-400" />
                                <div className="text-sm font-medium text-gray-900 dark:text-white">Subtasks</div>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subtasks.length > 0 && subtasks.every(st => st.isCompleted)
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}>
                                    {subtasks.filter(st => st.isCompleted).length}/{subtasks.length}
                                </span>
                            </div>

                            <div className="space-y-2 mb-3">
                                {subtasks.map(st => (
                                    <div key={st.id} className="group flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors">
                                        <button
                                            onClick={() => handleToggleSubtask(st.id, st.isCompleted)}
                                            className={`flex-shrink-0 transition-colors ${st.isCompleted ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                                        >
                                            {st.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                                        </button>
                                        <span className={`flex-grow text-sm ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {st.title}
                                        </span>
                                        <button
                                            onClick={() => handleDeleteSubtask(st.id)}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Add Subtask Input */}
                            <div className="flex items-center gap-3 px-2">
                                <Plus size={18} className="text-gray-400" />
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={handleAddSubtask}
                                    placeholder="Add a subtask..."
                                    className="flex-grow bg-transparent border-none focus:ring-0 p-0 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">Description</div>
                            {isAdmin ? (
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    onBlur={() => handleSave({ description })}
                                    className="w-full min-h-[100px] border-0 bg-transparent p-0 text-sm text-gray-600 dark:text-gray-300 focus:ring-0 placeholder-gray-400 resize-none"
                                    placeholder="Type description here..."
                                />
                            ) : (
                                <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                    {description || "No description provided."}
                                </div>
                            )}
                        </div>

                        {/* Files */}
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-3">Files</div>

                            {/* Dropzone */}
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-all group bg-white dark:bg-gray-800/20"
                            >
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Paperclip size={20} className="text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Drop files here to upload (or click)</p>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                            </div>

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {files.map(f => (
                                        <div key={f._id || f.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="w-8 h-8 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="text-sm text-gray-700 dark:text-gray-200 truncate font-medium">{f.filename || f.fileName}</span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    downloadFile(f.id || f._id, f.filename);
                                                }}
                                                className="text-gray-400 hover:text-indigo-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Comments */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="text-sm font-medium text-gray-900 dark:text-white mb-4">Comments</div>

                            {comments.length === 0 ? (
                                <div className="text-center py-10 opacity-60 hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 rounded-2xl mb-3 flex items-center justify-center">
                                        <MessageSquare size={24} className="text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">No Comments</p>
                                    <p className="text-xs text-gray-500">Be the first to leave a comment.</p>
                                </div>
                            ) : (
                                <div className="space-y-6 mb-6">
                                    {comments.map(c => {
                                        const isMe = c.authorId === currentUser?.id;
                                        return (
                                            <div key={c.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold flex-shrink-0">
                                                    {(members.find(m => m.userId === c.authorId)?.fullName || 'U').charAt(0)}
                                                </div>
                                                <div className={`max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {members.find(m => m.userId === c.authorId)?.fullName || 'User'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">
                                                            {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                                                        </span>
                                                    </div>
                                                    <div className={`p-3 rounded-2xl text-sm ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none'
                                                        }`}>
                                                        {c.content}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Comment Input */}
                            <div className="relative mt-4">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    placeholder="Leave a comment..."
                                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    onKeyDown={e => e.key === 'Enter' && handlePostComment(e)}
                                />
                                <button
                                    onClick={handlePostComment}
                                    disabled={!newComment.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskSlideOver;
