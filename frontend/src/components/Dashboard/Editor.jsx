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
    ChevronDown, ChevronLeft, ChevronRight, Clock, FileText, Type, Hash,
    Sparkles, Wand2, Expand, Shrink, MessageSquare, BookOpen, Gauge,
    Focus, Eye, CheckCircle, BarChart3, Zap, AlertCircle, RefreshCw
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
const WordPredictionPanel = ({ 
    onWordClick, 
    predictions = [], 
    isLoading = false,
    isCollapsed,
    onToggleCollapse,
    onRegenerate
}) => {
    // Separate probable and creative predictions
    const probablePredictions = predictions.filter(p => p.type === 'probable' || !p.type);
    const creativePredictions = predictions.filter(p => p.type === 'creative');

    if (isCollapsed) {
        return (
            <div className="prediction-panel collapsed">
                <button className="panel-toggle" onClick={onToggleCollapse} title="Expand Predictions">
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="prediction-panel">
            <div className="panel-header-bar">
                <h3>Word Predictions</h3>
                <div className="panel-header-actions">
                    <button className="regenerate-btn" onClick={onRegenerate} title="Regenerate predictions" disabled={isLoading}>
                        <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
                    </button>
                    <button className="panel-toggle" onClick={onToggleCollapse} title="Collapse Panel">
                        <ChevronLeft size={18} />
                    </button>
                </div>
            </div>

            <div className="panel-container">
                <div className="panel-content">
                    {/* Probable Words Section */}
                    <div className="prediction-section">
                        <div className="section-header">
                            <Zap size={14} />
                            <span>Predicted Words</span>
                        </div>
                        <p className="section-subtitle">Click to insert at cursor</p>

                        <div className="words-grid">
                            {isLoading && (
                                <div className="prediction-loading">
                                    <span>Thinking...</span>
                                </div>
                            )}
                            {!isLoading && probablePredictions.map((prediction) => (
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

                    {/* Creative Words Section */}
                    {!isLoading && creativePredictions.length > 0 && (
                        <div className="prediction-section creative-section">
                            <div className="section-header">
                                <Sparkles size={14} />
                                <span>Creative Alternatives</span>
                            </div>
                            <p className="section-subtitle">For more expressive writing</p>

                            <div className="words-grid creative-grid">
                                {creativePredictions.map((prediction) => (
                                    <button
                                        key={prediction.id}
                                        onClick={() => onWordClick(prediction.word)}
                                        className="word-card creative-card"
                                    >
                                        <div className="word-card-inner">
                                            <div className="word-card-content">
                                                <span className="word-rank creative-rank">{prediction.rank}</span>
                                                <span className="word-text">{prediction.word}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
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
                        {/* <div className="toolbar-row-bottom">
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
                        </div> */}
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

// WritingRibbon Component - Professional writing utility panel
const WritingRibbon = ({
    isCollapsed,
    onToggleCollapse,
    wordCount,
    charCount,
    content,
    genre,
    onGenreChange,
    onToneChange,
    tone,
    focusMode,
    onFocusModeToggle,
    autoSaveStatus,
    onAIAction,
    lastSaved
}) => {
    const [writingIntensity, setWritingIntensity] = useState(50);

    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.ceil(wordCount / 200) || 1;

    // Calculate paragraph count
    const paragraphCount = content 
        ? content.replace(/<[^>]*>/g, '\n').split(/\n\s*\n/).filter(p => p.trim()).length 
        : 0;

    // Calculate sentence count (rough estimate)
    const plainText = content ? content.replace(/<[^>]*>/g, ' ') : '';
    const sentenceCount = plainText.split(/[.!?]+/).filter(s => s.trim()).length;

    // Vocabulary richness (unique words / total words)
    const words = plainText.toLowerCase().match(/\b[a-z]+\b/g) || [];
    const uniqueWords = new Set(words).size;
    const vocabRichness = words.length > 0 ? Math.round((uniqueWords / words.length) * 100) : 0;

    // Average sentence length
    const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;

    // Passive voice detection (simple heuristic)
    const passivePatterns = /\b(was|were|been|being|is|are|am)\s+\w+ed\b/gi;
    const passiveCount = (plainText.match(passivePatterns) || []).length;
    const passivePercentage = sentenceCount > 0 ? Math.round((passiveCount / sentenceCount) * 100) : 0;

    const genres = [
        'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 
        'Fantasy', 'Thriller', 'Horror', 'Biography', 'Self-Help'
    ];

    const tones = [
        'Neutral', 'Formal', 'Casual', 'Dramatic', 'Humorous', 
        'Poetic', 'Suspenseful', 'Romantic'
    ];

    if (isCollapsed) {
        return (
            <div className="writing-ribbon collapsed">
                <button className="ribbon-toggle" onClick={onToggleCollapse} title="Expand Panel">
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className="writing-ribbon">
            <div className="ribbon-header">
                <h3>Writing Tools</h3>
                <button className="ribbon-toggle" onClick={onToggleCollapse} title="Collapse Panel">
                    <ChevronLeft size={18} />
                </button>
            </div>

            <div className="ribbon-content">
                {/* Writing Stats Section */}
                <div className="ribbon-section">
                    <div className="section-header">
                        <FileText size={14} />
                        <span>Document Stats</span>
                    </div>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-value">{wordCount}</span>
                            <span className="stat-label">Words</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{charCount}</span>
                            <span className="stat-label">Chars</span>
                        </div>
                    </div>
                    <div className="saved-time-row">
                        <CheckCircle size={12} className={autoSaveStatus === 'saved' ? 'saved' : ''} />
                        <span className="saved-label">Last saved:</span>
                        <span className="saved-value">{lastSaved || 'Not saved'}</span>
                    </div>
                </div>

                {/* AI Assistance Section */}
                {/* <div className="ribbon-section">
                    <div className="section-header">
                        <Sparkles size={14} />
                        <span>AI Assistance</span>
                    </div>
                    <div className="ai-buttons">
                        <button className="ai-btn" onClick={() => onAIAction('regenerate')} title="Regenerate suggestions">
                            <RefreshCw size={14} />
                            <span>Regenerate</span>
                        </button>
                        <button className="ai-btn" onClick={() => onAIAction('improve')} title="Improve sentence">
                            <Wand2 size={14} />
                            <span>Improve</span>
                        </button>
                        <button className="ai-btn" onClick={() => onAIAction('expand')} title="Expand paragraph">
                            <Expand size={14} />
                            <span>Expand</span>
                        </button>
                        <button className="ai-btn" onClick={() => onAIAction('shorten')} title="Shorten paragraph">
                            <Shrink size={14} />
                            <span>Shorten</span>
                        </button>
                        <button className="ai-btn" onClick={() => onAIAction('tone')} title="Change tone">
                            <MessageSquare size={14} />
                            <span>Change Tone</span>
                        </button>
                    </div>
                </div> */}

                {/* Genre & Style Section */}
                <div className="ribbon-section">
                    <div className="section-header">
                        <BookOpen size={14} />
                        <span>Genre & Style</span>
                    </div>
                    <div className="style-controls">
                        <div className="control-group">
                            <label>Genre</label>
                            <select value={genre} onChange={(e) => onGenreChange(e.target.value)}>
                                {genres.map(g => (
                                    <option key={g} value={g.toLowerCase()}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Tone</label>
                            <select value={tone} onChange={(e) => onToneChange(e.target.value)}>
                                {tones.map(t => (
                                    <option key={t} value={t.toLowerCase()}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Intensity</label>
                            <div className="slider-container">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={writingIntensity}
                                    onChange={(e) => setWritingIntensity(e.target.value)}
                                />
                                <span className="slider-value">{writingIntensity}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Productivity Section */}
                <div className="ribbon-section">
                    <div className="section-header">
                        <Zap size={14} />
                        <span>Productivity</span>
                    </div>
                    <div className="productivity-controls">
                        <button 
                            className={`toggle-btn ${focusMode ? 'active' : ''}`}
                            onClick={onFocusModeToggle}
                        >
                            <Focus size={14} />
                            <span>Focus Mode</span>
                        </button>
                        <div className="auto-save-status">
                            <CheckCircle size={14} className={autoSaveStatus === 'saved' ? 'saved' : ''} />
                            <span>{autoSaveStatus === 'saved' ? 'Auto-saved' : 'Saving...'}</span>
                        </div>
                    </div>
                </div>

                {/* Document Insights Section */}
                <div className="ribbon-section">
                    <div className="section-header">
                        <BarChart3 size={14} />
                        <span>Document Insights</span>
                    </div>
                    <div className="insights-list">
                        <div className="insight-item">
                            <div className="insight-header">
                                <span>Vocabulary Richness</span>
                                <span className={`insight-value ${vocabRichness > 60 ? 'good' : vocabRichness > 40 ? 'medium' : 'low'}`}>
                                    {vocabRichness}%
                                </span>
                            </div>
                            <div className="insight-bar">
                                <div className="insight-fill" style={{ width: `${vocabRichness}%` }}></div>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-header">
                                <span>Avg Sentence Length</span>
                                <span className={`insight-value ${avgSentenceLength > 10 && avgSentenceLength < 20 ? 'good' : 'medium'}`}>
                                    {avgSentenceLength} words
                                </span>
                            </div>
                            <div className="insight-bar">
                                <div className="insight-fill" style={{ width: `${Math.min(avgSentenceLength * 4, 100)}%` }}></div>
                            </div>
                        </div>
                        <div className="insight-item">
                            <div className="insight-header">
                                <span>Passive Voice</span>
                                <span className={`insight-value ${passivePercentage < 10 ? 'good' : passivePercentage < 20 ? 'medium' : 'low'}`}>
                                    {passivePercentage}%
                                </span>
                            </div>
                            <div className="insight-bar warning">
                                <div className="insight-fill" style={{ width: `${passivePercentage}%` }}></div>
                            </div>
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

    // Panel collapse states
    const [isPredictionCollapsed, setIsPredictionCollapsed] = useState(false);
    const [isRibbonCollapsed, setIsRibbonCollapsed] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState('fiction');
    const [selectedTone, setSelectedTone] = useState('neutral');
    const [focusMode, setFocusMode] = useState(false);
    const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

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
                // Set genre from book if available
                if (data.book.genre) {
                    setSelectedGenre(data.book.genre);
                }
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
                body: JSON.stringify({ 
                    text,
                    genre: book?.genre || 'fiction'
                }),
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
            if (isAutoSave) setAutoSaveStatus('saving');

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
                setAutoSaveStatus('saved');
            } else {
                console.error('Failed to save:', data.message);
                setAutoSaveStatus('error');
            }
        } catch (error) {
            console.error('Error saving book:', error);
            setAutoSaveStatus('error');
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

    // Handle AI assistance actions
    const handleAIAction = async (action) => {
        const plainText = editorRef.current?.innerText?.trim() || '';
        if (!plainText && action !== 'regenerate') {
            alert('Please write some text first');
            return;
        }

        // For now, just trigger new predictions
        // TODO: Implement specific AI actions (improve, expand, shorten, tone)
        if (action === 'regenerate') {
            fetchPredictions(plainText);
        } else {
            console.log(`AI Action: ${action}`, plainText.slice(-100));
            // Placeholder for future AI features
            alert(`${action.charAt(0).toUpperCase() + action.slice(1)} feature coming soon!`);
        }
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
        <div className={`editor ${focusMode ? 'focus-mode' : ''}`}>
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
                <WritingRibbon
                    isCollapsed={isRibbonCollapsed}
                    onToggleCollapse={() => setIsRibbonCollapsed(!isRibbonCollapsed)}
                    wordCount={wordCount}
                    charCount={charCount}
                    content={content}
                    genre={selectedGenre}
                    onGenreChange={setSelectedGenre}
                    tone={selectedTone}
                    onToneChange={setSelectedTone}
                    focusMode={focusMode}
                    onFocusModeToggle={() => setFocusMode(!focusMode)}
                    autoSaveStatus={autoSaveStatus}
                    onAIAction={handleAIAction}
                    lastSaved={lastSaved}
                />
                <WordPredictionPanel 
                    onWordClick={insertWordAtCursor}
                    predictions={predictions}
                    isLoading={isPredicting}
                    isCollapsed={isPredictionCollapsed}
                    onToggleCollapse={() => setIsPredictionCollapsed(!isPredictionCollapsed)}
                    onRegenerate={() => handleAIAction('regenerate')}
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
