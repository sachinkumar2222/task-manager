import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserCircle, Search } from 'lucide-react'; // Example icons
import { useAuth } from '../../context/AuthContext'; // User info ke liye

/**
 * Navbar
 * Top navigation bar within the AppLayout for logged-in users.
 * Displays user's first name from AuthContext.
 */
const Navbar = () => {
    const { currentUser } = useAuth(); // Auth context se user info

    // Attempt to get the first name from the full name provided by AuthContext
    const firstName = currentUser?.fullName?.split(' ')[0];
    console.log(currentUser)

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"> {/* Added flex-shrink-0 */}
            {/* Left side (e.g., Search bar - can add later) */}
            <div className="relative">
                {/* Search bar placeholder */}
            </div>

            {/* Right side (Notifications, User Profile) */}
            <div className="flex items-center gap-4">
                {/* Notification Icon */}
                <Link
                    to="/notifications"
                    className="p-1 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="View notifications"
                >
                    <Bell className="h-6 w-6" />
                </Link>

                {/* User Profile Area */}
                <Link to="/settings" className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <UserCircle className="h-8 w-8 text-gray-500 dark:text-gray-300" />
                    {/* Display user's first name if available, otherwise email, otherwise 'Profile' */}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
                        {firstName || currentUser?.email || 'User Profile'}
                    </span>
                </Link>
            </div>
        </header>
    );
};

export default Navbar;

