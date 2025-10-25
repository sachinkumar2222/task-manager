import React, { createContext, useState, useEffect, useContext } from 'react';
import { getToken, saveToken, removeToken } from '../utils/tokenManager';
import { jwtDecode } from 'jwt-decode'; // Import the decoder
import toast from 'react-hot-toast'; // Import react-hot-toast

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(getToken()); // Initial state from localStorage
  const [currentUser, setCurrentUser] = useState(null); // Initially no user
  const [isLoading, setIsLoading] = useState(true); // To check initial token state

  // Function to decode token and set user state - UPDATED
  const setUserFromToken = (token) => {
    if (token) {
      try {
        // Decode token to get user data
        const decoded = jwtDecode(token.replace('Bearer ', '')); // Remove 'Bearer ' prefix
        
        // --- UPDATE HERE ---
        // Extract fullName from the decoded token
        setCurrentUser({
          id: decoded.userId,
          email: decoded.email,
          fullName: decoded.fullName, // Add fullName here
          // Add role and workspaceId if they exist in your token payload
          ...(decoded.role && { role: decoded.role }),
          ...(decoded.workspaceId && { workspaceId: decoded.workspaceId }),
        });
        setAuthToken(token); // Ensure token state is updated
        return true; // Indicate success
      } catch (error) {
        console.error("Invalid token:", error);
        removeToken(); // Remove invalid token
        setCurrentUser(null);
        setAuthToken(null);
        return false; // Indicate failure
      }
    } else {
      setCurrentUser(null);
      setAuthToken(null);
      return false;
    }
  };

  // 3. useEffect for initial load check
  useEffect(() => {
    const initialToken = getToken();
    setUserFromToken(initialToken);
    setIsLoading(false); // Finished initial check
  }, []); // Empty array ensures this runs only once on mount

  // 4. Login function - Includes toast
  const login = (token) => {
    saveToken(token); // Save to localStorage
    const success = setUserFromToken(token); // Decode and set state
    if (success) {
      toast.success('Login successful!'); // Show success toast
    }
    return success; // Return true/false based on token validity
  };

  // 5. Logout function - Includes toast
  const logout = () => {
    removeToken(); // Remove from localStorage
    setCurrentUser(null); // Reset user state
    setAuthToken(null); // Reset token state
    toast.success('Logout successful!'); // Show success toast
    // Optionally redirect to login page after a short delay
    // setTimeout(() => window.location.href = '/login', 500); 
  };

  // 6. Value provided by the context
  const value = {
    authToken,
    currentUser,
    isAuthenticated: !!authToken, // True if authToken is not null/empty
    isLoading, // To know if initial check is done
    login,
    logout,
  };

  // Render children only after initial loading is complete
  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children} 
    </AuthContext.Provider>
  );
};

// 7. Custom hook for easy consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

