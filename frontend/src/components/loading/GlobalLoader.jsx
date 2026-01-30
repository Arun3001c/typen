/**
 * GlobalLoader Component
 * Renders the Loading component when global loading state is true
 * This component should be placed at the root level of the app
 * 
 * Features:
 * - Listens to LoadingContext for loading state
 * - Supports different loader types (pencil, book)
 * - Smooth fade in/out transitions
 * - Prevents body scroll when loading
 */

import React, { useEffect } from 'react';
import { useLoading, LOADER_TYPES } from '../../context/LoadingContext';
import Loading from './Loading';
import LoadingBook from './Loading_book';

const GlobalLoader = () => {
    const { isLoading, loadingMessage, loaderType } = useLoading();

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

    // Render the appropriate loader based on type
    if (loaderType === LOADER_TYPES.BOOK) {
        return <LoadingBook message={loadingMessage} />;
    }

    return <Loading fullScreen={true} message={loadingMessage} />;
};

export default GlobalLoader;
