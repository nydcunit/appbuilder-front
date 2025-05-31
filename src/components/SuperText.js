import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CalculationPopup } from './CalculationComponents';
import { useZIndex } from './ZIndexContext';

// CLEAN EXPANDED EDITOR COMPONENT - Isolated contentEditable logic
const ExpandedEditor = ({ 
  textValue, 
  calculations, 
  placeholder, 
  disabled, 
  onTextChange, 
  onKeyPress, 
  onCapsuleClick,
  renderTextWithCapsules 
}) => {
  const editorRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastTextValueRef = useRef('');

  // Initialize editor content when first mounted
  useEffect(() => {
    if (!editorRef.current || isInitialized) return;
    
    console.log('Initializing editor with textValue:', textValue);
    lastTextValueRef.current = textValue;
    setIsInitialized(true);
    updateEditorContent(textValue);
  }, []);

  // Update editor content when textValue changes (but not during initialization)
  useEffect(() => {
    if (!editorRef.current || isUpdating || !isInitialized) return;
    
    // Only update if textValue actually changed from external source
    if (textValue === lastTextValueRef.current) return;
    
    console.log('Updating editor content from', lastTextValueRef.current, 'to', textValue);
    updateEditorContent(textValue);
  }, [textValue, calculations, isInitialized, isUpdating]);

  const updateEditorContent = useCallback((newTextValue) => {
    if (!editorRef.current) return;
    
    setIsUpdating(true);
    
    // Save cursor position before updating
    const selection = window.getSelection();
    let cursorOffset = 0;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.startContainer)) {
        cursorOffset = getCursorPosition();
      }
    }
    
    // Clear and rebuild content
    editorRef.current.innerHTML = '';
    
    if (!newTextValue) {
      const placeholderSpan = document.createElement('span');
      placeholderSpan.style.cssText = 'color: #999; font-style: italic;';
      placeholderSpan.textContent = placeholder;
      placeholderSpan.setAttribute('data-placeholder', 'true');
      editorRef.current.appendChild(placeholderSpan);
    } else {
      // Split text and create DOM elements
      const parts = newTextValue.split(/({{CALC:[^}]+}})/);
      
      parts.forEach((part) => {
        const calcMatch = part.match(/{{CALC:([^}]+)}}/);
        if (calcMatch) {
          const calculationId = calcMatch[1];
          const calculation = calculations[calculationId];
          
          const capsule = document.createElement('span');
          capsule.setAttribute('data-calc-id', calculationId);
          capsule.setAttribute('contenteditable', 'false');
          capsule.textContent = calculation?.label || 'Calculation';
          capsule.style.cssText = `
            display: inline-block;
            background-color: #333;
            color: white;
            padding: 4px 12px;
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            margin: 0 4px;
            transition: background-color 0.2s ease;
            vertical-align: middle;
          `;
          
          capsule.onmouseover = () => { capsule.style.backgroundColor = '#555'; };
          capsule.onmouseout = () => { capsule.style.backgroundColor = '#333'; };
          capsule.onclick = (e) => {
            e.stopPropagation();
            onCapsuleClick(calculationId, e);
          };
          
          editorRef.current.appendChild(capsule);
        } else if (part) {
          const textNode = document.createTextNode(part);
          editorRef.current.appendChild(textNode);
        }
      });
      
      // Restore cursor position
      setTimeout(() => {
        setCursorPosition(cursorOffset);
      }, 0);
    }
    
    lastTextValueRef.current = newTextValue;
    setIsUpdating(false);
  }, [calculations, placeholder, onCapsuleClick]);

  // Get current cursor position
  const getCursorPosition = useCallback(() => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    return preCaretRange.toString().length;
  }, []);

  // Set cursor position
  const setCursorPosition = useCallback((offset) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    let currentOffset = 0;
    let found = false;
    
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent.length;
      if (currentOffset + nodeLength >= offset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        found = true;
        break;
      }
      currentOffset += nodeLength;
    }
    
    if (!found && editorRef.current.lastChild) {
      // Place cursor at the end
      if (editorRef.current.lastChild.nodeType === Node.TEXT_NODE) {
        range.setStart(editorRef.current.lastChild, editorRef.current.lastChild.textContent.length);
      } else {
        range.setStartAfter(editorRef.current.lastChild);
      }
      range.collapse(true);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const handleInput = useCallback(() => {
    if (!editorRef.current || isUpdating) return;
    
    // Remove placeholder if it exists
    const placeholder = editorRef.current.querySelector('[data-placeholder]');
    if (placeholder) {
      placeholder.remove();
    }
    
    // Extract text content including calculation tokens
    let textContent = '';
    
    const walkNodes = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textContent += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.hasAttribute('data-calc-id')) {
          const calcId = node.getAttribute('data-calc-id');
          textContent += `{{CALC:${calcId}}}`;
        } else if (!node.hasAttribute('data-placeholder')) {
          for (const child of node.childNodes) {
            walkNodes(child);
          }
        }
      }
    };
    
    for (const child of editorRef.current.childNodes) {
      walkNodes(child);
    }

    console.log('Editor input changed to:', textContent);
    lastTextValueRef.current = textContent;
    onTextChange(textContent);
  }, [onTextChange, isUpdating]);

  const handleFocus = useCallback(() => {
    if (!editorRef.current) return;
    
    const placeholder = editorRef.current.querySelector('[data-placeholder]');
    if (placeholder) {
      editorRef.current.innerHTML = '';
      // Set cursor at beginning
      const range = document.createRange();
      const selection = window.getSelection();
      range.setStart(editorRef.current, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  return (
    <div
      ref={editorRef}
      contentEditable={!disabled}
      onInput={handleInput}
      onFocus={handleFocus}
      onKeyDown={onKeyPress}
      suppressContentEditableWarning={true}
      style={{
        width: '100%',
        padding: '12px 16px',
        border: 'none',
        outline: 'none',
        fontSize: '14px',
        fontFamily: 'inherit',
        minHeight: '80px',
        backgroundColor: 'transparent',
        color: '#333',
        lineHeight: '1.4',
        wordWrap: 'break-word'
      }}
    />
  );
};

const SuperText = ({ 
  label = "Text", 
  placeholder = "Type Here", 
  value = "", 
  onChange,
  disabled = false,
  availableElements = [],
  screens = [],
  currentScreenId = null
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textValue, setTextValue] = useState(value);
  const [showCalculationPopup, setShowCalculationPopup] = useState(false);
  const [editingCalculationId, setEditingCalculationId] = useState(null);
  const [calculations, setCalculations] = useState({});
  const [popupZIndex, setPopupZIndex] = useState(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const containerRef = useRef(null);
  const { getNextZIndex, releaseZIndex } = useZIndex();

  // Initialize calculations from existing value
  useEffect(() => {
    setTextValue(value);
    
    if (value && value.includes('{{CALC:')) {
      const existingCalcs = extractCalculationsFromValue(value);
      setCalculations(existingCalcs);
    }
  }, [value]);

  const extractCalculationsFromValue = useCallback((textWithCalcs) => {
    const calculations = {};
    const calcMatches = textWithCalcs.match(/{{CALC:([^}]+)}}/g);
    
    if (calcMatches) {
      calcMatches.forEach(match => {
        const calculationId = match.match(/{{CALC:([^}]+)}}/)[1];
        
        try {
          const storedCalc = localStorage.getItem(`calc_${calculationId}`);
          if (storedCalc) {
            calculations[calculationId] = JSON.parse(storedCalc);
          } else {
            calculations[calculationId] = {
              id: calculationId,
              steps: [{ id: Date.now().toString(), type: 'value', config: { source: 'custom', value: '[Missing Calculation]' } }],
              label: 'Calculation'
            };
          }
        } catch (error) {
          console.error('Error loading calculation:', error);
        }
      });
    }
    
    return calculations;
  }, []);

  const storeCalculation = useCallback((calculationId, calculation) => {
    try {
      localStorage.setItem(`calc_${calculationId}`, JSON.stringify(calculation));
    } catch (error) {
      console.error('Error storing calculation:', error);
    }
  }, []);

  // Handle clicking outside to collapse
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded && !showCalculationPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded, showCalculationPopup]);

  // Focus handling when expanding
  useEffect(() => {
    if (isExpanded) {
      // Focus will be handled by the ExpandedEditor component
    }
  }, [isExpanded]);

  const handlePlaceholderClick = useCallback(() => {
    if (!disabled) {
      setIsExpanded(true);
    }
  }, [disabled]);

  const handleCalculationClick = useCallback((e) => {
    e.stopPropagation();
    if (!disabled) {
      if (!isExpanded) {
        setIsExpanded(true);
      }
      setEditingCalculationId(null);
      const zIndex = getNextZIndex();
      setPopupZIndex(zIndex);
      setShowCalculationPopup(true);
    }
  }, [disabled, getNextZIndex, isExpanded]);

  const handleCapsuleClick = useCallback((calculationId, e) => {
    e.stopPropagation();
    if (!disabled) {
      setEditingCalculationId(calculationId);
      const zIndex = getNextZIndex();
      setPopupZIndex(zIndex);
      setShowCalculationPopup(true);
    }
  }, [disabled, getNextZIndex]);

  const handleTextChange = useCallback((newText) => {
    setTextValue(newText);
    onChange?.(newText); // FIXED: Save immediately on every change
  }, [onChange]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsExpanded(false); // Just collapse, value already saved
    }
    if (e.key === 'Escape') {
      setTextValue(value); // Reset to original value
      onChange?.(value); // Restore original value
      setIsExpanded(false);
    }
  }, [value, onChange]);

  const generateCalculationId = useCallback(() => {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substr(2, 12);
    return `calc_${timestamp}_${randomPart}`;
  }, []);

  const handleCalculationSave = useCallback((steps) => {
    let calculationId;
    
    if (editingCalculationId) {
      calculationId = editingCalculationId;
    } else {
      calculationId = generateCalculationId();
    }
    
    const newCalculation = { 
      id: calculationId,
      steps: JSON.parse(JSON.stringify(steps)),
      label: 'Calculation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storeCalculation(calculationId, newCalculation);
    
    setCalculations(prev => ({
      ...prev,
      [calculationId]: newCalculation
    }));

    if (!editingCalculationId) {
      // Insert calculation token at current position (simplified)
      const capsuleToken = `{{CALC:${calculationId}}}`;
      const newTextValue = textValue + capsuleToken;
      
      setTextValue(newTextValue);
      onChange?.(newTextValue); // FIXED: Save immediately when adding calculation
    }
    
    setShowCalculationPopup(false);
    setEditingCalculationId(null);
    releaseZIndex();
    setPopupZIndex(null);
  }, [textValue, cursorPosition, editingCalculationId, generateCalculationId, storeCalculation, releaseZIndex]);

  const handleCalculationClose = useCallback(() => {
    setShowCalculationPopup(false);
    setEditingCalculationId(null);
    releaseZIndex();
    setPopupZIndex(null);
  }, [releaseZIndex]);

  // GUARANTEED SINGLE RENDERING: Only one function handles all calculation display
  const renderTextWithCapsules = useCallback((text) => {
    if (!text) return placeholder;

    if (!text.includes('{{CALC:')) {
      return text;
    }

    const parts = text.split(/({{CALC:[^}]+}})/);
    
    return parts.map((part, index) => {
      const calcMatch = part.match(/{{CALC:([^}]+)}}/);
      if (calcMatch) {
        const calculationId = calcMatch[1];
        const calculation = calculations[calculationId];
        
        return (
          <span
            key={`calc-${calculationId}-${index}`}
            onClick={(e) => handleCapsuleClick(calculationId, e)}
            style={{
              display: 'inline-block',
              backgroundColor: '#333',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              margin: '0 4px',
              transition: 'background-color 0.2s ease',
              verticalAlign: 'middle'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#555';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
            }}
          >
            {calculation?.label || 'Calculation'}
          </span>
        );
      }
      return part;
    });
  }, [calculations, handleCapsuleClick, placeholder]);

  // Expose calculation data to parent components
  useEffect(() => {
    if (onChange && typeof onChange === 'function') {
      window.superTextCalculations = window.superTextCalculations || {};
      Object.keys(calculations).forEach(calcId => {
        window.superTextCalculations[calcId] = calculations[calcId];
      });
    }
  }, [calculations, onChange]);

  const CalculationIcon = () => (
    <button
      onClick={handleCalculationClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '8px',
        borderRadius: '6px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        transition: 'background-color 0.2s ease',
        opacity: disabled ? 0.5 : 1
      }}
      onMouseOver={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = '#e8e8e8';
        }
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#f5f5f5';
      }}
    >
      🔢
    </button>
  );

  return (
    <>
      <div ref={containerRef} style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#666',
          marginBottom: '8px'
        }}>
          {label}
        </div>

        {!isExpanded ? (
          // COLLAPSED MODE - Pure React rendering
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: disabled ? '#f9f9f9' : '#ffffff',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s ease'
          }}>
            <div
              onClick={handlePlaceholderClick}
              style={{
                flex: 1,
                color: textValue ? '#333' : '#999',
                fontSize: '14px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                minHeight: '20px',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '4px',
                lineHeight: '1.4'
              }}
            >
              {renderTextWithCapsules(textValue)}
            </div>
            <CalculationIcon />
          </div>
        ) : (
          // EXPANDED MODE - ContentEditable with capsules (CLEAN IMPLEMENTATION)
          <div style={{
            border: '2px solid #007bff',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
          }}>
            <ExpandedEditor
              textValue={textValue}
              calculations={calculations}
              placeholder={placeholder}
              disabled={disabled}
              onTextChange={handleTextChange}
              onKeyPress={handleKeyPress}
              onCapsuleClick={handleCapsuleClick}
              renderTextWithCapsules={renderTextWithCapsules}
            />

            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fafafa'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#999'
              }}>
                Press Enter to save, Escape to cancel • Click calculation capsules to edit
              </div>
              <CalculationIcon />
            </div>
          </div>
        )}
      </div>

      <CalculationPopup
        isOpen={showCalculationPopup}
        onClose={handleCalculationClose}
        onSave={handleCalculationSave}
        initialSteps={editingCalculationId ? (calculations[editingCalculationId]?.steps || []) : []}
        position={{ x: 0, y: 0 }}
        zIndex={popupZIndex || 1000}
        availableElements={availableElements}
        screens={screens}
        currentScreenId={currentScreenId}
      />
    </>
  );
};

export default SuperText;
