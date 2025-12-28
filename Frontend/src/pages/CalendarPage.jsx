import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarOverrides.css'; // Import custom styles
import { getUserTasks } from '../api/taskService';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import TaskSlideOver from '../components/kanban/TaskSlideOver'; // Import TaskSlideOver

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const CalendarPage = () => {
    const { activeWorkspace } = useAuth();
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // State for Task Detail View
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const isAdmin = activeWorkspace?.role === 'ADMIN';

    // Helper to format tasks to events
    const formatTaskToEvent = (task) => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        allDay: true,
        status: task.status,
        originalTask: task // Store full task object
    });

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                // Admin sees all workspace tasks, Members see assigned
                const filter = isAdmin ? 'workspace' : 'assigned';
                const tasks = await getUserTasks(filter);

                // Transform tasks to calendar events
                const calendarEvents = tasks
                    .filter(task => task.dueDate)
                    .map(formatTaskToEvent);

                setEvents(calendarEvents);
            } catch (error) {
                console.error("Failed to load tasks for calendar", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [isAdmin]);

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3b82f6'; // blue default
        if (event.status === 'COMPLETED') backgroundColor = '#10b981'; // green
        if (event.status === 'IN_PROGRESS') backgroundColor = '#f59e0b'; // orange

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    const handleSelectEvent = (event) => {
        setSelectedTask(event.originalTask);
        setIsDetailsOpen(true);
    };

    const handleTaskUpdated = (updatedTask) => {
        // Update the event in the list if it exists
        setEvents(prevEvents => prevEvents.map(evt => {
            if (evt.id === updatedTask.id) {
                // Return updated event structure
                return formatTaskToEvent(updatedTask);
            }
            return evt;
        }));

        // Also update the selected task to reflect changes in UI if currently viewing
        if (selectedTask && selectedTask.id === updatedTask.id) {
            setSelectedTask(updatedTask);
        }
    };

    const handleTaskDeleted = (deletedTaskId) => {
        setEvents(prevEvents => prevEvents.filter(evt => evt.id !== deletedTaskId));
        setIsDetailsOpen(false);
        setSelectedTask(null);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center dark:text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 h-screen flex flex-col relative">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Calendar</h1>
            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day']}
                    onSelectEvent={handleSelectEvent} // Handle click
                />
            </div>

            {/* Task Detail Slide Over */}
            <TaskSlideOver
                task={selectedTask}
                isOpen={isDetailsOpen}
                onClose={() => {
                    setIsDetailsOpen(false);
                    setSelectedTask(null);
                }}
                onTaskUpdated={handleTaskUpdated}
                onTaskDeleted={handleTaskDeleted}
            />
        </div>
    );
};

export default CalendarPage;
