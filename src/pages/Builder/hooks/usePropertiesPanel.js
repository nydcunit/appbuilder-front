import { useState, useEffect, useCallback } from 'react';

export const usePropertiesPanel = () => {
  const [selectedElement, setSelectedElement] = useState(null);
  const [showPropertiesPopup, setShowPropertiesPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: window.innerWidth - 520, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle popup dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPopupPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handlePopupMouseDown = useCallback((e) => {
    if (e.target.closest('.popup-header')) {
      const popupElement = e.currentTarget;
      const rect = popupElement.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  }, []);

  const handleElementClick = useCallback((element, event) => {
    event.stopPropagation();
    console.log('🖱️ Element clicked:', element);
    setSelectedElement(element);
    setShowPropertiesPopup(true);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedElement(null);
    setShowPropertiesPopup(false);
  }, []);

  return {
    // State
    selectedElement,
    showPropertiesPopup,
    popupPosition,
    isDragging,
    
    // Setters
    setSelectedElement,
    setShowPropertiesPopup,
    
    // Handlers
    handlePopupMouseDown,
    handleElementClick,
    handleCanvasClick
  };
};