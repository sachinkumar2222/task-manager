import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Link, NavLink, useLocation } from 'react-router-dom'; // Import useLocation
import { LayoutDashboard, FolderKanban, Settings, LogOut, Zap, ChevronDown, ChevronRight, Loader2 } from 'lucide-react'; // Import more icons
import { useAuth } from '../../context/AuthContext'; // To access logout and activeWorkspace
import { getProjects } from '../../api/taskService'; // API function to get projects

/**
 * Sidebar
 * Main navigation sidebar for the application layout.
 * Now dynamically fetches and displays projects for the active workspace.
 */
const Sidebar = () => {
    const { logout, activeWorkspace } = useAuth(); // Get logout and activeWorkspace
    const [projects, setProjects] = useState([]);
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [projectsError, setProjectsError] = useState('');
    const [showProjects, setShowProjects] = useState(true); // State to toggle project list visibility
    const location = useLocation(); // Hook to get current path

    // Fetch projects when activeWorkspace changes
    useEffect(() => {
        const fetchProjects = async () => {
            // Only fetch if there's an active workspace
            if (!activeWorkspace?.id) {
                setProjects([]); // Clear projects if no workspace is active
                return;
            }
            setIsLoadingProjects(true);
            setProjectsError('');
            try {
                const fetchedProjects = await getProjects(); // API client sends activeWorkspace ID via header
                setProjects(fetchedProjects || []);
            } catch (err) {
                console.error("Failed to fetch projects for sidebar:", err);
                setProjectsError('Could not load projects.');
            } finally {
                setIsLoadingProjects(false);
            }
        };

        fetchProjects();
    }, [activeWorkspace]); // Dependency array: refetch if activeWorkspace changes

    // Style definitions (remain the same)
    const linkBaseStyle = "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium";
    const activeLinkStyle = "bg-indigo-100 text-indigo-700";
    const inactiveLinkStyle = "text-gray-700 hover:bg-gray-100 hover:text-gray-900";
    const projectLinkStyle = "pl-9 pr-3 py-1.5 rounded-md text-xs font-medium"; // Indented style for project links


    return (
        <div className="w-64 bg-white shadow-md flex flex-col h-screen p-4 border-r border-gray-200 overflow-y-auto"> {/* Added overflow */}
            {/* Logo */}
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-8 px-2 pt-2 flex-shrink-0"> {/* Added flex-shrink-0 */}
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

                {/* --- DYNAMIC PROJECTS SECTION --- */}
                {/* Projects Header - Clickable to toggle visibility */}
                <button
                    onClick={() => setShowProjects(!showProjects)}
                    className={`${linkBaseStyle} ${inactiveLinkStyle} w-full justify-between`} // Button styling like a link
                >
                   <span className="flex items-center gap-3">
                       <FolderKanban className="h-5 w-5" />
                       Projects
                   </span>
                   {showProjects ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                </button>

                {/* Conditional rendering for Projects List */}
                {showProjects && (
                    <div className="pl-3 space-y-1"> {/* Indent project links */}
                        {isLoadingProjects && (
                             <div className="flex items-center justify-center py-2">
                                <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
                            </div>
                        )}
                        {projectsError && <p className="text-xs text-red-500 px-3 py-1">{projectsError}</p>}
                        {!isLoadingProjects && !projectsError && projects.length === 0 && (
                            <p className="text-xs text-gray-500 px-3 py-1">No projects yet.</p>
                        )}
                        {!isLoadingProjects && !projectsError && projects.map(project => (
                            <NavLink
                                key={project.id}
                                to={`/project/${project.id}`}
                                // Highlight if the current path starts with /project/PROJECT_ID
                                className={({ isActive }) => 
                                    `${projectLinkStyle} ${isActive ? activeLinkStyle.replace('bg-indigo-100','bg-indigo-50') : inactiveLinkStyle}` // Slightly different active style
                                }
                                title={project.name} // Show full name on hover
                            >
                                <span className="truncate">{project.name}</span> {/* Truncate long names */}
                            </NavLink>
                        ))}
                         {/* Optional: Add "Create Project" link here */}
                         {/* <button className={`${projectLinkStyle} ${inactiveLinkStyle} text-indigo-600`}>+ Create Project</button> */}
                    </div>
                )}
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