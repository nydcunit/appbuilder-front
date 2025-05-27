import React from 'react';
import { availableElements } from '../../../../elements';

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

export default ElementsToolbar;