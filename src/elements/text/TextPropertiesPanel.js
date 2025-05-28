import React, { useState, useCallback, memo, useEffect } from 'react';
import ConditionBlock from '../../components/ConditionBlock';
import TextContentSettings from './TextContentSettings';
import TextStyleSettings from './TextStyleSettings';

// Separate memoized properties panel component
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

      {/* Content Section */}
      <TextContentSettings
        getValue={getValue}
        handleInputChange={handleInputChange}
        availableElements={availableElements}
        element={element}
        isInsideSliderContainer={checkIfInsideSliderContainer()}
      />
      
      {/* Style Settings - These now automatically use the correct condition properties */}
      <TextStyleSettings
        getValue={getValue}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        updateProperty={updateProperty}
        element={element}
        isInsideSliderContainer={checkIfInsideSliderContainer()}
      />
    </div>
  );
});

TextPropertiesPanel.displayName = 'TextPropertiesPanel';

export default TextPropertiesPanel;
