/**
 * Dashboard Component
 * Main dashboard page shown after successful login
 * Contains the Next Word Prediction interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import '../styles/dashboard.css';

const Dashboard = () => {
    // Navigation hook
    const navigate = useNavigate();
    
    // Clerk hooks for user data and sign out
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();

    // State for the typing input
    const [inputText, setInputText] = useState('');
    const [predictions, setPredictions] = useState([]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
        }
    }, [isLoaded, isSignedIn, navigate]);

    /**
     * Handle sign out
     * Signs user out of Clerk and redirects to home
     */
    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    /**
     * Handle input change
     * In future, this will trigger word predictions
     */
    const handleInputChange = (e) => {
        setInputText(e.target.value);
        
        // TODO: Implement actual prediction API call
        // For now, show placeholder predictions
        if (e.target.value.length > 0) {
            setPredictions(['the', 'and', 'to', 'is', 'in']);
        } else {
            setPredictions([]);
        }
    };

    /**
     * Handle prediction click
     * Appends selected word to input
     */
    const handlePredictionClick = (word) => {
        setInputText(prevText => prevText + ' ' + word);
        setPredictions([]);
    };

    // Show loading while checking authentication
    if (!isLoaded) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not signed in
    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="dashboard-container">
            {/* Navigation Bar */}
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <span className="logo-icon">⌨️</span>
                    <span className="logo-text">NextWord</span>
                </div>
                <div className="nav-right">
                    {/* User Profile Section */}
                    <div className="user-profile">
                        <img 
                            src={user?.imageUrl || '/default-avatar.png'} 
                            alt="Profile" 
                            className="profile-image"
                        />
                        <span className="user-name">
                            {user?.firstName || user?.username || 'User'}
                        </span>
                    </div>
                    <button 
                        className="sign-out-btn"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        Welcome, {user?.firstName || 'User'}! 👋
                    </h1>
                    <p className="welcome-subtitle">
                        Start typing below and watch the AI predict your next words
                    </p>
                </div>

                {/* Typing Area */}
                <div className="typing-section">
                    <div className="typing-card">
                        <h2 className="card-title">Start Typing</h2>
                        
                        {/* Text Input Area */}
                        <textarea
                            className="typing-input"
                            placeholder="Type something here..."
                            value={inputText}
                            onChange={handleInputChange}
                            rows={6}
                        />

                        {/* Word Predictions */}
                        {predictions.length > 0 && (
                            <div className="predictions-section">
                                <p className="predictions-label">Suggested words:</p>
                                <div className="predictions-list">
                                    {predictions.map((word, index) => (
                                        <button
                                            key={index}
                                            className="prediction-btn"
                                            onClick={() => handlePredictionClick(word)}
                                        >
                                            {word}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Word Count */}
                        <div className="word-count">
                            Words: {inputText.trim() ? inputText.trim().split(/\s+/).length : 0}
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="stats-section">
                    <div className="stat-card">
                        <div className="stat-icon">📝</div>
                        <div className="stat-info">
                            <h3>Words Typed</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎯</div>
                        <div className="stat-info">
                            <h3>Predictions Used</h3>
                            <p className="stat-value">0</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚡</div>
                        <div className="stat-info">
                            <h3>Accuracy</h3>
                            <p className="stat-value">--%</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="dashboard-footer">
                <p>© 2026 NextWord Prediction. Happy typing!</p>
            </footer>
        </div>
    );
};

export default Dashboard;
