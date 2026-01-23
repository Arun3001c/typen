/**
 * App Component
 * Main application component with React Router setup
 * Routes: Landing Page, Login, Dashboard
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/landingpage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './styles/landingpage.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Home route */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Login/Signup Page - Clerk authentication */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard - Protected route (after login) */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;