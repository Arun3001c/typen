/**
 * Profile Component
 * User profile management for Typen application
 * Uses Clerk for authentication
 */

import React, { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Edit2, 
  Save, 
  X, 
  Camera,
  ArrowLeft,
  LogOut,
  Trash2
} from 'lucide-react';
import './profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
  });

  // Update form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update first name and last name
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      // Update username separately (Clerk requires this)
      if (formData.username && formData.username !== user.username) {
        try {
          await user.update({
            username: formData.username,
          });
        } catch (usernameError) {
          console.error('Failed to update username:', usernameError);
          // Username might already be taken or not enabled in Clerk
          alert('Username update failed. It may already be taken or username feature is not enabled in your Clerk settings.');
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile: ' + (error.errors?.[0]?.message || error.message || 'Please try again.'));
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
    });
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      await user.setProfileImage({ file });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await user.delete();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="profile-container">
        <div className="profile-loading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="profile-title">Profile Settings</h1>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          {/* Avatar Section */}
          <div className="avatar-section">
            <div className="avatar-container">
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="avatar-image"
                />
              ) : (
                <div className="avatar-placeholder">
                  <User size={48} />
                </div>
              )}
              <label className="avatar-upload-btn">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
            </div>
            <div className="avatar-info">
              <h2 className="user-name">
                {user.firstName} {user.lastName}
              </h2>
              <p className="user-email">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="form-header">
              <h3>Personal Information</h3>
              {!isEditing ? (
                <button className="edit-btn" onClick={() => setIsEditing(true)}>
                  <Edit2 size={16} />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-btn" onClick={handleCancel}>
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button 
                    className="save-btn" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter last name"
                />
              </div>

              {/* <div className="form-group">
                <label className="form-label">
                  <User size={16} />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="form-input"
                  placeholder="Enter username"
                />
              </div> */}

              <div className="form-group">
                <label className="form-label">
                  <Mail size={16} />
                  Email
                </label>
                <input
                  type="email"
                  value={user.primaryEmailAddress?.emailAddress || ''}
                  disabled
                  className="form-input disabled"
                  placeholder="Email address"
                />
                <span className="form-hint">Email cannot be changed here</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="account-actions">
            <button className="signout-btn" onClick={handleSignOut}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
            <button className="delete-btn" onClick={handleDeleteAccount}>
              <Trash2 size={18} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
