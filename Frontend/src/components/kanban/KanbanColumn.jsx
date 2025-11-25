import React from 'react';
import TaskCard from './TaskCard'; // Task card component

/**
 * KanbanColumn
 * Represents a single column in the Kanban board (e.g., To Do, In Progress, Done).
 * Displays the column title and lists the tasks within it.
 *
 * Props:
 * - title: string - The title of the column (e.g., "To Do").
 * - tasks: Array<object> - An array of task objects belonging to this column.
 * - onTaskClick: function (jab card par click ho)
 * - onEditTask: function (jab edit dot par click ho)
 * - onDeleteTask: function (jab delete dot par click ho)
 * - isAdmin: boolean - Whether the current user is an admin (passed down to TaskCard)
 */
const KanbanColumn = ({ title, tasks = [], onTaskClick, onEditTask, onDeleteTask, isAdmin }) => {
    let headerColor = 'bg-gray-200 text-gray-700'; // Default
    if (title.toLowerCase().includes('progress')) {
        headerColor = 'bg-blue-200 text-blue-800';
    } else if (title.toLowerCase().includes('done') || title.toLowerCase().includes('complete')) {
        headerColor = 'bg-green-200 text-green-800';
    }

    return (
        // Column container
        <div className="flex flex-col w-72 md:w-80 bg-gray-100 rounded-lg shadow flex-shrink-0 h-fit">
            {/* Column Header */}
            <div className={`p-3 font-semibold text-sm rounded-t-lg ${headerColor} flex justify-between items-center`}>
                <span>{title}</span>
                <span className="text-xs">{tasks.length}</span> {/* Display task count */}
            </div>

            {/* --- UPDATED TASK LIST AREA --- */}
            {/* Removed 'overflow-y-auto' and 'maxHeight' style */}
            {/* Ab column content ke saath grow karega aur page scroll hoga */}
            <div className="p-3 space-y-3 min-h-[100px]">
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onClick={() => onTaskClick(task)} // Modal kholne ke liye main click
                            onEditClick={() => onEditTask(task)} // "Edit" par click karne se bhi modal khulega
                            onDeleteClick={() => onDeleteTask(task)} // "Delete" par click karne se delete handler call hoga
                            isAdmin={isAdmin} // Pass the isAdmin prop down
                        />
                    ))
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No tasks in this column.</p>
                )}
            </div>
            {/* --- END UPDATE --- */}
            
        </div>
    );
};

export default KanbanColumn;