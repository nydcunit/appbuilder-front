import React, { useState, useCallback, useEffect } from 'react';
import SuperText from '../SuperText';
import { useZIndex } from '../ZIndexContext';
import axios from 'axios';

const ValueTab = ({ config, onUpdate, availableElements = [], parentZIndex = 1000 }) => {
  const [selectedOption, setSelectedOption] = useState(config.source || 'custom');
  const [repeatingContainers, setRepeatingContainers] = useState([]);
  const [containerColumns, setContainerColumns] = useState({});
  const [loading, setLoading] = useState(false);
  const { getNextZIndex } = useZIndex();

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
    onUpdate({
      source: 'element',
      elementId: elementId,
      value: selectedElement ? `Text (${elementId.slice(-6)})` : '',
      // Clear other source-specific fields
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null,
      repeatingContainerId: null,
      repeatingColumn: null
    });
  }, [availableElements, onUpdate]);

  const handleRepeatingContainerSelect = useCallback((containerId) => {
    onUpdate({
      source: 'repeating_container',
      repeatingContainerId: containerId,
      repeatingColumn: null,
      value: `Repeating Container (${containerId.slice(-6)})`,
      // Clear other source-specific fields
      elementId: null,
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

  // Filter available elements to only show text elements
  const textElements = availableElements.filter(element => element.type === 'text');

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
        {textElements.map((element) => (
          <option key={element.id} value={element.id}>
            Text ({element.id.slice(-6)})
          </option>
        ))}
      </select>

      {textElements.length === 0 && (
        <div style={{
          marginTop: '8px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          No text elements found in current screen
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
            const element = textElements.find(el => el.id === config.elementId);
            return element && (
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '2px'
              }}>
                Current Value: "{element.properties?.value || ''}"
              </div>
            );
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
              Get value from a text element in the current screen
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
      {selectedOption === 'custom' && renderCustomValue()}
    </div>
  );
};

export default ValueTab;