import { useState, useCallback } from 'react';

export const useDragDrop = (elementOperations) => {
  const [draggedElement, setDraggedElement] = useState(null);
  const [draggedExistingElement, setDraggedExistingElement] = useState(null);
  const [dropZone, setDropZone] = useState(null);

  const {
    addElementToCanvas,
    addElementToContainer,
    moveExistingElementToCanvas,
    moveExistingElementToContainer
  } = elementOperations;

  const handleNewElementDragStart = useCallback((e, elementType) => {
    setDraggedElement(elementType);
    setDraggedExistingElement(null);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleExistingElementDragStart = useCallback((e, element) => {
    e.stopPropagation();
    setDraggedExistingElement(element);
    setDraggedElement(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', element.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedElement(null);
    setDraggedExistingElement(null);
    setDropZone(null);
  }, []);

  const handleContainerDragOver = useCallback((e, containerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedExistingElement && draggedExistingElement.id === containerId) {
      return;
    }
    
    e.dataTransfer.dropEffect = draggedExistingElement ? 'move' : 'copy';
    setDropZone(containerId);
  }, [draggedExistingElement]);

  const handleCanvasDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    e.dataTransfer.dropEffect = draggedExistingElement ? 'move' : 'copy';
    setDropZone('canvas');
  }, [draggedExistingElement]);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setTimeout(() => {
        setDropZone(null);
      }, 10);
    }
  }, []);

  const handleContainerDrop = useCallback((e, containerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedElement) {
      addElementToContainer(draggedElement, containerId);
    } else if (draggedExistingElement) {
      if (draggedExistingElement.id !== containerId) {
        moveExistingElementToContainer(draggedExistingElement, containerId);
      }
    }
    
    setDraggedElement(null);
    setDraggedExistingElement(null);
    setDropZone(null);
  }, [draggedElement, draggedExistingElement, addElementToContainer, moveExistingElementToContainer]);

  const handleCanvasDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (dropZone === 'canvas') {
      if (draggedElement) {
        addElementToCanvas(draggedElement);
      } else if (draggedExistingElement) {
        moveExistingElementToCanvas(draggedExistingElement);
      }
    }
    
    setDraggedElement(null);
    setDraggedExistingElement(null);
    setDropZone(null);
  }, [dropZone, draggedElement, draggedExistingElement, addElementToCanvas, moveExistingElementToCanvas]);

  return {
    // State
    draggedElement,
    draggedExistingElement,
    dropZone,
    
    // Handlers
    handleNewElementDragStart,
    handleExistingElementDragStart,
    handleDragEnd,
    handleContainerDragOver,
    handleCanvasDragOver,
    handleDragLeave,
    handleContainerDrop,
    handleCanvasDrop
  };
};