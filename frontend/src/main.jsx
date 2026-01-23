/**
 * Main Entry Point
 * Initializes React app with Clerk authentication provider
 * 
 * IMPORTANT: You must set your Clerk publishable key in .env file
 * VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'

// Get Clerk publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Check if Clerk key is configured
if (!PUBLISHABLE_KEY) {
  console.error('❌ Missing Clerk Publishable Key!')
  console.log('Please add VITE_CLERK_PUBLISHABLE_KEY to your .env file')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ClerkProvider wraps the entire app for authentication */}
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
)