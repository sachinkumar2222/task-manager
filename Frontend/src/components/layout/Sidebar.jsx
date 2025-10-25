import React from 'react';
import { Link, NavLink } from 'react-router-dom'; // Use NavLink for active styling
import { LayoutDashboard, FolderKanban, Settings, LogOut, Zap } from 'lucide-react'; // Import icons
import { useAuth } from '../../context/AuthContext'; // To access the logout function

/**
 * Sidebar
 * Main navigation sidebar for the application layout.
 */
const Sidebar = () => {
    const { logout } = useAuth(); // Get logout function from AuthContext

    // Define a base style for NavLink
    const linkBaseStyle = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium";
    // Define the style for the active link
    const activeLinkStyle = "bg-indigo-100 text-indigo-700";
    // Define the style for inactive links
    const inactiveLinkStyle = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";

    return (
        // Sidebar container
        <div className="w-64 bg-white shadow-md flex flex-col h-screen p-4 border-r border-gray-200"> {/* Added border */}
            {/* Logo */}
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-8 px-2 pt-2">
                <Zap className="h-7 w-7 text-indigo-600" />
                <span>Task Sphere</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
                <NavLink
                    to="/dashboard"
                    // Apply active style conditionally
                    className={({ isActive }) => 
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                </NavLink>
                {/* Example project link - this will need to be dynamic later */}
                {/* <NavLink
                    to="/project/example-project-id"
                     className={({ isActive }) => 
                        `${linkBaseStyle} ${isActive ? activeLinkStyle : inactiveLinkStyle}`
                    }
                >
                    <FolderKanban className="h-5 w-5" />
                    Projects
                </NavLink> */}
                {/* Add more links as needed */}
            </nav>

            {/* Bottom Section (Settings, Logout) */}
            <div className="mt-auto space-y-2 border-t pt-4"> {/* Added top border */}
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
                    // Consistent styling with NavLinks, but with red color for logout
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

