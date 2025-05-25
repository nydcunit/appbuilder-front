import React, { useState, useCallback } from 'react';

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

export default InformationTab;