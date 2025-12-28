import React, { useState, useEffect, useRef } from 'react';
import { UserCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';

const TaskCard = ({ task, onClick, onEditClick, onDeleteClick, isAdmin }) => { // Added isAdmin prop
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    if (!task) return null;

    // Updated Display Logic for Multiple Assignees (Version 2)
    let assigneeDisplay = "Unassigned";
    if (task.assigneeIds && task.assigneeIds.length > 0) {
        assigneeDisplay = `${task.assigneeIds.length} Assignee${task.assigneeIds.length > 1 ? 's' : ''}`;
    } else if (task.assigneeId) {
        assigneeDisplay = "1 Assignee"; // Fallback for old data
    }

    const handleEdit = (e) => {
        e.stopPropagation();
        onEditClick();
        setIsMenuOpen(false);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDeleteClick();
        setIsMenuOpen(false);
    };

    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-gray-800 rounded-md shadow p-3 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 relative"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
        >
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 break-words">{task.title}</h4>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <UserCircle size={14} />
                    <span>{assigneeDisplay}</span>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMenuOpen(!isMenuOpen);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                        aria-label="Task options"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-xl z-50">
                            <ul className="py-1">
                                <li>
                                    <button
                                        onClick={handleEdit}
                                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Edit size={14} /> {isAdmin ? 'Edit Task' : 'Update Status'}
                                    </button>
                                </li>
                                {isAdmin && (
                                    <li>
                                        <button
                                            onClick={handleDelete}
                                            className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                        >
                                            <Trash2 size={14} /> Delete Task
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskCard;