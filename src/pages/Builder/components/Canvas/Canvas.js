import React from 'react';
import ElementRenderer from './ElementRenderer';

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

export default Canvas;
