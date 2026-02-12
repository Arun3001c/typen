/**
 * Login Component
 * Handles user authentication using Clerk
 * Shows Sign In / Sign Up UI powered by Clerk
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    SignIn, 
    SignUp, 
    useUser, 
    useAuth 
} from '@clerk/clerk-react';
import { useLoading } from '../context/LoadingContext';
import { Loading } from './loading';
import '../styles/login.css';

const Login = () => {
    // Hook for navigation
    const navigate = useNavigate();
    
    // Clerk hooks to check if user is signed in
    const { isSignedIn, user, isLoaded } = useUser();
    const { getToken } = useAuth();
    
    // Loading context for global loading state
    const { showLoader, hideLoader } = useLoading();

    // State to toggle between Sign In and Sign Up
    const [isSignUp, setIsSignUp] = React.useState(false);

    /**
     * Listen for hash changes to handle Clerk's internal Sign In/Sign Up links
     * This fixes the "Sign up" / "Sign in" links inside Clerk components
     */
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash.includes('sign-up')) {
                setIsSignUp(true);
            } else if (hash.includes('sign-in')) {
                setIsSignUp(false);
            }
        };

        // Check hash on mount
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    /**
     * When user signs in/up successfully, save their data to MongoDB
     * and redirect to dashboard
     */
    useEffect(() => {
        const saveUserToDatabase = async () => {
            if (isSignedIn && user) {
                // Show loading while saving user data
                showLoader('Setting up your account...');
                
                try {
                    // Prepare user data to send to backend
                    const userData = {
                        clerkUserId: user.id,
                        email: user.primaryEmailAddress?.emailAddress,
                        username: user.username || user.firstName || '',
                        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    };

                    // Send user data to Flask backend
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const response = await fetch(`${API_URL}/api/users/register`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData)
                    });

                    const result = await response.json();
                    
                    if (result.status === 'success') {
                        console.log('User saved to database:', result.message);
                    } else {
                        console.error('Error saving user:', result.message);
                    }
                } catch (error) {
                    console.error('Error connecting to backend:', error);
                } finally {
                    // Hide loader and redirect to dashboard
                    hideLoader();
                    navigate('/dashboard');
                }
            }
        };

        // Only run when user data is loaded and user is signed in
        if (isLoaded && isSignedIn) {
            saveUserToDatabase();
        }
    }, [isSignedIn, user, isLoaded, navigate, showLoader, hideLoader]);

    // Show loading state while Clerk is loading
    if (!isLoaded) {
        return <Loading fullScreen={true} message="" />;
    }

    return (
        <div className="login-container">
            {/* Back to Home Button */}
            <button 
                className="back-button"
                onClick={() => navigate('/')}
            >
                ← Back to Home
            </button>

            <div className="login-content">
                {/* Header */}
                <div className="login-header">
                    <h1 className="login-title">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="login-subtitle">
                        {isSignUp 
                            ? 'Sign up to start predicting your next words'
                            : 'Sign in to continue your journey'
                        }
                    </p>
                </div>

                {/* Clerk Authentication Component */}
                <div className="auth-wrapper">
                    {isSignUp ? (
                        <SignUp 
                            routing="hash"
                            afterSignUpUrl="/dashboard"
                            appearance={{
                                elements: {
                                    rootBox: 'clerk-root',
                                    card: 'clerk-card',
                                    formButtonPrimary: 'clerk-button',
                                    // Hide Clerk's built-in footer link (we use our own toggle)
                                    footer: { display: 'none' },
                                }
                            }}
                        />
                    ) : (
                        <SignIn 
                            routing="hash"
                            afterSignInUrl="/dashboard"
                            appearance={{
                                elements: {
                                    rootBox: 'clerk-root',
                                    card: 'clerk-card',
                                    formButtonPrimary: 'clerk-button',
                                    // Hide Clerk's built-in footer link (we use our own toggle)
                                    footer: { display: 'none' },
                                }
                            }}
                        />
                    )}
                </div>

                {/* Toggle between Sign In and Sign Up */}
                <div className="auth-toggle">
                    <p>
                        {isSignUp 
                            ? 'Already have an account?' 
                            : "Don't have an account?"
                        }
                        <button 
                            className="toggle-button"
                            onClick={() => setIsSignUp(!isSignUp)}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
