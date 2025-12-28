import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { UserCircle, Calendar, Tag, Type, AlignLeft, Trash2, Edit, Save, XCircle, MessageSquare, Send, Lock, Users, Check, Paperclip, FileText, Download } from 'lucide-react';
// Import API functions including File Service
import { updateTask, getCommentsForTask, createComment, deleteTask, deleteComment } from '../../api/taskService';
import { uploadFile, getFilesForTask, downloadFile } from '../../api/fileService'; // Import file service
import { getWorkspaceMembers } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TASK_STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE'];

const TaskDetailsModal = ({ task, isOpen, onClose, onTaskDeleted, onTaskUpdated }) => {
    const { activeWorkspace, currentUser } = useAuth();
    // Case-insensitive check for admin role
    const isAdmin = activeWorkspace?.role?.toUpperCase() === 'ADMIN';

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Task Data State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('TO_DO');
    const [assigneeIds, setAssigneeIds] = useState([]);

    // UI State
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file input

    // Related Data State
    const [comments, setComments] = useState([]);
    const [files, setFiles] = useState([]); // State for files
    const [newComment, setNewComment] = useState('');
    const [members, setMembers] = useState([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [isFilesLoading, setIsFilesLoading] = useState(false); // Loading state for files
    const [isUploading, setIsUploading] = useState(false); // Uploading state

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Initial Data Fetch
    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'TO_DO');

            let initialAssignees = [];
            if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
                initialAssignees = task.assigneeIds;
            } else if (task.assigneeId) {
                initialAssignees = [task.assigneeId];
            }
            setAssigneeIds(initialAssignees);

            fetchComments(task.id);
            fetchFiles(task.id); // Fetch files

            if (activeWorkspace?.id) fetchMembers(activeWorkspace.id);
        } else {
            setIsEditing(false);
            setComments([]);
            setFiles([]);
            setIsAssigneeDropdownOpen(false);
        }
    }, [task, isOpen, activeWorkspace]);

    // --- DATA FETCHING ---
    const fetchComments = async (taskId) => {
        setIsCommentsLoading(true);
        try {
            const fetchedComments = await getCommentsForTask(taskId);
            setComments(fetchedComments || []);
        } catch (error) { console.error(error); } finally { setIsCommentsLoading(false); }
    };

    const fetchFiles = async (taskId) => {
        setIsFilesLoading(true);
        try {
            const fetchedFiles = await getFilesForTask(taskId);
            setFiles(fetchedFiles || []);
        } catch (error) { console.error("Failed to load files", error); } finally { setIsFilesLoading(false); }
    };

    const fetchMembers = async (workspaceId) => {
        try {
            const fetchedMembers = await getWorkspaceMembers(workspaceId);
            setMembers(fetchedMembers || []);
        } catch (error) { console.error(error); }
    };

    // --- ACTIONS ---
    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        let updateData = { status };

        if (isAdmin) {
            if (!title.trim()) { toast.error("Title cannot be empty"); setIsLoading(false); return; }
            updateData.title = title;
            updateData.description = description;
            updateData.assigneeIds = assigneeIds;
        }

        try {
            const updatedTask = await updateTask(task.id, updateData);
            toast.success('Task updated!');
            onTaskUpdated(updatedTask);
            setIsEditing(false);
            setIsAssigneeDropdownOpen(false);
        } catch (err) {
            toast.error(err.message || 'Failed to update task.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAssignee = (memberId) => {
        if (assigneeIds.includes(memberId)) {
            setAssigneeIds(prev => prev.filter(id => id !== memberId));
        } else {
            setAssigneeIds(prev => [...prev, memberId]);
        }
    };

    const handleDelete = async () => {
        if (!isAdmin) return;
        if (!window.confirm(`Delete task "${task.title}"?`)) return;
        setIsLoading(true);
        try {
            await deleteTask(task.id);
            toast.success('Task deleted');
            onTaskDeleted(task.id);
            onClose();
        } catch (err) { toast.error(err.message); } finally { setIsLoading(false); }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await createComment(task.id, newComment);
            fetchComments(task.id);
            setNewComment('');
            toast.success('Comment posted');
        } catch (error) { toast.error("Failed to post comment"); }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await deleteComment(commentId);
            toast.success("Comment deleted");
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) { toast.error("Failed to delete comment"); }
    };

    // --- FILE ACTIONS ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation (e.g., max size 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size too large (Max 10MB)");
            return;
        }

        setIsUploading(true);
        try {
            await uploadFile(file, task.id);
            toast.success("File uploaded!");
            fetchFiles(task.id); // Refresh list
        } catch (error) {
            toast.error("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const handleFileDownload = async (fileId, fileName) => {
        try {
            await downloadFile(fileId, fileName);
        } catch (error) {
            toast.error("Failed to download file");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status || 'TO_DO');
            let initialAssignees = [];
            if (task.assigneeIds && Array.isArray(task.assigneeIds)) {
                initialAssignees = task.assigneeIds;
            } else if (task.assigneeId) {
                initialAssignees = [task.assigneeId];
            }
            setAssigneeIds(initialAssignees);
        }
    };

    if (!isOpen || !task) return null;

    const getAssigneeNames = () => {
        if (!task.assigneeIds || task.assigneeIds.length === 0) {
            if (task.assigneeId) {
                const member = members.find(m => m.userId === task.assigneeId);
                return member ? member.fullName : 'Unknown User';
            }
            return "Unassigned";
        }
        const names = task.assigneeIds.map(id => {
            const member = members.find(m => m.userId === id);
            return member ? member.fullName : 'Unknown';
        });
        return names.join(', ');
    };

    const formattedDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Editing Task...` : "Task Details"} size="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 h-[70vh]"> {/* Increased height */}

                {/* --- LEFT COLUMN: Task Details --- */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    <form onSubmit={handleSave}>
                        {/* ... (Title, Desc, Status, Assignee fields - Same as before) ... */}
                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Title</label>
                            {isEditing && isAdmin ? (
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-lg font-semibold border-b-2 border-indigo-500 focus:outline-none bg-gray-50 dark:bg-gray-700 dark:text-white p-1" disabled={isLoading} />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
                                    {isEditing && !isAdmin && <Lock size={16} className="text-gray-400" title="Only Admin can edit" />}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Description</label>
                            {isEditing && isAdmin ? (
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="6" className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isLoading} />
                            ) : (
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md min-h-[80px]">{description || <span className="text-gray-400 italic">No description provided.</span>}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Status</label>
                                {isEditing ? (
                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" disabled={isLoading}>
                                        {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                ) : (
                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${status === 'DONE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>{status.replace('_', ' ')}</span>
                                )}
                            </div>
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Assignees</label>
                                {isEditing && isAdmin ? (
                                    <div>
                                        <button type="button" onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)} className="w-full border p-2 rounded text-left flex justify-between items-center bg-white focus:ring-2 focus:ring-indigo-500 min-h-[42px]">
                                            <span className="truncate text-sm text-gray-700">{assigneeIds.length > 0 ? `${assigneeIds.length} selected` : "Select members..."}</span>
                                            <Users size={16} className="text-gray-400" />
                                        </button>
                                        {isAssigneeDropdownOpen && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {members.length > 0 ? members.map(member => (
                                                    <div key={member.userId} onClick={() => toggleAssignee(member.userId)} className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-600 font-medium">{member.fullName.charAt(0)}</div>
                                                            <div className="flex flex-col"><span className="font-medium text-gray-800">{member.fullName}</span><span className="text-xs text-gray-500">{member.email}</span></div>
                                                        </div>
                                                        {assigneeIds.includes(member.userId) && <Check size={16} className="text-indigo-600" />}
                                                    </div>
                                                )) : <div className="p-3 text-sm text-gray-500 text-center">No members found</div>}
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {assigneeIds.map(id => {
                                                const m = members.find(mem => mem.userId === id);
                                                return m ? (
                                                    <span key={id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                                                        {m.fullName}
                                                        <button type="button" onClick={() => toggleAssignee(id)} className="ml-1 text-indigo-500 hover:text-indigo-900 rounded-full p-0.5 hover:bg-indigo-200 transition-colors">×</button>
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-start gap-2">
                                        <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                                        <span className="text-sm text-gray-700 font-medium">{getAssigneeNames()}</span>
                                        {isEditing && !isAdmin && <Lock size={14} className="text-gray-400 ml-1" title="Only Admin can assign" />}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-4"><label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase block mb-1">Created On</label><span className="text-sm text-gray-600 dark:text-gray-300">{formattedDate}</span></div>
                    </form>

                    {/* --- ATTACHMENTS SECTION --- */}
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Attachments</label>
                            {/* Hidden File Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                disabled={isUploading}
                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm flex items-center gap-1 disabled:opacity-50"
                            >
                                <Paperclip size={14} /> {isUploading ? 'Uploading...' : 'Add File'}
                            </button>
                        </div>

                        <div className="space-y-2">
                            {isFilesLoading ? (
                                <p className="text-xs text-gray-400">Loading files...</p>
                            ) : files.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700/50 p-2 rounded">No files attached.</p>
                            ) : (
                                files.map(file => (
                                    <div key={file.id} className="flex items-center justify-between bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-2 rounded-md shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText size={18} className="text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-200 truncate" title={file.fileName}>{file.filename || file.fileName}</span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </div>
                                        <button
                                            onClick={() => handleFileDownload(file.id, file.filename || file.fileName)}
                                            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Comments) - Same as before */}
                <div className="w-full md:w-80 border-l border-gray-200 dark:border-gray-700 pl-6 flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><MessageSquare size={16} /> Comments</h3>
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                        {isCommentsLoading ? (
                            <div className="flex justify-center py-4"><span className="text-xs text-gray-500 dark:text-gray-400">Loading comments...</span></div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-600">
                                <p className="text-xs text-gray-400 italic">No comments yet.</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg text-sm border border-gray-100 dark:border-gray-700 group relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">{members.find(m => m.userId === comment.authorId)?.fullName || 'User'}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            {(currentUser?.id === comment.authorId || isAdmin) && (
                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handlePostComment} className="mt-auto relative">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="w-full border border-gray-300 dark:border-gray-600 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                        <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600 dark:text-indigo-400"><Send size={18} /></button>
                    </form>
                </div>
            </div>

            <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
                {!isEditing && isAdmin ? (
                    <button onClick={handleDelete} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded flex items-center gap-2 text-sm"><Trash2 size={16} /> Delete Task</button>
                ) : (<div></div>)}
                <div className="flex gap-3 ml-auto">
                    {!isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"><Edit size={16} /> {isAdmin ? 'Edit Task' : 'Update Status'}</button>
                            <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
                            <button type="button" onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Save Changes</button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;