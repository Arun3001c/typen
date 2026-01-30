/**
 * Dashboard Component
 * My Drafts Library - Shows user's saved documents
 * Fetches books from database and allows creating new ones
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useLoading, LOADER_TYPES } from '../../context/LoadingContext';
import { Loading } from '../loading';
import { X, Image, Edit2, Trash2, MoreVertical, Star } from 'lucide-react';
import '../../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// New Document Modal Component
const NewDocumentModal = ({ isOpen, onClose, onSubmit, isSubmitting, editingBook = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        genre: '',
        coverImage: ''
    });
    const [imagePreview, setImagePreview] = useState(null);

    // Populate form when editing
    useEffect(() => {
        if (editingBook) {
            setFormData({
                title: editingBook.title || '',
                description: editingBook.description || '',
                genre: editingBook.genre || '',
                coverImage: editingBook.coverImage || ''
            });
            setImagePreview(editingBook.coverImage || null);
        } else {
            setFormData({ title: '', description: '', genre: '', coverImage: '' });
            setImagePreview(null);
        }
    }, [editingBook, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size must be less than 5MB');
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, coverImage: reader.result }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('Please enter a book title');
            return;
        }
        onSubmit(formData);
    };

    const handleClose = () => {
        setFormData({ title: '', description: '', genre: '', coverImage: '' });
        setImagePreview(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{editingBook ? 'Edit Book Details' : 'Create New Book'}</h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="modal-body-layout">
                        {/* Left side - Cover Image Upload */}
                        <div className="cover-section">
                            <div className="cover-upload-area">
                                {imagePreview ? (
                                    <div className="cover-preview">
                                        <img src={imagePreview} alt="Cover preview" />
                                        <button 
                                            type="button" 
                                            className="remove-cover-btn"
                                            onClick={() => {
                                                setImagePreview(null);
                                                setFormData(prev => ({ ...prev, coverImage: '' }));
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cover-upload-btn">
                                        <Image size={24} />
                                        <span>Add Cover</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            hidden
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Right side - Form Fields */}
                        <div className="form-fields-section">
                            {/* Book Title */}
                            <div className="form-group">
                                <label className="form-label">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="Your book title"
                                    required
                                />
                            </div>

                            {/* Genre */}
                            <div className="form-group">
                                <label className="form-label">Genre</label>
                                <select
                                    name="genre"
                                    value={formData.genre}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="">Select genre</option>
                                    <option value="fiction">Fiction</option>
                                    <option value="non-fiction">Non-Fiction</option>
                                    <option value="mystery">Mystery</option>
                                    <option value="romance">Romance</option>
                                    <option value="sci-fi">Science Fiction</option>
                                    <option value="fantasy">Fantasy</option>
                                    <option value="thriller">Thriller</option>
                                    <option value="horror">Horror</option>
                                    <option value="biography">Biography</option>
                                    <option value="self-help">Self-Help</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    placeholder="Brief description..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? (editingBook ? 'Saving...' : 'Creating...') : (editingBook ? 'Save Changes' : 'Start Writing')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const { showLoader, hideLoader } = useLoading();

    // State for active tab
    const [activeTab, setActiveTab] = useState('all');
    
    // State for search
    const [searchQuery, setSearchQuery] = useState('');

    // State for books from database
    const [books, setBooks] = useState([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);

    // State for new document modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    // State for book menu dropdown
    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
        }
    }, [isLoaded, isSignedIn, navigate]);

    // Fetch books from database when component mounts or tab changes
    useEffect(() => {
        if (user?.id) {
            fetchBooks();
        }
    }, [user?.id, activeTab]);

    // Refetch books when page becomes visible (returning from editor)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user?.id) {
                fetchBooks();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user?.id, activeTab]);

    const fetchBooks = async () => {
        try {
            setIsLoadingBooks(true);
            let url = `${API_URL}/api/books/user/${user.id}?archived=false`;
            
            // Apply tab filters
            if (activeTab === 'favorites') {
                url += '&favorite=true';
            } else if (activeTab === 'archive') {
                url = `${API_URL}/api/books/user/${user.id}?archived=true`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'success') {
                setBooks(data.books);
            } else {
                console.error('Failed to fetch books:', data.message);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setIsLoadingBooks(false);
        }
    };

    // Handle sign out
    const handleSignOut = async () => {
        showLoader('Signing out...');
        await signOut();
        hideLoader();
        navigate('/');
    };

    // Handle new document creation
    const handleNewDocument = () => {
        setIsModalOpen(true);
    };

    // Handle form submission for new book
    const handleCreateBook = async (formData) => {
        setIsSubmitting(true);
        try {
            // If editing, update the book
            if (editingBook) {
                const response = await fetch(`${API_URL}/api/books/${editingBook.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: formData.title,
                        description: formData.description,
                        genre: formData.genre,
                        coverImage: formData.coverImage
                    }),
                });

                const data = await response.json();

                if (data.status === 'success') {
                    setIsModalOpen(false);
                    setEditingBook(null);
                    fetchBooks(); // Refresh the list
                } else {
                    alert('Failed to update book: ' + data.message);
                }
            } else {
                // Create new book
                const response = await fetch(`${API_URL}/api/books`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        title: formData.title,
                        description: formData.description,
                        genre: formData.genre,
                        coverImage: formData.coverImage
                    }),
                });

                const data = await response.json();

                if (data.status === 'success') {
                    setIsModalOpen(false);
                    // Show book loader before navigating to editor
                    showLoader('Opening your book...', LOADER_TYPES.BOOK);
                    // Navigate to editor with the new book ID
                    navigate(`/editor/${data.book.id}`);
                } else {
                    alert('Failed to create book: ' + data.message);
                }
            }
        } catch (error) {
            console.error('Error saving book:', error);
            alert('Failed to save book. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle edit book
    const handleEditBook = (book, e) => {
        e.stopPropagation();
        setOpenMenuId(null);
        setEditingBook(book);
        setIsModalOpen(true);
    };

    // Handle toggle favorite
    const handleToggleFavorite = async (book, e) => {
        e.stopPropagation();
        setOpenMenuId(null);
        
        try {
            const response = await fetch(`${API_URL}/api/books/${book.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isFavorite: !book.isFavorite
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                fetchBooks(); // Refresh the list
            } else {
                alert('Failed to update favorite status');
            }
        } catch (error) {
            console.error('Error updating favorite:', error);
            alert('Failed to update favorite status');
        }
    };

    // Handle delete book
    const handleDeleteBook = async (bookId, e) => {
        e.stopPropagation();
        setOpenMenuId(null);
        
        if (!window.confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/books/${bookId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.status === 'success') {
                fetchBooks(); // Refresh the list
            } else {
                alert('Failed to delete book: ' + data.message);
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book. Please try again.');
        }
    };

    // Toggle book menu
    const handleToggleMenu = (bookId, e) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === bookId ? null : bookId);
    };

    // Handle opening existing book
    const handleOpenBook = (bookId) => {
        showLoader('Opening your book...', LOADER_TYPES.BOOK);
        navigate(`/editor/${bookId}`);
    };

    // Format time ago
    const formatTimeAgo = (dateString) => {
        if (!dateString) return 'Just now';
        
        // Parse the ISO date string - ensure it's treated as UTC
        // MongoDB returns ISO strings without 'Z' suffix, so we need to append it
        let normalizedDateString = dateString;
        if (!dateString.endsWith('Z') && !dateString.includes('+')) {
            normalizedDateString = dateString + 'Z';
        }
        
        const date = new Date(normalizedDateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) return 'Just now';
        
        const now = Date.now();
        const diffMs = now - date.getTime();
        
        // Handle future dates or very recent (less than 1 minute)
        if (diffMs < 0 || diffMs < 60000) return 'Just now';
        
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    // Filter books by search query
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show loading state
    if (!isLoaded) {
        return <Loading fullScreen={true} message="Loading your drafts..." />;
    }

    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="dashboard">
            {/* Top Navigation Bar */}
            <header className="dashboard-header">
                <div className="header-content">
                    {/* <button className="icon-btn menu-btn">
                        <span className="material-icon">☰</span>
                    </button> */}
                    <h1 className="header-title">My Drafts</h1>
                    <button className="icon-btn profile-btn" onClick={() => navigate('/profile')}>
                        <img 
                            src={user?.imageUrl || '/default-avatar.png'} 
                            alt="Profile" 
                            className="profile-avatar"
                        />
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Search Bar */}
                <div className="search-container">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search your stories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Drafts
                        </button>
                        <button 
                            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recent')}
                        >
                            Recent
                        </button>
                        <button 
                            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            Favorites
                        </button>
                        {/* <button 
                            className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
                            onClick={() => setActiveTab('archive')}
                        >
                            Archive
                        </button> */}
                    </div>
                </div>

                {/* Document Grid */}
                <div className="drafts-grid">
                    {/* New Document Button */}
                    <div className="new-doc-card" onClick={handleNewDocument}>
                        <div className="new-doc-icon">
                            <span>+</span>
                        </div>
                        <p className="new-doc-text">New Document</p>
                    </div>

                    {/* Loading State - Show Loading Animation */}
                    {isLoadingBooks && (
                        <div className="loading-books-container">
                            <Loading fullScreen={false} />
                        </div>
                    )}

                    {/* Draft Cards from Database */}
                    {!isLoadingBooks && filteredBooks.map((book) => (
                        <div 
                            key={book.id} 
                            className="draft-card"
                            onClick={() => handleOpenBook(book.id)}
                        >
                            <div 
                                className="draft-image"
                                style={{ 
                                    backgroundImage: book.coverImage 
                                        ? `linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.4)), url("${book.coverImage}")` 
                                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                <div className="draft-menu-wrapper" ref={openMenuId === book.id ? menuRef : null}>
                                    <button 
                                        className="draft-menu-btn"
                                        onClick={(e) => handleToggleMenu(book.id, e)}
                                    >
                                        <MoreVertical size={18} />
                                    </button>
                                    {openMenuId === book.id && (
                                        <div className="draft-menu-dropdown">
                                            <button 
                                                className="menu-option"
                                                onClick={(e) => handleEditBook(book, e)}
                                            >
                                                <Edit2 size={16} />
                                                <span>Edit Details</span>
                                            </button>
                                            <button 
                                                className={`menu-option ${book.isFavorite ? 'menu-option-active' : ''}`}
                                                onClick={(e) => handleToggleFavorite(book, e)}
                                            >
                                                <Star size={16} fill={book.isFavorite ? 'currentColor' : 'none'} />
                                                <span>{book.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                                            </button>
                                            <button 
                                                className="menu-option menu-option-danger"
                                                onClick={(e) => handleDeleteBook(book.id, e)}
                                            >
                                                <Trash2 size={16} />
                                                <span>Delete Book</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {book.isFavorite && (
                                    <span className="favorite-badge">⭐</span>
                                )}
                            </div>
                            <div className="draft-info">
                                <h3 className="draft-title">{book.title}</h3>
                                <p className="draft-preview">
                                    {book.description || 'No description yet...'}
                                </p>
                                <p className="draft-time">
                                    {book.wordCount > 0 && `${book.wordCount} words • `}
                                    Edited {formatTimeAgo(book.updatedAt)}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {!isLoadingBooks && filteredBooks.length === 0 && (
                        <div className="empty-state">
                            <p>No books found. Create your first book!</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="bottom-nav">
                <button className="nav-item active">
                    <span className="nav-icon">📄</span>
                    <span className="nav-label">Library</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/editor')}>
                    <span className="nav-icon">✏️</span>
                    <span className="nav-label">Writing Lab</span>
                </button>
                {/* <button className="nav-item">
                    <span className="nav-icon">✨</span>
                    <span className="nav-label">AI Assistant</span>
                </button> */}
                <button className="nav-item" onClick={handleSignOut}>
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Settings</span>
                </button>
            </nav>

            {/* Floating Action Button */}
            <button className="fab" onClick={handleNewDocument}>
                <span>+</span>
            </button>

            {/* New Document Modal */}
            <NewDocumentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBook(null);
                }}
                onSubmit={handleCreateBook}
                isSubmitting={isSubmitting}
                editingBook={editingBook}
            />
        </div>
    );
};

export default Dashboard;
