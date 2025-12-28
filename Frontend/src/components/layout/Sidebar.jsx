import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link, NavLink, useLocation } from 'react-router-dom'; // Import useLocation
import { LayoutDashboard, FolderKanban, Settings, LogOut, Zap, ChevronDown, ChevronRight, Loader2, ListTodo, Calendar } from 'lucide-react'; // Import ListTodo
import { useAuth } from '../../context/AuthContext'; // To access logout and activeWorkspace
import { useProjects } from '../../context/ProjectContext'; // Import useProjects context

/**
 * Sidebar
 * Main navigation sidebar for the application layout.
 * Now dynamically fetches and displays projects for the active workspace.
 */
const Sidebar = () => {
    const { logout } = useAuth(); // Removed activeWorkspace dependency as context handles it
    const location = useLocation(); // Hook to get current path

    // Removed useEffect for fetching projects - handled by context

    // Style definitions (remain the same)
    const linkBaseStyle = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeLinkStyle = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300";
    const inactiveLinkStyle = "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-white";
    const projectLinkStyle = "pl-9 pr-3 py-1.5 rounded-md text-xs font-medium"; // Indented style for project links


    return (
        <div className="w-64 bg-white dark:bg-gray-800 shadow-md flex flex-col h-screen p-4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"> {/* Added overflow */}
            {/* Logo */}
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-8 px-2 pt-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
                <Zap className="h-7 w-7 text-indigo-600" />
                <span>Task Master</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1"> {/* Reduced space */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) =>
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                </NavLink>

                {/* Projects Link - Navigation to new Projects Page */}
                <NavLink
                    to="/projects"
                    className={({ isActive }) =>
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <FolderKanban className="h-5 w-5" />
                    Projects
                </NavLink>

                <NavLink
                    to="/tasks"
                    className={({ isActive }) =>
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <ListTodo className="h-5 w-5" />
                    Tasks
                </NavLink>

                <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <Calendar className="h-5 w-5" />
                    Calendar
                </NavLink>
                {/* --- END DYNAMIC PROJECTS SECTION --- */}

            </nav>

            {/* Bottom Section (Settings, Logout) */}
            <div className="mt-auto space-y-2 border-t pt-4 flex-shrink-0"> {/* Added flex-shrink-0 */}
                <NavLink
                    to="/settings" // Placeholder link
                    className={({ isActive }) =>
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </NavLink>
                <button
                    onClick={logout}
                    className={`flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700`}
                >
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;