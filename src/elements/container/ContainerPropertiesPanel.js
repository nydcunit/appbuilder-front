import React, { useState, useCallback, memo } from 'react';
import ConditionBlock from '../../components/ConditionBlock';
import ContainerContentSettings from './ContainerContentSettings';
import ContainerStyleSettings from './ContainerStyleSettings';

// Separate memoized properties panel component
const ContainerPropertiesPanel = memo(({ element, onUpdate, availableElements = [] }) => {
  const props = element.properties || {};
  const [activeConditionIndex, setActiveConditionIndex] = useState(0);

  // FIXED: Get the current properties - either base properties or condition-specific properties
  const getCurrentProperties = useCallback(() => {
    console.log('🔧 Getting current properties for element:', element.id);
    console.log('🔧 Render type:', element.renderType);
    console.log('🔧 Active condition index:', activeConditionIndex);
    console.log('🔧 Conditions:', element.conditions?.length || 0);
    
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      const activeCondition = element.conditions[activeConditionIndex];
      console.log('🔧 Active condition:', activeCondition);
      console.log('🔧 Active condition properties:', activeCondition?.properties);
      const conditionProps = activeCondition?.properties || {};
      const mergedProps = { ...props, ...conditionProps };
      console.log('🔧 Merged properties:', mergedProps);
      return mergedProps;
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

  // Handle condition updates (these go on the element itself, not properties)
  const handleConditionUpdate = useCallback((updates) => {
    console.log('🔧 Updating conditions:', updates);
    
    // If we're adding a new condition, copy properties from the previous condition
    if (updates.conditions && updates.conditions.length > (element.conditions?.length || 0)) {
      const newConditions = updates.conditions.map((condition, index) => {
        // If this is a new condition and doesn't have properties, copy from previous condition
        if (!condition.properties && index > 0) {
          const previousCondition = updates.conditions[index - 1];
          const copiedProps = previousCondition.properties ? { ...previousCondition.properties } : { ...props };
          console.log('🔧 Copying properties to new condition:', copiedProps);
          return {
            ...condition,
            properties: copiedProps
          };
        }
        return condition;
      });
      updates.conditions = newConditions;
      console.log('🔧 Final conditions with copied properties:', updates.conditions);
    }
    
    onUpdate(updates);
  }, [onUpdate, element.conditions, props]);

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

  // FIXED: Render condition selector for properties
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
              onClick={() => {
                console.log('🔧 Switching to condition index:', index);
                setActiveConditionIndex(index);
              }}
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
          Configure how this container appears when Condition {activeConditionIndex + 1} is true.
        </div>
      </div>
    );
  };

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

      {/* Condition Properties Selector - FIXED: Show this for conditional containers */}
      {renderConditionSelector()}

      {/* Content Section */}
      <ContainerContentSettings
        element={element}
        onUpdate={onUpdate}
      />
      
      {/* Style Settings - FIXED: Pass correct functions */}
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