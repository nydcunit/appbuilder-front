import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { availableElements, getElementByType, createElement } from '../elements';
import { ZIndexProvider } from '../components/ZIndexContext';
import { executeTextCalculations } from '../utils/calculationEngine';
import axios from 'axios';

const Builder = () => {
  const { appId } = useParams();
  const { user, logout } = useAuth();
  
  const [app, setApp] = useState(null);
  const [screens, setScreens] = useState([]);
  const [currentScreenId, setCurrentScreenId] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showPropertiesPopup, setShowPropertiesPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: window.innerWidth - 520, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showCreateScreenModal, setShowCreateScreenModal] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');
  const [draggedElement, setDraggedElement] = useState(null);
  const [draggedExistingElement, setDraggedExistingElement] = useState(null);
  const [dropZone, setDropZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewScreenId, setPreviewScreenId] = useState(null);

  const popupRef = useRef(null);
  const currentScreen = screens.find(screen => screen.id === currentScreenId);

  useEffect(() => {
    loadApp();
  }, [appId]);

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

  const handlePopupMouseDown = (e) => {
    if (e.target.closest('.popup-header')) {
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  const loadApp = async () => {
    try {
      const response = await axios.get(`/api/apps/${appId}`);
      if (response.data.success) {
        const appData = response.data.data;
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
      const response = await axios.put(`/api/apps/${appId}`, {
        screens: screens
      });
      
      if (response.data.success) {
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

  const handleExecute = () => {
    setPreviewScreenId(currentScreenId);
    setShowPreviewModal(true);
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
    setShowCreateScreenModal(false);
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
      
      setSelectedElement(null);
      setShowPropertiesPopup(false);
    }
  };

  const addElementToCanvas = (elementType) => {
    const newElement = createElement(elementType);
    if (!newElement) return;
    
    setScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? { ...screen, elements: [...screen.elements, newElement] }
        : screen
    ));
  };

  const addElementToContainer = (elementType, containerId) => {
    const newElement = createElement(elementType);
    if (!newElement) return;
    
    setScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: addToElementInTree(screen.elements, containerId, newElement)
          }
        : screen
    ));
  };

  const moveExistingElementToCanvas = (element) => {
    setScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, element.id)
          }
        : screen
    ));

    setScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? { ...screen, elements: [...screen.elements, element] }
        : screen
    ));
  };

  const moveExistingElementToContainer = (element, containerId) => {
    if (element.id === containerId) return;

    setScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, element.id)
          }
        : screen
    ));

    setScreens(prevScreens => prevScreens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: addToElementInTree(screen.elements, containerId, element)
          }
        : screen
    ));
  };

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

  const updateElement = (elementId, updates) => {
    setScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: updateElementInTree(screen.elements, elementId, updates)
          }
        : screen
    ));

    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  const updateElementInTree = (elements, targetId, updates) => {
    return elements.map(element => {
      if (element.id === targetId) {
        return { ...element, ...updates };
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

  const deleteElement = (elementId) => {
    setScreens(screens.map(screen =>
      screen.id === currentScreenId
        ? {
            ...screen,
            elements: removeElementFromTree(screen.elements, elementId)
          }
        : screen
    ));
    
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
      setShowPropertiesPopup(false);
    }
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

  // Helper function to get all elements in current screen (including nested ones)
  const getAllElementsInScreen = (elements) => {
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

  const handleElementClick = (element, event) => {
    event.stopPropagation();
    setSelectedElement(element);
    setShowPropertiesPopup(true);
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
    setShowPropertiesPopup(false);
  };

  const handleNewElementDragStart = (e, elementType) => {
    setDraggedElement(elementType);
    setDraggedExistingElement(null);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleExistingElementDragStart = (e, element) => {
    e.stopPropagation();
    setDraggedExistingElement(element);
    setDraggedElement(null);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', element.id);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
    setDraggedExistingElement(null);
    setDropZone(null);
  };

  const handleContainerDragOver = (e, containerId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedExistingElement && draggedExistingElement.id === containerId) {
      return;
    }
    
    e.dataTransfer.dropEffect = draggedExistingElement ? 'move' : 'copy';
    setDropZone(containerId);
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    e.dataTransfer.dropEffect = draggedExistingElement ? 'move' : 'copy';
    setDropZone('canvas');
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setTimeout(() => {
        setDropZone(null);
      }, 10);
    }
  };

  const handleContainerDrop = (e, containerId) => {
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
  };

  const handleCanvasDrop = (e) => {
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
  };

  const renderElement = (element, depth = 0) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    const isSelected = selectedElement?.id === element.id;
    const isDropZone = dropZone === element.id;
    const isDragging = draggedExistingElement?.id === element.id;

    const handlers = {
      onClick: handleElementClick,
      onDelete: deleteElement,
      onDragOver: (e) => handleContainerDragOver(e, element.id),
      onDragLeave: handleDragLeave,
      onDrop: (e) => handleContainerDrop(e, element.id),
      onDragStart: (e) => handleExistingElementDragStart(e, element)
    };

    const children = element.children && element.children.length > 0 
      ? element.children.map(child => renderElement(child, depth + 1))
      : null;

    const renderedElement = elementDef.render(element, depth, isSelected, isDropZone, handlers, children);
    
    return React.cloneElement(renderedElement, {
      key: element.id,
      style: {
        ...renderedElement.props.style,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }
    });
  };

  const isCanvasDropZone = dropZone === 'canvas';

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
        {/* Top Bar */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Screen:</label>
              <select
                value={currentScreenId}
                onChange={(e) => {
                  setCurrentScreenId(parseInt(e.target.value));
                  setSelectedElement(null);
                  setShowPropertiesPopup(false);
                }}
                style={{ padding: '5px', border: '1px solid #ddd' }}
              >
                {screens.map(screen => (
                  <option key={screen.id} value={screen.id}>
                    {screen.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowCreateScreenModal(true)}
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
                onClick={() => deleteScreen(currentScreenId)}
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

        {/* Main Content - Full Width Canvas */}
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Canvas - Now Full Width */}
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
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
                currentScreen.elements.map(element => renderElement(element))
              )}
            </div>
          </div>
        </div>

        {/* Elements Bar */}
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

        {/* Draggable Properties Popup */}
        {showPropertiesPopup && selectedElement && (
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
              />
            </div>
          </div>
        )}

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
        {showCreateScreenModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '300px'
            }}>
              <h3>Create New Screen</h3>
              <input
                type="text"
                placeholder="Screen name"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  marginBottom: '15px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && createScreen()}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  onClick={() => {
                    setShowCreateScreenModal(false);
                    setNewScreenName('');
                  }}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={createScreen}
                  disabled={!newScreenName.trim()}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    opacity: !newScreenName.trim() ? 0.5 : 1
                  }}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ZIndexProvider>
  );
};

// Preview Modal Component with Real Calculation Execution
const PreviewModal = ({ screens, currentScreenId, onClose, onScreenChange }) => {
  const currentScreen = screens.find(screen => screen.id === currentScreenId);
  const [calculationResults, setCalculationResults] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionErrors, setExecutionErrors] = useState({});

  // Execute calculations for the current screen
  useEffect(() => {
    if (currentScreen) {
      executeCalculations();
    }
  }, [currentScreen]);

  const executeCalculations = async () => {
    setIsExecuting(true);
    setExecutionErrors({});
    
    const results = {};
    const errors = {};
    const allElements = getAllElementsInScreen(currentScreen.elements);
    
    for (const element of allElements) {
      if (element.type === 'text' && element.properties?.value) {
        try {
          // Extract calculation storage from SuperText component data
          // This is a simplified approach - in a real app, you'd store calculations centrally
          const calculationStorage = extractCalculationStorage(element.properties.value);
          
          const executedValue = await executeTextCalculations(
            element.properties.value, 
            allElements,
            calculationStorage
          );
          results[element.id] = executedValue;
        } catch (error) {
          console.error(`Error executing calculations for element ${element.id}:`, error);
          errors[element.id] = error.message;
          results[element.id] = `[Error: ${error.message}]`;
        }
      }
    }
    
    setCalculationResults(results);
    setExecutionErrors(errors);
    setIsExecuting(false);
  };

  // Helper function to extract calculation storage (simplified)
  const extractCalculationStorage = (textValue) => {
    // In a real implementation, you'd store calculations in a central location
    // For now, we'll return an empty object and let the engine handle missing calculations
    return {};
  };

  const getAllElementsInScreen = (elements) => {
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

  const renderPreviewElement = (element, depth = 0) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    // Create a copy of the element with executed calculations
    const executedElement = {
      ...element,
      properties: {
        ...element.properties,
        ...(element.type === 'text' && calculationResults[element.id] && {
          value: calculationResults[element.id]
        })
      }
    };

    const children = element.children && element.children.length > 0 
      ? element.children.map(child => renderPreviewElement(child, depth + 1))
      : null;

    // Render without edit handlers for preview
    const renderedElement = elementDef.render(
      executedElement, 
      depth, 
      false, // not selected
      false, // not drop zone
      {}, // no handlers
      children
    );
    
    return React.cloneElement(renderedElement, {
      key: element.id,
      style: {
        ...renderedElement.props.style,
        // Remove edit-specific styles
        cursor: 'default',
        border: element.type === 'container' ? '1px solid #ddd' : renderedElement.props.style?.border,
        // Add error styling if there's an execution error
        ...(executionErrors[element.id] && {
          backgroundColor: '#ffebee',
          border: '1px solid #f44336'
        })
      }
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1000px',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Preview Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>
              Preview - {currentScreen?.name}
              {isExecuting && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#28a745', 
                  marginLeft: '10px' 
                }}>
                  🔄 Executing calculations...
                </span>
              )}
            </h3>
            
            {/* Screen Navigator */}
            <select
              value={currentScreenId}
              onChange={(e) => onScreenChange(parseInt(e.target.value))}
              style={{
                padding: '5px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {screens.map(screen => (
                <option key={screen.id} value={screen.id}>
                  {screen.name}
                </option>
              ))}
            </select>

            {/* Refresh Calculations Button */}
            <button
              onClick={executeCalculations}
              disabled={isExecuting}
              style={{
                padding: '5px 10px',
                backgroundColor: isExecuting ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isExecuting ? '🔄' : '🔄 Refresh'}
            </button>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close Preview
          </button>
        </div>

        {/* Execution Errors Display */}
        {Object.keys(executionErrors).length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#ffebee',
            borderBottom: '1px solid #f44336',
            fontSize: '12px',
            color: '#d32f2f'
          }}>
            ⚠️ Calculation errors detected. Check console for details.
          </div>
        )}

        {/* Preview Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}>
          {currentScreen?.elements?.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontSize: '18px'
            }}>
              No elements to preview
            </div>
          ) : (
            <div style={{ minHeight: '100%' }}>
              {currentScreen.elements.map(element => renderPreviewElement(element))}
            </div>
          )}
        </div>

        {/* Preview Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #ddd',
          backgroundColor: '#f8f9fa',
          fontSize: '12px',
          color: '#666'
        }}>
          💡 This is how your app will look to users. Calculations are executed in real-time.
          {Object.keys(executionErrors).length > 0 && (
            <span style={{ color: '#d32f2f', marginLeft: '10px' }}>
              | ⚠️ Some calculations failed - check your database connections and element references.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ElementProperties = ({ element, onUpdate, availableElements }) => {
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
    />
  );
};

export default Builder;