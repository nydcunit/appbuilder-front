import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ZIndexProvider } from '../../components/ZIndexContext';
import { getElementByType } from '../../elements';
import websocketService from '../../services/websocketService';

// Import components
import BuilderHeader from './components/Header/BuilderHeader';
import Canvas from './components/Canvas/Canvas';
import ElementsToolbar from './components/Panels/ElementsToolbar';
import PropertiesPanel from './components/Panels/PropertiesPanel';
import PreviewModal from './components/Modals/PreviewModal';
import CreateScreenModal from './components/Modals/CreateScreenModal';

// Import hooks
import { useAppState } from './hooks/useAppState';
import { useElementOperations } from './hooks/useElementOperations';
import { useDragDrop } from './hooks/useDragDrop';
import { usePropertiesPanel } from './hooks/usePropertiesPanel';

// Import utils
import { getAllElementsInScreen, copyCanvasToClipboard } from './utils/canvasUtils';

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
      </div>
    </ZIndexProvider>
  );
};

export default Builder;
