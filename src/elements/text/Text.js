import React from 'react';
import TextPropertiesPanel from './TextPropertiesPanel';

// FIXED: Get properties for rendering - now correctly handles conditional properties based on evaluation
const getRenderProperties = (element, matchedConditionIndex = null) => {
  console.log('🎨 Getting render properties for text element:', element.id);
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

// FIX: Helper function to render text with calculation capsules in Canvas
const renderTextWithCalculationCapsules = (textValue) => {
  if (!textValue || typeof textValue !== 'string') {
    return 'Sample Text';
  }

  // Check if text contains calculation tokens
  if (!textValue.includes('{{CALC:')) {
    return textValue;
  }

  // Split text into parts and render calculation capsules
  const parts = textValue.split(/({{CALC:[^}]+}})/);
  
  return parts.map((part, index) => {
    const calcMatch = part.match(/{{CALC:([^}]+)}}/);
    if (calcMatch) {
      // This is a calculation token - render as capsule
      return (
        <span
          key={`calc-${index}`}
          style={{
            display: 'inline-block',
            backgroundColor: '#333',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500',
            margin: '0 2px',
            verticalAlign: 'middle'
          }}
        >
          Calculation
        </span>
      );
    }
    // Regular text part
    return part;
  });
};

export const TextElement = {
  type: 'text',
  label: 'Text',
  icon: '📝',
  
  // Default properties when element is created
  getDefaultProps: () => ({
    // Content
    value: 'Sample Text',
    
    // Typography
    fontSize: 16,
    fontWeight: '400',
    textAlignment: 'left',
    
    // Colors
    textColor: '#333333',
    textBackgroundColor: 'transparent',
    
    // Spacing
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    
    // Active state properties (for when inside slider)
    activeFontSize: 16,
    activeFontWeight: '400',
    activeTextAlignment: 'left',
    activeTextColor: '#333333',
    activeTextBackgroundColor: 'transparent',
    activeMarginTop: 0,
    activeMarginBottom: 0,
    activeMarginLeft: 0,
    activeMarginRight: 0,
    activePaddingTop: 8,
    activePaddingBottom: 8,
    activePaddingLeft: 12,
    activePaddingRight: 12
  }),
  
  getDefaultChildren: () => ([]),

  // FIXED: Render function now accepts matchedConditionIndex parameter
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null, isExecuteMode = false, isActiveSlide = false) => {
    const { onClick, onDelete, onDragStart } = handlers;
    
    console.log('🔍 Text render called:', {
      elementId: element.id,
      isExecuteMode,
      isActiveSlide,
      hasActiveProps: !!element.properties?.activeFontSize,
      value: element.properties?.value
    });
    
    // FIXED: Use the fixed getRenderProperties function with matched condition index
    let props = getRenderProperties(element, matchedConditionIndex);
    
    // Check if this element is in an active slide by checking parent hierarchy
    const checkIfInActiveSlide = () => {
      if (!isExecuteMode) return false;
      
      // Check if any parent element indicates this is in an active slide
      // This works by checking the element's ID pattern for repeating containers
      if (element.id && element.id.includes('_instance_')) {
        // Extract the instance number from repeating container ID
        const match = element.id.match(/_instance_(\d+)/);
        if (match) {
          const instanceIndex = parseInt(match[1]);
          // Check if there's a parent slider container tracking this
          const parentMatch = element.id.match(/^([^_]+)_instance/);
          if (parentMatch) {
            const parentId = parentMatch[1];
            // Check if this parent has active slide info
            if (window.__activeSlides && window.__activeSlides[parentId] === instanceIndex) {
              return true;
            }
          }
        }
      }
      
      // For non-repeating elements, check if they're in a slide that's active
      // by looking at the global active slides tracker
      if (window.__activeSlideElements) {
        // Check each slider to see if this element is in its active slide
        for (const [sliderId, activeIndex] of Object.entries(window.__activeSlideElements)) {
          // This is a simplified check - in practice we'd need to traverse the tree
          // For now, just use the passed isActiveSlide prop
          return isActiveSlide;
        }
      }
      
      return isActiveSlide;
    };
    
    // Apply active styles if this element is in the active slide
    const effectiveIsActiveSlide = checkIfInActiveSlide();
    if (effectiveIsActiveSlide && isExecuteMode) {
      console.log('✅ Applying active styles for text:', element.id);
      // Merge active properties over default properties
      const activeProps = {};
      Object.keys(props).forEach(key => {
        const activeKey = `active${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        if (props[activeKey] !== undefined) {
          activeProps[key] = props[activeKey];
        }
      });
      console.log('🎨 Active text props to apply:', activeProps);
      props = { ...props, ...activeProps };
      console.log('🎨 Final text props after active merge:', props);
    } else {
      console.log('❌ NOT applying active text styles:', {
        isActiveSlide: effectiveIsActiveSlide,
        isExecuteMode,
        reason: !effectiveIsActiveSlide ? 'not active slide' : 'not execute mode'
      });
    }
    
    console.log('🎨 Rendering text with props:', props);
    
    // Build styles from properties
    const textStyle = {
      // Typography
      fontSize: `${props.fontSize || 16}px`,
      fontWeight: props.fontWeight || '400',
      textAlign: props.textAlignment || 'left',
      
      // Colors
      color: props.textColor || '#333333',
      backgroundColor: props.textBackgroundColor === 'transparent' ? 'transparent' : (props.textBackgroundColor || 'transparent'),
      
      // Spacing
      marginTop: `${props.marginTop || 0}px`,
      marginBottom: `${props.marginBottom || 0}px`,
      marginLeft: `${props.marginLeft || 0}px`,
      marginRight: `${props.marginRight || 0}px`,
      paddingTop: `${props.paddingTop || 8}px`,
      paddingBottom: `${props.paddingBottom || 8}px`,
      paddingLeft: `${props.paddingLeft || 12}px`,
      paddingRight: `${props.paddingRight || 12}px`,
      
      // Canvas specific styles
      position: 'relative',
      cursor: 'grab',
      transition: 'all 0.2s ease',
      display: 'inline-block',
      border: isSelected ? '2px solid #007bff' : '1px dashed transparent',
      borderRadius: '2px',
      
      // Hover effect
      '&:hover': {
        border: '1px dashed #ccc'
      }
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
        style={{
          position: 'relative',
          display: 'inline-block'
        }}
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
        {/* Element Label */}
        {isSelected && (
          <div 
            style={{
              position: 'absolute',
              top: '-20px',
              left: '0px',
              fontSize: '10px',
              color: '#007bff',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #007bff',
              zIndex: 1,
              pointerEvents: 'none',
              whiteSpace: 'nowrap'
            }}
          >
            Text Element (ID: {element.id.slice(-6)})
            {element.renderType === 'conditional' && (
              <span style={{ color: '#28a745', marginLeft: '4px' }}>• Conditional</span>
            )}
          </div>
        )}
        
        {/* Delete Button */}
        {isSelected && (
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
              top: '-10px',
              right: '-10px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              width: '20px',
              height: '20px',
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
        )}

        {/* Drag Handle */}
        {isSelected && (
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: '#007bff',
              cursor: 'grab',
              padding: '2px 4px',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            ⋮⋮
          </div>
        )}

        {/* Text Content - FIX: Render with calculation capsules */}
        <div style={textStyle}>
          {renderTextWithCalculationCapsules(props.value)}
        </div>
      </div>
    );
  },

  // Use the updated properties panel
  PropertiesPanel: TextPropertiesPanel
};
