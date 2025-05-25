import React, { useState, useCallback } from 'react';
import SuperText from '../SuperText';
import { useZIndex } from '../ZIndexContext';

const ValueTab = ({ config, onUpdate, availableElements = [], parentZIndex = 1000 }) => {
  const [selectedOption, setSelectedOption] = useState(config.source || 'custom');
  const { getNextZIndex } = useZIndex();

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
      selectedColumn: null
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
      selectedColumn: null
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
      selectedColumn: null
    });
  }, [availableElements, onUpdate]);

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
      {selectedOption === 'custom' && renderCustomValue()}
    </div>
  );
};

export default ValueTab;