import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import the useAuth hook

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading... 
      </div>
    ); 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; 
  }

  return children; 
};

export default ProtectedRoute;
