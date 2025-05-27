import React, { useState, useCallback, memo } from 'react';
import ConditionBlock from '../../components/ConditionBlock';
import ContainerContentSettings from './ContainerContentSettings';
import ContainerStyleSettings from './ContainerStyleSettings';

// Separate memoized properties panel component
const ContainerPropertiesPanel = memo(({ element, onUpdate, availableElements = [] }) => {
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

  // Stable update function for properties
  const updateProperty = useCallback((key, value) => {
    console.log('Updating property:', key, value);
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

      {/* Condition Block */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        availableElements={availableElements}
      />



      {/* Content Section */}
      <ContainerContentSettings
        element={element}
        onUpdate={onUpdate}
      />
      
      {/* Style Settings */}
      <ContainerStyleSettings
        getValue={getValue}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        updateProperty={updateProperty}
      />
    </div>
  );
});

ContainerPropertiesPanel.displayName = 'ContainerPropertiesPanel';

export default ContainerPropertiesPanel;