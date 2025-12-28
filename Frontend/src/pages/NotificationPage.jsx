import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
// import Layout from '../components/layout/AppLayout'; // Removed as it's handled by Router
import { useAuth } from '../context/AuthContext';
import { Info, Trash2 } from 'lucide-react'; // Valid icon
import toast from 'react-hot-toast';

const NotificationPage = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get('/api/notifications');
            setNotifications(response.data.notifications || []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
            toast.error("Failed to load notifications.");
        } finally {
            setIsLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await apiClient.put(`/api/notifications/${id}/read`);
            // Update local state
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            await apiClient.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All marked as read");
        } catch (error) {
            toast.error("Failed to mark all as read");
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }

        // Navigate if payload exists with projectId/taskId
        if (notification.payload && notification.payload.projectId) {
            // Can pass taskId as query param to open modal automatically
            const { projectId, taskId } = notification.payload;
            const targetUrl = `/project/${projectId}${taskId ? `?taskId=${taskId}` : ''}`;
            navigate(targetUrl);
        }
    };

    const deleteNotification = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this notification?")) return;
        try {
            await apiClient.delete(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Failed to delete notification:", error);
            toast.error("Failed to delete notification");
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
                <button
                    onClick={markAllRead}
                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    Mark all as read
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-10 dark:text-gray-400">Loading...</div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    No notifications yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`group p-4 rounded-lg border transition-colors cursor-pointer relative ${notification.isRead
                                ? 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
                                : 'bg-blue-50 border-blue-200 text-gray-800 dark:bg-gray-800 dark:border-blue-900/50 dark:text-gray-200'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${notification.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                    {/* You can switch icons based on notification.type */}
                                    <Info className="w-5 h-5 dark:text-gray-300" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{notification.message}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    )}
                                    <button
                                        onClick={(e) => deleteNotification(notification._id, e)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Delete Notification"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
