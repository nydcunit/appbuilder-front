import React, { useState, useCallback, memo } from 'react';
import ConditionBlock from '../components/ConditionBlock';

// Separate memoized properties panel component
const ContainerPropertiesPanel = memo(({ element, onUpdate, availableElements = [] }) => {
  const props = element.properties || {};

  // Stable update function for properties
  const updateProperty = useCallback((key, value) => {
    onUpdate({
      properties: {
        ...props,
        [key]: value
      }
    });
  }, [props, onUpdate]);

  // Handle condition updates (these go on the element itself, not properties)
  const handleConditionUpdate = useCallback((updates) => {
    onUpdate(updates);
  }, [onUpdate]);

  // Handle input changes with immediate updates
  const handleInputChange = useCallback((key, value) => {
    // Apply changes immediately on every keystroke
    updateProperty(key, value);
  }, [updateProperty]);

  // Handle Enter key for better UX
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }, []);

  // Get current value directly from props
  const getValue = useCallback((key) => {
    return props[key] ?? '';
  }, [props]);

  // Handle copying element ID to clipboard
  const copyElementId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(element.id);
      console.log('Element ID copied to clipboard');
    } catch (err) {
      console.error('Failed to copy element ID:', err);
    }
  }, [element.id]);

  return (
    <div>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Container Properties</h3>
      
      {/* Element ID Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Element ID
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={element.id}
            readOnly
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: '#f9f9f9',
              color: '#666',
              fontFamily: 'monospace'
            }}
          />
          <button
            onClick={copyElementId}
            style={{
              padding: '8px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            Copy
          </button>
        </div>
        
        <div style={{
          fontSize: '11px',
          color: '#999',
          marginTop: '4px'
        }}>
          Use this ID to reference this element in calculations
        </div>
      </div>

      {/* NEW: Condition Block */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        availableElements={availableElements}
      />
      
      {/* Layout Properties */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Layout
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Width:
          </label>
          <input
            type="text"
            value={getValue('width')}
            onChange={(e) => handleInputChange('width', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="auto, 100px, 50%"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Height:
          </label>
          <input
            type="text"
            value={getValue('height')}
            onChange={(e) => handleInputChange('height', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="auto, 100px, 50%"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Direction:
          </label>
          <select
            value={getValue('orientation')}
            onChange={(e) => updateProperty('orientation', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="column">Column</option>
            <option value="row">Row</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            V-Align:
          </label>
          <select
            value={getValue('verticalAlignment')}
            onChange={(e) => updateProperty('verticalAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            H-Align:
          </label>
          <select
            value={getValue('horizontalAlignment')}
            onChange={(e) => updateProperty('horizontalAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
      </div>

      {/* Styling */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Styling
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Background:
          </label>
          <input
            type="color"
            value={getValue('backgroundColor')}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Spacing - Margin */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Spacing
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Margin:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('marginTop')}
              onChange={(e) => handleInputChange('marginTop', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('marginBottom')}
              onChange={(e) => handleInputChange('marginBottom', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('marginLeft')}
              onChange={(e) => handleInputChange('marginLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('marginRight')}
              onChange={(e) => handleInputChange('marginRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Padding:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('paddingTop')}
              onChange={(e) => handleInputChange('paddingTop', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('paddingBottom')}
              onChange={(e) => handleInputChange('paddingBottom', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('paddingLeft')}
              onChange={(e) => handleInputChange('paddingLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('paddingRight')}
              onChange={(e) => handleInputChange('paddingRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Border Radius */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Border Radius
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Corners:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('borderRadiusTopLeft')}
              onChange={(e) => handleInputChange('borderRadiusTopLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('borderRadiusTopRight')}
              onChange={(e) => handleInputChange('borderRadiusTopRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('borderRadiusBottomLeft')}
              onChange={(e) => handleInputChange('borderRadiusBottomLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('borderRadiusBottomRight')}
              onChange={(e) => handleInputChange('borderRadiusBottomRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>
      </div>

      {/* Shadow */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Shadow
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Color:
          </label>
          <input
            type="color"
            value={getValue('shadowColor')}
            onChange={(e) => updateProperty('shadowColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <input
            type="number"
            value={getValue('shadowX')}
            onChange={(e) => handleInputChange('shadowX', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="X"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <input
            type="number"
            value={getValue('shadowY')}
            onChange={(e) => handleInputChange('shadowY', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="Y"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <input
            type="number"
            value={getValue('shadowBlur')}
            onChange={(e) => handleInputChange('shadowBlur', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="Blur"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
      </div>
    </div>
  );
});

export const ContainerElement = {
  type: 'container',
  label: 'Container',
  icon: '📦',
  
  // Default properties when element is created
  getDefaultProps: () => ({
    // Layout
    orientation: 'column',
    width: 'auto',
    height: 'auto',
    verticalAlignment: 'flex-start',
    horizontalAlignment: 'flex-start',
    
    // Styling
    backgroundColor: '#ffffff',
    
    // Spacing
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    
    // Border Radius
    borderRadiusTopLeft: 0,
    borderRadiusTopRight: 0,
    borderRadiusBottomLeft: 0,
    borderRadiusBottomRight: 0,
    
    // Border
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
    
    // Shadow
    shadowColor: '#000000',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0
  }),
  
  getDefaultChildren: () => ([]),

  // Render the element in the canvas (same as before)
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null) => {
    const { onClick, onDelete, onDragOver, onDragLeave, onDrop, onDragStart } = handlers;
    const props = element.properties || {};
    
    // Build styles from properties
    const containerStyle = {
      // Layout
      width: props.width || 'auto',
      height: props.height || 'auto',
      display: 'flex',
      flexDirection: props.orientation || 'column',
      alignItems: props.horizontalAlignment || 'flex-start',
      justifyContent: props.verticalAlignment || 'flex-start',
      
      // Styling
      backgroundColor: props.backgroundColor || '#ffffff',
      
      // Spacing
      marginTop: `${props.marginTop || 0}px`,
      marginBottom: `${props.marginBottom || 0}px`,
      marginLeft: `${props.marginLeft || 0}px`,
      marginRight: `${props.marginRight || 0}px`,
      paddingTop: `${props.paddingTop || 15}px`,
      paddingBottom: `${props.paddingBottom || 15}px`,
      paddingLeft: `${props.paddingLeft || 15}px`,
      paddingRight: `${props.paddingRight || 15}px`,
      
      // Border Radius
      borderTopLeftRadius: `${props.borderRadiusTopLeft || 0}px`,
      borderTopRightRadius: `${props.borderRadiusTopRight || 0}px`,
      borderBottomLeftRadius: `${props.borderRadiusBottomLeft || 0}px`,
      borderBottomRightRadius: `${props.borderRadiusBottomRight || 0}px`,
      
      // Border
      borderTopWidth: `${props.borderTopWidth || 1}px`,
      borderBottomWidth: `${props.borderBottomWidth || 1}px`,
      borderLeftWidth: `${props.borderLeftWidth || 1}px`,
      borderRightWidth: `${props.borderRightWidth || 1}px`,
      borderTopStyle: props.borderTopStyle || 'dashed',
      borderBottomStyle: props.borderBottomStyle || 'dashed',
      borderLeftStyle: props.borderLeftStyle || 'dashed',
      borderRightStyle: props.borderRightStyle || 'dashed',
      borderTopColor: props.borderTopColor || '#ccc',
      borderBottomColor: props.borderBottomColor || '#ccc',
      borderLeftColor: props.borderLeftColor || '#ccc',
      borderRightColor: props.borderRightColor || '#ccc',
      
      // Shadow
      boxShadow: props.shadowBlur > 0 
        ? `${props.shadowX || 0}px ${props.shadowY || 0}px ${props.shadowBlur || 0}px ${props.shadowColor || '#000000'}`
        : 'none',
      
      // Canvas specific styles
      minHeight: '80px',
      position: 'relative',
      cursor: 'grab',
      transition: 'all 0.2s ease',
      
      // Selection and drop zone styles
      ...(isSelected && {
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderTopColor: '#007bff',
        borderBottomColor: '#007bff',
        borderLeftColor: '#007bff',
        borderRightColor: '#007bff',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '2px',
        borderRightWidth: '2px'
      }),
      
      ...(isDropZone && {
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderTopColor: '#0056b3',
        borderBottomColor: '#0056b3',
        borderLeftColor: '#0056b3',
        borderRightColor: '#0056b3',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '2px',
        borderRightWidth: '2px',
        backgroundColor: '#e3f2fd'
      })
    };
    
    return (
      <div
        key={element.id}
        draggable={true}
        onClick={(e) => onClick && onClick(element, e)}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart && onDragStart(e);
        }}
        onDragOver={(e) => {
          e.stopPropagation();
          onDragOver && onDragOver(e);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          onDragLeave && onDragLeave(e);
        }}
        onDrop={(e) => {
          e.stopPropagation();
          onDrop && onDrop(e);
        }}
        style={containerStyle}
        onMouseDown={(e) => {
          e.currentTarget.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
      >
        {/* Container Label */}
        <div 
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '10px',
            color: '#666',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '3px',
            border: '1px solid #ddd',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          Container ({props.orientation || 'column'})
        </div>
        
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete(element.id);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            fontSize: '12px',
            borderRadius: '50%',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>

        {/* Drag Handle */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#999',
            cursor: 'grab',
            padding: '2px 4px',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          ⋮⋮
        </div>

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: props.orientation || 'column',
          alignItems: props.horizontalAlignment || 'flex-start',
          justifyContent: props.verticalAlignment || 'flex-start',
          minHeight: '50px',
          marginTop: '20px',
          gap: props.orientation === 'row' ? '10px' : '5px'
        }}>
          {children && children.length > 0 ? (
            children
          ) : (
            <div 
              onDragOver={(e) => {
                e.stopPropagation();
                onDragOver && onDragOver(e);
              }}
              onDrop={(e) => {
                e.stopPropagation();
                onDrop && onDrop(e);
              }}
              style={{ 
                color: isDropZone ? '#0056b3' : '#999', 
                fontSize: '12px', 
                textAlign: 'center',
                alignSelf: 'center',
                margin: 'auto',
                padding: '20px',
                border: isDropZone 
                  ? '2px dashed #0056b3' 
                  : '2px dashed #ddd',
                borderRadius: '4px',
                backgroundColor: isDropZone ? '#ffffff' : 'transparent',
                fontWeight: isDropZone ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                width: '100%',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isDropZone ? 'Release to drop here' : 'Drop elements here'}
            </div>
          )}
        </div>
      </div>
    );
  },

  // Use the updated properties panel with ConditionBlock
  PropertiesPanel: ContainerPropertiesPanel
};