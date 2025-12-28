import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../api/analyticsService';
import { getUserTasks } from '../api/taskService'; // Import task service
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { LayoutDashboard, CheckCircle2, ListTodo, TrendingUp, Activity, User, Users } from 'lucide-react';

const DashboardPage = () => {
    const { currentUser, activeWorkspace } = useAuth();
    const [stats, setStats] = useState(null);
    const [assignedTasksCount, setAssignedTasksCount] = useState(0); // State for live task count
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAdmin = activeWorkspace?.role === 'ADMIN';

    useEffect(() => {
        const loadIds = async () => {
            try {
                // Parallel fetch
                const scope = isAdmin ? 'workspace' : 'me';
                const [analyticsData, tasksData] = await Promise.all([
                    getDashboardStats(scope),
                    !isAdmin ? getUserTasks('assigned') : Promise.resolve([]) // Only fetch tasks if Member
                ]);

                setStats(analyticsData);
                if (!isAdmin) {
                    setAssignedTasksCount(tasksData ? tasksData.length : 0);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadIds();
    }, [isAdmin]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center dark:text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading dashboard: {error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-indigo-600 hover:underline">Retry</button>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <header className="mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            {isAdmin ? <LayoutDashboard className="text-indigo-600" /> : <User className="text-green-600" />}
                            {isAdmin ? 'Workspace Overview' : 'My Dashboard'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            {isAdmin
                                ? 'Track overall team performance and project health.'
                                : `Welcome back, ${currentUser?.fullName || 'User'}. Here is your personal activity.`}
                        </p>
                    </div>
                    {!isAdmin && (
                        <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                            Personal View
                        </div>
                    )}
                </div>
            </header>

            {/* Design A: ADMIN DASHBOARD */}
            {isAdmin && (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Tasks"
                            value={stats.totalTasks}
                            icon={<ListTodo size={24} className="text-blue-600" />}
                            bgColor="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <StatCard
                            title="Total Projects"
                            value={stats.totalProjects}
                            icon={<Users size={24} className="text-indigo-600" />}
                            bgColor="bg-indigo-50 dark:bg-indigo-900/20"
                        />
                        <StatCard
                            title="Completed"
                            value={stats.completedTasks}
                            icon={<CheckCircle2 size={24} className="text-green-600" />}
                            bgColor="bg-green-50 dark:bg-green-900/20"
                        />
                        <StatCard
                            title="Completion Rate"
                            value={`${stats.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%`}
                            icon={<TrendingUp size={24} className="text-purple-600" />}
                            bgColor="bg-purple-50 dark:bg-purple-900/20"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Completion Trend */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Productivity (Last 7 Days)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.taskTrendData}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorCount)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Task Distribution (Simple Bar for now, derived from stats) */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Workload Overview</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[
                                            { name: 'Active', count: stats.activeTasks, fill: '#f97316' }, // Orange
                                            { name: 'Completed', count: stats.completedTasks, fill: '#22c55e' }, // Green
                                        ]}
                                        layout="vertical"
                                        barSize={40}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#6B7280', fontSize: 14, fontWeight: 500 }}
                                            width={100}
                                        />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="count" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Design B: TEAM MEMBER DASHBOARD */}
            {!isAdmin && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CHANGED FROM "Created by Me" TO "Assigned to Me" */}
                        <StatCard
                            title="Tasks Assigned to Me"
                            value={assignedTasksCount} // Live data from task-service
                            icon={<ListTodo size={24} className="text-blue-600" />}
                            bgColor="bg-blue-50 dark:bg-blue-900/20"
                        />
                        <StatCard
                            title="My Completed Tasks"
                            value={stats.completedTasks} // Still from Analytics for now
                            icon={<CheckCircle2 size={24} className="text-green-600" />}
                            bgColor="bg-green-50 dark:bg-green-900/20"
                        />
                        <StatCard
                            title="Recent Activity"
                            value={stats.createdTasksLast7Days || 0} // This might be low if they don't create tasks
                            icon={<Activity size={24} className="text-orange-600" />}
                            bgColor="bg-orange-50 dark:bg-orange-900/20"
                        />
                    </div>

                    <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">My Personal Productivity</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.taskTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6B7280', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        barSize={50}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
            {icon}
        </div>
    </div>
);

export default DashboardPage;