import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { UserCircle, Calendar, Tag, Type, AlignLeft, Trash2, Edit, Save, XCircle, MessageSquare, Send, Lock, Users, Check } from 'lucide-react';
import { updateTask, getCommentsForTask, createComment, deleteTask, deleteComment } from '../../api/taskService';
import { getWorkspaceMembers } from '../../api/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const TASK_STATUSES = ['TO_DO', 'IN_PROGRESS', 'DONE'];

const TaskDetailsModal = ({ task, isOpen, onClose, onTaskDeleted, onTaskUpdated }) => {
    const { activeWorkspace, currentUser } = useAuth();
    const isAdmin = activeWorkspace?.role === 'ADMIN';

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('TO_DO');
    
    // --- UPDATED STATE: Array of IDs ---
    const [assigneeIds, setAssigneeIds] = useState([]); 
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false); // To toggle custom dropdown

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [members, setMembers] = useState([]); 
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);

    useEffect(() => {
        if (task && isOpen) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'TO_DO');
            // Ensure we have an array (backend might return null if empty)
            setAssigneeIds(task.assigneeIds || []); 
            
            fetchComments(task.id);
            if (activeWorkspace?.id) fetchMembers(activeWorkspace.id);
        } else {
            setIsEditing(false);
            setComments([]);
            setIsAssigneeDropdownOpen(false);
        }
    }, [task, isOpen, activeWorkspace]);

    const fetchComments = async (taskId) => {
        setIsCommentsLoading(true);
        try {
            const fetchedComments = await getCommentsForTask(taskId);
            setComments(fetchedComments || []);
        } catch (error) { console.error(error); } finally { setIsCommentsLoading(false); }
    };
    const fetchMembers = async (workspaceId) => {
        try {
            const fetchedMembers = await getWorkspaceMembers(workspaceId);
            setMembers(fetchedMembers || []);
        } catch (error) { console.error(error); }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let updateData = { status }; 

        if (isAdmin) {
            if (!title.trim()) { toast.error("Title cannot be empty"); setIsLoading(false); return; }
            updateData.title = title;
            updateData.description = description;
            updateData.assigneeIds = assigneeIds; // Send array
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

    // Helper to toggle a member in the array
    const toggleAssignee = (memberId) => {
        if (assigneeIds.includes(memberId)) {
            setAssigneeIds(prev => prev.filter(id => id !== memberId));
        } else {
            setAssigneeIds(prev => [...prev, memberId]);
        }
    };

    const handleDelete = async () => {
        if(!isAdmin) return; 
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
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await deleteComment(commentId);
            toast.success("Comment deleted");
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };
    
    const handleCancelEdit = () => {
        setIsEditing(false);
        if (task) { setTitle(task.title); setDescription(task.description || ''); setStatus(task.status || 'TO_DO'); setAssigneeIds(task.assigneeIds || []); }
    };

    if (!isOpen || !task) return null;

    const formattedDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A';

    // Helper to get display names
    const getAssigneeNames = () => {
        if (!assigneeIds || assigneeIds.length === 0) return "Unassigned";
        const names = assigneeIds.map(id => {
            const member = members.find(m => m.userId === id);
            return member ? member.fullName : 'Unknown';
        });
        return names.join(', ');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? `Editing Task...` : "Task Details"} size="max-w-4xl">
            <div className="flex flex-col md:flex-row gap-6 h-[65vh]">
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                    <form onSubmit={handleSave}>
                        {/* ... Title and Description inputs (same as before) ... */}
                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Title</label>
                            {isEditing && isAdmin ? (
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-lg font-semibold border-b-2 border-indigo-500 focus:outline-none bg-gray-50 p-1" disabled={isLoading} />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                                    {isEditing && !isAdmin && <Lock size={16} className="text-gray-400" title="Only Admin can edit" />}
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Description</label>
                            {isEditing && isAdmin ? (
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="6" className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" disabled={isLoading} />
                            ) : (
                                <p className="text-gray-700 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded-md min-h-[80px]">{description || <span className="text-gray-400 italic">No description provided.</span>}</p>
                            )}
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Status</label>
                                {isEditing ? (
                                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" disabled={isLoading}>
                                        {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                ) : (
                                    <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${status === 'DONE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ')}</span>
                                )}
                            </div>

                            {/* --- MULTI-SELECT ASSIGNEES --- */}
                            <div className="relative">
                                <label className="text-xs font-medium text-gray-500 uppercase block mb-1">Assignees</label>
                                {isEditing && isAdmin ? (
                                    <div>
                                        {/* Toggle Button simulating a select box */}
                                        <button 
                                            type="button"
                                            onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                                            className="w-full border p-2 rounded text-left flex justify-between items-center bg-white focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <span className="truncate text-sm">
                                                {assigneeIds.length > 0 ? `${assigneeIds.length} selected` : "Select members..."}
                                            </span>
                                            <Users size={16} className="text-gray-400" />
                                        </button>

                                        {/* Custom Dropdown List */}
                                        {isAssigneeDropdownOpen && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                                {members.map(member => (
                                                    <div 
                                                        key={member.userId} 
                                                        onClick={() => toggleAssignee(member.userId)}
                                                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <UserCircle size={16} className="text-gray-400"/>
                                                            <span>{member.fullName}</span>
                                                        </div>
                                                        {assigneeIds.includes(member.userId) && <Check size={14} className="text-indigo-600" />}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {/* Selected Tags Display */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {assigneeIds.map(id => {
                                                const m = members.find(mem => mem.userId === id);
                                                return m ? (
                                                    <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {m.fullName}
                                                        <button type="button" onClick={() => toggleAssignee(id)} className="ml-1 text-indigo-600 hover:text-indigo-900">×</button>
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
                        <div className="mt-4"><label className="text-xs font-medium text-gray-500 uppercase block mb-1">Created On</label><span className="text-sm text-gray-600">{formattedDate}</span></div>
                    </form>
                </div>

                {/* Right Column (Comments) - Same as before */}
                <div className="w-full md:w-80 border-l border-gray-200 pl-6 flex flex-col h-full">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><MessageSquare size={16} /> Comments</h3>
                    
                    <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                        {isCommentsLoading ? (
                            <div className="flex justify-center py-4"><span className="text-xs text-gray-500">Loading comments...</span></div>
                        ) : comments.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <p className="text-xs text-gray-400 italic">No comments yet.</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 group relative">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-indigo-600 text-xs">{members.find(m => m.userId === comment.authorId)?.fullName || 'User'}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            {(currentUser?.id === comment.authorId || isAdmin) && (
                                                <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                    <form onSubmit={handlePostComment} className="mt-auto relative">
                        <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500" />
                        <button type="submit" disabled={!newComment.trim()} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-600"><Send size={18} /></button>
                    </form>
                </div>
            </div>

            <div className="flex justify-between items-center pt-6 mt-4 border-t">
                {!isEditing && isAdmin ? (
                    <button onClick={handleDelete} className="text-red-600 hover:bg-red-50 p-2 rounded flex items-center gap-2 text-sm"><Trash2 size={16} /> Delete Task</button>
                ) : ( <div></div> )}
                <div className="flex gap-3 ml-auto">
                    {!isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"><Edit size={16} /> {isAdmin ? 'Edit Task' : 'Update Status'}</button>
                            <button onClick={onClose} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">Close</button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={handleCancelEdit} className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">Cancel</button>
                            <button type="button" onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">Save Changes</button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default TaskDetailsModal;