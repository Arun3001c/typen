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
    const [fontFamily, setFontFamily] = useState('Georgia');
    const [fontSize, setFontSize] = useState(16);
    const [showFontDropdown, setShowFontDropdown] = useState(false);
    const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
    
    // Color states
    const [textColor, setTextColor] = useState('#000000');
    const [highlightColor, setHighlightColor] = useState('transparent');
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    
    // Spacing states
    const [lineSpacing, setLineSpacing] = useState(1.5);
    const [wordSpacing, setWordSpacing] = useState(0);
    const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);
    const [showWordSpacingDropdown, setShowWordSpacingDropdown] = useState(false);
    
    // Multi-page state
    const [pages, setPages] = useState([{ id: 1, content: '' }]);
    const pagesContainerRef = useRef(null);
    const pageRefs = useRef([]);
    const activePageRef = useRef(0);
    const contentInitializedRef = useRef(false);
    const isPaginatingRef = useRef(false);
    
    const lineSpacingOptions = [1, 1.15, 1.5, 2, 2.5, 3];
    const wordSpacingOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10];
    
    // Cleanup empty pages on mount
    useEffect(() => {
        const cleanupTimer = setTimeout(() => {
            setPages(currentPages => {
                if (currentPages.length <= 1) return currentPages;
                
                // Filter out empty trailing pages
                const nonEmptyPages = [];
                for (let i = 0; i < currentPages.length; i++) {
                    const pageRef = pageRefs.current[i];
                    if (pageRef && pageRef.innerText.trim().length > 0) {
                        nonEmptyPages.push(currentPages[i]);
                    } else if (i === 0) {
                        // Always keep the first page
                        nonEmptyPages.push(currentPages[i]);
                    }
                }
                
                return nonEmptyPages.length > 0 ? nonEmptyPages : [{ id: 1, content: '' }];
            });
        }, 100);
        
        return () => clearTimeout(cleanupTimer);
    }, []);
    
    // Save and restore cursor position
    const saveCursorPosition = () => {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;
        
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        
        // Find which page contains the cursor
        let pageIndex = -1;
        let pageEditor = null;
        for (let i = 0; i < pageRefs.current.length; i++) {
            if (pageRefs.current[i]?.contains(range.startContainer)) {
                pageIndex = i;
                pageEditor = pageRefs.current[i];
                break;
            }
        }
        
        if (pageIndex === -1 || !pageEditor) return null;
        
        preCaretRange.selectNodeContents(pageEditor);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        
        return {
            pageIndex,
            offset: preCaretRange.toString().length,
            collapsed: range.collapsed
        };
    };
    
    const restoreCursorPosition = (savedPosition) => {
        if (!savedPosition) return;
        
        const { pageIndex, offset } = savedPosition;
        const pageEditor = pageRefs.current[pageIndex];
        if (!pageEditor) return;
        
        const selection = window.getSelection();
        const range = document.createRange();
        
        let charCount = 0;
        let found = false;
        
        const walker = document.createTreeWalker(
            pageEditor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while ((node = walker.nextNode()) && !found) {
            const nodeLength = node.textContent.length;
            if (charCount + nodeLength >= offset) {
                range.setStart(node, offset - charCount);
                range.collapse(true);
                found = true;
            }
            charCount += nodeLength;
        }
        
        if (!found && pageEditor.childNodes.length > 0) {
            // Place cursor at end if position not found
            range.selectNodeContents(pageEditor);
            range.collapse(false);
        }
        
        selection.removeAllRanges();
        selection.addRange(range);
    };
    
    // Check and handle pagination
    const handlePagination = useCallback(() => {
        if (isPaginatingRef.current) return;
        isPaginatingRef.current = true;
        
        requestAnimationFrame(() => {
            const newPages = [...pages];
            let pagesChanged = false;
            
            // Check each page for overflow
            for (let i = 0; i < pageRefs.current.length; i++) {
                const pageEditor = pageRefs.current[i];
                if (!pageEditor) continue;
                
                // Skip if editor is empty or has no real content
                const hasContent = pageEditor.innerText.trim().length > 0;
                if (!hasContent) continue;
                
                // Check if content actually overflows (with small threshold to avoid false positives)
                const overflowThreshold = 5; // pixels
                const isOverflowing = pageEditor.scrollHeight > (pageEditor.clientHeight + overflowThreshold);
                
                // If content overflows current page
                if (isOverflowing) {
                    // Create a new page if needed
                    if (i === newPages.length - 1) {
                        newPages.push({ id: Date.now(), content: '' });
                        pagesChanged = true;
                    }
                    
                    // Move overflow content to next page
                    const overflowContent = extractOverflowContent(pageEditor, pageEditor.clientHeight);
                    if (overflowContent && pageRefs.current[i + 1]) {
                        prependContent(pageRefs.current[i + 1], overflowContent);
                    }
                }
            }
            
            // Remove empty trailing pages (keep at least one)
            while (newPages.length > 1) {
                const lastPageRef = pageRefs.current[newPages.length - 1];
                if (lastPageRef && lastPageRef.innerHTML.trim() === '' && 
                    lastPageRef.innerText.trim() === '') {
                    newPages.pop();
                    pagesChanged = true;
                } else {
                    break;
                }
            }
            
            if (pagesChanged) {
                setPages(newPages);
            }
            
            isPaginatingRef.current = false;
        });
    }, [pages]);
    
    // Extract content that overflows beyond maxHeight
    const extractOverflowContent = (editor, maxHeight) => {
        const children = Array.from(editor.childNodes);
        let accumulatedHeight = 0;
        let overflowStartIndex = -1;
        
        // Create a temporary measuring element
        const measurer = document.createElement('div');
        measurer.style.cssText = window.getComputedStyle(editor).cssText;
        measurer.style.position = 'absolute';
        measurer.style.visibility = 'hidden';
        measurer.style.height = 'auto';
        measurer.style.width = editor.offsetWidth + 'px';
        document.body.appendChild(measurer);
        
        for (let i = 0; i < children.length; i++) {
            const child = children[i].cloneNode(true);
            measurer.appendChild(child);
            
            if (measurer.scrollHeight > maxHeight) {
                overflowStartIndex = i;
                break;
            }
        }
        
        document.body.removeChild(measurer);
        
        if (overflowStartIndex === -1) return null;
        
        // Extract overflow nodes
        const fragment = document.createDocumentFragment();
        for (let i = children.length - 1; i >= overflowStartIndex; i--) {
            fragment.insertBefore(children[i], fragment.firstChild);
        }
        
        return fragment;
    };
    
    // Prepend content to the beginning of an editor
    const prependContent = (editor, content) => {
        if (editor.firstChild) {
            editor.insertBefore(content, editor.firstChild);
        } else {
            editor.appendChild(content);
        }
    };
    
    // Handle input on any page
    const handlePageInput = (pageIndex) => {
        // Sync content to the main editorRef for external access
        if (pageRefs.current[0]) {
            // Collect all pages content
            const allContent = pageRefs.current
                .filter(ref => ref)
                .map(ref => ref.innerHTML)
                .join('<!-- page-break -->');
            
            // Update the hidden master ref if it exists
            if (editorRef.current) {
                editorRef.current.innerHTML = allContent;
            }
        }
        
        onContentChange();
        
        // Only run pagination if there's actual content
        const currentPage = pageRefs.current[pageIndex];
        if (currentPage && currentPage.innerText.trim().length > 0) {
            handlePagination();
        }
    };
    
    // Initialize first page with existing content
    useEffect(() => {
        if (content && !contentInitializedRef.current && pageRefs.current[0]) {
            contentInitializedRef.current = true;
            
            // Split content by page breaks if they exist
            const pageContents = content.split('<!-- page-break -->').filter(pc => pc.trim() !== '');
            
            if (pageContents.length > 1) {
                const initialPages = pageContents.map((pc, idx) => ({
                    id: idx + 1,
                    content: pc
                }));
                setPages(initialPages);
                
                // Set content after state update
                setTimeout(() => {
                    pageContents.forEach((pc, idx) => {
                        if (pageRefs.current[idx]) {
                            pageRefs.current[idx].innerHTML = pc;
                        }
                    });
                }, 0);
            } else if (pageContents.length === 1) {
                pageRefs.current[0].innerHTML = pageContents[0];
            }
            // If no content, leave the page empty
        }
    }, [content]);
    
    // Update page content when pages state changes (for multi-page initialization)
    useEffect(() => {
        pages.forEach((page, idx) => {
            if (page.content && pageRefs.current[idx] && !pageRefs.current[idx].innerHTML) {
                pageRefs.current[idx].innerHTML = page.content;
            }
        });
    }, [pages]);

    const fonts = ['Georgia', 'Times New Roman', 'Arial', 'Helvetica', 'Inter', 'Roboto'];
    const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
    
    // Color palette similar to MS Word
    const textColors = [
        '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
        '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
        '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
        '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
        '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
        '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
        '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
        '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
    ];
    
    const highlightColors = [
        'transparent', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff', '#ff0000', '#000080', '#008080', '#008000',
        '#800080', '#800000', '#808000', '#808080', '#c0c0c0', '#ff9999', '#99ff99', '#9999ff', '#ffff99', '#ff99ff'
    ];

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        // Focus the active page instead of the hidden master ref
        const activePage = pageRefs.current[activePageRef.current];
        activePage?.focus();
    };

    const handleFontChange = (font) => {
        setFontFamily(font);
        execCommand('fontName', font);
        setShowFontDropdown(false);
    };

    const handleFontSizeChange = (size) => {
        setFontSize(size);
        execCommand('fontSize', 7); // Use largest size first
        // Apply actual pixel size via span styling
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const fontElements = editorRef.current?.querySelectorAll('font[size="7"]');
            fontElements?.forEach(el => {
                el.removeAttribute('size');
                el.style.fontSize = `${size}px`;
            });
        }
        setShowFontSizeDropdown(false);
        editorRef.current?.focus();
    };

    const increaseFontSize = () => {
        const currentIndex = fontSizes.indexOf(fontSize);
        if (currentIndex < fontSizes.length - 1) {
            handleFontSizeChange(fontSizes[currentIndex + 1]);
        }
    };

    const decreaseFontSize = () => {
        const currentIndex = fontSizes.indexOf(fontSize);
        if (currentIndex > 0) {
            handleFontSizeChange(fontSizes[currentIndex - 1]);
        }
    };

    // Apply text color
    const handleTextColorChange = (color) => {
        setTextColor(color);
        execCommand('foreColor', color);
        setShowTextColorPicker(false);
    };

    // Apply highlight/background color
    const handleHighlightChange = (color) => {
        setHighlightColor(color);
        if (color === 'transparent') {
            // Remove highlight by setting background to transparent
            execCommand('backColor', 'transparent');
        } else {
            execCommand('hiliteColor', color);
        }
        setShowHighlightPicker(false);
    };

    // Close all dropdowns
    const closeAllDropdowns = () => {
        setShowTextColorPicker(false);
        setShowHighlightPicker(false);
        setShowFontDropdown(false);
        setShowFontSizeDropdown(false);
        setShowLineSpacingDropdown(false);
        setShowWordSpacingDropdown(false);
    };

    // Handle click outside to close dropdowns
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.color-picker-wrapper') && 
                !e.target.closest('.font-selector-enhanced') && 
                !e.target.closest('.font-size-selector') &&
                !e.target.closest('.spacing-selector-wrapper')) {
                closeAllDropdowns();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return (
        <div className="editor-panel">
            <div className="editor-container">
                <div className="editor-content">
                    
                    {/* Enhanced Toolbar */}
                    <div className="toolbar-enhanced">
                        {/* Edit Group */}
                        <div className="toolbar-group-enhanced">
                            <div className="group-label">Edit</div>
                            <div className="group-buttons">
                                <IconButton onClick={() => execCommand('undo')} title="Undo">
                                    <Undo size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('redo')} title="Redo">
                                    <Redo size={16} />
                                </IconButton>
                            </div>
                        </div>

                        {/* Format Group */}
                        <div className="toolbar-group-enhanced">
                            <div className="group-label">Format</div>
                            <div className="group-buttons">
                                <IconButton onClick={() => execCommand('bold')} title="Bold (Ctrl+B)">
                                    <Bold size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('italic')} title="Italic (Ctrl+I)">
                                    <Italic size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('underline')} title="Underline (Ctrl+U)">
                                    <Underline size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('strikeThrough')} title="Strikethrough">
                                    <span className="strikethrough-icon">abc</span>
                                </IconButton>
                            </div>
                        </div>

                        {/* Font Group */}
                        <div className="toolbar-group-enhanced font-group">
                            <div className="group-label">Font</div>
                            <div className="font-controls-row">
                                <div className="font-selector-enhanced" onClick={() => setShowFontDropdown(!showFontDropdown)}>
                                    <span className="font-name-display">{fontFamily}</span>
                                    <ChevronDown size={14} />
                                    {showFontDropdown && (
                                        <div className="font-dropdown-enhanced">
                                            {fonts.map(font => (
                                                <div 
                                                    key={font} 
                                                    className={`font-option-enhanced ${font === fontFamily ? 'active' : ''}`}
                                                    style={{ fontFamily: font }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleFontChange(font);
                                                    }}
                                                >
                                                    {font}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="font-size-controls">
                                    <button className="font-size-btn" onClick={decreaseFontSize} title="Decrease font size">
                                        −
                                    </button>
                                    <div className="font-size-selector" onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}>
                                        <span className="font-size-display">{fontSize}</span>
                                        <ChevronDown size={12} />
                                        {showFontSizeDropdown && (
                                            <div className="font-size-dropdown">
                                                {fontSizes.map(size => (
                                                    <div 
                                                        key={size} 
                                                        className={`font-size-option ${size === fontSize ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleFontSizeChange(size);
                                                        }}
                                                    >
                                                        {size}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button className="font-size-btn" onClick={increaseFontSize} title="Increase font size">
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Colors Group */}
                        <div className="toolbar-group-enhanced">
                            <div className="group-label">Colors</div>
                            <div className="group-buttons color-buttons">
                                {/* Text Color Button */}
                                <div className="color-picker-wrapper">
                                    <button 
                                        className="color-btn" 
                                        onClick={() => {
                                            setShowHighlightPicker(false);
                                            setShowTextColorPicker(!showTextColorPicker);
                                        }}
                                        title="Text Color"
                                    >
                                        <Palette size={16} />
                                        <span className="color-indicator" style={{ backgroundColor: textColor }}></span>
                                    </button>
                                    {showTextColorPicker && (
                                        <div className="color-palette-dropdown">
                                            <div className="color-palette-header">
                                                <span>Text Color</span>
                                                <button 
                                                    className="color-reset-btn"
                                                    onClick={() => handleTextColorChange('#000000')}
                                                >
                                                    Automatic
                                                </button>
                                            </div>
                                            <div className="color-palette-grid">
                                                {textColors.map((color, index) => (
                                                    <button
                                                        key={index}
                                                        className={`color-swatch ${color === textColor ? 'active' : ''}`}
                                                        style={{ backgroundColor: color }}
                                                        onClick={() => handleTextColorChange(color)}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                            <div className="color-palette-footer">
                                                <label className="custom-color-label">
                                                    <input 
                                                        type="color" 
                                                        value={textColor}
                                                        onChange={(e) => handleTextColorChange(e.target.value)}
                                                        className="custom-color-input"
                                                    />
                                                    <span>Custom Color...</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Highlight Color Button */}
                                <div className="color-picker-wrapper">
                                    <button 
                                        className="color-btn highlight-btn" 
                                        onClick={() => {
                                            setShowTextColorPicker(false);
                                            setShowHighlightPicker(!showHighlightPicker);
                                        }}
                                        title="Highlight Color"
                                    >
                                        <Highlighter size={16} />
                                        <span 
                                            className="color-indicator highlight-indicator" 
                                            style={{ backgroundColor: highlightColor === 'transparent' ? '#ffffff' : highlightColor }}
                                        ></span>
                                    </button>
                                    {showHighlightPicker && (
                                        <div className="color-palette-dropdown highlight-dropdown">
                                            <div className="color-palette-header">
                                                <span>Highlight Color</span>
                                                <button 
                                                    className="color-reset-btn"
                                                    onClick={() => handleHighlightChange('transparent')}
                                                >
                                                    No Color
                                                </button>
                                            </div>
                                            <div className="color-palette-grid highlight-grid">
                                                {highlightColors.map((color, index) => (
                                                    <button
                                                        key={index}
                                                        className={`color-swatch ${color === 'transparent' ? 'no-color' : ''} ${color === highlightColor ? 'active' : ''}`}
                                                        style={{ backgroundColor: color === 'transparent' ? '#ffffff' : color }}
                                                        onClick={() => handleHighlightChange(color)}
                                                        title={color === 'transparent' ? 'No Color' : color}
                                                    >
                                                        {color === 'transparent' && <span className="no-color-x">✕</span>}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Lists Group */}
                        <div className="toolbar-group-enhanced">
                            <div className="group-label">Lists</div>
                            <div className="group-buttons">
                                <IconButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
                                    <List size={16} />
                                </IconButton>
                                <IconButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
                                    <ListOrdered size={16} />
                                </IconButton>
                            </div>
                        </div>

                        {/* Alignment Group */}
                        <div className="toolbar-group-enhanced">
                            <div className="group-label">Align</div>
                            <div className="group-buttons">
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
                        </div>

                        {/* Spacing Group */}
                        <div className="toolbar-group-enhanced spacing-group">
                            <div className="group-label">Spacing</div>
                            <div className="spacing-controls">
                                {/* Line Spacing */}
                                <div className="spacing-selector-wrapper">
                                    <div 
                                        className="spacing-selector" 
                                        onClick={() => {
                                            setShowWordSpacingDropdown(false);
                                            setShowLineSpacingDropdown(!showLineSpacingDropdown);
                                        }}
                                        title="Line Spacing"
                                    >
                                        <span className="spacing-icon">≡</span>
                                        <span className="spacing-value">{lineSpacing}</span>
                                        <ChevronDown size={12} />
                                    </div>
                                    {showLineSpacingDropdown && (
                                        <div className="spacing-dropdown">
                                            <div className="spacing-dropdown-header">Line Spacing</div>
                                            {lineSpacingOptions.map(spacing => (
                                                <div 
                                                    key={spacing} 
                                                    className={`spacing-option ${spacing === lineSpacing ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setLineSpacing(spacing);
                                                        if (editorRef.current) {
                                                            editorRef.current.style.lineHeight = spacing;
                                                        }
                                                        setShowLineSpacingDropdown(false);
                                                    }}
                                                >
                                                    {spacing}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Word Spacing */}
                                <div className="spacing-selector-wrapper">
                                    <div 
                                        className="spacing-selector" 
                                        onClick={() => {
                                            setShowLineSpacingDropdown(false);
                                            setShowWordSpacingDropdown(!showWordSpacingDropdown);
                                        }}
                                        title="Word Spacing"
                                    >
                                        <span className="spacing-icon">A⟷B</span>
                                        <span className="spacing-value">{wordSpacing}px</span>
                                        <ChevronDown size={12} />
                                    </div>
                                    {showWordSpacingDropdown && (
                                        <div className="spacing-dropdown">
                                            <div className="spacing-dropdown-header">Word Spacing</div>
                                            {wordSpacingOptions.map(spacing => (
                                                <div 
                                                    key={spacing} 
                                                    className={`spacing-option ${spacing === wordSpacing ? 'active' : ''}`}
                                                    onClick={() => {
                                                        setWordSpacing(spacing);
                                                        if (editorRef.current) {
                                                            editorRef.current.style.wordSpacing = `${spacing}px`;
                                                        }
                                                        setShowWordSpacingDropdown(false);
                                                    }}
                                                >
                                                    {spacing}px
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Group */}
                        <div className="toolbar-group-enhanced">
                            <div className="group-label">Actions</div>
                            <div className="group-buttons">
                                <IconButton onClick={onSave} title="Save (Ctrl+S)">
                                    <Save size={16} />
                                </IconButton>
                                <IconButton title="Download">
                                    <Download size={16} />
                                </IconButton>
                            </div>
                        </div>
                    </div>

                    {/* Multi-page A4 Document Editor */}
                    <div className="document-wrapper" ref={pagesContainerRef}>
                        {/* Hidden master editor for external reference */}
                        <div 
                            ref={editorRef} 
                            style={{ display: 'none' }}
                            suppressContentEditableWarning={true}
                        />
                        
                        {/* Rendered pages */}
                        <div className="pages-container">
                            {pages.map((page, index) => (
                                <div key={page.id} className="a4-page" data-page-number={index + 1}>
                                    <div className="page-number">Page {index + 1}</div>
                                    <div
                                        ref={el => pageRefs.current[index] = el}
                                        className="document-editor"
                                        contentEditable
                                        onInput={() => handlePageInput(index)}
                                        onFocus={() => { activePageRef.current = index; }}
                                        onKeyDown={(e) => {
                                            // Handle backspace at start of page - move to previous page
                                            if (e.key === 'Backspace' && index > 0) {
                                                const selection = window.getSelection();
                                                if (selection.rangeCount > 0) {
                                                    const range = selection.getRangeAt(0);
                                                    if (range.startOffset === 0 && range.collapsed) {
                                                        const prevPage = pageRefs.current[index - 1];
                                                        if (prevPage) {
                                                            e.preventDefault();
                                                            // Move cursor to end of previous page
                                                            const prevRange = document.createRange();
                                                            prevRange.selectNodeContents(prevPage);
                                                            prevRange.collapse(false);
                                                            selection.removeAllRanges();
                                                            selection.addRange(prevRange);
                                                            prevPage.focus();
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        suppressContentEditableWarning={true}
                                        data-placeholder={index === 0 ? "Start writing your story..." : ""}
                                        style={{
                                            lineHeight: lineSpacing,
                                            wordSpacing: `${wordSpacing}px`
                                        }}
                                    />
                                </div>
                            ))}
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
