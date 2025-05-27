import React, { useState, useCallback, memo } from 'react';
import SuperText from '../components/SuperText';
import ConditionBlock from '../components/ConditionBlock';

// Updated Text Properties Panel with Conditional Properties Support
const TextPropertiesPanel = memo(({ element, onUpdate, availableElements = [] }) => {
  const props = element.properties || {};
  const [activeConditionIndex, setActiveConditionIndex] = useState(0);

  // Get the current properties - either base properties or condition-specific properties
  const getCurrentProperties = useCallback(() => {
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      const activeCondition = element.conditions[activeConditionIndex];
      return activeCondition?.properties || props;
    }
    return props;
  }, [element.renderType, element.conditions, activeConditionIndex, props]);

  // Stable update function
  const updateProperty = useCallback((key, value) => {
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      // Update condition-specific properties
      const newConditions = element.conditions.map((condition, index) => {
        if (index === activeConditionIndex) {
          return {
            ...condition,
            properties: {
              ...condition.properties,
              [key]: value
            }
          };
        }
        return condition;
      });
      onUpdate({ conditions: newConditions });
    } else {
      // Update base properties
      onUpdate({
        properties: {
          ...props,
          [key]: value
        }
      });
    }
  }, [props, onUpdate, element.renderType, element.conditions, activeConditionIndex]);

  // Handle condition updates (these go on the element itself, not properties)
  const handleConditionUpdate = useCallback((updates) => {
    console.log('Updating conditions:', updates);
    
    // If we're adding a new condition, copy properties from the previous condition
    if (updates.conditions && updates.conditions.length > (element.conditions?.length || 0)) {
      const newConditions = updates.conditions.map((condition, index) => {
        // If this is a new condition and doesn't have properties, copy from previous condition
        if (!condition.properties && index > 0) {
          const previousCondition = updates.conditions[index - 1];
          return {
            ...condition,
            properties: previousCondition.properties ? { ...previousCondition.properties } : { ...props }
          };
        }
        return condition;
      });
      updates.conditions = newConditions;
    }
    
    onUpdate(updates);
  }, [onUpdate, element.conditions, props]);

  // Handle input changes with immediate updates
  const handleInputChange = useCallback((key, value) => {
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
    return currentProps[key] ?? '';
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

  // Render condition selector for properties
  const renderConditionSelector = () => {
    if (element.renderType !== 'conditional' || !element.conditions || element.conditions.length === 0) {
      return null;
    }

    return (
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{ 
          marginBottom: '12px', 
          color: '#333', 
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Condition Properties
        </h4>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}>
          {element.conditions.map((condition, index) => (
            <button
              key={condition.id || index}
              onClick={() => setActiveConditionIndex(index)}
              style={{
                backgroundColor: activeConditionIndex === index ? '#007bff' : '#ffffff',
                color: activeConditionIndex === index ? 'white' : '#333',
                border: `1px solid ${activeConditionIndex === index ? '#007bff' : '#ddd'}`,
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
            >
              Condition {index + 1}
            </button>
          ))}
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Configure how this element appears when Condition {activeConditionIndex + 1} is true.
        </div>
      </div>
    );
  };

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

      {/* Condition Block */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        availableElements={availableElements}
      />

      {/* Condition Properties Selector */}
      {renderConditionSelector()}

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

// Get properties for rendering - use condition 1 properties if conditional
const getRenderProperties = (element) => {
  if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
    const firstCondition = element.conditions[0];
    if (firstCondition.properties) {
      return { ...element.properties, ...firstCondition.properties };
    }
  }
  return element.properties || {};
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

  // Render the element in the canvas
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null) => {
    const { onClick, onDelete, onDragStart } = handlers;
    const props = getRenderProperties(element); // Use condition 1 properties if conditional
    
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

  // Use the memoized properties panel
  PropertiesPanel: TextPropertiesPanel
};