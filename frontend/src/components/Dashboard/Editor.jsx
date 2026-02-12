/**
 * Editor Component
 * Text editor for writing books with word prediction
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useLoading } from '../../context/LoadingContext';
import Loader from '../loading/Loading_book';
import { 
    ArrowLeft, Save, MoreVertical, Undo, Redo, Bold, Italic, 
    Underline, Strikethrough, Palette, Highlighter, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Download, Search,
    ChevronDown
} from 'lucide-react';
import './editor.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// IconButton Component
const IconButton = ({ children, onClick, className = '', active = false, title = '' }) => (
    <button 
        className={`icon-button ${className} ${active ? 'active' : ''}`}
        onClick={onClick}
        title={title}
        type="button"
    >
        {children}
    </button>
);

// WordPredictionPanel Component
const WordPredictionPanel = ({ onWordClick, predictions = [], isLoading = false }) => {
    const defaultPredictions = [
        
    ];

    const displayPredictions = predictions.length > 0 ? predictions : defaultPredictions;

    return (
        <div className="prediction-panel">
            <div className="panel-container">
                <div className="panel-content">
                    <div className="panel-header">
                        <div className="panel-title">
                            <h2>Predicted next words</h2>
                            <p>Click to insert at cursor</p>
                        </div>
                    </div>

                    <div className="words-grid">
                        {isLoading && (
                            <div className="prediction-loading">
                                <span>Thinking...</span>
                            </div>
                        )}
                        {!isLoading && displayPredictions.map((prediction) => (
                            <button
                                key={prediction.id}
                                onClick={() => onWordClick(prediction.word)}
                                className="word-card"
                            >
                                <div className="word-card-inner">
                                    <div className="word-card-content">
                                        <span className="word-rank">{prediction.rank}</span>
                                        <span className="word-text">{prediction.word}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// TextEditorPanel Component
const TextEditorPanel = ({ 
    editorRef, 
    content, 
    onContentChange, 
    wordCount, 
    charCount,
    lastSaved,
    onSave
}) => {
    const [fontSize, setFontSize] = useState('16px');
    const [fontFamily, setFontFamily] = useState('Georgia');
    const [showFontDropdown, setShowFontDropdown] = useState(false);

    const fonts = ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Inter', 'Roboto'];

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleFontChange = (font) => {
        setFontFamily(font);
        execCommand('fontName', font);
        setShowFontDropdown(false);
    };

    return (
        <div className="editor-panel">
            <div className="editor-container">
                <div className="editor-content">
                    
                    {/* Formatting Toolbar */}
                    <div className="toolbar-section">
                        
                        {/* First Row - Main Formatting */}
                        <div className="toolbar-row">
                            <div className="formatting-tools">
                                <IconButton onClick={() => execCommand('undo')} title="Undo">
                                    <Undo size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('redo')} title="Redo">
                                    <Redo size={16} />
                                </IconButton>
                                <div className="toolbar-divider" />
                                <IconButton onClick={() => execCommand('bold')} title="Bold">
                                    <Bold size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('italic')} title="Italic">
                                    <Italic size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('underline')} title="Underline">
                                    <Underline size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
                                    <Strikethrough size={16} />
                                </IconButton>
                            </div>

                            {/* Font Controls */}
                            <div className="font-controls">
                                <span className="font-label">Font</span>
                                <div className="font-selector" onClick={() => setShowFontDropdown(!showFontDropdown)}>
                                    <span className="font-name">{fontFamily}</span>
                                    <ChevronDown size={14} />
                                    {showFontDropdown && (
                                        <div className="font-dropdown">
                                            {fonts.map(font => (
                                                <div 
                                                    key={font} 
                                                    className="font-option"
                                                    style={{ fontFamily: font }}
                                                    onClick={() => handleFontChange(font)}
                                                >
                                                    {font}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Second Row - Color and Text Tools */}
                        <div className="toolbar-row-second">
                            <div className="color-tools">
                                <IconButton title="Text Color">
                                    <Palette size={16} />
                                </IconButton>
                                <span className="color-label">Color</span>
                                <div className="highlight-tools">
                                    <IconButton title="Highlight">
                                        <Highlighter size={16} />
                                    </IconButton>
                                    <span className="highlight-label">Highlight</span>
                                </div>
                            </div>

                            <div className="toolbar-group">
                                <IconButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                                    <List size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                                    <ListOrdered size={16} />
                                </IconButton>
                            </div>

                            <div className="toolbar-group">
                                <IconButton onClick={() => execCommand('justifyLeft')} title="Align Left">
                                    <AlignLeft size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('justifyCenter')} title="Align Center">
                                    <AlignCenter size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('justifyRight')} title="Align Right">
                                    <AlignRight size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('justifyFull')} title="Justify">
                                    <AlignJustify size={16} />
                                </IconButton>
                            </div>

                            <div className="toolbar-group">
                                <IconButton onClick={onSave} title="Save">
                                    <Save size={16} />
                                </IconButton>
                                <IconButton title="Download">
                                    <Download size={16} />
                                </IconButton>
                            </div>
                        </div>

                        {/* Bottom Row - Status and Stats */}
                        <div className="toolbar-row-bottom">
                            <IconButton title="Search">
                                <Search size={16} />
                            </IconButton>
                            
                            <div className="stats-display">
                                <span>{wordCount}</span>
                                <span>words •</span>
                                <span>{charCount}</span>
                                <span>chars</span>
                            </div>
                            
                            <span className="save-time">
                                {lastSaved ? `Saved ${lastSaved}` : 'Not saved yet'}
                            </span>
                        </div>
                    </div>

                    {/* A4 Document Editor */}
                    <div className="document-wrapper">
                        <div className="a4-page">
                            <div
                                ref={editorRef}
                                className="document-editor"
                                contentEditable
                                onInput={onContentChange}
                                suppressContentEditableWarning={true}
                                data-placeholder="Start writing your story..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Editor = () => {
    const navigate = useNavigate();
    const { id: bookId } = useParams();
    const { user, isLoaded, isSignedIn } = useUser();
    const { hideLoader } = useLoading();
    const editorRef = useRef(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Book data
    const [book, setBook] = useState(null);
    const [content, setContent] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [lastSaved, setLastSaved] = useState(null);

    // Word predictions
    const [predictions, setPredictions] = useState([]);
    const [isPredicting, setIsPredicting] = useState(false);

    // Auto-save timer
    const autoSaveTimerRef = useRef(null);
    
    // Prediction debounce timer
    const predictionTimerRef = useRef(null);

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
            setIsLoading(false);
            hideLoader();
        }
    }, [bookId, user?.id]);

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

    // Cleanup prediction timer on unmount
    useEffect(() => {
        return () => {
            if (predictionTimerRef.current) {
                clearTimeout(predictionTimerRef.current);
            }
        };
    }, []);

    const loadBook = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/books/${bookId}`);
            const data = await response.json();

            if (data.status === 'success') {
                setBook(data.book);
                setContent(data.book.content || '');
                // Set content in editor
                if (editorRef.current) {
                    editorRef.current.innerHTML = data.book.content || '';
                }
                updateCounts(data.book.content || '');
            } else {
                console.error('Failed to load book:', data.message);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Error loading book:', error);
            navigate('/dashboard');
        } finally {
            setIsLoading(false);
            hideLoader();
        }
    };

    const updateCounts = (text) => {
        const plainText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = plainText ? plainText.split(/\s+/).length : 0;
        const chars = plainText.length;
        setWordCount(words);
        setCharCount(chars);
    };

    // Fetch predictions from Cohere API
    const fetchPredictions = async (text) => {
        if (!text.trim()) {
            setPredictions([]);
            return;
        }

        try {
            setIsPredicting(true);
            const response = await fetch(`${API_URL}/api/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                setPredictions(data.predictions);
            }
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setIsPredicting(false);
        }
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            const htmlContent = editorRef.current.innerHTML;
            setContent(htmlContent);
            updateCounts(htmlContent);
            
            // Get plain text for predictions
            const plainText = editorRef.current.innerText.trim();
            
            // Debounce prediction API calls (500ms delay)
            if (predictionTimerRef.current) {
                clearTimeout(predictionTimerRef.current);
            }
            predictionTimerRef.current = setTimeout(() => {
                fetchPredictions(plainText);
            }, 500);
        }
    };

    const insertWordAtCursor = (word) => {
        if (!editorRef.current) return;
        
        editorRef.current.focus();
        
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            
            // Add space before and after if needed
            const textNode = document.createTextNode(word + ' ');
            range.insertNode(textNode);
            
            // Move cursor after inserted word
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);
            
            // Trigger content change
            handleContentChange();
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

            if (data.status === 'success') {
                const now = new Date();
                setLastSaved(now.toLocaleTimeString());
            } else {
                console.error('Failed to save:', data.message);
            }
        } catch (error) {
            console.error('Error saving book:', error);
        } finally {
            if (!isAutoSave) setIsSaving(false);
        }
    };

    const handleBack = async () => {
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
                <div className="logo-section">
                    <div className="logo">
                        <img src="/logo.svg" alt="logo" />
                    </div>
                    <span className="brand-name">Typen</span>
                </div>

                <div className="header-title-section">
                    <span className="header-title">Next-word prediction studio</span>
                </div>
                
                <div className="editor-title-section">
                    <h1 className="editor-title">{book?.title || 'Untitled'}</h1>
                    {/* <span className="editor-word-count">{wordCount} words</span> */}
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

            {/* Two Panel Layout */}
            <div className="panels-container">
                <WordPredictionPanel 
                    onWordClick={insertWordAtCursor}
                    predictions={predictions}
                    isLoading={isPredicting}
                />
                <TextEditorPanel 
                    editorRef={editorRef}
                    content={content}
                    onContentChange={handleContentChange}
                    wordCount={wordCount}
                    charCount={charCount}
                    lastSaved={lastSaved}
                    onSave={() => saveBook(false)}
                />
            </div>
        </div>
    );
};

export default Editor;
