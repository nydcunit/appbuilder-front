import React from 'react';
import SuperText from '../../components/SuperText';

const TextContentSettings = ({ 
  getValue, 
  handleInputChange, 
  availableElements = [],
  element,
  isInsideSliderContainer = false, // Flag to indicate if this text is inside a slider container
  isInsideTabsContainer = false // Flag to indicate if this text is inside a tabs container
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
      />
    </div>
  );
};

export default TextContentSettings;
