import React, { useRef, useEffect } from 'react';
import { getElementByType } from '../../../../elements';

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

export default PropertiesPanel;
