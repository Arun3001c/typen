/**
 * GlobalLoader Component
 * Renders the Loading component when global loading state is true
 * This component should be placed at the root level of the app
 * 
 * Features:
 * - Listens to LoadingContext for loading state
 * - Smooth fade in/out transitions
 * - Prevents body scroll when loading
 */

import React, { useEffect } from 'react';
import { useLoading } from '../../context/LoadingContext';
import Loading from './Loading';

const GlobalLoader = () => {
    const { isLoading, loadingMessage } = useLoading();

    // Prevent body scroll when loading
    useEffect(() => {
        if (isLoading) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isLoading]);

    // Don't render if not loading
    if (!isLoading) {
        return null;
    }

    return <Loading fullScreen={true} message={loadingMessage} />;
};

export default GlobalLoader;
