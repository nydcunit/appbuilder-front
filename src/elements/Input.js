import React, { memo, useCallback, useEffect, useState } from 'react';
import ConditionBlock from '../components/ConditionBlock';
import SuperText from '../components/SuperText';

// ============================================
// INPUT STYLE SETTINGS COMPONENT
// ============================================

const InputStyleSettings = ({ 
  getValue, 
  handleInputChange, 
  handleKeyPress, 
  updateProperty,
  element,
  isInsideSliderContainer = false,
  isInsideTabsContainer = false
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
  
  // Determine active color based on container type
  const activeColor = isInsideTabsContainer ? '#007bff' : '#8b5cf6';
  
  // Style for labels in active mode
  const labelStyle = {
    minWidth: '80px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: isActiveMode ? activeColor : '#555'
  };
  
  // Style for section headers in active mode
  const headerStyle = {
    marginBottom: '10px',
    color: isActiveMode ? activeColor : '#333',
    borderBottom: '1px solid #eee',
    paddingBottom: '5px'
  };

  return (
    <>
      {/* Active Mode Toggle for Input Elements Inside Slider/Tabs Containers */}
      {(isInsideSliderContainer || isInsideTabsContainer) && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: isActiveMode ? (isInsideTabsContainer ? '#f0f8ff' : '#f3f4f6') : 'transparent',
            borderRadius: '4px',
            border: isActiveMode ? `1px solid ${activeColor}` : '1px solid transparent'
          }}>
            <button
              onClick={() => setIsActiveMode(!isActiveMode)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: isActiveMode ? activeColor : '#e5e7eb',
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
              color: isActiveMode ? activeColor : '#6b7280',
              fontWeight: isActiveMode ? '500' : '400'
            }}>
              {isActiveMode 
                ? (isInsideTabsContainer ? 'Editing active tab input styles' : 'Editing active slide input styles')
                : 'Editing default input styles'
              }
            </span>
          </div>
          {isActiveMode && (
            <div style={{
              fontSize: '11px',
              color: activeColor,
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: isInsideTabsContainer ? '#e6f3ff' : '#faf5ff',
              borderRadius: '3px'
            }}>
              {isInsideTabsContainer 
                ? 'These styles will only apply when this input is in the active tab'
                : 'These styles will only apply when this input is in the active slide'
              }
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
          </select>
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Colors
        </h4>
        
        {/* Get current input type for conditional color options */}
        {(() => {
          const currentInputType = getValue('inputType') || 'text';
          
          if (currentInputType === 'button') {
            // Button-specific colors only
            return (
              <>
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
                    Background Color:
                  </label>
                  <input
                    type="color"
                    value={getValueWithActiveMode('backgroundColor')}
                    onChange={(e) => updatePropertyWithActiveMode('backgroundColor', e.target.value)}
                    style={{
                      width: '100%',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  />
                </div>
              </>
            );
          } else {
            // All other input types get full color options
            return (
              <>
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
                    Placeholder Color:
                  </label>
                  <input
                    type="color"
                    value={getValueWithActiveMode('placeholderColor')}
                    onChange={(e) => updatePropertyWithActiveMode('placeholderColor', e.target.value)}
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
                    value={getValueWithActiveMode('boxBackgroundColor')}
                    onChange={(e) => updatePropertyWithActiveMode('boxBackgroundColor', e.target.value)}
                    style={{
                      width: '100%',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  />
                </div>

                {currentInputType === 'dropdown' && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <label style={labelStyle}>
                      Arrow Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('arrowColor')}
                      onChange={(e) => updatePropertyWithActiveMode('arrowColor', e.target.value)}
                      style={{
                        width: '100%',
                        height: '30px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                )}
              </>
            );
          }
        })()}
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
            color: isActiveMode ? activeColor : '#555' 
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
            color: isActiveMode ? activeColor : '#555' 
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

      {/* Border Radius */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Border Radius
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            fontWeight: 'bold', 
            marginBottom: '5px', 
            color: isActiveMode ? activeColor : '#555' 
          }}>
            Corners:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValueWithActiveMode('borderRadiusTopLeft')}
              onChange={(e) => handleInputChangeWithActiveMode('borderRadiusTopLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValueWithActiveMode('borderRadiusTopRight')}
              onChange={(e) => handleInputChangeWithActiveMode('borderRadiusTopRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValueWithActiveMode('borderRadiusBottomLeft')}
              onChange={(e) => handleInputChangeWithActiveMode('borderRadiusBottomLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValueWithActiveMode('borderRadiusBottomRight')}
              onChange={(e) => handleInputChangeWithActiveMode('borderRadiusBottomRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom Right"
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

      {/* Border */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Border
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Border Color:
          </label>
          <input
            type="color"
            value={getValueWithActiveMode('borderColor')}
            onChange={(e) => updatePropertyWithActiveMode('borderColor', e.target.value)}
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
            Border Width:
          </label>
          <input
            type="number"
            value={getValueWithActiveMode('borderWidth')}
            onChange={(e) => handleInputChangeWithActiveMode('borderWidth', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="1"
            min="0"
            max="10"
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
      </div>
    </>
  );
};

// ============================================
// INPUT CONTENT SETTINGS COMPONENT
// ============================================

const InputContentSettings = ({ 
  getValue, 
  handleInputChange, 
  availableElements = [],
  element,
  screens = [],
  currentScreenId = null
}) => {
  
  // Handle input type checkboxes (for text type only)
  const handleInputTypeChange = (type, checked) => {
    const currentTypes = getValue('inputTypes') || [];
    let newTypes;
    
    if (checked) {
      newTypes = [...currentTypes, type];
    } else {
      newTypes = currentTypes.filter(t => t !== type);
    }
    
    handleInputChange('inputTypes', newTypes);
  };
  
  const currentInputTypes = getValue('inputTypes') || [];
  const currentInputType = getValue('inputType') || 'text';
  
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Input Configuration
      </h4>
      
      {/* Main Input Type Dropdown */}
      <div style={{
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#e8f4fd',
        borderRadius: '6px',
        border: '1px solid #b3d9ff'
      }}>
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '8px'
        }}>
          Input Type:
        </label>
        
        <select
          value={currentInputType}
          onChange={(e) => handleInputChange('inputType', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          <option value="text">Text</option>
          <option value="dropdown">Dropdown</option>
          <option value="button">Button</option>
          <option value="toggle">Toggle</option>
          <option value="datePicker">Date Picker</option>
          <option value="location">Location</option>
          <option value="filePicker">File Picker</option>
          <option value="audio">Audio</option>
        </select>
      </div>
      
      {/* Text Input Type Options (only show for text type) */}
      {currentInputType === 'text' && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e0e0e0'
        }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '8px'
          }}>
            Text Input Options (can select multiple):
          </label>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Number Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="input-number"
                checked={currentInputTypes.includes('number')}
                onChange={(e) => handleInputTypeChange('number', e.target.checked)}
              />
              <label htmlFor="input-number" style={{
                fontSize: '12px',
                color: '#333',
                cursor: 'pointer'
              }}>
                Number (only number input)
              </label>
            </div>
            
            {/* Password Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="input-password"
                checked={currentInputTypes.includes('password')}
                onChange={(e) => handleInputTypeChange('password', e.target.checked)}
              />
              <label htmlFor="input-password" style={{
                fontSize: '12px',
                color: '#333',
                cursor: 'pointer'
              }}>
                Password (password input)
              </label>
            </div>
            
            {/* Long Text Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="input-long"
                checked={currentInputTypes.includes('long')}
                onChange={(e) => handleInputTypeChange('long', e.target.checked)}
              />
              <label htmlFor="input-long" style={{
                fontSize: '12px',
                color: '#333',
                cursor: 'pointer'
              }}>
                Long (textarea)
              </label>
            </div>
          </div>
        </div>
      )}
      
      {/* Dropdown Configuration */}
      {currentInputType === 'dropdown' && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f0f8ff',
          borderRadius: '6px',
          border: '1px solid #b3d9ff'
        }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '8px'
          }}>
            Dropdown Configuration:
          </label>
          
          {/* Placeholder SuperText for Dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <SuperText
              label="Placeholder"
              placeholder="Enter placeholder text (e.g., Select one)"
              value={getValue('placeholder')}
              onChange={(value) => handleInputChange('placeholder', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>
          
          {/* Selected Option SuperText */}
          <div style={{ marginBottom: '12px' }}>
            <SuperText
              label="Selected Option"
              placeholder="Enter selected option value..."
              value={getValue('selectedOption')}
              onChange={(value) => handleInputChange('selectedOption', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>
          
          {/* Available Options SuperText */}
          <div style={{ marginBottom: '8px' }}>
            <SuperText
              label="Available Options"
              placeholder="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
              value={getValue('availableOptions')}
              onChange={(value) => handleInputChange('availableOptions', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#0066cc',
            padding: '4px 8px',
            backgroundColor: '#e6f3ff',
            borderRadius: '3px'
          }}>
            💡 Tip: Separate options with commas. The selected option will be used as the default value.
          </div>
        </div>
      )}

      {/* Button Configuration */}
      {currentInputType === 'button' && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#f0fff0',
          borderRadius: '6px',
          border: '1px solid #90ee90'
        }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '8px'
          }}>
            Button Configuration:
          </label>
          
          {/* Label SuperText for Button */}
          <div style={{ marginBottom: '8px' }}>
            <SuperText
              label="Label Text"
              placeholder="Enter button label (e.g., Click Me)"
              value={getValue('buttonLabel')}
              onChange={(value) => handleInputChange('buttonLabel', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#228b22',
            padding: '4px 8px',
            backgroundColor: '#f0fff0',
            borderRadius: '3px'
          }}>
            💡 Tip: The label text will be displayed on the button.
          </div>
        </div>
      )}

      {/* Show placeholder for other input types */}
      {currentInputType !== 'text' && currentInputType !== 'dropdown' && currentInputType !== 'button' && (
        <div style={{
          marginBottom: '16px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          borderRadius: '6px',
          border: '1px solid #ffeaa7',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#856404',
            fontWeight: '500',
            marginBottom: '4px'
          }}>
            {currentInputType.charAt(0).toUpperCase() + currentInputType.slice(1)} Input Type
          </div>
          <div style={{
            fontSize: '12px',
            color: '#856404'
          }}>
            Configuration options for this input type will be available soon.
          </div>
        </div>
      )}
      
      {/* Placeholder and Default Value SuperTexts - Only show for text input types */}
      {currentInputType === 'text' && (
        <>
          {/* Placeholder SuperText */}
          <SuperText
            label="Placeholder"
            placeholder="Enter placeholder text..."
            value={getValue('placeholder')}
            onChange={(value) => handleInputChange('placeholder', value)}
            availableElements={availableElements}
            screens={screens}
            currentScreenId={currentScreenId}
          />
          
          {/* Default Value SuperText */}
          <SuperText
            label="Default Value"
            placeholder="Enter default value..."
            value={getValue('defaultValue')}
            onChange={(value) => handleInputChange('defaultValue', value)}
            availableElements={availableElements}
            screens={screens}
            currentScreenId={currentScreenId}
          />
        </>
      )}
    </div>
  );
};

// ============================================
// INPUT PROPERTIES PANEL COMPONENT
// ============================================

const InputPropertiesPanel = memo(({ element, onUpdate, availableElements = [], screens = [], currentScreenId = null }) => {
  const props = element.properties || {};
  
  // Initialize activeConditionIndex based on element's conditional state
  const [activeConditionIndex, setActiveConditionIndex] = useState(() => {
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      return 0;
    }
    return 0;
  });

  // Update activeConditionIndex when element changes, but preserve user selection
  useEffect(() => {
    if (element.renderType !== 'conditional' || !element.conditions || element.conditions.length === 0) {
      setActiveConditionIndex(0);
    } else if (activeConditionIndex >= element.conditions.length) {
      setActiveConditionIndex(0);
    }
  }, [element.id, element.renderType, element.conditions?.length]);

  // Get the current properties - enhanced logic for condition property inheritance
  const getCurrentProperties = useCallback(() => {
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      const activeCondition = element.conditions[activeConditionIndex];
      
      if (activeCondition?.properties) {
        const mergedProps = { ...props, ...activeCondition.properties };
        return mergedProps;
      } else {
        return props;
      }
    }
    return props;
  }, [element.renderType, element.conditions, activeConditionIndex, props]);

  // Stable update function for properties
  const updateProperty = useCallback((key, value) => {
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      // Update condition-specific properties
      const newConditions = element.conditions.map((condition, index) => {
        if (index === activeConditionIndex) {
          const updatedCondition = {
            ...condition,
            properties: {
              ...condition.properties,
              [key]: value
            }
          };
          return updatedCondition;
        }
        return condition;
      });
      onUpdate({ conditions: newConditions });
    } else {
      // Update base properties
      const updatedProps = {
        ...props,
        [key]: value
      };
      onUpdate({
        properties: updatedProps
      });
    }
  }, [props, onUpdate, element.renderType, element.conditions, activeConditionIndex]);

  // Handle condition updates AND manage active condition index
  const handleConditionUpdate = useCallback((updates) => {
    // If we're adding a new condition, copy properties from the active condition or base
    if (updates.conditions && updates.conditions.length > (element.conditions?.length || 0)) {
      const newConditions = updates.conditions.map((condition, index) => {
        if (!condition.properties) {
          let sourceProperties = { ...props };
          
          if (element.conditions && element.conditions[activeConditionIndex]?.properties) {
            sourceProperties = { ...element.conditions[activeConditionIndex].properties };
          }
          
          return {
            ...condition,
            properties: sourceProperties
          };
        }
        return condition;
      });
      updates.conditions = newConditions;
    }
    
    // If conditions were deleted and activeConditionIndex is out of bounds, reset it
    if (updates.conditions && activeConditionIndex >= updates.conditions.length) {
      setActiveConditionIndex(0);
    }
    
    onUpdate(updates);
  }, [onUpdate, element.conditions, props, activeConditionIndex]);

  // Handle condition selection changes from ConditionBlock
  const handleConditionSelectionChange = useCallback((conditionIndex) => {
    setActiveConditionIndex(conditionIndex);
  }, []);

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
    const value = currentProps[key] ?? '';
    return value;
  }, [getCurrentProperties]);

  // Check if this input element is inside a slider container
  const checkIfInsideSliderContainer = useCallback(() => {
    const isElementInContainer = (elementId, container) => {
      if (!container.children || container.children.length === 0) {
        return false;
      }
      
      for (const child of container.children) {
        if (child.id === elementId) {
          return true;
        }
        if (child.type === 'container' && isElementInContainer(elementId, child)) {
          return true;
        }
      }
      
      return false;
    };
    
    for (const container of availableElements) {
      if (container.type === 'container' && container.containerType === 'slider') {
        if (isElementInContainer(element.id, container)) {
          return true;
        }
      }
    }
    
    return false;
  }, [element.id, availableElements]);

  // Check if this input element is inside a tabs container
  const checkIfInsideTabsContainer = useCallback(() => {
    const isElementInContainer = (elementId, container) => {
      if (!container.children || container.children.length === 0) {
        return false;
      }
      
      for (const child of container.children) {
        if (child.id === elementId) {
          return true;
        }
        if (child.type === 'container' && isElementInContainer(elementId, child)) {
          return true;
        }
      }
      
      return false;
    };
    
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
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Input Properties</h3>
      
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
          Use this ID to reference this input in calculations
        </div>
      </div>

      {/* Condition Block */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        onConditionSelectionChange={handleConditionSelectionChange}
        activeConditionIndex={activeConditionIndex}
        availableElements={availableElements}
        screens={screens}
        currentScreenId={currentScreenId}
      />

      {/* Show indicator of which condition's properties are being edited */}
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
            <strong>💡 Tip:</strong> Changes are automatically saved. The input styling you set here will be applied when this condition evaluates to true during preview/execution.
          </div>
        </div>
      )}

      {/* Content Section */}
      <InputContentSettings
        getValue={getValue}
        handleInputChange={handleInputChange}
        availableElements={availableElements}
        element={element}
        screens={screens}
        currentScreenId={currentScreenId}
      />
      
      {/* Style Settings */}
      <InputStyleSettings
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

InputPropertiesPanel.displayName = 'InputPropertiesPanel';

// ============================================
// MAIN INPUT COMPONENT AND ELEMENT DEFINITION
// ============================================

// Get properties for rendering - handles conditional properties based on evaluation
const getRenderProperties = (element, matchedConditionIndex = null) => {
  if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
    let conditionIndex = matchedConditionIndex;
    
    if (conditionIndex === null || conditionIndex === undefined) {
      conditionIndex = 0;
    }
    
    const selectedCondition = element.conditions[conditionIndex];
    
    if (selectedCondition && selectedCondition.properties) {
      const mergedProperties = { ...element.properties, ...selectedCondition.properties };
      return mergedProperties;
    }
  }
  
  const baseProperties = element.properties || {};
  return baseProperties;
};

// Separate component for input rendering with hooks
const InputRenderer = ({ element, isExecuteMode, isSelected, isActiveSlide, isActiveTab, matchedConditionIndex, handlers }) => {
  const { onClick, onDelete, onDragStart } = handlers;
  
  console.log('🔵 INPUT_DEBUG: InputRenderer props:', {
    elementId: element.id,
    isExecuteMode,
    isSelected,
    isActiveSlide,
    isActiveTab,
    matchedConditionIndex,
    hasHandlers: !!handlers
  });
  
  // State for controlled input in execute mode
  const [inputValue, setInputValue] = React.useState('');
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [userHasEdited, setUserHasEdited] = React.useState(false);
  
  console.log('🔵 INPUT_DEBUG: State values:', {
    elementId: element.id,
    inputValue,
    isInitialized,
    userHasEdited,
    defaultValue: element.properties?.defaultValue
  });
  
  // Initialize input value with calculated result in execute mode
  React.useEffect(() => {
    console.log('🔵 INPUT_DEBUG: Initialization effect running:', {
      elementId: element.id,
      isExecuteMode,
      isInitialized,
      inputType: element.properties?.inputType,
      selectedOption: element.properties?.selectedOption,
      defaultValue: element.properties?.defaultValue
    });
    
    if (isExecuteMode && !isInitialized) {
      let calculatedValue = '';
      
      // For dropdown inputs, use selectedOption as the initial value
      if (element.properties?.inputType === 'dropdown') {
        calculatedValue = element.properties?.selectedOption || '';
      } else {
        // For other input types, use defaultValue
        calculatedValue = element.properties?.defaultValue || '';
      }
      
      console.log('🔵 INPUT_DEBUG: Initializing input value:', {
        elementId: element.id,
        inputType: element.properties?.inputType,
        calculatedValue
      });
      setInputValue(calculatedValue);
      setIsInitialized(true);
      
      // Expose initial value to calculation engine for all input types
      if (isExecuteMode) {
        // Initialize elementValues if it doesn't exist
        if (!window.elementValues) {
          window.elementValues = {};
        }
        window.elementValues[element.id] = calculatedValue;
        
        console.log('🔵 INPUT_DEBUG: Exposed initial value to calculation engine:', {
          elementId: element.id,
          value: calculatedValue,
          elementValues: window.elementValues
        });
      }
    }
  }, [isExecuteMode, element.properties?.defaultValue, element.properties?.selectedOption, element.properties?.inputType, isInitialized]);
  
  // Update input value when calculated value changes (but only if user hasn't edited)
  React.useEffect(() => {
    console.log('🔵 INPUT_DEBUG: Update effect running:', {
      elementId: element.id,
      isExecuteMode,
      isInitialized,
      userHasEdited,
      inputType: element.properties?.inputType,
      selectedOption: element.properties?.selectedOption,
      defaultValue: element.properties?.defaultValue,
      currentInputValue: inputValue
    });
    
    if (isExecuteMode && isInitialized && !userHasEdited) {
      let calculatedValue = '';
      
      // For dropdown inputs, use selectedOption as the value to track
      if (element.properties?.inputType === 'dropdown') {
        calculatedValue = element.properties?.selectedOption || '';
      } else {
        // For other input types, use defaultValue
        calculatedValue = element.properties?.defaultValue || '';
      }
      
      // Only update if the calculated value is different and doesn't contain calc tokens
      if (calculatedValue !== inputValue && !calculatedValue.includes('{{CALC:')) {
        console.log('🔵 INPUT_DEBUG: Updating input value (user has not edited):', {
          elementId: element.id,
          inputType: element.properties?.inputType,
          from: inputValue,
          to: calculatedValue
        });
        setInputValue(calculatedValue);
      }
    } else if (userHasEdited) {
      console.log('🔵 INPUT_DEBUG: Skipping update - user has edited the input');
    }
  }, [element.properties?.defaultValue, element.properties?.selectedOption, element.properties?.inputType, isExecuteMode, isInitialized, inputValue, userHasEdited]);
  
  // Get render properties with matched condition index
  let props = getRenderProperties(element, matchedConditionIndex);
  
  // Apply active styles if this element is in the active slide OR active tab
  const shouldApplyActiveStyles = (isActiveSlide || isActiveTab) && isExecuteMode;
  
  if (shouldApplyActiveStyles) {
    // Merge active properties over default properties
    const activeProps = {};
    Object.keys(props).forEach(key => {
      const activeKey = `active${key.charAt(0).toUpperCase()}${key.slice(1)}`;
      if (props[activeKey] !== undefined) {
        activeProps[key] = props[activeKey];
      }
    });
    props = { ...props, ...activeProps };
  }
  
  // Determine input type based on selected options
  const inputTypes = props.inputTypes || [];
  let inputType = 'text';
  let isTextarea = false;
  
  if (inputTypes.includes('password')) {
    inputType = 'password';
  } else if (inputTypes.includes('number')) {
    inputType = 'number';
  }
  
  if (inputTypes.includes('long')) {
    isTextarea = true;
  }
  
  // Build styles from properties
  const inputStyle = {
    // Typography
    fontSize: `${props.fontSize || 16}px`,
    fontWeight: props.fontWeight || '400',
    textAlign: props.textAlignment || 'left',
    
    // Colors
    color: props.textColor || '#333333',
    backgroundColor: props.boxBackgroundColor || '#ffffff',
    
    // Spacing
    marginTop: `${props.marginTop || 0}px`,
    marginBottom: `${props.marginBottom || 0}px`,
    marginLeft: `${props.marginLeft || 0}px`,
    marginRight: `${props.marginRight || 0}px`,
    paddingTop: `${props.paddingTop || 12}px`,
    paddingBottom: `${props.paddingBottom || 12}px`,
    paddingLeft: `${props.paddingLeft || 16}px`,
    paddingRight: `${props.paddingRight || 16}px`,
    
    // Border Radius
    borderTopLeftRadius: `${props.borderRadiusTopLeft || 4}px`,
    borderTopRightRadius: `${props.borderRadiusTopRight || 4}px`,
    borderBottomLeftRadius: `${props.borderRadiusBottomLeft || 4}px`,
    borderBottomRightRadius: `${props.borderRadiusBottomRight || 4}px`,
    
    // Border
    border: `${props.borderWidth || 1}px solid ${props.borderColor || '#ddd'}`,
    
    // Layout
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    resize: isTextarea ? 'vertical' : 'none',
    minHeight: isTextarea ? '80px' : 'auto',
    
    // Canvas specific styles
    ...(isSelected && {
      borderColor: '#007bff',
      borderWidth: '2px'
    })
  };
  
  // Placeholder color
  const placeholderColor = props.placeholderColor || '#999999';
  
  return (
    <div
      key={element.id}
      draggable={!isExecuteMode}
      onClick={(e) => {
        if (!isExecuteMode) {
          onClick && onClick(element, e);
        }
      }}
      onDragStart={(e) => {
        if (!isExecuteMode) {
          e.stopPropagation();
          onDragStart && onDragStart(e);
        }
      }}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: '100%'
      }}
      onMouseDown={(e) => {
        if (!isExecuteMode) {
          e.currentTarget.style.cursor = 'grabbing';
        }
      }}
      onMouseUp={(e) => {
        if (!isExecuteMode) {
          e.currentTarget.style.cursor = 'grab';
        }
      }}
      onMouseLeave={(e) => {
        if (!isExecuteMode) {
          e.currentTarget.style.cursor = 'grab';
        }
      }}
    >
      {/* Element Label - Hide in execute mode */}
      {!isExecuteMode && isSelected && (
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
          Input Element (ID: {element.id.slice(-6)})
          {element.renderType === 'conditional' && (
            <span style={{ color: '#28a745', marginLeft: '4px' }}>• Conditional</span>
          )}
        </div>
      )}
      
      {/* Delete Button - Hide in execute mode */}
      {!isExecuteMode && isSelected && (
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

      {/* Drag Handle - Hide in execute mode */}
      {!isExecuteMode && isSelected && (
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

      {/* Input Element */}
      {(() => {
        console.log('🔵 INPUT_DEBUG: Rendering input element:', {
          elementId: element.id,
          isExecuteMode,
          inputType: props.inputType,
          isTextarea,
          disabled: !isExecuteMode,
          value: isExecuteMode ? inputValue : undefined,
          defaultValue: !isExecuteMode ? (props.defaultValue || '') : undefined,
          placeholder: props.placeholder
        });
        
        // Handle button input type
        if (props.inputType === 'button') {
          // Button styles
          const buttonStyle = {
            ...inputStyle,
            cursor: isExecuteMode ? 'pointer' : 'default',
            pointerEvents: isExecuteMode ? 'auto' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none',
            // Use textColor directly for button label (not labelColor)
            color: props.textColor || '#333333',
            // Use backgroundColor directly for button background
            backgroundColor: props.backgroundColor || '#ffffff'
          };
          
          // Get button label
          const buttonLabel = props.buttonLabel || 'Click Me';
          
          return (
            <button
              data-element-id={element.id}
              data-element-type="input"
              data-input-type="button"
              onClick={isExecuteMode ? (e) => {
                console.log('🔵 INPUT_DEBUG: Button onClick:', {
                  elementId: element.id,
                  buttonLabel
                });
                // Button click handling can be extended here for future functionality
              } : undefined}
              style={buttonStyle}
              disabled={!isExecuteMode}
            >
              {buttonLabel}
            </button>
          );
        }
        
        // Handle dropdown input type
        if (props.inputType === 'dropdown') {
          // Parse available options from comma-separated string
          const availableOptionsStr = props.availableOptions || '';
          const optionsArray = availableOptionsStr.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
          
          // Get selected option value
          const selectedOptionValue = props.selectedOption || '';
          
          // Dropdown styles with custom arrow
          const dropdownStyle = {
            ...inputStyle,
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(props.arrowColor || '#666666')}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '16px',
            paddingRight: `${(props.paddingRight || 16) + 24}px`, // Add space for arrow
            cursor: isExecuteMode ? 'pointer' : 'default',
            pointerEvents: isExecuteMode ? 'auto' : 'none'
          };
          
          return (
            <select
              data-element-id={element.id}
              data-element-type="input"
              data-input-type="dropdown"
              value={isExecuteMode ? inputValue : undefined}
              defaultValue={!isExecuteMode ? selectedOptionValue : undefined}
              onChange={isExecuteMode ? (e) => {
                console.log('🔵 INPUT_DEBUG: Dropdown onChange:', {
                  elementId: element.id,
                  newValue: e.target.value
                });
                setInputValue(e.target.value);
                setUserHasEdited(true);
                
                // CALCULATION INTEGRATION STEP 1: Expose value to calculation engine
                // CRITICAL: All input changes must update window.elementValues for calculation access
                if (!window.elementValues) {
                  window.elementValues = {};
                }
                window.elementValues[element.id] = e.target.value;
                
                // CALCULATION INTEGRATION STEP 2: DOM element value exposure
                // Ensures calculation engine can access value via DOM queries
                const selectElement = e.target;
                if (selectElement) {
                  selectElement.value = e.target.value;
                  selectElement.setAttribute('data-current-value', e.target.value);
                }
                
                console.log('🔵 INPUT_DEBUG: Updated dropdown value in calculation engine:', {
                  elementId: element.id,
                  newValue: e.target.value,
                  elementValues: window.elementValues,
                  domValue: selectElement.value
                });
                
                // CALCULATION INTEGRATION STEP 3: Trigger real-time calculation re-execution
                // REAL-TIME UPDATE FLOW: User change → triggerCalculationUpdate() → 'input_change' event 
                // → AppRuntimeV2 re-executes screen → Calculations update → UI re-renders
                if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
                  console.log('🔵 INPUT_DEBUG: Triggering calculation update for dropdown change');
                  window.__v2ExecutionEngine.triggerCalculationUpdate();
                }
              } : undefined}
              style={dropdownStyle}
              disabled={!isExecuteMode}
            >
              {/* Placeholder option */}
              {props.placeholder && (
                <option value="" disabled style={{ color: placeholderColor }}>
                  {props.placeholder}
                </option>
              )}
              
              {/* Available options */}
              {optionsArray.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
              
              {/* Show default options if no options are configured */}
              {optionsArray.length === 0 && (
                <>
                  <option value="Option 1">Option 1</option>
                  <option value="Option 2">Option 2</option>
                  <option value="Option 3">Option 3</option>
                </>
              )}
            </select>
          );
        }
        
        // Handle text input types (textarea and regular inputs)
        return isTextarea ? (
          <textarea
            data-element-id={element.id}
            placeholder={props.placeholder || 'Enter text...'}
            value={isExecuteMode ? inputValue : undefined}
            defaultValue={!isExecuteMode ? (props.defaultValue || '') : undefined}
            onChange={isExecuteMode ? (e) => {
              console.log('🔵 INPUT_DEBUG: Textarea onChange:', {
                elementId: element.id,
                newValue: e.target.value
              });
              setInputValue(e.target.value);
              setUserHasEdited(true);
            } : undefined}
            style={{
              ...inputStyle,
              pointerEvents: isExecuteMode ? 'auto' : 'none',
              '::placeholder': {
                color: placeholderColor
              }
            }}
            disabled={!isExecuteMode}
          />
        ) : (
          <input
            data-element-id={element.id}
            type={inputType}
            placeholder={props.placeholder || 'Enter text...'}
            value={isExecuteMode ? inputValue : undefined}
            defaultValue={!isExecuteMode ? (props.defaultValue || '') : undefined}
            onChange={isExecuteMode ? (e) => {
              console.log('🔵 INPUT_DEBUG: Input onChange:', {
                elementId: element.id,
                newValue: e.target.value
              });
              setInputValue(e.target.value);
              setUserHasEdited(true);
            } : undefined}
            style={{
              ...inputStyle,
              pointerEvents: isExecuteMode ? 'auto' : 'none',
              '::placeholder': {
                color: placeholderColor
              }
            }}
            disabled={!isExecuteMode}
          />
        );
      })()}
      
      {/* Add CSS for placeholder styling */}
      <style>
        {`
          input::placeholder, textarea::placeholder {
            color: ${placeholderColor} !important;
          }
        `}
      </style>
    </div>
  );
};

export const InputElement = {
  type: 'input',
  label: 'Input',
  icon: '📝',
  
  // Default properties when element is created
  getDefaultProps: () => ({
    // Input Configuration
    inputType: 'text', // Main input type: 'text', 'dropdown', 'button', 'toggle', 'datePicker', 'location', 'filePicker', 'audio'
    inputTypes: [], // Array of selected types for text input: 'number', 'password', 'long'
    placeholder: 'Select one',
    defaultValue: '',
    
    // Dropdown Configuration
    selectedOption: '',
    availableOptions: '',
    
    // Button Configuration
    buttonLabel: 'Click Me',
    
    // Typography
    fontSize: 16,
    fontWeight: '400',
    textAlignment: 'left',
    
    // Colors
    textColor: '#333333',
    placeholderColor: '#999999',
    boxBackgroundColor: '#ffffff',
    arrowColor: '#666666',
    labelColor: '#333333', // Button label color
    backgroundColor: '#ffffff', // Button background color
    
    // Spacing
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    
    // Border Radius
    borderRadiusTopLeft: 4,
    borderRadiusTopRight: 4,
    borderRadiusBottomLeft: 4,
    borderRadiusBottomRight: 4,
    
    // Border
    borderColor: '#ddd',
    borderWidth: 1,
    
    // Active state properties (for when inside slider/tabs)
    activeFontSize: 16,
    activeFontWeight: '400',
    activeTextAlignment: 'left',
    activeTextColor: '#333333',
    activePlaceholderColor: '#999999',
    activeBoxBackgroundColor: '#ffffff',
    activeArrowColor: '#666666',
    activeLabelColor: '#333333', // Active button label color
    activeBackgroundColor: '#ffffff', // Active button background color
    activeMarginTop: 0,
    activeMarginBottom: 0,
    activeMarginLeft: 0,
    activeMarginRight: 0,
    activePaddingTop: 12,
    activePaddingBottom: 12,
    activePaddingLeft: 16,
    activePaddingRight: 16,
    activeBorderRadiusTopLeft: 4,
    activeBorderRadiusTopRight: 4,
    activeBorderRadiusBottomLeft: 4,
    activeBorderRadiusBottomRight: 4,
    activeBorderColor: '#ddd',
    activeBorderWidth: 1
  }),
  
  getDefaultChildren: () => ([]),

  // Render function
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null, isExecuteMode = false, isActiveSlide = false, isActiveTab = false) => {
    console.log('🔵 INPUT_DEBUG: Render function called:', {
      elementId: element.id,
      depth,
      isSelected,
      isDropZone,
      matchedConditionIndex,
      isExecuteMode,
      isActiveSlide,
      isActiveTab,
      hasHandlers: !!handlers
    });
    
    return React.createElement(InputRenderer, {
      element,
      isExecuteMode,
      isSelected,
      isActiveSlide,
      isActiveTab,
      matchedConditionIndex,
      handlers
    });
  },

  // Use the properties panel
  PropertiesPanel: InputPropertiesPanel
};
