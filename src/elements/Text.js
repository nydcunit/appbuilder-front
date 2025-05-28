import React, { useState, useCallback, memo } from 'react';
import SuperText from '../components/SuperText';
import ConditionBlock from '../components/ConditionBlock';

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

// Updated Text Properties Panel with Enhanced Conditional Properties Support
const TextPropertiesPanel = memo(({ element, onUpdate, availableElements = [] }) => {
  const props = element.properties || {};
  
  // FIXED: Initialize activeConditionIndex based on element's conditional state
  const [activeConditionIndex, setActiveConditionIndex] = useState(() => {
    // If element has conditional rendering and conditions, default to first condition
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      return 0; // Default to first condition for editing
    }
    return 0;
  });

  // FIXED: Update activeConditionIndex when element changes, but preserve user selection
  React.useEffect(() => {
    console.log('🔧 Element changed, checking condition state:', {
      elementId: element.id,
      renderType: element.renderType,
      conditionsCount: element.conditions?.length || 0,
      currentActiveIndex: activeConditionIndex
    });

    // Only reset if the current activeConditionIndex is out of bounds
    if (element.renderType !== 'conditional' || !element.conditions || element.conditions.length === 0) {
      console.log('🔧 No conditional rendering, resetting to 0');
      setActiveConditionIndex(0);
    } else if (activeConditionIndex >= element.conditions.length) {
      console.log('🔧 Active condition index out of bounds, resetting to 0');
      setActiveConditionIndex(0);
    }
    // Otherwise, preserve the current activeConditionIndex to maintain user's selection
  }, [element.id, element.renderType, element.conditions?.length]); // Only depend on essential changes

  // FIXED: Get the current properties - enhanced logic for condition property inheritance
  const getCurrentProperties = useCallback(() => {
    console.log('🔧 Getting current properties for element:', element.id);
    console.log('🔧 Render type:', element.renderType);
    console.log('🔧 Active condition index:', activeConditionIndex);
    console.log('🔧 Conditions:', element.conditions?.length || 0);
    
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      const activeCondition = element.conditions[activeConditionIndex];
      console.log('🔧 Active condition:', activeCondition);
      console.log('🔧 Active condition properties:', activeCondition?.properties);
      
      // FIXED: Return condition properties if they exist, otherwise return base properties
      if (activeCondition?.properties) {
        const mergedProps = { ...props, ...activeCondition.properties };
        console.log('🔧 Merged properties:', mergedProps);
        return mergedProps;
      } else {
        // If condition doesn't have properties yet, return base properties
        console.log('🔧 No condition properties, using base properties:', props);
        return props;
      }
    }
    console.log('🔧 Using base properties:', props);
    return props;
  }, [element.renderType, element.conditions, activeConditionIndex, props]);

  // FIXED: Stable update function for properties
  const updateProperty = useCallback((key, value) => {
    console.log('🔧 Updating property:', key, '=', value);
    console.log('🔧 Element render type:', element.renderType);
    console.log('🔧 Active condition index:', activeConditionIndex);
    
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      // Update condition-specific properties
      console.log('🔧 Updating condition-specific property');
      const newConditions = element.conditions.map((condition, index) => {
        if (index === activeConditionIndex) {
          const updatedCondition = {
            ...condition,
            properties: {
              ...condition.properties,
              [key]: value
            }
          };
          console.log('🔧 Updated condition:', updatedCondition);
          return updatedCondition;
        }
        return condition;
      });
      console.log('🔧 All updated conditions:', newConditions);
      onUpdate({ conditions: newConditions });
    } else {
      // Update base properties
      console.log('🔧 Updating base property');
      const updatedProps = {
        ...props,
        [key]: value
      };
      console.log('🔧 Updated base properties:', updatedProps);
      onUpdate({
        properties: updatedProps
      });
    }
  }, [props, onUpdate, element.renderType, element.conditions, activeConditionIndex]);

  // FIXED: Handle condition updates AND manage active condition index
  const handleConditionUpdate = useCallback((updates) => {
    console.log('🔧 Updating conditions:', updates);
    
    // If we're adding a new condition, copy properties from the active condition or base
    if (updates.conditions && updates.conditions.length > (element.conditions?.length || 0)) {
      const newConditions = updates.conditions.map((condition, index) => {
        // If this is a new condition and doesn't have properties, copy from active condition or base
        if (!condition.properties) {
          let sourceProperties = { ...props }; // Start with base properties
          
          // If we have an active condition with properties, copy from there
          if (element.conditions && element.conditions[activeConditionIndex]?.properties) {
            sourceProperties = { ...element.conditions[activeConditionIndex].properties };
          }
          
          console.log('🔧 Copying properties to new condition:', sourceProperties);
          return {
            ...condition,
            properties: sourceProperties
          };
        }
        return condition;
      });
      updates.conditions = newConditions;
      console.log('🔧 Final conditions with copied properties:', updates.conditions);
    }
    
    // If conditions were deleted and activeConditionIndex is out of bounds, reset it
    if (updates.conditions && activeConditionIndex >= updates.conditions.length) {
      console.log('🔧 Resetting active condition index due to condition deletion');
      setActiveConditionIndex(0);
    }
    
    onUpdate(updates);
  }, [onUpdate, element.conditions, props, activeConditionIndex]);

  // FIXED: Handle condition selection changes from ConditionBlock
  const handleConditionSelectionChange = useCallback((conditionIndex) => {
    console.log('🔧 Condition selection changed to:', conditionIndex);
    setActiveConditionIndex(conditionIndex);
  }, []);

  // Handle input changes with immediate updates
  const handleInputChange = useCallback((key, value) => {
    console.log('🔧 Handle input change:', key, '=', value);
    updateProperty(key, value);
  }, [updateProperty]);

  // Handle Enter key for better UX
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  }, []);

  // Get current value directly from current properties
  const getValue = useCallback((key) => {
    const currentProps = getCurrentProperties();
    const value = currentProps[key] ?? '';
    console.log('🔧 Getting value for', key, '=', value);
    return value;
  }, [getCurrentProperties]);

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
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Text Properties</h3>
      
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

      {/* FIXED: Condition Block with callback for condition selection changes */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        onConditionSelectionChange={handleConditionSelectionChange}
        activeConditionIndex={activeConditionIndex}
        availableElements={availableElements}
      />

      {/* FIXED: Show indicator of which condition's properties are being edited */}
      {element.renderType === 'conditional' && element.conditions && element.conditions.length > 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #2196f3',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          <strong>📝 Editing properties for Condition {activeConditionIndex + 1}</strong>
          <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.8 }}>
            All style settings below will apply to this condition. Switch between conditions using the tabs above.
          </div>
          <div style={{ fontSize: '11px', marginTop: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: '4px' }}>
            <strong>💡 Tip:</strong> Changes are automatically saved. The text color, font size, and other properties you set here will be applied when this condition evaluates to true during preview/execution.
          </div>
        </div>
      )}

      {/* Content Section with SuperText */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Content
        </h4>
        
        <SuperText
          label="Text Value"
          placeholder="Enter your text..."
          value={getValue('value')}
          onChange={(value) => handleInputChange('value', value)}
          availableElements={availableElements}
        />
      </div>

      {/* Typography */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Typography
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Font Size:
          </label>
          <input
            type="number"
            value={getValue('fontSize')}
            onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value) || 16)}
            onKeyPress={handleKeyPress}
            placeholder="16"
            min="8"
            max="100"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>px</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Font Weight:
          </label>
          <select
            value={getValue('fontWeight')}
            onChange={(e) => updateProperty('fontWeight', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="100">Thin (100)</option>
            <option value="200">Extra Light (200)</option>
            <option value="300">Light (300)</option>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Text Align:
          </label>
          <select
            value={getValue('textAlignment')}
            onChange={(e) => updateProperty('textAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Colors
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Text Color:
          </label>
          <input
            type="color"
            value={getValue('textColor')}
            onChange={(e) => updateProperty('textColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Background:
          </label>
          <input
            type="color"
            value={getValue('textBackgroundColor')}
            onChange={(e) => updateProperty('textBackgroundColor', e.target.value)}
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
    </div>
  );
});

TextPropertiesPanel.displayName = 'TextPropertiesPanel';

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
    paddingRight: 12
  }),
  
  getDefaultChildren: () => ([]),

  // FIXED: Render function now accepts matchedConditionIndex parameter
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null) => {
    const { onClick, onDelete, onDragStart } = handlers;
    
    // FIXED: Use the fixed getRenderProperties function with matched condition index
    const props = getRenderProperties(element, matchedConditionIndex);
    
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
      minWidth: '50px',
      minHeight: '20px',
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