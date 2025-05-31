import React, { memo, useCallback, useEffect, useState } from 'react';
import ConditionBlock from '../components/ConditionBlock';
import SuperText from '../components/SuperText';

// ============================================
// TEXT STYLE SETTINGS COMPONENT
// ============================================

const TextStyleSettings = ({ 
  getValue, 
  handleInputChange, 
  handleKeyPress, 
  updateProperty,
  element,
  isInsideSliderContainer = false, // Flag to indicate if this text is inside a slider container
  isInsideTabsContainer = false // Flag to indicate if this text is inside a tabs container
}) => {
  
  // State for active mode toggle
  const [isActiveMode, setIsActiveMode] = useState(false);
  
  // Helper function to get property name (with active prefix if in active mode)
  const getPropertyName = useCallback((baseName) => {
    return isActiveMode ? `active${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}` : baseName;
  }, [isActiveMode]);
  
  // Helper function to get value with active mode support
  const getValueWithActiveMode = useCallback((baseName) => {
    const propertyName = getPropertyName(baseName);
    return getValue(propertyName);
  }, [getValue, getPropertyName]);
  
  // Helper function to handle input change with active mode support
  const handleInputChangeWithActiveMode = useCallback((baseName, value) => {
    const propertyName = getPropertyName(baseName);
    handleInputChange(propertyName, value);
  }, [handleInputChange, getPropertyName]);
  
  // Helper function to update property with active mode support
  const updatePropertyWithActiveMode = useCallback((baseName, value) => {
    const propertyName = getPropertyName(baseName);
    updateProperty(propertyName, value);
  }, [updateProperty, getPropertyName]);
  
  // Style for labels in active mode
  const labelStyle = {
    minWidth: '80px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: isActiveMode ? '#8b5cf6' : '#555'
  };
  
  // Style for section headers in active mode
  const headerStyle = {
    marginBottom: '10px',
    color: isActiveMode ? '#8b5cf6' : '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px'
  };

  return (
    <>
      {/* Active Mode Toggle for Text Elements Inside Slider Containers */}
      {isInsideSliderContainer && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: isActiveMode ? '#f3f4f6' : 'transparent',
            borderRadius: '4px',
            border: isActiveMode ? '1px solid #8b5cf6' : '1px solid transparent'
          }}>
            <button
              onClick={() => setIsActiveMode(!isActiveMode)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isActiveMode ? '#8b5cf6' : '#e5e7eb',
                color: isActiveMode ? 'white' : '#374151',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Active
            </button>
            <span style={{
              fontSize: '12px',
              color: isActiveMode ? '#8b5cf6' : '#6b7280',
              fontWeight: isActiveMode ? '500' : '400'
            }}>
              {isActiveMode ? 'Editing active slide text styles' : 'Editing default text styles'}
            </span>
          </div>
          {isActiveMode && (
            <div style={{
              fontSize: '11px',
              color: '#8b5cf6',
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: '#faf5ff',
              borderRadius: '3px'
            }}>
              These styles will only apply when this text is in the active slide
            </div>
          )}
        </div>
      )}

      {/* Active Mode Toggle for Text Elements Inside Tabs Containers */}
      {isInsideTabsContainer && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: isActiveMode ? '#f0f8ff' : 'transparent',
            borderRadius: '4px',
            border: isActiveMode ? '1px solid #007bff' : '1px solid transparent'
          }}>
            <button
              onClick={() => setIsActiveMode(!isActiveMode)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isActiveMode ? '#007bff' : '#e5e7eb',
                color: isActiveMode ? 'white' : '#374151',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Active
            </button>
            <span style={{
              fontSize: '12px',
              color: isActiveMode ? '#007bff' : '#6b7280',
              fontWeight: isActiveMode ? '500' : '400'
            }}>
              {isActiveMode ? 'Editing active tab text styles' : 'Editing default text styles'}
            </span>
          </div>
          {isActiveMode && (
            <div style={{
              fontSize: '11px',
              color: '#007bff',
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: '#e6f3ff',
              borderRadius: '3px'
            }}>
              These styles will only apply when this text is in the active tab
            </div>
          )}
        </div>
      )}

      {/* Typography */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Typography
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Font Size:
          </label>
          <input
            type="number"
            value={getValueWithActiveMode('fontSize')}
            onChange={(e) => handleInputChangeWithActiveMode('fontSize', parseInt(e.target.value) || 16)}
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
          <label style={labelStyle}>
            Font Weight:
          </label>
          <select
            value={getValueWithActiveMode('fontWeight')}
            onChange={(e) => updatePropertyWithActiveMode('fontWeight', e.target.value)}
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
          <label style={labelStyle}>
            Text Align:
          </label>
          <select
            value={getValueWithActiveMode('textAlignment')}
            onChange={(e) => updatePropertyWithActiveMode('textAlignment', e.target.value)}
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
        <h4 style={headerStyle}>
          Colors
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Text Color:
          </label>
          <input
            type="color"
            value={getValueWithActiveMode('textColor')}
            onChange={(e) => updatePropertyWithActiveMode('textColor', e.target.value)}
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
          <label style={labelStyle}>
            Background:
          </label>
          <input
            type="color"
            value={getValueWithActiveMode('textBackgroundColor')}
            onChange={(e) => updatePropertyWithActiveMode('textBackgroundColor', e.target.value)}
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
        <h4 style={headerStyle}>
          Spacing
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            marginBottom: '5px', 
            color: isActiveMode ? '#8b5cf6' : '#555' 
          }}>
            Margin:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValueWithActiveMode('marginTop')}
              onChange={(e) => handleInputChangeWithActiveMode('marginTop', parseInt(e.target.value) || 0)}
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
              value={getValueWithActiveMode('marginBottom')}
              onChange={(e) => handleInputChangeWithActiveMode('marginBottom', parseInt(e.target.value) || 0)}
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
              value={getValueWithActiveMode('marginLeft')}
              onChange={(e) => handleInputChangeWithActiveMode('marginLeft', parseInt(e.target.value) || 0)}
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
              value={getValueWithActiveMode('marginRight')}
              onChange={(e) => handleInputChangeWithActiveMode('marginRight', parseInt(e.target.value) || 0)}
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
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            marginBottom: '5px', 
            color: isActiveMode ? '#8b5cf6' : '#555' 
          }}>
            Padding:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValueWithActiveMode('paddingTop')}
              onChange={(e) => handleInputChangeWithActiveMode('paddingTop', parseInt(e.target.value) || 0)}
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
              value={getValueWithActiveMode('paddingBottom')}
              onChange={(e) => handleInputChangeWithActiveMode('paddingBottom', parseInt(e.target.value) || 0)}
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
              value={getValueWithActiveMode('paddingLeft')}
              onChange={(e) => handleInputChangeWithActiveMode('paddingLeft', parseInt(e.target.value) || 0)}
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
              value={getValueWithActiveMode('paddingRight')}
              onChange={(e) => handleInputChangeWithActiveMode('paddingRight', parseInt(e.target.value) || 0)}
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
    </>
  );
};

// ============================================
// TEXT CONTENT SETTINGS COMPONENT
// ============================================

const TextContentSettings = ({ 
  getValue, 
  handleInputChange, 
  availableElements = [],
  element,
  isInsideSliderContainer = false, // Flag to indicate if this text is inside a slider container
  isInsideTabsContainer = false, // Flag to indicate if this text is inside a tabs container
  screens = [],
  currentScreenId = null
}) => {
  
  // Handle slide text toggle
  const handleSlideTextToggle = (checked) => {
    handleInputChange('isSlideText', checked);
  };
  
  // Handle tab value toggle
  const handleTabValueToggle = (checked) => {
    handleInputChange('isTabValue', checked);
  };
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Content
      </h4>
      
      {/* Set As Slide Text checkbox for text elements inside slider containers */}
      {isInsideSliderContainer && (
        <div style={{
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="checkbox"
              id="slide-text-checkbox"
              checked={getValue('isSlideText') || false}
              onChange={(e) => handleSlideTextToggle(e.target.checked)}
              style={{
                marginRight: '4px'
              }}
            />
            <label htmlFor="slide-text-checkbox" style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              cursor: 'pointer'
            }}>
              Set As Slide Text
            </label>
          </div>
          {getValue('isSlideText') && (
            <div style={{
              fontSize: '11px',
              color: '#8b5cf6',
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: '#faf5ff',
              borderRadius: '3px'
            }}>
              This text value will be used as the slide identifier for navigation
            </div>
          )}
        </div>
      )}
      
      {/* Set As Tab Value checkbox for text elements inside tabs containers */}
      {isInsideTabsContainer && (
        <div style={{
          marginBottom: '16px',
          padding: '8px',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="checkbox"
              id="tab-value-checkbox"
              checked={getValue('isTabValue') || false}
              onChange={(e) => handleTabValueToggle(e.target.checked)}
              style={{
                marginRight: '4px'
              }}
            />
            <label htmlFor="tab-value-checkbox" style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              cursor: 'pointer'
            }}>
              Set as Tab Value
            </label>
          </div>
          {getValue('isTabValue') && (
            <div style={{
              fontSize: '11px',
              color: '#0066cc',
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: '#e6f3ff',
              borderRadius: '3px'
            }}>
              This text value will be used as the tab identifier for navigation
            </div>
          )}
        </div>
      )}
      
      <SuperText
        label="Text Value"
        placeholder="Enter your text..."
        value={getValue('value')}
        onChange={(value) => handleInputChange('value', value)}
        availableElements={availableElements}
        screens={screens}
        currentScreenId={currentScreenId}
      />
    </div>
  );
};

// ============================================
// TEXT PROPERTIES PANEL COMPONENT
// ============================================

// Separate memoized properties panel component
const TextPropertiesPanel = memo(({ element, onUpdate, availableElements = [], screens = [], currentScreenId = null }) => {
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
  useEffect(() => {
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

  // Check if this text element is inside a slider container
  const checkIfInsideSliderContainer = useCallback(() => {
    // Helper function to check if an element exists anywhere in a container's tree
    const isElementInContainer = (elementId, container) => {
      if (!container.children || container.children.length === 0) {
        return false;
      }
      
      // Check all children recursively
      for (const child of container.children) {
        if (child.id === elementId) {
          return true;
        }
        // Recursively check if this child contains the element
        if (child.type === 'container' && isElementInContainer(elementId, child)) {
          return true;
        }
      }
      
      return false;
    };
    
    // Check all containers to see if any slider contains this element
    for (const container of availableElements) {
      if (container.type === 'container' && container.containerType === 'slider') {
        if (isElementInContainer(element.id, container)) {
          return true;
        }
      }
    }
    
    return false;
  }, [element.id, availableElements]);

  // Check if this text element is inside a tabs container
  const checkIfInsideTabsContainer = useCallback(() => {
    // Helper function to check if an element exists anywhere in a container's tree
    const isElementInContainer = (elementId, container) => {
      if (!container.children || container.children.length === 0) {
        return false;
      }
      
      // Check all children recursively
      for (const child of container.children) {
        if (child.id === elementId) {
          return true;
        }
        // Recursively check if this child contains the element
        if (child.type === 'container' && isElementInContainer(elementId, child)) {
          return true;
        }
      }
      
      return false;
    };
    
    // Check all containers to see if any tabs container contains this element
    for (const container of availableElements) {
      if (container.type === 'container' && container.containerType === 'tabs') {
        if (isElementInContainer(element.id, container)) {
          return true;
        }
      }
    }
    
    return false;
  }, [element.id, availableElements]);

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
        screens={screens}
        currentScreenId={currentScreenId}
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

      {/* Content Section */}
      <TextContentSettings
        getValue={getValue}
        handleInputChange={handleInputChange}
        availableElements={availableElements}
        element={element}
        isInsideSliderContainer={checkIfInsideSliderContainer()}
        isInsideTabsContainer={checkIfInsideTabsContainer()}
        screens={screens}
        currentScreenId={currentScreenId}
      />
      
      {/* Style Settings - These now automatically use the correct condition properties */}
      <TextStyleSettings
        getValue={getValue}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        updateProperty={updateProperty}
        element={element}
        isInsideSliderContainer={checkIfInsideSliderContainer()}
        isInsideTabsContainer={checkIfInsideTabsContainer()}
      />
    </div>
  );
});

TextPropertiesPanel.displayName = 'TextPropertiesPanel';

// ============================================
// MAIN TEXT COMPONENT AND ELEMENT DEFINITION
// ============================================

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
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null, isExecuteMode = false, isActiveSlide = false, isActiveTab = false) => {
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
    
    // Apply active styles if this element is in the active slide OR active tab
    const effectiveIsActiveSlide = checkIfInActiveSlide();
    const shouldApplyActiveStyles = (effectiveIsActiveSlide || isActiveTab) && isExecuteMode;
    
    if (shouldApplyActiveStyles) {
      console.log('✅ Applying active styles for text:', element.id, {
        isActiveSlide: effectiveIsActiveSlide,
        isActiveTab: isActiveTab,
        reason: effectiveIsActiveSlide ? 'active slide' : 'active tab'
      });
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
        isActiveTab: isActiveTab,
        isExecuteMode,
        reason: !shouldApplyActiveStyles ? 'not active slide or tab' : 'not execute mode'
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
