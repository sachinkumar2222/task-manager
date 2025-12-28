import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserTasks } from '../../api/taskService';
import TaskSlideOver from '../kanban/TaskSlideOver';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';

const DashboardCalendar = () => {
    const { activeWorkspace } = useAuth();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // For Task Detail Modal
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const isAdmin = activeWorkspace?.role === 'ADMIN';

    // Fetch filters
    useEffect(() => {
        fetchTasks();
    }, [activeWorkspace]);

    const fetchTasks = async () => {
        if (!activeWorkspace) return;
        setIsLoading(true);
        try {
            // Logic matches user request: Admin sees all (workspace), Member sees own (assigned)
            const filter = isAdmin ? 'workspace' : 'assigned';
            const data = await getUserTasks(filter);
            setTasks(data || []);
        } catch (error) {
            console.error("Failed to fetch tasks for calendar", error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const jumpToToday = () => setCurrentMonth(new Date());

    // Calendar Grid Logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    const handleTaskClick = (task, e) => {
        e.stopPropagation();
        setSelectedTask(task);
        setIsDetailsOpen(true);
    };

    // Helpers for task styling
    const getPriorityColor = (status) => {
        if (status === 'DONE') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (status === 'IN_PROGRESS') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        return 'bg-slate-700 text-slate-300 border-slate-600';
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6 border border-gray-100 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    Calendar
                </h2>

                <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-900/50 p-1 rounded-lg border border-gray-200 dark:border-white/10">
                    <button onClick={prevMonth} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md text-gray-500 dark:text-slate-400 dark:hover:text-white transition">
                        <ChevronLeft size={16} />
                    </button>
                    <div className="px-3 text-sm font-semibold min-w-[120px] text-center text-gray-700 dark:text-gray-200">
                        {format(currentMonth, 'MMMM yyyy')}
                    </div>
                    <button onClick={nextMonth} className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/5 rounded-md text-gray-500 dark:text-slate-400 dark:hover:text-white transition">
                        <ChevronRight size={16} />
                    </button>
                    <div className="w-px h-5 bg-gray-300 dark:bg-white/10 mx-1"></div>
                    <button onClick={jumpToToday} className="px-2 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded transition uppercase tracking-wider">
                        Today
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-gray-500 dark:text-slate-500 uppercase tracking-widest py-3">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Cells */}
                {isLoading ? (
                    <div className="h-96 flex items-center justify-center bg-white dark:bg-gray-800">
                        <Loader size={32} className="animate-spin text-indigo-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 dark:bg-gray-700 gap-px border-b border-gray-200 dark:border-gray-700">
                        {calendarDays.map((day, dayIdx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const isTodayDate = isToday(day);

                            // Filter tasks for this day
                            const dayTasks = tasks.filter(task =>
                                task.dueDate && isSameDay(new Date(task.dueDate), day)
                            );

                            return (
                                <div
                                    key={day.toString()}
                                    className={`min-h-[100px] bg-white dark:bg-gray-800 p-2 transition-colors relative
                                        ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-800/50' : ''}
                                    `}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-semibold h-6 w-6 flex items-center justify-center rounded-full
                                            ${isTodayDate
                                                ? 'bg-indigo-600 text-white shadow-md'
                                                : isCurrentMonth ? 'text-gray-700 dark:text-slate-400' : 'text-gray-400 dark:text-slate-600'}
                                        `}>
                                            {format(day, 'd')}
                                        </span>
                                        {dayTasks.length > 0 && (
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600">
                                                {dayTasks.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Task List in Day Cell */}
                                    <div className="space-y-1">
                                        {dayTasks.slice(0, 3).map(task => ( // Show max 3 small
                                            <div
                                                key={task.id}
                                                onClick={(e) => handleTaskClick(task, e)}
                                                className={`px-1.5 py-1 rounded text-[10px] font-medium cursor-pointer truncate border ${getPriorityColor(task.status)} hover:opacity-80`}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <div className="text-[10px] text-center font-bold text-gray-400 dark:text-slate-500">
                                                + {dayTasks.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Task Details Modal */}
            {selectedTask && (
                <TaskSlideOver
                    task={selectedTask}
                    isOpen={isDetailsOpen}
                    onClose={() => { setIsDetailsOpen(false); setSelectedTask(null); }}
                    onTaskUpdated={(updatedTask) => {
                        setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
                    }}
                    onTaskDeleted={(taskId) => {
                        setTasks(tasks.filter(t => t.id !== taskId));
                        setIsDetailsOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default DashboardCalendar;
