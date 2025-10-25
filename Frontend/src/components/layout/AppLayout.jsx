import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Sidebar component (hum agle step mein banayenge)
import Navbar from './Navbar'; // Navbar component (hum agle step mein banayenge)

/**
 * AppLayout
 * Yeh logged-in users ke liye main application layout hai.
 * Ismein ek Sidebar aur ek Navbar shaamil hai.
 */
const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 md:p-8">
          {/* Outlet App.jsx mein define kiye gaye child routes (DashboardPage, ProjectPage) ko render karega */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
