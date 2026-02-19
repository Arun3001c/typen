/**
 * App Component
 * Main application component with React Router setup
 * Routes: Landing Page, Login, Dashboard
 * Includes global loading state management
 */

import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { GlobalLoader, Loading } from './components/loading';
import './styles/landingpage.css';

// Lazy load components for better performance
const LandingPage = lazy(() => import('./components/landingpage'));
const Login = lazy(() => import('./components/Login'));
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Editor = lazy(() => import('./components/Dashboard/Editor'));
const Profile = lazy(() => import('./components/Dashboard/profile'));
const Contact = lazy(() => import('./components/Contact'));

/**
 * RouteChangeHandler Component
 * Detects route changes and shows loading state during navigation
 */
const RouteChangeHandler = ({ children }) => {
    const location = useLocation();
    const { showLoader, hideLoader } = useLoading();
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        // Show loader briefly on route change
        setIsNavigating(true);
        showLoader();

        // Hide loader after a short delay to allow component to load
        const timer = setTimeout(() => {
            setIsNavigating(false);
            hideLoader();
        }, 300);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return children;
};

/**
 * AppRoutes Component
 * Contains all route definitions with Suspense for lazy loading
 */
const AppRoutes = () => {
    return (
        <Suspense fallback={<Loading fullScreen={true} />}>
            <RouteChangeHandler>
                <Routes>
                    {/* Landing Page - Home route */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Login/Signup Page - Clerk authentication */}
                    <Route path="/login" element={<Login />} />

                    {/* Dashboard - Protected route (after login) */}
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Editor - Protected route (after login) */}
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/editor/:id" element={<Editor />} />

                    {/* Profile - Protected route (after login) */}
                    <Route path="/profile" element={<Profile />} />

                    {/* Contact Page */}
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </RouteChangeHandler>
        </Suspense>
    );
};

/**
 * Main App Component
 * Wraps everything with necessary providers
 */
function App() {
    return (
        <LoadingProvider>
            {/* Global loader that responds to loading context */}
            <GlobalLoader />
            
            <Router>
                <AppRoutes />
            </Router>
        </LoadingProvider>
    );
}

export default App;