import React, { useCallback, useEffect, useRef, useState } from 'react';
import SuperText from './SuperText';
import axios from 'axios';
import { useZIndex } from './ZIndexContext';

// ============================================
// CALCULATION STEP
// ============================================

const CalculationStep = ({ 
  step, 
  stepNumber, 
  isFirst,
  onUpdate, 
  onRemove, 
  canRemove = true,
  availableElements = [],
  parentZIndex = 1000,
  screens = [],
  currentScreenId = null
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    // Better detection of active tab based on step's config
    if (step.config.source === 'database' || step.config.databaseId) return 'database';
    if (['timestamp', 'screen_width', 'screen_height'].includes(step.config.source)) return 'information';
    return 'value';
  });

  // Update active tab when step config changes
  useEffect(() => {
    if (step.config.source === 'database' || step.config.databaseId) {
      setActiveTab('database');
    } else if (['timestamp', 'screen_width', 'screen_height'].includes(step.config.source)) {
      setActiveTab('information');
    } else {
      setActiveTab('value');
    }
  }, [step.config.source, step.config.databaseId]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    // Reset config when switching tabs
    onUpdate({
      source: getDefaultSourceForTab(tab),
      value: '',
      // Clear any tab-specific config
      elementId: null,
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null
    });
  }, [onUpdate]);

  const getDefaultSourceForTab = (tab) => {
    switch (tab) {
      case 'value': return 'custom';
      case 'database': return 'database';
      case 'information': return 'timestamp';
      default: return 'custom';
    }
  };

  const handleOperationChange = useCallback((operation) => {
    onUpdate({ operation });
  }, [onUpdate]);

  const renderTabs = () => (
    <div style={{
      display: 'flex',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      padding: '4px',
      marginBottom: '16px'
    }}>
      {['value', 'database', 'information'].map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          style={{
            flex: 1,
            padding: '8px 16px',
            border: 'none',
            backgroundColor: activeTab === tab ? 'white' : 'transparent',
            color: activeTab === tab ? '#333' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === tab ? '500' : '400',
            transition: 'all 0.2s ease',
            textTransform: 'capitalize'
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    const tabProps = {
      config: step.config,
      onUpdate,
      availableElements,
      parentZIndex,
      screens,
      currentScreenId
    };

    switch (activeTab) {
      case 'value':
        return <ValueTab {...tabProps} />;
      case 'database':
        return <DatabaseTab {...tabProps} />;
      case 'information':
        return <InformationTab {...tabProps} />;
      default:
        return <ValueTab {...tabProps} />;
    }
  };

  const renderOperationSelector = () => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        Operation
      </label>
      
      <select
        value={step.config.operation || 'add'}
        onChange={(e) => handleOperationChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white'
        }}
      >
        <option value="add">Added to</option>
        <option value="subtract">Subtracted from</option>
        <option value="multiply">Multiplied by</option>
        <option value="divide">Divided by</option>
        <option value="concatenate">Concatenated with</option>
      </select>
    </div>
  );

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      {/* Step Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isFirst ? '#28a745' : '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {stepNumber}
          </div>
          
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#333' 
            }}>
              {isFirst ? 'Value' : 'Operation'}
            </h4>
          </div>
        </div>

        {/* Remove Button */}
        {canRemove && !isFirst && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Remove Step"
          >
            ×
          </button>
        )}
      </div>

      {/* Step Content */}
      <div style={{ padding: '20px' }}>
        {/* Show operation selector for non-first steps */}
        {!isFirst && renderOperationSelector()}
        
        {/* Tabs */}
        {renderTabs()}
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};



// ============================================
// CALCULATION POPUP
// ============================================

const CalculationPopup = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSteps = [],
  position = { x: 0, y: 0 },
  zIndex = 1000,
  availableElements = [],
  screens = [],
  currentScreenId = null
}) => {
  const createEmptyStep = useCallback(() => ({
    id: Date.now().toString(),
    type: 'value',
    config: {
      source: 'custom',
      value: '',
    }
  }), []);

  const [steps, setSteps] = useState(() => {
    if (initialSteps.length > 0) {
      return initialSteps;
    }
    return [createEmptyStep()];
  });
  
  const popupRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialSteps.length === 0 && steps.length === 0) {
      setSteps([createEmptyStep()]);
    }
  }, [isOpen, initialSteps.length, steps.length, createEmptyStep]);

  // Reset steps when initialSteps change (editing existing calculation)
  useEffect(() => {
    if (isOpen && initialSteps.length > 0) {
      setSteps(initialSteps);
    }
  }, [isOpen, initialSteps]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleStepUpdate = useCallback((stepId, newConfig) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, config: { ...step.config, ...newConfig } }
          : step
      )
    );
  }, []);

  const handleAddStep = useCallback(() => {
    const newStep = {
      ...createEmptyStep(),
      type: 'operation',
      config: {
        operation: 'add',
        source: 'custom',
        value: ''
      }
    };
    setSteps(prevSteps => [...prevSteps, newStep]);
  }, [createEmptyStep]);

  const handleRemoveStep = useCallback((stepId) => {
    setSteps(prevSteps => {
      const newSteps = prevSteps.filter(step => step.id !== stepId);
      return newSteps.length > 0 ? newSteps : [createEmptyStep()];
    });
  }, [createEmptyStep]);

  const handleSave = useCallback(() => {
    const validSteps = steps.filter(step => {
      if (step.config.source === 'custom') {
        return step.config.value && step.config.value.trim() !== '';
      }
      return true;
    });

    if (validSteps.length === 0) {
      alert('Please add at least one valid step');
      return;
    }

    onSave(steps);
    onClose();
  }, [steps, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: zIndex,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '50px'
      }}
    >
      <div
        ref={popupRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: '600' }}>
              Calculation
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              {steps.length === 1 ? '1 Step' : `${steps.length} Steps`} in Calculation
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Steps Container */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 24px'
        }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ marginBottom: '20px' }}>
              <CalculationStep
                step={step}
                stepNumber={index + 1}
                isFirst={index === 0}
                onUpdate={(config) => handleStepUpdate(step.id, config)}
                onRemove={() => handleRemoveStep(step.id)}
                canRemove={steps.length > 1}
                availableElements={availableElements}
                parentZIndex={zIndex}
                screens={screens}
                currentScreenId={currentScreenId}
              />
            </div>
          ))}

          {/* Add Step Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <button
              onClick={handleAddStep}
              style={{
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#555';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
            >
              + Add Step
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: '#666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save Calculation
          </button>
        </div>
      </div>
    </div>
  );
};



// ============================================
// VALUE TAB
// ============================================

const ValueTab = ({ config, onUpdate, availableElements = [], parentZIndex = 1000, screens = [], currentScreenId = null }) => {
  // FIX: Properly initialize selectedOption based on config.source
  const getInitialSelectedOption = () => {
    if (config.source === 'element') return 'element';
    if (config.source === 'repeating_container') return 'repeating_container';
    if (config.source === 'passed_parameter') return 'passed_parameter';
    if (config.source === 'custom') return 'custom';
    // Default fallback
    return 'custom';
  };

  const [selectedOption, setSelectedOption] = useState(getInitialSelectedOption());
  const [repeatingContainers, setRepeatingContainers] = useState([]);
  const [containerColumns, setContainerColumns] = useState({});
  const [loading, setLoading] = useState(false);
  const { getNextZIndex } = useZIndex();

  // FIX: Update selectedOption when config changes
  useEffect(() => {
    const newOption = getInitialSelectedOption();
    setSelectedOption(newOption);
  }, [config.source, config.elementId, config.repeatingContainerId]);

  // Find repeating containers that this element is inside
  useEffect(() => {
    const containers = findRepeatingContainers();
    setRepeatingContainers(containers);
    
    // Load columns for each repeating container
    containers.forEach(container => {
      if (container.repeatingConfig?.databaseId && container.repeatingConfig?.tableId) {
        loadContainerColumns(container.id, container.repeatingConfig.databaseId, container.repeatingConfig.tableId);
      }
    });
  }, [availableElements]);

  const findRepeatingContainers = () => {
    // This is a simplified approach - in reality, you'd need to traverse the element tree
    // to find which containers this element is nested inside
    return availableElements.filter(element => 
      element.type === 'container' && 
      element.contentType === 'repeating' &&
      element.repeatingConfig?.databaseId &&
      element.repeatingConfig?.tableId
    );
  };

  // Find parameters being passed to the current screen from page containers on other screens
  const findPassedParameters = () => {
    const passedParams = [];
    
    if (!screens || !currentScreenId) return passedParams;
    
    // Look through all screens for page containers that reference the current screen
    screens.forEach(screen => {
      if (screen.id === currentScreenId) return; // Skip current screen
      
      // Recursively search for page containers in this screen
      const searchElements = (elements) => {
        if (!elements) return;
        
        elements.forEach(element => {
          // Check if this is a page container pointing to current screen
          if (element.type === 'container' && 
              element.contentType === 'page' && 
              element.pageConfig && 
              element.pageConfig.selectedPageId == currentScreenId) {
            
            // Add all parameters from this page container
            if (element.pageConfig.parameters) {
              element.pageConfig.parameters.forEach(param => {
                if (param.name && param.name.trim()) {
                  passedParams.push({
                    name: param.name,
                    value: param.value,
                    fromScreen: screen.name,
                    fromScreenId: screen.id,
                    containerId: element.id
                  });
                }
              });
            }
          }
          
          // Recursively search children
          if (element.children) {
            searchElements(element.children);
          }
        });
      };
      
      searchElements(screen.elements);
    });
    
    return passedParams;
  };

  // Get passed parameters
  const passedParameters = findPassedParameters();

  const loadContainerColumns = async (containerId, databaseId, tableId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/columns`);
      if (response.data.success) {
        setContainerColumns(prev => ({
          ...prev,
          [containerId]: response.data.data
        }));
      }
    } catch (error) {
      console.error('Error loading container columns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = useCallback((option) => {
    setSelectedOption(option);
    onUpdate({
      source: option,
      value: '',
      elementId: null,
      containerValueType: null,
      // Clear database-specific fields when switching away from database
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null,
      // Clear repeating container fields
      repeatingContainerId: null,
      repeatingColumn: null
    });
  }, [onUpdate]);

  const handleCustomValueChange = useCallback((value) => {
    onUpdate({
      source: 'custom',
      value: value,
      // Clear other source-specific fields
      elementId: null,
      containerValueType: null,
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null,
      repeatingContainerId: null,
      repeatingColumn: null
    });
  }, [onUpdate]);

  const handleElementSelect = useCallback((elementId) => {
    const selectedElement = availableElements.find(el => el.id === elementId);
    const isSliderContainer = selectedElement?.type === 'container' && selectedElement?.containerType === 'slider';
    const isTabsContainer = selectedElement?.type === 'container' && selectedElement?.containerType === 'tabs';
    
    // Only set containerValueType if it's not already set (preserve existing value)
    const updates = {
      source: 'element',
      elementId: elementId,
      value: selectedElement ? `${selectedElement.type === 'text' ? 'Text' : 'Container'} (${elementId.slice(-6)})` : '',
      // Clear other source-specific fields
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null,
      repeatingContainerId: null,
      repeatingColumn: null
    };
    
    // Set containerValueType based on container type
    if (isSliderContainer) {
      // Preserve existing containerValueType if it exists, otherwise default to 'active_slide_number'
      updates.containerValueType = config.containerValueType || 'active_slide_number';
    } else if (isTabsContainer) {
      // Preserve existing containerValueType if it exists, otherwise default to 'active_tab_order'
      updates.containerValueType = config.containerValueType || 'active_tab_order';
    } else {
      updates.containerValueType = null;
    }
    
    onUpdate(updates);
  }, [availableElements, onUpdate, config.containerValueType]);

  const handleRepeatingContainerSelect = useCallback((containerId) => {
    onUpdate({
      source: 'repeating_container',
      repeatingContainerId: containerId,
      repeatingColumn: null,
      value: `Repeating Container (${containerId.slice(-6)})`,
      // Clear other source-specific fields
      elementId: null,
      containerValueType: null,
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null
    });
  }, [onUpdate]);

  const handleRepeatingColumnSelect = useCallback((column) => {
    const container = repeatingContainers.find(c => c.id === config.repeatingContainerId);
    const tableName = container?.repeatingConfig?.tableId ? 'Table' : 'Unknown';
    
    onUpdate({
      ...config,
      repeatingColumn: column,
      value: column === 'row_number' 
        ? `Row Number (${tableName})` 
        : `${column} (${tableName})`
    });
  }, [config, onUpdate, repeatingContainers]);

  // Handle passed parameter selection
  const handlePassedParameterSelect = useCallback((parameterKey) => {
    const [paramName, fromScreenName] = parameterKey.split('|');
    const parameter = passedParameters.find(p => p.name === paramName && p.fromScreen === fromScreenName);
    
    if (parameter) {
      onUpdate({
        source: 'passed_parameter',
        passedParameterName: parameter.name,
        passedParameterFromScreen: parameter.fromScreen,
        value: `${parameter.name} (From: ${parameter.fromScreen})`,
        // Clear other source-specific fields
        elementId: null,
        containerValueType: null,
        databaseId: null,
        tableId: null,
        filters: [],
        action: 'value',
        selectedColumn: null,
        repeatingContainerId: null,
        repeatingColumn: null
      });
    }
  }, [passedParameters, onUpdate]);

  // Filter available elements to show text elements, input elements, slider containers, and tabs containers
  const valueElements = availableElements.filter(element => 
    element.type === 'text' || 
    element.type === 'input' ||
    (element.type === 'container' && element.containerType === 'slider') ||
    (element.type === 'container' && element.containerType === 'tabs')
  );

  const renderCustomValue = () => (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Custom Value
        </label>
        <button
          onClick={() => handleOptionChange('custom')}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Clear
        </button>
      </div>

      <SuperText
        label=""
        placeholder="Custom Value"
        value={config.value || ''}
        onChange={handleCustomValueChange}
        availableElements={availableElements}
        screens={screens}
        currentScreenId={currentScreenId}
      />
    </div>
  );

  const renderElementValue = () => (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Value Of Element
        </label>
        <button
          onClick={() => handleOptionChange('element')}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Clear
        </button>
      </div>

      <select
        value={config.elementId || ''}
        onChange={(e) => handleElementSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white'
        }}
      >
        <option value="">Select Element</option>
        {valueElements.map((element) => {
          let label;
          if (element.type === 'text') {
            label = `Text (${element.id.slice(-6)})`;
          } else if (element.type === 'input') {
            label = `Input (${element.id.slice(-6)})`;
          } else if (element.type === 'container' && element.containerType === 'slider') {
            label = `Slider Container (${element.id.slice(-6)})`;
          } else if (element.type === 'container' && element.containerType === 'tabs') {
            label = `Tabs Container (${element.id.slice(-6)})`;
          } else {
            label = `Container (${element.id.slice(-6)})`;
          }
          return (
            <option key={element.id} value={element.id}>
              {label}
            </option>
          );
        })}
      </select>

      {valueElements.length === 0 && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          No text elements, input elements, slider containers, or tabs containers found in current screen
        </div>
      )}

      {/* Show selected element info */}
      {config.elementId && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#e8f4fd',
          borderRadius: '6px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#0066cc',
            marginBottom: '4px'
          }}>
            Selected Element:
          </div>
          <div style={{
            fontSize: '12px',
            color: '#333',
            fontFamily: 'monospace'
          }}>
            ID: {config.elementId}
          </div>
          {(() => {
            const element = valueElements.find(el => el.id === config.elementId);
            if (!element) return null;
            
            if (element.type === 'text') {
              return (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '2px'
                }}>
                  Current Value: "{element.properties?.value || ''}"
                </div>
              );
            } else if (element.type === 'container' && element.containerType === 'slider') {
              return (
                <div style={{ marginTop: '8px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '4px'
                  }}>
                    Container Value Type
                  </label>
                  <select
                    value={config.containerValueType || 'active_slide_number'}
                    onChange={(e) => onUpdate({ ...config, containerValueType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="active_slide_number">Get active slide number</option>
                    <option value="active_slide_value">Get active slide value</option>
                  </select>
                </div>
              );
            } else if (element.type === 'container' && element.containerType === 'tabs') {
              return (
                <div style={{ marginTop: '8px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#555',
                    marginBottom: '4px'
                  }}>
                    Container Value Type
                  </label>
                  <select
                    value={config.containerValueType || 'active_tab_order'}
                    onChange={(e) => onUpdate({ ...config, containerValueType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="active_tab_order">Get active tab order</option>
                    <option value="active_tab_value">Get active tab value</option>
                  </select>
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </div>
  );

  const renderRepeatingContainerValue = () => (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Repeating Container Value
        </label>
        <button
          onClick={() => handleOptionChange('repeating_container')}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Clear
        </button>
      </div>

      {/* Container Selection */}
      <select
        value={config.repeatingContainerId || ''}
        onChange={(e) => handleRepeatingContainerSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '12px'
        }}
      >
        <option value="">Select Repeating Container</option>
        {repeatingContainers.map((container) => {
          const tableName = container.repeatingConfig?.tableId || 'Unknown Table';
          return (
            <option key={container.id} value={container.id}>
              Container ({container.id.slice(-6)}) - {tableName}
            </option>
          );
        })}
      </select>

      {/* Column Selection */}
      {config.repeatingContainerId && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '8px'
          }}>
            Select Column or Value
          </label>
          <select
            value={config.repeatingColumn || ''}
            onChange={(e) => handleRepeatingColumnSelect(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">
              {loading ? 'Loading columns...' : 'Select Column'}
            </option>
            
            {/* Row Number Option */}
            <option value="row_number">Row Number</option>
            
            {/* Table Columns */}
            {containerColumns[config.repeatingContainerId]?.map((column) => (
              <option key={column._id} value={column.name}>
                {column.name} ({column.type})
              </option>
            ))}
          </select>

          {/* Show selected column info */}
          {config.repeatingColumn && (
            <div style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#e8f5e8',
              borderRadius: '6px',
              border: '1px solid #28a745'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#155724',
                marginBottom: '4px'
              }}>
                Selected Value:
              </div>
              <div style={{
                fontSize: '12px',
                color: '#333'
              }}>
                {config.repeatingColumn === 'row_number' 
                  ? 'Row Number (1, 2, 3, ...)'
                  : `Column: ${config.repeatingColumn}`
                }
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666',
                marginTop: '2px'
              }}>
                This value will be different for each repeated container instance
              </div>
            </div>
          )}
        </div>
      )}

      {repeatingContainers.length === 0 && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#856404',
          textAlign: 'center'
        }}>
          No repeating containers found. This element must be inside a repeating container to use this option.
        </div>
      )}
    </div>
  );

  const renderPassedParameterValue = () => (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Passed Parameter
        </label>
        <button
          onClick={() => handleOptionChange('passed_parameter')}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Clear
        </button>
      </div>

      {/* Parameter Selection */}
      <select
        value={config.passedParameterName && config.passedParameterFromScreen ? `${config.passedParameterName}|${config.passedParameterFromScreen}` : ''}
        onChange={(e) => handlePassedParameterSelect(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '12px'
        }}
      >
        <option value="">Select Parameter</option>
        {passedParameters.map((param, index) => {
          const key = `${param.name}|${param.fromScreen}`;
          return (
            <option key={`${key}-${index}`} value={key}>
              {param.name}, From: {param.fromScreen}
            </option>
          );
        })}
      </select>

      {/* Show selected parameter info */}
      {config.passedParameterName && config.passedParameterFromScreen && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: '#f3e8ff',
          borderRadius: '6px',
          border: '1px solid #6f42c1'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#6f42c1',
            marginBottom: '4px'
          }}>
            Selected Parameter:
          </div>
          <div style={{
            fontSize: '12px',
            color: '#333',
            marginBottom: '2px'
          }}>
            <strong>Name:</strong> {config.passedParameterName}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#333',
            marginBottom: '2px'
          }}>
            <strong>From Screen:</strong> {config.passedParameterFromScreen}
          </div>
          {(() => {
            const parameter = passedParameters.find(p => 
              p.name === config.passedParameterName && 
              p.fromScreen === config.passedParameterFromScreen
            );
            if (parameter && parameter.value) {
              return (
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginTop: '4px'
                }}>
                  <strong>Current Value:</strong> "{parameter.value}"
                </div>
              );
            }
            return null;
          })()} 
          <div style={{
            fontSize: '11px',
            color: '#666',
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            This parameter is passed from a page container on the "{config.passedParameterFromScreen}" screen
          </div>
        </div>
      )}

      {passedParameters.length === 0 && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          No parameters are being passed to this screen from page containers on other screens.
        </div>
      )}
    </div>
  );

  return (
    <div>
      {/* Value Source Selection */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px'
      }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '12px'
        }}>
          Value
        </label>

        {/* Option: Value of Element */}
        <div
          onClick={() => handleOptionChange('element')}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: selectedOption === 'element' ? '#007bff' : 'white',
            color: selectedOption === 'element' ? 'white' : '#333',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '8px',
            border: selectedOption === 'element' ? '2px solid #007bff' : '1px solid #e0e0e0',
            transition: 'all 0.2s ease'
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: selectedOption === 'element' ? '2px solid white' : '2px solid #ddd',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {selectedOption === 'element' && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }}
              />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Value Of Element
            </span>
            <div style={{
              fontSize: '12px',
              opacity: 0.8,
              marginTop: '2px'
            }}>
              Get value from a text element, input element, slider container, or tabs container
            </div>
          </div>
          {selectedOption === 'element' && (
            <div style={{ marginLeft: 'auto' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Option: Repeating Container (only show if repeating containers are available) */}
        {repeatingContainers.length > 0 && (
          <div
            onClick={() => handleOptionChange('repeating_container')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: selectedOption === 'repeating_container' ? '#28a745' : 'white',
              color: selectedOption === 'repeating_container' ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '8px',
              border: selectedOption === 'repeating_container' ? '2px solid #28a745' : '1px solid #e0e0e0',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: selectedOption === 'repeating_container' ? '2px solid white' : '2px solid #ddd',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedOption === 'repeating_container' && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white'
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Repeating Container
              </span>
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                marginTop: '2px'
              }}>
                Get value from current record in repeating container ({repeatingContainers.length} available)
              </div>
            </div>
            {selectedOption === 'repeating_container' && (
              <div style={{ marginLeft: 'auto' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Option: Passed Parameter (only show if passed parameters are available) */}
        {passedParameters.length > 0 && (
          <div
            onClick={() => handleOptionChange('passed_parameter')}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: selectedOption === 'passed_parameter' ? '#6f42c1' : 'white',
              color: selectedOption === 'passed_parameter' ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '8px',
              border: selectedOption === 'passed_parameter' ? '2px solid #6f42c1' : '1px solid #e0e0e0',
              transition: 'all 0.2s ease'
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: selectedOption === 'passed_parameter' ? '2px solid white' : '2px solid #ddd',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedOption === 'passed_parameter' && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white'
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                Passed Parameter
              </span>
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                marginTop: '2px'
              }}>
                Get value from parameters passed to this screen ({passedParameters.length} available)
              </div>
            </div>
            {selectedOption === 'passed_parameter' && (
              <div style={{ marginLeft: 'auto' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Option: Custom Value */}
        <div
          onClick={() => handleOptionChange('custom')}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: selectedOption === 'custom' ? '#007bff' : 'white',
            color: selectedOption === 'custom' ? 'white' : '#333',
            borderRadius: '6px',
            cursor: 'pointer',
            border: selectedOption === 'custom' ? '2px solid #007bff' : '1px solid #e0e0e0',
            transition: 'all 0.2s ease'
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: selectedOption === 'custom' ? '2px solid white' : '2px solid #ddd',
              marginRight: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {selectedOption === 'custom' && (
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }}
              />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Custom Value
            </span>
            <div style={{
              fontSize: '12px',
              opacity: 0.8,
              marginTop: '2px'
            }}>
              Enter any text or use nested calculations
            </div>
          </div>
          {selectedOption === 'custom' && (
            <div style={{ marginLeft: 'auto' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Render selected option content */}
      {selectedOption === 'element' && renderElementValue()}
      {selectedOption === 'repeating_container' && renderRepeatingContainerValue()}
      {selectedOption === 'passed_parameter' && renderPassedParameterValue()}
      {selectedOption === 'custom' && renderCustomValue()}
    </div>
  );
};



// ============================================
// DATABASE TAB
// ============================================

const DatabaseTab = ({ config, onUpdate, availableElements = [], parentZIndex = 1000 }) => {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(config.filters || []);

  // Fetch user's databases on mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  // Fetch tables when database is selected
  useEffect(() => {
    if (config.databaseId) {
      fetchTables(config.databaseId);
    } else {
      setTables([]);
      setColumns([]);
    }
  }, [config.databaseId]);

  // Fetch columns when table is selected
  useEffect(() => {
    if (config.databaseId && config.tableId) {
      fetchColumns(config.databaseId, config.tableId);
    } else {
      setColumns([]);
    }
  }, [config.databaseId, config.tableId]);

  // Update filters when config changes
  useEffect(() => {
    setFilters(config.filters || []);
  }, [config.filters]);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/databases');
      if (response.data.success) {
        setDatabases(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
      setError('Failed to load databases');
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (databaseId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/databases/${databaseId}/tables`);
      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const fetchColumns = async (databaseId, tableId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/columns`);
      if (response.data.success) {
        setColumns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
      setError('Failed to load columns');
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseSelect = useCallback((databaseId) => {
    onUpdate({
      databaseId,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null
    });
    setTables([]);
    setColumns([]);
    setFilters([]);
  }, [onUpdate]);

  const handleTableSelect = useCallback((tableId) => {
    onUpdate({
      ...config,
      tableId,
      filters: [],
      selectedColumn: null
    });
    setFilters([]);
  }, [config, onUpdate]);

  const handleAddFilter = useCallback(() => {
    const newFilter = {
      id: Date.now().toString(),
      column: '',
      operator: 'equals',
      value: '',
      logic: filters.length > 0 ? 'and' : null
    };
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    onUpdate({ ...config, filters: newFilters });
  }, [filters, config, onUpdate]);

  const handleRemoveFilter = useCallback((filterId) => {
    const newFilters = filters.filter(f => f.id !== filterId);
    setFilters(newFilters);
    onUpdate({ ...config, filters: newFilters });
  }, [filters, config, onUpdate]);

  const handleFilterUpdate = useCallback((filterId, field, value) => {
    const newFilters = filters.map(filter => 
      filter.id === filterId ? { ...filter, [field]: value } : filter
    );
    setFilters(newFilters);
    onUpdate({ ...config, filters: newFilters });
  }, [filters, config, onUpdate]);

  const handleActionChange = useCallback((action) => {
    onUpdate({ ...config, action });
  }, [config, onUpdate]);

  const handleColumnSelect = useCallback((columnId) => {
    onUpdate({ ...config, selectedColumn: columnId });
  }, [config, onUpdate]);

  const renderDatabaseSelection = () => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        Database Table
      </label>

      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          color: '#c33',
          borderRadius: '4px',
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          {error}
        </div>
      )}

      <select
        value={config.databaseId || ''}
        onChange={(e) => handleDatabaseSelect(e.target.value)}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '8px',
          opacity: loading ? 0.6 : 1
        }}
      >
        <option value="">
          {loading ? 'Loading databases...' : 'Select Database'}
        </option>
        {databases.map((db) => (
          <option key={db._id} value={db._id}>
            {db.name}
          </option>
        ))}
      </select>

      {config.databaseId && (
        <select
          value={config.tableId || ''}
          onChange={(e) => handleTableSelect(e.target.value)}
          disabled={loading || tables.length === 0}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            opacity: loading ? 0.6 : 1
          }}
        >
          <option value="">
            {loading ? 'Loading tables...' : tables.length === 0 ? 'No tables found' : 'Select Table'}
          </option>
          {tables.map((table) => (
            <option key={table._id} value={table._id}>
              {table.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  const renderFilters = () => (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Filter
        </label>
        <div>
          <button
            onClick={handleAddFilter}
            disabled={!config.tableId || columns.length === 0}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '8px',
              opacity: (!config.tableId || columns.length === 0) ? 0.5 : 1
            }}
          >
            +
          </button>
          {filters.length > 0 && (
            <button
              onClick={() => {
                setFilters([]);
                onUpdate({ ...config, filters: [] });
              }}
              style={{
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filters.map((filter, index) => (
        <div key={filter.id} style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #e0e0e0'
        }}>
          {/* Logic connector for non-first filters */}
          {index > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <button
                onClick={() => handleFilterUpdate(filter.id, 'logic', 'and')}
                style={{
                  padding: '4px 12px',
                  border: filter.logic === 'and' ? '2px solid #007bff' : '1px solid #ddd',
                  backgroundColor: filter.logic === 'and' ? '#e3f2fd' : 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                And
              </button>
              <button
                onClick={() => handleFilterUpdate(filter.id, 'logic', 'or')}
                style={{
                  padding: '4px 12px',
                  border: filter.logic === 'or' ? '2px solid #007bff' : '1px solid #ddd',
                  backgroundColor: filter.logic === 'or' ? '#e3f2fd' : 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Or
              </button>
              <button
                onClick={() => handleRemoveFilter(filter.id)}
                style={{
                  marginLeft: 'auto',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* Column Selection */}
          <select
            value={filter.column}
            onChange={(e) => handleFilterUpdate(filter.id, 'column', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: 'white',
              marginBottom: '8px'
            }}
          >
            <option value="">Column</option>
            {columns.map((column) => (
              <option key={column._id} value={column.name}>
                {column.name} ({column.type})
              </option>
            ))}
          </select>

          {/* Operator Selection */}
          <select
            value={filter.operator}
            onChange={(e) => handleFilterUpdate(filter.id, 'operator', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: 'white',
              marginBottom: '8px'
            }}
          >
            <option value="equals">Equals</option>
            <option value="not_equals">Doesn't Equal</option>
            <option value="greater_than">Greater Than</option>
            <option value="less_than">Less Than</option>
            <option value="greater_equal">Greater Than or Equal</option>
            <option value="less_equal">Less Than or Equal</option>
            <option value="contains">Contains</option>
          </select>

          {/* Value Input using SuperText */}
          <SuperText
            label=""
            placeholder="Type Here"
            value={filter.value}
            onChange={(value) => handleFilterUpdate(filter.id, 'value', value)}
            availableElements={availableElements}
          />

          {/* Remove button for first filter */}
          {index === 0 && filters.length > 1 && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                onClick={() => handleRemoveFilter(filter.id)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#dc3545',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add Filter Set Button */}
      {filters.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            onClick={handleAddFilter}
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Add Filter Set
          </button>
        </div>
      )}
    </div>
  );

  const renderAction = () => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        Action
      </label>

      <select
        value={config.action || 'value'}
        onChange={(e) => handleActionChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '12px'
        }}
      >
        <option value="value">Value Of Column</option>
        <option value="values">Values Of Columns</option>
        <option value="count">Number of Rows</option>
      </select>

      {(config.action === 'value' || config.action === 'values') && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '4px'
          }}>
            Select column
          </label>
          <select
            value={config.selectedColumn || ''}
            onChange={(e) => handleColumnSelect(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select</option>
            {columns.map((column) => (
              <option key={column._id} value={column.name}>
                {column.name} ({column.type})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Database value(s)
        </label>
        <button
          onClick={() => {
            onUpdate({
              source: 'database',
              databaseId: null,
              tableId: null,
              filters: [],
              action: 'value',
              selectedColumn: null
            });
            setFilters([]);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Clear
        </button>
      </div>

      {renderDatabaseSelection()}
      
      {config.tableId && renderFilters()}
      
      {config.tableId && renderAction()}

      {/* Database Connection Status */}
      {databases.length === 0 && !loading && !error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          borderRadius: '6px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          No databases found. Create a database first to use database calculations.
        </div>
      )}
    </div>
  );
};



// ============================================
// INFORMATION TAB
// ============================================

const InformationTab = ({ config, onUpdate }) => {
  const [selectedOption, setSelectedOption] = useState(config.source || 'timestamp');

  const handleOptionChange = useCallback((option) => {
    setSelectedOption(option);
    onUpdate({
      source: option,
      value: getOptionLabel(option)
    });
  }, [onUpdate]);

  const getOptionLabel = (option) => {
    switch (option) {
      case 'timestamp': return 'Current Timestamp';
      case 'screen_width': return 'Screen Width';
      case 'screen_height': return 'Screen Height';
      default: return '';
    }
  };

  const getOptionDescription = (option) => {
    switch (option) {
      case 'timestamp': return 'Current date and time';
      case 'screen_width': return 'Current screen/window width in pixels';
      case 'screen_height': return 'Current screen/window height in pixels';
      default: return '';
    }
  };

  const informationOptions = [
    { value: 'timestamp', label: 'Timestamp', icon: '🕐' },
    { value: 'screen_width', label: 'Screen Width', icon: '📏' },
    { value: 'screen_height', label: 'Screen Height', icon: '📐' }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <label style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Information
        </label>
        <button
          onClick={() => {
            setSelectedOption('timestamp');
            onUpdate({
              source: 'timestamp',
              value: 'Current Timestamp'
            });
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '12px',
            textDecoration: 'underline'
          }}
        >
          Clear
        </button>
      </div>

      {/* Information Options */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px'
      }}>
        {informationOptions.map((option) => (
          <div
            key={option.value}
            onClick={() => handleOptionChange(option.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: selectedOption === option.value ? '#007bff' : 'white',
              color: selectedOption === option.value ? 'white' : '#333',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '8px',
              border: selectedOption === option.value ? '2px solid #007bff' : '1px solid #e0e0e0',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Radio Button */}
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: selectedOption === option.value ? '2px solid white' : '2px solid #ddd',
                marginRight: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedOption === option.value && (
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'white'
                  }}
                />
              )}
            </div>

            {/* Icon */}
            <div style={{
              fontSize: '18px',
              marginRight: '12px'
            }}>
              {option.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '2px'
              }}>
                {option.label}
              </div>
              <div style={{
                fontSize: '12px',
                opacity: 0.8
              }}>
                {getOptionDescription(option.value)}
              </div>
            </div>

            {/* Selected Indicator */}
            {selectedOption === option.value && (
              <div style={{ marginLeft: 'auto' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Option Preview */}
      {selectedOption && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#e8f4fd',
          borderRadius: '6px',
          border: '1px solid #b3d9ff'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#0066cc',
            marginBottom: '4px'
          }}>
            Selected Information:
          </div>
          <div style={{
            fontSize: '14px',
            color: '#333'
          }}>
            {getOptionLabel(selectedOption)}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#666',
            marginTop: '2px'
          }}>
            {getOptionDescription(selectedOption)}
          </div>
        </div>
      )}
    </div>
  );
};



// Export all calculation components
export { CalculationStep, CalculationPopup, ValueTab, DatabaseTab, InformationTab };
