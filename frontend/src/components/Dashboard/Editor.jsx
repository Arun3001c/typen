/**
 * Editor Component
 * Text editor for writing books with word prediction
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Loader from '../loading/Loading_book';
import { ArrowLeft, Save, MoreVertical } from 'lucide-react';
import './editor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Editor = () => {
    const navigate = useNavigate();
    const { id: bookId } = useParams();
    const { user, isLoaded, isSignedIn } = useUser();
    const textareaRef = useRef(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Book data
    const [book, setBook] = useState(null);
    const [content, setContent] = useState('');
    const [wordCount, setWordCount] = useState(0);

    // Auto-save timer
    const autoSaveTimerRef = useRef(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
        }
    }, [isLoaded, isSignedIn, navigate]);

    // Load book data
    useEffect(() => {
        if (bookId && user?.id) {
            loadBook();
        } else if (!bookId) {
            // New document without ID
            setIsLoading(false);
        }
    }, [bookId, user?.id]);

    // Calculate word count
    useEffect(() => {
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        setWordCount(words);
    }, [content]);

    // Auto-save after 2 seconds of inactivity
    useEffect(() => {
        if (bookId && content && !isLoading) {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
            autoSaveTimerRef.current = setTimeout(() => {
                saveBook(true);
            }, 2000);
        }

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [content]);

    const loadBook = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/books/${bookId}`);
            const data = await response.json();

            if (data.status === 'success') {
                setBook(data.book);
                setContent(data.book.content || '');
            } else {
                console.error('Failed to load book:', data.message);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error loading book:', error);
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };

    const saveBook = async (isAutoSave = false) => {
        if (!bookId || isSaving) return;

        try {
            if (!isAutoSave) setIsSaving(true);

            const response = await fetch(`${API_URL}/api/books/${bookId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    wordCount,
                }),
            });

            const data = await response.json();

            if (data.status !== 'success') {
                console.error('Failed to save:', data.message);
            }
        } catch (error) {
            console.error('Error saving book:', error);
        } finally {
            if (!isAutoSave) setIsSaving(false);
        }
    };

    const handleBack = async () => {
        // Save before leaving
        if (bookId && content) {
            await saveBook();
        }
        navigate('/dashboard');
    };

    // Show loading animation
    if (!isLoaded || isLoading) {
        return (
            <div className="editor-loading">
                <Loader />
                <p className="loading-text">Loading your book...</p>
            </div>
        );
    }

    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="editor">
            {/* Header */}
            <header className="editor-header">
                <button className="editor-back-btn" onClick={handleBack}>
                    <ArrowLeft size={20} />
                </button>
                <div className="editor-title-section">
                    <h1 className="editor-title">{book?.title || 'Untitled'}</h1>
                    <span className="editor-word-count">{wordCount} words</span>
                </div>
                <div className="editor-actions">
                    <button 
                        className="editor-save-btn" 
                        onClick={() => saveBook(false)}
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button className="editor-menu-btn">
                        <MoreVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Editor Content */}
            <main className="editor-main">
                <textarea
                    ref={textareaRef}
                    className="editor-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Start writing your story..."
                    autoFocus
                />
            </main>
        </div>
    );
};

export default Editor;
