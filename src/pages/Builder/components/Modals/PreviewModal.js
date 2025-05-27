import React, { useState, useEffect } from 'react';
import { getElementByType } from '../../../../elements';
import { executeTextCalculations, executeRepeatingContainerQuery } from '../../../../utils/calculationEngine';
import { getVisibleElements } from '../../../../utils/ConditionEngine';

// Preview Modal Component with Real Calculation Execution AND Conditional Rendering AND Repeating Containers
const PreviewModal = ({ screens, currentScreenId, onClose, onScreenChange }) => {
  const currentScreen = screens.find(screen => screen.id === currentScreenId);
  const [calculationResults, setCalculationResults] = useState({});
  const [visibleElements, setVisibleElements] = useState([]);
  const [repeatingContainerData, setRepeatingContainerData] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionErrors, setExecutionErrors] = useState({});

  // Execute calculations and conditional rendering for the current screen
  useEffect(() => {
    if (currentScreen) {
      executeCalculationsAndConditions();
    }
  }, [currentScreen]);

  const executeCalculationsAndConditions = async () => {
    setIsExecuting(true);
    setExecutionErrors({});
    
    try {
      // First, get all elements for condition evaluation
      const allElements = getAllElementsInScreen(currentScreen.elements);
      
      // Step 1: Load repeating container data
      console.log('🔄 Loading repeating container data...');
      const containerData = await loadRepeatingContainerData(currentScreen.elements);
      setRepeatingContainerData(containerData);
      
      // Step 2: Expand repeating containers into multiple instances
      console.log('🔄 Expanding repeating containers...');
      const expandedElements = await expandRepeatingContainers(currentScreen.elements, containerData);
      console.log('Expanded elements:', expandedElements);
      
      // Step 3: Execute conditional rendering on expanded elements
      console.log('🔄 Executing conditional rendering...');
      const filteredElements = await getVisibleElements(expandedElements, allElements);
      console.log('Visible elements after conditions:', filteredElements);
      setVisibleElements(filteredElements);
      
      // Step 4: Execute calculations on visible elements
      console.log('🔄 Executing calculations...');
      const results = {};
      const errors = {};
      const visibleFlatElements = getAllElementsInScreen(filteredElements);
      
      for (const element of visibleFlatElements) {
        if (element.type === 'text' && element.properties?.value) {
          try {
            const calculationStorage = extractCalculationStorage(element.properties.value);
            
            // Get repeating context if element is inside a repeating container
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            
            const executedValue = await executeTextCalculations(
              element.properties.value, 
              allElements, // Use all elements for calculations
              calculationStorage,
              repeatingContext // Pass repeating context
            );
            results[element.id] = executedValue;
          } catch (error) {
            console.error(`Error executing calculations for element ${element.id}:`, error);
            errors[element.id] = error.message;
            results[element.id] = `[Error: ${error.message}]`;
          }
        }
      }
      
      setCalculationResults(results);
      setExecutionErrors(errors);
    } catch (error) {
      console.error('Error in executeCalculationsAndConditions:', error);
      setExecutionErrors({ general: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  // Load data for all repeating containers
  const loadRepeatingContainerData = async (elements) => {
    const containerData = {};
    const repeatingContainers = findRepeatingContainers(elements);
    
    console.log('Found repeating containers:', repeatingContainers.length);
    
    for (const container of repeatingContainers) {
      const { databaseId, tableId, filters } = container.repeatingConfig;
      
      try {
        console.log(`Loading data for container ${container.id}:`, { databaseId, tableId, filters });
        const records = await executeRepeatingContainerQuery(databaseId, tableId, filters);
        containerData[container.id] = {
          records,
          config: container.repeatingConfig
        };
        console.log(`Loaded ${records.length} records for container ${container.id}`);
      } catch (error) {
        console.error(`Error loading data for container ${container.id}:`, error);
        containerData[container.id] = {
          records: [],
          config: container.repeatingConfig,
          error: error.message
        };
      }
    }
    
    return containerData;
  };

  // Find all repeating containers in the element tree
  const findRepeatingContainers = (elements) => {
    const containers = [];
    
    const traverse = (elementList) => {
      elementList.forEach(element => {
        if (element.type === 'container' && 
            element.contentType === 'repeating' && 
            element.repeatingConfig?.databaseId && 
            element.repeatingConfig?.tableId) {
          containers.push(element);
        }
        
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    
    traverse(elements);
    return containers;
  };

  // Expand repeating containers into multiple instances
  const expandRepeatingContainers = async (elements, containerData) => {
    const expanded = [];
    
    for (const element of elements) {
      if (element.type === 'container' && element.contentType === 'repeating') {
        // This is a repeating container
        const data = containerData[element.id];
        
        if (data && data.records && data.records.length > 0) {
          // Create multiple instances of this container
          for (let i = 0; i < data.records.length; i++) {
            const record = data.records[i];
            const instanceId = `${element.id}_instance_${i}`;
            
            // Create container instance with repeating context
            const containerInstance = {
              ...element,
              id: instanceId,
              originalId: element.id, // Keep track of original ID
              repeatingContext: {
                containerId: element.id,
                recordData: record,
                rowIndex: i
              },
              // Recursively expand children
              children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
            };
            
            // Update child elements with repeating context
            containerInstance.children = await updateChildrenWithRepeatingContext(
              containerInstance.children, 
              element.id, 
              record, 
              i,
              containerData
            );
            
            expanded.push(containerInstance);
          }
        } else {
          // No data or error - show empty container
          expanded.push({
            ...element,
            children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
          });
        }
      } else {
        // Regular element - recursively process children
        const expandedElement = {
          ...element,
          children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
        };
        expanded.push(expandedElement);
      }
    }
    
    return expanded;
  };

  // Update children with repeating context information
  const updateChildrenWithRepeatingContext = async (children, containerId, recordData, rowIndex, containerData) => {
    const updated = [];
    
    for (const child of children) {
      const updatedChild = {
        ...child,
        id: `${child.id}_repeat_${containerId}_${rowIndex}`, // Unique ID for this instance
        originalId: child.id, // Keep original ID for reference
        parentRepeatingContext: {
          containerId,
          recordData,
          rowIndex
        }
      };
      
      // Recursively update grandchildren
      if (updatedChild.children && updatedChild.children.length > 0) {
        updatedChild.children = await updateChildrenWithRepeatingContext(
          updatedChild.children, 
          containerId, 
          recordData, 
          rowIndex,
          containerData
        );
      }
      
      updated.push(updatedChild);
    }
    
    return updated;
  };

  // Get repeating context for an element (for calculations)
  const getRepeatingContextForElement = (element, containerData) => {
    // Check if element has parent repeating context
    if (element.parentRepeatingContext) {
      return element.parentRepeatingContext;
    }
    
    // Check if element itself is a repeating container instance
    if (element.repeatingContext) {
      return element.repeatingContext;
    }
    
    return null;
  };

  // Helper function to extract calculation storage (simplified)
  const extractCalculationStorage = (textValue) => {
    return {};
  };

  const getAllElementsInScreen = (elements) => {
    const allElements = [];
    const traverse = (elementList) => {
      elementList.forEach(element => {
        allElements.push(element);
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    traverse(elements);
    return allElements;
  };

  const renderPreviewElement = (element, depth = 0) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    // Create a copy of the element with executed calculations
    const executedElement = {
      ...element,
      properties: {
        ...element.properties,
        ...(element.type === 'text' && calculationResults[element.id] && {
          value: calculationResults[element.id]
        })
      }
    };

    const children = element.children && element.children.length > 0 
      ? element.children.map(child => renderPreviewElement(child, depth + 1))
      : null;

    // Render without edit handlers for preview
    const renderedElement = elementDef.render(
      executedElement, 
      depth, 
      false, // not selected
      false, // not drop zone
      {}, // no handlers
      children
    );
    
    // Add debug info for repeating container instances
    let debugStyle = {};
    if (element.repeatingContext || element.parentRepeatingContext) {
      debugStyle = {
        border: '2px solid #28a745',
        margin: '2px'
      };
    }
    
    return React.cloneElement(renderedElement, {
      key: element.id,
      style: {
        ...renderedElement.props.style,
        ...debugStyle,
        // Remove edit-specific styles
        cursor: 'default',
        // Add error styling if there's an execution error
        ...(executionErrors[element.id] && {
          backgroundColor: '#ffebee',
          border: '1px solid #f44336'
        })
      }
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1000px',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Preview Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>
              Preview - {currentScreen?.name}
              {isExecuting && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#28a745', 
                  marginLeft: '10px' 
                }}>
                  🔄 Executing calculations and conditions...
                </span>
              )}
            </h3>
            
            {/* Screen Navigator */}
            <select
              value={currentScreenId}
              onChange={(e) => onScreenChange(parseInt(e.target.value))}
              style={{
                padding: '5px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {screens.map(screen => (
                <option key={screen.id} value={screen.id}>
                  {screen.name}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={executeCalculationsAndConditions}
              disabled={isExecuting}
              style={{
                padding: '5px 10px',
                backgroundColor: isExecuting ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isExecuting ? '🔄' : '🔄 Refresh'}
            </button>

            {/* Debug Info */}
            <div style={{ fontSize: '12px', color: '#666' }}>
              Visible: {visibleElements.length} elements | 
              Repeating Containers: {Object.keys(repeatingContainerData).length}
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close Preview
          </button>
        </div>

        {/* Execution Errors Display */}
        {Object.keys(executionErrors).length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#ffebee',
            borderBottom: '1px solid #f44336',
            fontSize: '12px',
            color: '#d32f2f'
          }}>
            ⚠️ Execution errors detected. Check console for details.
            {executionErrors.general && ` General error: ${executionErrors.general}`}
          </div>
        )}

        {/* Repeating Container Status */}
        {Object.keys(repeatingContainerData).length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#e8f5e9',
            borderBottom: '1px solid #4caf50',
            fontSize: '12px',
            color: '#2e7d32'
          }}>
            🔄 Repeating Containers Active: {
              Object.entries(repeatingContainerData).map(([containerId, data]) => 
                `${containerId.slice(-6)} (${data.records?.length || 0} records)`
              ).join(', ')
            }
          </div>
        )}

        {/* Preview Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}>
          {visibleElements.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontSize: '18px'
            }}>
              {currentScreen?.elements?.length === 0 
                ? "No elements to preview" 
                : "No elements are visible (all hidden by conditions)"
              }
            </div>
          ) : (
            <div style={{ minHeight: '100%' }}>
              {visibleElements.map(element => renderPreviewElement(element))}
            </div>
          )}
        </div>

        {/* Preview Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #ddd',
          backgroundColor: '#f8f9fa',
          fontSize: '12px',
          color: '#666'
        }}>
          💡 This preview shows conditional rendering, calculations, and repeating containers in real-time.
          {Object.keys(executionErrors).length > 0 && (
            <span style={{ color: '#d32f2f', marginLeft: '10px' }}>
              | ⚠️ Some calculations failed - check your database connections and element references.
            </span>
          )}
          <br />
          🔄 Repeating containers are outlined in green. Elements inside show data from each record.
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;