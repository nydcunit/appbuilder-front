import React from 'react';
import ContainerPropertiesPanel from './ContainerPropertiesPanel';

// FIXED: Get properties for rendering - now correctly handles conditional properties based on evaluation
const getRenderProperties = (element, matchedConditionIndex = null) => {
  console.log('🎨 Getting render properties for element:', element.id);
  console.log('🎨 Element renderType:', element.renderType);
  console.log('🎨 Element conditions:', element.conditions?.length || 0);
  console.log('🎨 Matched condition index:', matchedConditionIndex);
  
  if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
    // FIXED: Use the matched condition index if provided
    let conditionIndex = matchedConditionIndex;
    
    // Fallback to first condition if no specific match provided (for builder mode)
    if (conditionIndex === null || conditionIndex === undefined) {
      conditionIndex = 0;
      console.log('🎨 No matched condition index provided, defaulting to first condition for builder mode');
    }
    
    const selectedCondition = element.conditions[conditionIndex];
    console.log(`🎨 Using condition ${conditionIndex + 1}:`, selectedCondition);
    console.log(`🎨 Condition ${conditionIndex + 1} properties:`, selectedCondition?.properties);
    
    if (selectedCondition && selectedCondition.properties) {
      const mergedProperties = { ...element.properties, ...selectedCondition.properties };
      console.log('🎨 Merged properties:', mergedProperties);
      return mergedProperties;
    }
  }
  
  const baseProperties = element.properties || {};
  console.log('🎨 Using base properties:', baseProperties);
  return baseProperties;
};

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

  // FIXED: Render function now accepts matchedConditionIndex parameter
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null) => {
    const { onClick, onDelete, onDragOver, onDragLeave, onDrop, onDragStart } = handlers;
    
    // FIXED: Use the fixed getRenderProperties function with matched condition index
    const props = getRenderProperties(element, matchedConditionIndex);
    const contentType = element.contentType || 'fixed';
    
    console.log('🎨 Rendering container with props:', props);
    
    // Build styles from properties
    const containerStyle = {
      // Layout
      width: props.width || 'auto',
      height: props.height || 'auto',
      display: 'flex',
      flexDirection: props.orientation || 'column',
      alignItems: props.horizontalAlignment || 'flex-start',
      justifyContent: props.verticalAlignment || 'flex-start',
      
      // Styling - FIXED: Ensure background color is applied
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

    // Determine container label based on content type
    const getContainerLabel = () => {
      if (contentType === 'repeating') {
        const config = element.repeatingConfig;
        if (config && config.databaseId && config.tableId) {
          return `Repeating Container`;
        }
        return 'Repeating Container (No Data)';
      }
      return `Container (${props.orientation || 'column'})`;
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
            color: contentType === 'repeating' ? '#28a745' : '#666',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '3px',
            border: `1px solid ${contentType === 'repeating' ? '#28a745' : '#ddd'}`,
            zIndex: 1,
            pointerEvents: 'none',
            fontWeight: contentType === 'repeating' ? 'bold' : 'normal'
          }}
        >
          {getContainerLabel()}
          {element.renderType === 'conditional' && (
            <span style={{ color: '#007bff', marginLeft: '4px' }}>• Conditional</span>
          )}
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

  // Use the properties panel
  PropertiesPanel: ContainerPropertiesPanel
};