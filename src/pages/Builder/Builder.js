import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ZIndexProvider } from '../../components/ZIndexContext';
import websocketService from '../../services/websocketService';
import { getElementByType, availableElements, createElement } from '../../elements';
import { CreateScreenModal, ScreenDetailsModal, PreviewModal } from './BuilderModals';

// ============================================
// PROPERTIES PANEL HOOK
// ============================================

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

// ============================================
// APP STATE HOOK
// ============================================

export const useAppState = () => {
  const { appId } = useParams();
  
  const [app, setApp] = useState(null);
  const [screens, setScreens] = useState([]);
  const [currentScreenId, setCurrentScreenId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');

  useEffect(() => {
    loadApp();
  }, [appId]);

  const loadApp = async () => {
    try {
      const response = await axios.get(`/api/apps/${appId}`);
      if (response.data.success) {
        const appData = response.data.data;
        console.log('Loaded app data:', appData);
        setApp(appData);
        setScreens(appData.screens || [{ id: 1, name: 'Home', elements: [] }]);
        setCurrentScreenId(appData.screens?.[0]?.id || 1);
      }
    } catch (error) {
      console.error('Error loading app:', error);
      alert('Error loading app: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const saveApp = async () => {
    setSaving(true);
    try {
      console.log('Saving app with screens:', screens);
      
      // Log the current screen elements to see what we're saving
      const currentScreen = screens.find(screen => screen.id === currentScreenId);
      const currentScreenElements = currentScreen?.elements || [];
      console.log('Current screen elements being saved:', JSON.stringify(currentScreenElements, null, 2));
      
      const response = await axios.put(`/api/apps/${appId}`, {
        screens: screens,
        homeScreenId: app?.homeScreenId
      });
      
      if (response.data.success) {
        console.log('App saved successfully. Saved data:', response.data.data);
        alert('App saved successfully!');
        setApp(response.data.data);
      }
    } catch (error) {
      console.error('Error saving app:', error);
      alert('Error saving app: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const createScreen = () => {
    if (!newScreenName.trim()) return;
    
    const newScreen = {
      id: Date.now(),
      name: newScreenName,
      elements: []
    };
    
    setScreens([...screens, newScreen]);
    setCurrentScreenId(newScreen.id);
    setNewScreenName('');
  };

  const deleteScreen = (screenId) => {
    if (screens.length === 1) {
      alert('Please create another screen to delete this.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this screen?')) {
      const updatedScreens = screens.filter(screen => screen.id !== screenId);
      setScreens(updatedScreens);
      
      if (screenId === currentScreenId) {
        setCurrentScreenId(updatedScreens[0].id);
      }
    }
  };

  const updateScreen = (updatedScreen) => {
    const updatedScreens = screens.map(screen => 
      screen.id === updatedScreen.id ? updatedScreen : screen
    );
    setScreens(updatedScreens);
  };

  const setHomeScreen = (screenId) => {
    // Update app to set home screen
    setApp(prevApp => ({
      ...prevApp,
      homeScreenId: screenId
    }));
  };

  const getCurrentScreen = () => {
    return screens.find(screen => screen.id === currentScreenId);
  };

  const updateScreens = (newScreens) => {
    setScreens(newScreens);
  };

  return {
    // State
    app,
    screens,
    currentScreenId,
    loading,
    saving,
    newScreenName,
    
    // Setters
    setCurrentScreenId,
    setNewScreenName,
    updateScreens,
    
    // Actions
    saveApp,
    createScreen,
    deleteScreen,
    updateScreen,
    setHomeScreen,
    getCurrentScreen,
    
    // Computed
    currentScreen: getCurrentScreen()
  };
};


// ============================================
// DRAG DROP HOOK
// ============================================

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

// ============================================
// ELEMENT OPERATIONS HOOK
// ============================================

export const useElementOperations = (screens, currentScreenId, updateScreens, setSelectedElement, setShowPropertiesPopup) => {
  
  const addElementToCanvas = useCallback((elementType) => {
    const newElement = createElement(elementType);
    if (!newElement) return;
    
    updateScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? { ...screen, elements: [...screen.elements, newElement] }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  const addElementToContainer = useCallback((elementType, containerId) => {
    const newElement = createElement(elementType);
    if (!newElement) return;
    
    updateScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: addToElementInTree(screen.elements, containerId, newElement)
          }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  const moveExistingElementToCanvas = useCallback((element) => {
    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, element.id)
          }
        : screen
    ));

    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? { ...screen, elements: [...screen.elements, element] }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  const moveExistingElementToContainer = useCallback((element, containerId) => {
    if (element.id === containerId) return;

    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, element.id)
          }
        : screen
    ));

    updateScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: addToElementInTree(screen.elements, containerId, element)
          }
        : screen
    ));
  }, [screens, currentScreenId, updateScreens]);

  // FIXED: Enhanced updateElement with better logging and proper merging
  const updateElement = useCallback((elementId, updates) => {
    console.log('🔧 === ELEMENT UPDATE START ===');
    console.log('🔧 Element ID:', elementId);
    console.log('🔧 Updates being applied:', JSON.stringify(updates, null, 2));
    
    const updatedScreens = screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: updateElementInTree(screen.elements, elementId, updates)
          }
        : screen
    );
    
    console.log('🔧 Updated screens state calculated');
    updateScreens(updatedScreens);

    // Update selected element if it's the one being updated
    setSelectedElement(prevSelected => {
      if (prevSelected && prevSelected.id === elementId) {
        const updatedElement = findElementInTree(updatedScreens.find(s => s.id === currentScreenId)?.elements || [], elementId);
        if (updatedElement) {
          console.log('🔧 Updated selected element:', JSON.stringify(updatedElement, null, 2));
          return updatedElement;
        }
      }
      return prevSelected;
    });
    
    console.log('🔧 === ELEMENT UPDATE END ===');
  }, [screens, currentScreenId, updateScreens, setSelectedElement]);

  const deleteElement = useCallback((elementId) => {
    updateScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, elementId)
          }
        : screen
    ));
    
    setSelectedElement(prevSelected => {
      if (prevSelected?.id === elementId) {
        setShowPropertiesPopup(false);
        return null;
      }
      return prevSelected;
    });
  }, [screens, currentScreenId, updateScreens, setSelectedElement, setShowPropertiesPopup]);

  // Helper function to get all elements in current screen (including nested ones)
  const getAllElementsInScreen = useCallback((elements) => {
    const allElements = [];
    
    const traverse = (elementList) => {
      elementList.forEach(element => {
        allElements.push(element);
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    
    traverse(elements);
    return allElements;
  }, []);

  // Helper functions
  const addToElementInTree = (elements, targetId, newElement) => {
    return elements.map(element => {
      if (element.id === targetId) {
        return {
          ...element,
          children: [...(element.children || []), newElement]
        };
      }
      if (element.children) {
        return {
          ...element,
          children: addToElementInTree(element.children, targetId, newElement)
        };
      }
      return element;
    });
  };

  // FIXED: Enhanced updateElementInTree with better logging and deep merging
  const updateElementInTree = (elements, targetId, updates) => {
    return elements.map(element => {
      if (element.id === targetId) {
        console.log('🎯 Found target element:', element.id);
        console.log('📝 Current element state:', JSON.stringify(element, null, 2));
        console.log('🔄 Applying updates:', JSON.stringify(updates, null, 2));
        
        // FIXED: Proper deep merging for complex objects like conditions
        const updatedElement = {
          ...element,
          ...updates
        };
        
        // Special handling for conditions array to ensure proper merging
        if (updates.conditions && Array.isArray(updates.conditions)) {
          updatedElement.conditions = updates.conditions;
          console.log('🔄 Updated conditions:', JSON.stringify(updatedElement.conditions, null, 2));
        }
        
        // Special handling for properties object to ensure proper merging
        if (updates.properties) {
          updatedElement.properties = {
            ...element.properties,
            ...updates.properties
          };
          console.log('🔄 Updated properties:', JSON.stringify(updatedElement.properties, null, 2));
        }
        
        console.log('✅ Final updated element:', JSON.stringify(updatedElement, null, 2));
        return updatedElement;
      }
      if (element.children) {
        return {
          ...element,
          children: updateElementInTree(element.children, targetId, updates)
        };
      }
      return element;
    });
  };

  const removeElementFromTree = (elements, targetId) => {
    return elements
      .filter(element => element.id !== targetId)
      .map(element => {
        if (element.children) {
          return {
            ...element,
            children: removeElementFromTree(element.children, targetId)
          };
        }
        return element;
      });
  };

  const findElementInTree = (elements, targetId) => {
    for (const element of elements) {
      if (element.id === targetId) {
        return element;
      }
      if (element.children) {
        const found = findElementInTree(element.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  return {
    addElementToCanvas,
    addElementToContainer,
    moveExistingElementToCanvas,
    moveExistingElementToContainer,
    updateElement,
    deleteElement,
    getAllElementsInScreen
  };
};

// ============================================
// CANVAS UTILS
// ============================================

// Utility functions for canvas operations

// Helper function to get all elements in current screen (including nested ones)
export const getAllElementsInScreen = (elements) => {
  const allElements = [];
  
  const traverse = (elementList) => {
    elementList.forEach(element => {
      allElements.push(element);
      if (element.children && element.children.length > 0) {
        traverse(element.children);
      }
    });
  };
  
  traverse(elements);
  return allElements;
};

// Copy canvas data to clipboard
export const copyCanvasToClipboard = async (app, appId, currentScreen, screens, selectedElement, allElements) => {
  try {
    const canvasData = {
      app: {
        name: app?.name,
        id: appId,
        description: app?.description
      },
      currentScreen: {
        id: currentScreen?.id,
        name: currentScreen?.name,
        elementCount: currentScreen?.elements?.length || 0
      },
      elements: currentScreen?.elements || [],
      allScreens: screens.map(screen => ({
        id: screen.id,
        name: screen.name,
        elementCount: screen.elements?.length || 0
      })),
      selectedElement: selectedElement ? {
        id: selectedElement.id,
        type: selectedElement.type,
        properties: selectedElement.properties,
        conditions: selectedElement.conditions,
        renderType: selectedElement.renderType,
        contentType: selectedElement.contentType,
        repeatingConfig: selectedElement.repeatingConfig,
        children: selectedElement.children
      } : null,
      metadata: {
        timestamp: new Date().toISOString(),
        totalElements: allElements.length,
        hasConditionalElements: (currentScreen?.elements || []).some(el => el.renderType === 'conditional'),
        hasRepeatingContainers: (currentScreen?.elements || []).some(el => 
          el.type === 'container' && el.contentType === 'repeating'
        )
      }
    };

    const formattedJSON = JSON.stringify(canvasData, null, 2);
    await navigator.clipboard.writeText(formattedJSON);
    
    console.log('Canvas data copied to clipboard:', canvasData);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw new Error('Failed to copy canvas data to clipboard');
  }
};

// ============================================
// CANVAS COMPONENT
// ============================================

const Canvas = ({
  currentScreen,
  handleCanvasClick,
  handleCanvasDragOver,
  handleDragLeave,
  handleCanvasDrop,
  dropZone,
  renderElement
}) => {
  const isCanvasDropZone = dropZone === 'canvas';

  return (
    <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', minWidth: 0 }}>
      <h3>Canvas - {currentScreen?.name}</h3>
      <div 
        onClick={handleCanvasClick}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleCanvasDrop}
        style={{ 
          border: isCanvasDropZone 
            ? '3px solid #007bff' 
            : '2px dashed #ddd', 
          minHeight: '400px', 
          padding: '20px',
          backgroundColor: isCanvasDropZone ? '#e7f3ff' : 'white',
          transition: 'all 0.2s ease',
          borderRadius: '8px'
        }}
      >
        {currentScreen?.elements?.length === 0 ? (
          <p style={{ 
            color: isCanvasDropZone ? '#007bff' : '#999', 
            textAlign: 'center',
            fontWeight: isCanvasDropZone ? 'bold' : 'normal',
            fontSize: isCanvasDropZone ? '16px' : '14px'
          }}>
            {isCanvasDropZone ? '⬇ Drop here to move to main canvas!' : 'Drag containers from below to start building!'}
          </p>
        ) : (
          <ElementRenderer
            elements={currentScreen.elements}
            renderElement={renderElement}
          />
        )}
      </div>
    </div>
  );
};



// ============================================
// ELEMENT RENDERER COMPONENT
// ============================================

const ElementRenderer = ({ elements, renderElement }) => {
  if (!elements || elements.length === 0) {
    return null;
  }

  return (
    <>
      {elements.map(element => renderElement(element))}
    </>
  );
};



// ============================================
// BUILDER HEADER COMPONENT
// ============================================

const BuilderHeader = ({
  app,
  screens,
  currentScreenId,
  setCurrentScreenId,
  setSelectedElement,
  setShowPropertiesPopup,
  setShowCreateScreenModal,
  setShowScreenDetailsModal,
  deleteScreen,
  copyCanvasToClipboard,
  copySuccess,
  handleExecute,
  handleOldExecute,
  saveApp,
  saving
}) => {
  return (
    <div style={{ 
      padding: '10px 20px', 
      borderBottom: '1px solid #ddd',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100
    }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>{app.name}</h2>
        
        {/* Screen Selector */}
        <ScreenSelector
          screens={screens}
          currentScreenId={currentScreenId}
          setCurrentScreenId={setCurrentScreenId}
          setSelectedElement={setSelectedElement}
          setShowPropertiesPopup={setShowPropertiesPopup}
          setShowCreateScreenModal={setShowCreateScreenModal}
          setShowScreenDetailsModal={setShowScreenDetailsModal}
          deleteScreen={deleteScreen}
        />

        {/* Copy Canvas Button */}
        <button
          onClick={copyCanvasToClipboard}
          style={{
            padding: '8px 15px',
            backgroundColor: copySuccess ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background-color 0.3s ease'
          }}
          title="Copy all canvas data to clipboard for sharing/debugging"
        >
          {copySuccess ? '✓ Copied!' : '📋 Copy Canvas'}
        </button>

        {/* Old Execute Button */}
        <button
          onClick={handleOldExecute}
          style={{
            padding: '8px 15px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Open inbuilder execute popup with calculations and conditions"
        >
          🔍 Old Execute
        </button>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Open app in new window - auto-updates when you save"
        >
          ▶️ Execute
        </button>

        <button
          onClick={saveApp}
          disabled={saving}
          style={{
            padding: '8px 15px',
            backgroundColor: saving ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save App'}
        </button>
      </div>
    </div>
  );
};



// ============================================
// SCREEN SELECTOR COMPONENT
// ============================================

const ScreenSelector = ({
  screens,
  currentScreenId,
  setCurrentScreenId,
  setSelectedElement,
  setShowPropertiesPopup,
  setShowCreateScreenModal,
  deleteScreen,
  setShowScreenDetailsModal
}) => {
  const handleScreenChange = (screenId) => {
    setCurrentScreenId(parseInt(screenId));
    setSelectedElement(null);
    setShowPropertiesPopup(false);
  };

  const handleDeleteScreen = () => {
    deleteScreen(currentScreenId);
  };

  const handleCreateScreen = () => {
    setShowCreateScreenModal(true);
  };

  const handleScreenDetails = () => {
    setShowScreenDetailsModal(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label>Screen:</label>
      <select
        value={currentScreenId}
        onChange={(e) => handleScreenChange(e.target.value)}
        style={{ padding: '5px', border: '1px solid #ddd' }}
      >
        {screens.map(screen => (
          <option key={screen.id} value={screen.id}>
            {screen.name}
          </option>
        ))}
      </select>
      
      <button
        onClick={handleCreateScreen}
        style={{
          padding: '5px 10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        + New
      </button>
      
      <button
        onClick={handleScreenDetails}
        style={{
          padding: '5px 10px',
          backgroundColor: '#17a2b8',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px'
        }}
        title="Screen Details"
      >
        ⚙️
      </button>
      
      <button
        onClick={handleDeleteScreen}
        style={{
          padding: '5px 8px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🗑
      </button>
    </div>
  );
};



// ============================================
// ELEMENTS TOOLBAR COMPONENT
// ============================================

const ElementsToolbar = ({ 
  handleNewElementDragStart, 
  handleDragEnd 
}) => {
  return (
    <div style={{ 
      height: '120px', 
      backgroundColor: 'white', 
      borderTop: '1px solid #ddd',
      padding: '20px'
    }}>
      <h4 style={{ margin: '0 0 10px 0' }}>Elements</h4>
      <div style={{ display: 'flex', gap: '10px' }}>
        {availableElements.map(elementDef => (
          <div
            key={elementDef.type}
            draggable
            onDragStart={(e) => handleNewElementDragStart(e, elementDef.type)}
            onDragEnd={handleDragEnd}
            style={{
              width: '80px',
              height: '60px',
              border: '1px solid #ddd',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'grab',
              backgroundColor: '#f8f9fa',
              userSelect: 'none'
            }}
            onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
          >
            <div style={{ fontSize: '20px' }}>{elementDef.icon}</div>
            <div style={{ fontSize: '10px' }}>{elementDef.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};



// ============================================
// PROPERTIES PANEL COMPONENT
// ============================================

const PropertiesPanel = ({
  showPropertiesPopup,
  selectedElement,
  popupPosition,
  isDragging,
  handlePopupMouseDown,
  setShowPropertiesPopup,
  updateElement,
  availableElementsForCalculations,
  screens = [],
  currentScreenId = null
}) => {
  const popupRef = useRef(null);

  useEffect(() => {
    if (showPropertiesPopup && popupRef.current) {
      // Any initialization logic for the popup
    }
  }, [showPropertiesPopup]);

  if (!showPropertiesPopup || !selectedElement) return null;

  return (
    <div
      ref={popupRef}
      onMouseDown={handlePopupMouseDown}
      style={{
        position: 'fixed',
        left: `${popupPosition.x}px`,
        top: `${popupPosition.y}px`,
        width: '500px',
        maxHeight: '70vh',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Draggable Header */}
      <div 
        className="popup-header"
        style={{
          padding: '10px 15px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #ddd',
          borderRadius: '8px 8px 0 0',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
            Properties
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            (Drag to move)
          </span>
        </div>
        
        {/* Close Button */}
        <button
          onClick={() => setShowPropertiesPopup(false)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{
        padding: '15px',
        overflowY: 'auto',
        flex: 1
      }}>
        <ElementProperties
          element={selectedElement}
          onUpdate={(updates) => updateElement(selectedElement.id, updates)}
          availableElements={availableElementsForCalculations}
          screens={screens}
          currentScreenId={currentScreenId}
        />
      </div>
    </div>
  );
};

const ElementProperties = ({ element, onUpdate, availableElements, screens, currentScreenId }) => {
  const elementDef = getElementByType(element.type);
  if (!elementDef || !elementDef.PropertiesPanel) {
    return <div>No properties available</div>;
  }
  
  const PropertiesComponent = elementDef.PropertiesPanel;
  return (
    <PropertiesComponent 
      element={element} 
      onUpdate={onUpdate}
      availableElements={availableElements}
      screens={screens}
      currentScreenId={currentScreenId}
    />
  );
};



// ============================================
// MAIN BUILDER COMPONENT
// ============================================


const Builder = () => {
  // App state management
  const {
    app,
    screens,
    currentScreenId,
    loading,
    saving,
    newScreenName,
    setCurrentScreenId,
    setNewScreenName,
    updateScreens,
    saveApp,
    createScreen,
    deleteScreen,
    updateScreen,
    setHomeScreen,
    currentScreen
  } = useAppState();

  // Properties panel management
  const {
    selectedElement,
    showPropertiesPopup,
    popupPosition,
    isDragging,
    setSelectedElement,
    setShowPropertiesPopup,
    handlePopupMouseDown,
    handleElementClick,
    handleCanvasClick
  } = usePropertiesPanel();

  // Element operations
  const elementOperations = useElementOperations(
    screens,
    currentScreenId,
    updateScreens,
    setSelectedElement,
    setShowPropertiesPopup
  );

  // Drag and drop functionality
  const dragDropHandlers = useDragDrop(elementOperations);

  // Modal states
  const [showCreateScreenModal, setShowCreateScreenModal] = useState(false);
  const [showScreenDetailsModal, setShowScreenDetailsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewScreenId, setPreviewScreenId] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [previewWindow, setPreviewWindow] = useState(null);

  // WebSocket setup
  useEffect(() => {
    if (app?._id) {
      // Connect to WebSocket and join app room
      websocketService.connect();
      websocketService.joinApp(app._id);
    }

    // Cleanup on unmount
    return () => {
      if (app?._id) {
        websocketService.leaveApp(app._id);
      }
    };
  }, [app?._id]);

  // Enhanced save function that notifies WebSocket
  const handleSaveApp = async () => {
    try {
      await saveApp();
      // Notify WebSocket that app was saved
      if (app?._id) {
        websocketService.notifyAppSaved(app._id);
      }
    } catch (error) {
      console.error('Error saving app:', error);
    }
  };

  // Element rendering logic
  const renderElement = (element, depth = 0) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    const isSelected = selectedElement?.id === element.id;
    const isDropZone = dragDropHandlers.dropZone === element.id;
    const isDraggingElement = dragDropHandlers.draggedExistingElement?.id === element.id;

    const handlers = {
      onClick: handleElementClick,
      onDelete: elementOperations.deleteElement,
      onDragOver: (e) => dragDropHandlers.handleContainerDragOver(e, element.id),
      onDragLeave: dragDropHandlers.handleDragLeave,
      onDrop: (e) => dragDropHandlers.handleContainerDrop(e, element.id),
      onDragStart: (e) => dragDropHandlers.handleExistingElementDragStart(e, element)
    };

    const children = element.children && element.children.length > 0 
      ? element.children.map(child => renderElement(child, depth + 1))
      : null;

    const renderedElement = elementDef.render(element, depth, isSelected, isDropZone, handlers, children, null, false, false, false, screens);
    
    return React.cloneElement(renderedElement, {
      key: element.id,
      style: {
        ...renderedElement.props.style,
        opacity: isDraggingElement ? 0.5 : 1,
        transform: isDraggingElement ? 'rotate(2deg)' : 'none',
        transition: isDraggingElement ? 'none' : 'all 0.2s ease'
      }
    });
  };

  // Action handlers
  const handleExecute = () => {
    if (!app?.subdomain) {
      alert('App subdomain not found. Please ensure the app has a subdomain configured.');
      return;
    }

    // Check if preview window is already open and still valid
    if (previewWindow && !previewWindow.closed) {
      previewWindow.focus();
      return;
    }

    // Open new preview window with app runtime
    const newPreviewWindow = websocketService.openPreviewWindow(app.subdomain);
    if (newPreviewWindow) {
      setPreviewWindow(newPreviewWindow);
      
      // Monitor when window is closed
      const checkClosed = setInterval(() => {
        if (newPreviewWindow.closed) {
          setPreviewWindow(null);
          clearInterval(checkClosed);
        }
      }, 1000);
    }
  };

  const handleOldExecute = () => {
    setShowPreviewModal(true);
    setPreviewScreenId(currentScreenId);
  };

  const handleCopyCanvas = async () => {
    try {
      const availableElementsForCalculations = currentScreen ? getAllElementsInScreen(currentScreen.elements) : [];
      await copyCanvasToClipboard(
        app, 
        app?._id, 
        currentScreen, 
        screens, 
        selectedElement, 
        availableElementsForCalculations
      );
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      alert('Failed to copy canvas data to clipboard');
    }
  };

  const handleCreateScreenClose = () => {
    setShowCreateScreenModal(false);
    setNewScreenName('');
  };

  const handleCreateScreen = () => {
    createScreen();
    setShowCreateScreenModal(false);
  };

  const handleDeleteScreen = (screenId) => {
    deleteScreen(screenId);
    setSelectedElement(null);
    setShowPropertiesPopup(false);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading app...
      </div>
    );
  }

  // App not found state
  if (!app) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        App not found. <Link to="/dashboard">Go back to Dashboard</Link>
      </div>
    );
  }

  // Get all available elements in current screen for calculations
  const availableElementsForCalculations = currentScreen ? getAllElementsInScreen(currentScreen.elements) : [];

  return (
    <ZIndexProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <BuilderHeader
          app={app}
          screens={screens}
          currentScreenId={currentScreenId}
          setCurrentScreenId={setCurrentScreenId}
          setSelectedElement={setSelectedElement}
          setShowPropertiesPopup={setShowPropertiesPopup}
          setShowCreateScreenModal={setShowCreateScreenModal}
          setShowScreenDetailsModal={setShowScreenDetailsModal}
          deleteScreen={handleDeleteScreen}
          copyCanvasToClipboard={handleCopyCanvas}
          copySuccess={copySuccess}
          handleExecute={handleExecute}
          handleOldExecute={handleOldExecute}
          saveApp={handleSaveApp}
          saving={saving}
        />

        {/* Main Content */}
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Canvas */}
          <Canvas
            currentScreen={currentScreen}
            handleCanvasClick={handleCanvasClick}
            handleCanvasDragOver={dragDropHandlers.handleCanvasDragOver}
            handleDragLeave={dragDropHandlers.handleDragLeave}
            handleCanvasDrop={dragDropHandlers.handleCanvasDrop}
            dropZone={dragDropHandlers.dropZone}
            renderElement={renderElement}
          />
        </div>

        {/* Elements Toolbar */}
        <ElementsToolbar
          handleNewElementDragStart={dragDropHandlers.handleNewElementDragStart}
          handleDragEnd={dragDropHandlers.handleDragEnd}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          showPropertiesPopup={showPropertiesPopup}
          selectedElement={selectedElement}
          popupPosition={popupPosition}
          isDragging={isDragging}
          handlePopupMouseDown={handlePopupMouseDown}
          setShowPropertiesPopup={setShowPropertiesPopup}
          updateElement={elementOperations.updateElement}
          availableElementsForCalculations={availableElementsForCalculations}
          screens={screens}
          currentScreenId={currentScreenId}
        />

        {/* Preview Modal */}
        {showPreviewModal && (
          <PreviewModal
            screens={screens}
            currentScreenId={previewScreenId}
            onClose={() => setShowPreviewModal(false)}
            onScreenChange={setPreviewScreenId}
          />
        )}

        {/* Create Screen Modal */}
        <CreateScreenModal
          showCreateScreenModal={showCreateScreenModal}
          newScreenName={newScreenName}
          setNewScreenName={setNewScreenName}
          createScreen={handleCreateScreen}
          onClose={handleCreateScreenClose}
        />

        {/* Screen Details Modal */}
        <ScreenDetailsModal
          showModal={showScreenDetailsModal}
          currentScreen={currentScreen}
          screens={screens}
          app={app}
          onClose={() => setShowScreenDetailsModal(false)}
          onUpdateScreen={updateScreen}
          onSetHomeScreen={setHomeScreen}
          onDeleteScreen={handleDeleteScreen}
        />
      </div>
    </ZIndexProvider>
  );
};



export default Builder;
