/**
 * useAsyncLoading Hook
 * Custom hook for handling async operations with automatic loading state
 * 
 * Usage:
 * const { execute, isLoading } = useAsyncLoading();
 * 
 * // In your component:
 * const handleSubmit = async () => {
 *     await execute(async () => {
 *         await api.submitData(data);
 *     }, 'Submitting...');
 * };
 */

import { useState, useCallback } from 'react';
import { useLoading } from '../context/LoadingContext';

/**
 * useAsyncLoading Hook
 * @param {boolean} useGlobalLoader - Whether to use global loader (default: true)
 * @returns {Object} - { execute, isLoading, error }
 */
export const useAsyncLoading = (useGlobalLoader = true) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showLoader, hideLoader } = useLoading();

    /**
     * Execute an async function with loading state
     * @param {Function} asyncFn - The async function to execute
     * @param {string} message - Optional loading message
     * @returns {Promise} - Result of the async function
     */
    const execute = useCallback(async (asyncFn, message = '') => {
        try {
            setError(null);
            setIsLoading(true);
            
            if (useGlobalLoader) {
                showLoader(message);
            }

            const result = await asyncFn();
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
            
            if (useGlobalLoader) {
                hideLoader();
            }
        }
    }, [useGlobalLoader, showLoader, hideLoader]);

    return {
        execute,
        isLoading,
        error,
        clearError: () => setError(null)
    };
};

export default useAsyncLoading;
