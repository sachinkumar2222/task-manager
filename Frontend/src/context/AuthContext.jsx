import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, saveToken, removeToken } from '../utils/tokenManager';
import { jwtDecode } from 'jwt-decode'; // Import the decoder
import toast from 'react-hot-toast'; // Import react-hot-toast

// Key for storing active workspace in localStorage
const ACTIVE_WORKSPACE_KEY = 'tasksphere_active_workspace';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(getToken()); // Token from localStorage
  const [currentUser, setCurrentUser] = useState(null); // User details from token
  const [activeWorkspace, setActiveWorkspaceState] = useState(null); // Active workspace { id, name }
  const [isLoading, setIsLoading] = useState(true); // Initial auth check status

  // Function to decode token and set user state
  const setUserFromToken = (token) => {
    if (token) {
      try {
        const decoded = jwtDecode(token.replace('Bearer ', ''));
        setCurrentUser({
          id: decoded.userId,
          email: decoded.email,
          fullName: decoded.fullName,
          // Role/Workspace from initial token might be outdated or absent after schema change
        });
        setAuthToken(token);
        return true;
      } catch (error) {
        console.error("Invalid token:", error);
        removeToken();
        setCurrentUser(null);
        setAuthToken(null);
        setActiveWorkspaceState(null); // Clear workspace on bad token
        localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
        return false;
      }
    } else {
      setCurrentUser(null);
      setAuthToken(null);
      setActiveWorkspaceState(null); // Clear workspace if no token
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      return false;
    }
  };

  // 3. useEffect for initial load check (Token and Active Workspace)
  useEffect(() => {
    const initialToken = getToken();
    const tokenIsValid = setUserFromToken(initialToken); // Set user based on token validity

    // If token was valid, try loading active workspace from localStorage
    if (tokenIsValid) {
        const savedWorkspace = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
        if (savedWorkspace) {
            try {
                setActiveWorkspaceState(JSON.parse(savedWorkspace));
            } catch (e) {
                console.error("Failed to parse saved workspace:", e);
                localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
            }
        }
    }
    setIsLoading(false); // Finished initial check
  }, []); // Run only once on mount

  // 4. Login function
  const login = (token) => {
    saveToken(token);
    const success = setUserFromToken(token);
    if (success) {
      toast.success('Login successful!');
      // Clear any previously selected workspace on new login
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      setActiveWorkspaceState(null);
    }
    return success;
  };

  // 5. Logout function
  const logout = () => {
    removeToken();
    setCurrentUser(null);
    setAuthToken(null);
    setActiveWorkspaceState(null); // Clear active workspace on logout
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY); // Remove from storage
    toast.success('Logout successful!');
  };

  // --- NEW FUNCTION ---
  // 6. Function to set the active workspace
  const setActiveWorkspace = (workspace) => {
      if (workspace && workspace.id && workspace.name) {
          setActiveWorkspaceState(workspace);
          localStorage.setItem(ACTIVE_WORKSPACE_KEY, JSON.stringify(workspace)); // Save to localStorage
          console.log("Active workspace set:", workspace);
      } else {
          console.error("Attempted to set invalid workspace:", workspace);
          // Optionally clear it if invalid data is passed
          // setActiveWorkspaceState(null);
          // localStorage.removeItem(ACTIVE_WORKSPACE_KEY);
      }
  };

  // 7. Value provided by the context
  const value = {
    authToken,
    currentUser,
    activeWorkspace, // Expose active workspace
    isAuthenticated: !!authToken,
    isLoading,
    login,
    logout,
    setActiveWorkspace, // Expose the setter function
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// 8. Custom hook remains the same
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

