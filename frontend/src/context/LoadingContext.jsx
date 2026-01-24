/**
 * Loading Context
 * Global state management for loading state across the application
 * 
 * This context provides:
 * - isLoading: boolean state indicating if app is loading
 * - setLoading: function to set loading state
 * - showLoader: function to show loader with optional message
 * - hideLoader: function to hide loader
 * 
 * Usage:
 * 1. Wrap your app with LoadingProvider
 * 2. Use useLoading() hook to access loading state and functions
 * 
 * Example:
 * const { showLoader, hideLoader } = useLoading();
 * showLoader('Fetching data...');
 * await fetchData();
 * hideLoader();
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const LoadingContext = createContext(null);

/**
 * LoadingProvider Component
 * Wraps the application and provides loading state management
 */
export const LoadingProvider = ({ children }) => {
    // Loading state
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    /**
     * Show the loader with an optional message
     * @param {string} message - Optional message to display
     */
    const showLoader = useCallback((message = '') => {
        setLoadingMessage(message);
        setIsLoading(true);
    }, []);

    /**
     * Hide the loader
     */
    const hideLoader = useCallback(() => {
        setIsLoading(false);
        setLoadingMessage('');
    }, []);

    /**
     * Set loading state directly
     * @param {boolean} loading - Loading state
     * @param {string} message - Optional message
     */
    const setLoading = useCallback((loading, message = '') => {
        setIsLoading(loading);
        setLoadingMessage(message);
    }, []);

    // Context value - memoized to prevent unnecessary re-renders
    const value = {
        isLoading,
        loadingMessage,
        setLoading,
        showLoader,
        hideLoader
    };

    return (
        <LoadingContext.Provider value={value}>
            {children}
        </LoadingContext.Provider>
    );
};

/**
 * useLoading Hook
 * Custom hook to access loading context
 * @returns {Object} Loading context value
 */
export const useLoading = () => {
    const context = useContext(LoadingContext);
    
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    
    return context;
};

export default LoadingContext;
