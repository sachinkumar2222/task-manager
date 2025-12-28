import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getProjects } from '../api/taskService';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
    const { activeWorkspace } = useAuth();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        if (!activeWorkspace?.id) {
            setProjects([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await getProjects();
            setProjects(data || []);
        } catch (err) {
            console.error("Error fetching projects:", err);
            setError(err.message || "Failed to load projects");
        } finally {
            setIsLoading(false);
        }
    }, [activeWorkspace]);

    // Initial fetch when workspace changes
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <ProjectContext.Provider value={{ projects, isLoading, error, fetchProjects }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within a ProjectProvider');
    }
    return context;
};
