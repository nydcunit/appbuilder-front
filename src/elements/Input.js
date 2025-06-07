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
          
          // Text Input Colors
          if (currentInputType === 'text') {
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
          }
          
          // Dropdown Input Colors
          else if (currentInputType === 'dropdown') {
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
              </>
            );
          }
          
          // Button Input Colors
          else if (currentInputType === 'button') {
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
          }
          
          // Toggle Input Colors
          else if (currentInputType === 'toggle') {
            const toggleType = getValue('toggleType') || 'radio';
            
            if (toggleType === 'radio') {
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <label style={labelStyle}>
                      Label Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('toggleLabelColor')}
                      onChange={(e) => updatePropertyWithActiveMode('toggleLabelColor', e.target.value)}
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
                      Selected Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('toggleSelectedColor')}
                      onChange={(e) => updatePropertyWithActiveMode('toggleSelectedColor', e.target.value)}
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
            } else if (toggleType === 'checkbox') {
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <label style={labelStyle}>
                      Label Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('toggleLabelColor')}
                      onChange={(e) => updatePropertyWithActiveMode('toggleLabelColor', e.target.value)}
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
                      Check Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('toggleCheckColor')}
                      onChange={(e) => updatePropertyWithActiveMode('toggleCheckColor', e.target.value)}
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
            } else if (toggleType === 'switch') {
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                    <label style={labelStyle}>
                      Switch Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('toggleSwitchColor')}
                      onChange={(e) => updatePropertyWithActiveMode('toggleSwitchColor', e.target.value)}
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
                      Thumb Color:
                    </label>
                    <input
                      type="color"
                      value={getValueWithActiveMode('toggleThumbColor')}
                      onChange={(e) => updatePropertyWithActiveMode('toggleThumbColor', e.target.value)}
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
            }
          }
          
          // Date Picker Input Colors
          else if (currentInputType === 'datePicker') {
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

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                  <label style={labelStyle}>
                    Icon Color:
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
              </>
            );
          }
          
          // Default fallback for other input types
          return (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#666',
              fontSize: '12px'
            }}>
              Color options will be available for this input type soon.
            </div>
          );
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

      {/* Toggle Configuration */}
      {currentInputType === 'toggle' && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#fff5f5',
          borderRadius: '6px',
          border: '1px solid #ffc0cb'
        }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '12px'
          }}>
            Toggle Configuration:
          </label>
          
          {/* Toggle Type Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Toggle Type:
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Radio Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="toggle-radio"
                  name="toggleType"
                  value="radio"
                  checked={getValue('toggleType') === 'radio' || !getValue('toggleType')}
                  onChange={(e) => handleInputChange('toggleType', e.target.value)}
                />
                <label htmlFor="toggle-radio" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Radio (single selection from options)
                </label>
              </div>
              
              {/* Checkbox Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="toggle-checkbox"
                  name="toggleType"
                  value="checkbox"
                  checked={getValue('toggleType') === 'checkbox'}
                  onChange={(e) => handleInputChange('toggleType', e.target.value)}
                />
                <label htmlFor="toggle-checkbox" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Checkbox (on/off toggle)
                </label>
              </div>
              
              {/* Switch Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="toggle-switch"
                  name="toggleType"
                  value="switch"
                  checked={getValue('toggleType') === 'switch'}
                  onChange={(e) => handleInputChange('toggleType', e.target.value)}
                />
                <label htmlFor="toggle-switch" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Switch (modern toggle)
                </label>
              </div>
            </div>
          </div>

          {/* Radio-specific Configuration */}
          {(getValue('toggleType') === 'radio' || !getValue('toggleType')) && (
            <div style={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#333' }}>
                Radio Options:
              </h5>
              
              {/* Selected Option SuperText */}
              <div style={{ marginBottom: '12px' }}>
                <SuperText
                  label="Selected Option"
                  placeholder="Enter the currently selected option..."
                  value={getValue('radioSelectedOption')}
                  onChange={(value) => handleInputChange('radioSelectedOption', value)}
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
                  value={getValue('radioAvailableOptions')}
                  onChange={(value) => handleInputChange('radioAvailableOptions', value)}
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
                💡 Tip: Separate options with commas. Only one option can be selected at a time.
              </div>
            </div>
          )}

          {/* Checkbox-specific Configuration */}
          {getValue('toggleType') === 'checkbox' && (
            <div style={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#333' }}>
                Checkbox Options:
              </h5>
              
              {/* Label SuperText */}
              <div style={{ marginBottom: '8px' }}>
                <SuperText
                  label="Label Text"
                  placeholder="Enter checkbox label (e.g., Toggle)"
                  value={getValue('checkboxLabel')}
                  onChange={(value) => handleInputChange('checkboxLabel', value)}
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
                💡 Tip: The label text will be displayed next to the checkbox.
              </div>
            </div>
          )}

          {/* Switch-specific Configuration */}
          {getValue('toggleType') === 'switch' && (
            <div style={{
              marginBottom: '12px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e0e0e0'
            }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#333' }}>
                Switch Options:
              </h5>
              
              {/* Label SuperText */}
              <div style={{ marginBottom: '8px' }}>
                <SuperText
                  label="Label Text"
                  placeholder="Enter switch label (optional)"
                  value={getValue('switchLabel')}
                  onChange={(value) => handleInputChange('switchLabel', value)}
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
                💡 Tip: The label text will be displayed next to the switch. Leave blank for no label.
              </div>
            </div>
          )}
          
          <div style={{
            fontSize: '11px',
            color: '#d63384',
            padding: '4px 8px',
            backgroundColor: '#fff0f3',
            borderRadius: '3px'
          }}>
            💡 Tip: Choose the toggle type that best fits your use case. Radio for multiple options, Checkbox for on/off, Switch for modern toggle.
          </div>
        </div>
      )}

      {/* Date Picker Configuration */}
      {currentInputType === 'datePicker' && (
        <div style={{
          marginBottom: '16px',
          padding: '12px',
          backgroundColor: '#fff0f5',
          borderRadius: '6px',
          border: '1px solid #ffc0cb'
        }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '12px'
          }}>
            Date Picker Configuration:
          </label>
          
          {/* Date Picker Style Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Style:
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Default Style Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="datepicker-default"
                  name="datePickerStyle"
                  value="default"
                  checked={getValue('datePickerStyle') === 'default' || !getValue('datePickerStyle')}
                  onChange={(e) => handleInputChange('datePickerStyle', e.target.value)}
                />
                <label htmlFor="datepicker-default" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Default (normal input style with dropdown icon)
                </label>
              </div>
              
              {/* Bar Style Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="datepicker-bar"
                  name="datePickerStyle"
                  value="bar"
                  checked={getValue('datePickerStyle') === 'bar'}
                  onChange={(e) => handleInputChange('datePickerStyle', e.target.value)}
                />
                <label htmlFor="datepicker-bar" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Bar (horizontal calendar picker)
                </label>
              </div>
            </div>
          </div>

          {/* Select Mode Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Select Mode:
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Single Date Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="datepicker-single"
                  name="datePickerSelectMode"
                  value="single"
                  checked={getValue('datePickerSelectMode') === 'single' || !getValue('datePickerSelectMode')}
                  onChange={(e) => handleInputChange('datePickerSelectMode', e.target.value)}
                />
                <label htmlFor="datepicker-single" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Single Date
                </label>
              </div>
              
              {/* Date Range Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  id="datepicker-range"
                  name="datePickerSelectMode"
                  value="range"
                  checked={getValue('datePickerSelectMode') === 'range'}
                  onChange={(e) => handleInputChange('datePickerSelectMode', e.target.value)}
                />
                <label htmlFor="datepicker-range" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Date Range
                </label>
              </div>
            </div>
          </div>

          {/* SuperText Options */}
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e0e0e0'
          }}>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '600', color: '#333' }}>
              SuperText Options:
            </h5>
            
            {/* Label SuperText */}
            <div style={{ marginBottom: '12px' }}>
              <SuperText
                label="Label"
                placeholder="Enter label text (e.g., Select Date)"
                value={getValue('datePickerLabel')}
                onChange={(value) => handleInputChange('datePickerLabel', value)}
                availableElements={availableElements}
                screens={screens}
                currentScreenId={currentScreenId}
              />
            </div>
            
            {/* Minimum Date SuperText */}
            <div style={{ marginBottom: '12px' }}>
              <SuperText
                label="Minimum Date"
                placeholder="Enter minimum date (MM/DD/YYYY format)"
                value={getValue('datePickerMinDate')}
                onChange={(value) => handleInputChange('datePickerMinDate', value)}
                availableElements={availableElements}
                screens={screens}
                currentScreenId={currentScreenId}
              />
            </div>
            
            {/* Maximum Date SuperText */}
            <div style={{ marginBottom: '12px' }}>
              <SuperText
                label="Maximum Date"
                placeholder="Enter maximum date (MM/DD/YYYY format)"
                value={getValue('datePickerMaxDate')}
                onChange={(value) => handleInputChange('datePickerMaxDate', value)}
                availableElements={availableElements}
                screens={screens}
                currentScreenId={currentScreenId}
              />
            </div>
            
            {/* Disabled Dates SuperText */}
            <div style={{ marginBottom: '8px' }}>
              <SuperText
                label="Disabled Dates"
                placeholder="Enter disabled dates separated by commas (MM/DD/YYYY,MM/DD/YYYY)"
                value={getValue('datePickerDisabledDates')}
                onChange={(value) => handleInputChange('datePickerDisabledDates', value)}
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
              💡 Tip: Use MM/DD/YYYY format for dates. Separate multiple disabled dates with commas.
            </div>
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#d63384',
            padding: '4px 8px',
            backgroundColor: '#fff0f3',
            borderRadius: '3px'
          }}>
            💡 Tip: Choose Default style for traditional date picker or Bar style for horizontal calendar view.
          </div>
        </div>
      )}

      {/* Show placeholder for other input types */}
      {currentInputType !== 'text' && currentInputType !== 'dropdown' && currentInputType !== 'button' && currentInputType !== 'toggle' && currentInputType !== 'datePicker' && (
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
  
  // State for toggle value
  const [toggleValue, setToggleValue] = React.useState(() => {
    const toggleType = element.properties?.toggleType || 'radio';
    if (toggleType === 'radio') {
      return element.properties?.radioSelectedOption || '';
    } else if (toggleType === 'checkbox') {
      return false;
    } else if (toggleType === 'switch') {
      return false;
    }
    return '';
  });
  
  // State for date picker
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedStartDate, setSelectedStartDate] = React.useState('');
  const [selectedEndDate, setSelectedEndDate] = React.useState('');
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [dateOffset, setDateOffset] = React.useState(0); // State for tracking the current date offset within the month
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    // Parse MM/DD/YYYY format to get minimum date
    const parseMMDDYYYY = (dateStr) => {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.trim().split('/');
      if (parts.length !== 3) return null;
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null;
      return new Date(year, month - 1, day);
    };
    
    const today = new Date();
    const minDate = parseMMDDYYYY(element.properties?.datePickerMinDate);
    
    // If there's a minimum date and it's after today, start with the minimum date's month
    if (minDate && minDate > today) {
      return minDate.getMonth();
    }
    
    return today.getMonth();
  });
  const [currentYear, setCurrentYear] = React.useState(() => {
    // Parse MM/DD/YYYY format to get minimum date
    const parseMMDDYYYY = (dateStr) => {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.trim().split('/');
      if (parts.length !== 3) return null;
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
      if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null;
      return new Date(year, month - 1, day);
    };
    
    const today = new Date();
    const minDate = parseMMDDYYYY(element.properties?.datePickerMinDate);
    
    // If there's a minimum date and it's after today, start with the minimum date's year
    if (minDate && minDate > today) {
      return minDate.getFullYear();
    }
    
    return today.getFullYear();
  });
  
  // Ref for calendar container to detect outside clicks
  const calendarRef = React.useRef(null);
  
  // Close calendar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    
    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCalendar]);
  
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
  
  // Initialize calendar to valid selectable month when opened
  React.useEffect(() => {
    if (showCalendar && props.inputType === 'datePicker') {
      // Parse MM/DD/YYYY format to YYYY-MM-DD
      const parseMMDDYYYY = (dateStr) => {
        if (!dateStr || dateStr.trim() === '') return null;
        const parts = dateStr.trim().split('/');
        if (parts.length !== 3) return null;
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null;
        const date = new Date(year, month - 1, day);
        return date.toISOString().split('T')[0]; // YYYY-MM-DD format
      };
      
      // Get date restrictions
      const minDate = parseMMDDYYYY(props.datePickerMinDate);
      const maxDate = parseMMDDYYYY(props.datePickerMaxDate);
      
      // Check if current month/year has any valid selectable dates
      const currentMonthFirstDay = new Date(currentYear, currentMonth, 1);
      const currentMonthLastDay = new Date(currentYear, currentMonth + 1, 0);
      const currentMonthFirstDayStr = currentMonthFirstDay.toISOString().split('T')[0];
      const currentMonthLastDayStr = currentMonthLastDay.toISOString().split('T')[0];
      
      let needsAdjustment = false;
      let newMonth = currentMonth;
      let newYear = currentYear;
      
      // If there's a minimum date and the entire current month is before it, move to minimum date month
      if (minDate && currentMonthLastDayStr < minDate) {
        const minDateObj = new Date(minDate);
        newMonth = minDateObj.getMonth();
        newYear = minDateObj.getFullYear();
        needsAdjustment = true;
      }
      // If there's a maximum date and the entire current month is after it, move to maximum date month
      else if (maxDate && currentMonthFirstDayStr > maxDate) {
        const maxDateObj = new Date(maxDate);
        newMonth = maxDateObj.getMonth();
        newYear = maxDateObj.getFullYear();
        needsAdjustment = true;
      }
      // If there's a minimum date and some days in current month are before it, 
      // but some days are valid, check if we should still move to minimum date month
      else if (minDate && currentMonthFirstDayStr < minDate && currentMonthLastDayStr >= minDate) {
        // Check if there are any valid days in the current month
        const daysInMonth = currentMonthLastDay.getDate();
        let hasValidDays = false;
        
        for (let day = 1; day <= daysInMonth; day++) {
          const testDate = new Date(currentYear, currentMonth, day);
          const testDateStr = testDate.toISOString().split('T')[0];
          if (testDateStr >= minDate && (!maxDate || testDateStr <= maxDate)) {
            hasValidDays = true;
            break;
          }
        }
        
        // If no valid days in current month, move to minimum date month
        if (!hasValidDays) {
          const minDateObj = new Date(minDate);
          newMonth = minDateObj.getMonth();
          newYear = minDateObj.getFullYear();
          needsAdjustment = true;
        }
      }
      
      if (needsAdjustment) {
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
      }
    }
  }, [showCalendar, props.inputType, props.datePickerMinDate, props.datePickerMaxDate, currentMonth, currentYear]);
  
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
      currentInputValue: inputValue,
      isActiveTab,
      isActiveSlide
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
        
        // CRITICAL FIX: Update the DOM element's value immediately to ensure calculation engine gets correct value
        // This is essential for tab-dependent calculations to work properly
        const domElement = document.querySelector(`input[data-element-id="${element.id}"]`) ||
                          document.querySelector(`textarea[data-element-id="${element.id}"]`) ||
                          document.querySelector(`select[data-element-id="${element.id}"]`);
        
        if (domElement) {
          domElement.value = calculatedValue;
          domElement.setAttribute('data-current-value', calculatedValue);
          console.log('🔵 INPUT_DEBUG: Updated DOM element value:', {
            elementId: element.id,
            domValue: domElement.value,
            calculatedValue
          });
        }
        
        // Update the calculation engine with the new value
        if (!window.elementValues) {
          window.elementValues = {};
        }
        window.elementValues[element.id] = calculatedValue;
        
        console.log('🔵 INPUT_DEBUG: Updated calculation engine value:', {
          elementId: element.id,
          newValue: calculatedValue,
          elementValues: window.elementValues
        });
      }
    } else if (userHasEdited) {
      console.log('🔵 INPUT_DEBUG: Skipping update - user has edited the input');
    }
  }, [element.properties?.defaultValue, element.properties?.selectedOption, element.properties?.inputType, isExecuteMode, isInitialized, inputValue, userHasEdited, isActiveTab, isActiveSlide]);
  
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
    backgroundColor: props.backgroundColor || '#ffffff',
    
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
        
        // Handle toggle input type
        if (props.inputType === 'toggle') {
          const toggleType = props.toggleType || 'radio';
          
          // Handle toggle change
          const handleToggleChange = (newValue) => {
            setToggleValue(newValue);
            setUserHasEdited(true);
            
            // Update calculation engine
            if (!window.elementValues) {
              window.elementValues = {};
            }
            window.elementValues[element.id] = newValue;
            
            // Trigger calculation update
            if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
              window.__v2ExecutionEngine.triggerCalculationUpdate();
            }
          };
          
          // Radio toggle
          if (toggleType === 'radio') {
            const availableOptionsStr = props.radioAvailableOptions || '';
            let optionsArray = availableOptionsStr.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
            
            // Check if options contain calculations
            const hasCalculations = availableOptionsStr.includes('{{CALC:');
            
            // In builder mode (not execute mode)
            if (!isExecuteMode) {
              if (optionsArray.length === 0) {
                // Show default "Option 1" if no options are configured
                optionsArray = ['Option 1'];
              } else if (hasCalculations) {
                // Show default "Option 1" if options contain calculations
                optionsArray = ['Option 1'];
              }
              // If options are simple text, show all of them (no change to optionsArray)
            } else {
              // In execute mode, show all options or defaults
              if (optionsArray.length === 0) {
                optionsArray = ['Option 1', 'Option 2', 'Option 3'];
              }
            }
            
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {optionsArray.map((option, index) => {
                  const isSelected = isExecuteMode ? toggleValue === option : props.radioSelectedOption === option;
                  
                  return (
                    <label key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: isExecuteMode ? 'pointer' : 'default',
                      color: props.toggleLabelColor || '#333333',
                      fontSize: `${props.fontSize || 16}px`,
                      fontWeight: props.fontWeight || '400'
                    }}>
                      {/* Custom Radio Button */}
                      <div
                        style={{
                          position: 'relative',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '1px solid #d1d5db',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.2s ease',
                          cursor: isExecuteMode ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={isExecuteMode ? () => handleToggleChange(option) : undefined}
                      >
                        {/* Inner dot when selected */}
                        {isSelected && (
                          <div
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: props.toggleSelectedColor || '#007bff',
                              transition: 'all 0.2s ease'
                            }}
                          />
                        )}
                      </div>
                      <span onClick={isExecuteMode ? () => handleToggleChange(option) : undefined}>
                        {option}
                      </span>
                    </label>
                  );
                })}
              </div>
            );
          }
          
          // Checkbox toggle
          if (toggleType === 'checkbox') {
            return (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isExecuteMode ? 'pointer' : 'default',
                color: props.toggleLabelColor || '#333333',
                fontSize: `${props.fontSize || 16}px`,
                fontWeight: props.fontWeight || '400'
              }}>
                <div style={{
                  position: 'relative',
                  width: '20px',
                  height: '20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  transition: 'all 0.2s ease',
                  cursor: isExecuteMode ? 'pointer' : 'default'
                }}
                onClick={isExecuteMode ? () => handleToggleChange(!toggleValue) : undefined}
                >
                  {(isExecuteMode ? toggleValue : false) && (
                    <svg
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '12px',
                        height: '12px',
                        fill: props.toggleCheckColor || '#ffffff'
                      }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
                <span onClick={isExecuteMode ? () => handleToggleChange(!toggleValue) : undefined}>
                  {props.checkboxLabel || 'Toggle'}
                </span>
              </label>
            );
          }
          
          // Switch toggle
          if (toggleType === 'switch') {
            const switchWidth = 50;
            const switchHeight = 24;
            const thumbSize = 18;
            const thumbOffset = 3;
            
            return (
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isExecuteMode ? 'pointer' : 'default',
                color: props.toggleLabelColor || '#333333',
                fontSize: `${props.fontSize || 16}px`,
                fontWeight: props.fontWeight || '400'
              }}>
                <div
                  style={{
                    position: 'relative',
                    width: `${switchWidth}px`,
                    height: `${switchHeight}px`,
                    borderRadius: `${switchHeight / 2}px`,
                    backgroundColor: props.toggleSwitchColor || '#007bff',
                    transition: 'all 0.3s ease',
                    cursor: isExecuteMode ? 'pointer' : 'default'
                  }}
                  onClick={isExecuteMode ? () => handleToggleChange(!toggleValue) : undefined}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: `${thumbOffset}px`,
                      left: (isExecuteMode && toggleValue) ? `${switchWidth - thumbSize - thumbOffset}px` : `${thumbOffset}px`,
                      width: `${thumbSize}px`,
                      height: `${thumbSize}px`,
                      borderRadius: '50%',
                      backgroundColor: props.toggleThumbColor || '#ffffff',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
                <span>{props.switchLabel || ''}</span>
              </label>
            );
          }
          
          return <div>Unknown toggle type</div>;
        }
        
          // Handle date picker input type
        if (props.inputType === 'datePicker') {
          const datePickerStyle = props.datePickerStyle || 'default';
          const selectMode = props.datePickerSelectMode || 'single';
          const label = props.datePickerLabel || 'Select Date';
          
          // Parse MM/DD/YYYY format to YYYY-MM-DD
          const parseMMDDYYYY = (dateStr) => {
            if (!dateStr || dateStr.trim() === '') return null;
            const parts = dateStr.trim().split('/');
            if (parts.length !== 3) return null;
            const month = parseInt(parts[0]);
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            if (isNaN(month) || isNaN(day) || isNaN(year)) return null;
            if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null;
            const date = new Date(year, month - 1, day);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD format
          };
          
          // Get date restrictions
          const minDate = parseMMDDYYYY(props.datePickerMinDate);
          const maxDate = parseMMDDYYYY(props.datePickerMaxDate);
          const disabledDatesStr = props.datePickerDisabledDates || '';
          const disabledDates = disabledDatesStr.split(',')
            .map(d => parseMMDDYYYY(d.trim()))
            .filter(d => d !== null);
          
          // Check if a date is disabled
          const isDateDisabled = (dateStr) => {
            if (minDate && dateStr < minDate) return true;
            if (maxDate && dateStr > maxDate) return true;
            if (disabledDates.includes(dateStr)) return true;
            return false;
          };
          
          // Format date for display (e.g., "Jun 19, 2025")
          const formatDateForDisplay = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            });
          };
          
          // Handle date selection
          const handleDateSelect = (date) => {
            if (selectMode === 'single') {
              setSelectedDate(date);
              const displayValue = formatDateForDisplay(date);
              setInputValue(displayValue);
              setUserHasEdited(true);
              setShowCalendar(false);
              
              // Update calculation engine with original date format
              if (!window.elementValues) {
                window.elementValues = {};
              }
              window.elementValues[element.id] = date; // Keep YYYY-MM-DD for calculations
              
              // Trigger calculation update
              if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
                window.__v2ExecutionEngine.triggerCalculationUpdate();
              }
            } else if (selectMode === 'range') {
              if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
                // Start new range
                setSelectedStartDate(date);
                setSelectedEndDate('');
                const displayValue = formatDateForDisplay(date);
                setInputValue(displayValue);
                setUserHasEdited(true);
              } else {
                // Complete range
                const startDate = new Date(selectedStartDate);
                const endDate = new Date(date);
                if (endDate >= startDate) {
                  setSelectedEndDate(date);
                  const startDisplay = formatDateForDisplay(selectedStartDate);
                  const endDisplay = formatDateForDisplay(date);
                  const rangeValue = `${startDisplay} to ${endDisplay}`;
                  setInputValue(rangeValue);
                  setUserHasEdited(true);
                  setShowCalendar(false);
                } else {
                  // If end date is before start date, swap them
                  setSelectedStartDate(date);
                  setSelectedEndDate(selectedStartDate);
                  const startDisplay = formatDateForDisplay(date);
                  const endDisplay = formatDateForDisplay(selectedStartDate);
                  const rangeValue = `${startDisplay} to ${endDisplay}`;
                  setInputValue(rangeValue);
                  setUserHasEdited(true);
                  setShowCalendar(false);
                }
              }
              
              // Update calculation engine with range in original format
              if (!window.elementValues) {
                window.elementValues = {};
              }
              const rangeForCalc = selectedEndDate ? `${selectedStartDate} to ${date}` : date;
              window.elementValues[element.id] = rangeForCalc;
              
              // Trigger calculation update
              if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
                window.__v2ExecutionEngine.triggerCalculationUpdate();
              }
            }
          };
          
          // Generate calendar dates for current month
          const generateCalendarDates = () => {
            const today = new Date();
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            const daysInMonth = lastDay.getDate();
            
            const dates = [];
            for (let i = 1; i <= daysInMonth; i++) {
              const date = new Date(currentYear, currentMonth, i);
              const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
              dates.push({
                date: dateStr,
                day: i,
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
              });
            }
            return dates;
          };
          
          // Generate next 7 days for bar style
          const generateBarDates = () => {
            const dates = [];
            const today = new Date();
            for (let i = 0; i < 7; i++) {
              const date = new Date(today);
              date.setDate(today.getDate() + i);
              const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
              dates.push({
                date: dateStr,
                day: date.getDate(),
                dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
              });
            }
            return dates;
          };
          
          // Default style (input with dropdown)
          if (datePickerStyle === 'default') {
            return (
              <div style={{ position: 'relative' }}>
                {/* Input field */}
                <div
                  style={{
                    ...inputStyle,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    cursor: isExecuteMode ? 'pointer' : 'default',
                    pointerEvents: isExecuteMode ? 'auto' : 'none'
                  }}
                  onClick={isExecuteMode ? () => setShowCalendar(!showCalendar) : undefined}
                >
                  <span style={{ 
                    color: props.textColor || '#333333',
                    flex: 1
                  }}>
                    {inputValue || (props.datePickerLabel || 'Select date')}
                  </span>
                  <svg
                    style={{
                      width: '16px',
                      height: '16px',
                      stroke: props.arrowColor || '#666666',
                      flexShrink: 0
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                
                {/* Calendar popup */}
                {showCalendar && isExecuteMode && (
                  <div 
                    ref={calendarRef}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      minWidth: '280px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                      zIndex: 1000,
                      padding: '16px'
                    }}>
                    {/* Calendar Header with Navigation */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333333'
                    }}>
                      {/* Previous Month Button */}
                      <button
                        onClick={() => {
                          if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(currentYear - 1);
                          } else {
                            setCurrentMonth(currentMonth - 1);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '16px',
                          color: '#666666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        ‹
                      </button>
                      
                      {/* Month/Year Display with Dropdowns */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Month Selector */}
                        <select
                          value={currentMonth}
                          onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                          ].map((month, index) => (
                            <option key={index} value={index}>
                              {month}
                            </option>
                          ))}
                        </select>
                        
                        {/* Year Selector */}
                        <select
                          value={currentYear}
                          onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                          style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            backgroundColor: '#ffffff',
                            cursor: 'pointer'
                          }}
                        >
                          {(() => {
                            const years = [];
                            const currentYearActual = new Date().getFullYear();
                            for (let year = currentYearActual - 100; year <= currentYearActual + 10; year++) {
                              years.push(year);
                            }
                            return years.map(year => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ));
                          })()}
                        </select>
                      </div>
                      
                      {/* Next Month Button */}
                      <button
                        onClick={() => {
                          if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(currentYear + 1);
                          } else {
                            setCurrentMonth(currentMonth + 1);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '16px',
                          color: '#666666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        ›
                      </button>
                    </div>
                    
                    {/* Day headers */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '2px',
                      marginBottom: '8px'
                    }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '6px 4px',
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#666666'
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    {/* Calendar dates */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '2px'
                    }}>
                      {(() => {
                        const today = new Date();
                        const firstDay = new Date(currentYear, currentMonth, 1);
                        const lastDay = new Date(currentYear, currentMonth + 1, 0);
                        const daysInMonth = lastDay.getDate();
                        const startingDayOfWeek = firstDay.getDay();
                        
                        const calendarDays = [];
                        
                        // Add empty cells for days before the first day of the month
                        for (let i = 0; i < startingDayOfWeek; i++) {
                          calendarDays.push(null);
                        }
                        
                        // Add all days of the month
                        for (let day = 1; day <= daysInMonth; day++) {
                          const date = new Date(currentYear, currentMonth, day);
                          const dateStr = date.toISOString().split('T')[0];
                          calendarDays.push({
                            date: dateStr,
                            day: day,
                            isToday: dateStr === today.toISOString().split('T')[0]
                          });
                        }
                        
                        return calendarDays.map((dateObj, index) => {
                          if (!dateObj) {
                            return <div key={index} style={{ padding: '8px' }}></div>;
                          }
                          
                          const isSelected = selectMode === 'single' 
                            ? selectedDate === dateObj.date
                            : (selectedStartDate === dateObj.date || selectedEndDate === dateObj.date);
                          const isInRange = selectMode === 'range' && selectedStartDate && selectedEndDate &&
                            dateObj.date >= selectedStartDate && dateObj.date <= selectedEndDate;
                          const isDisabled = isDateDisabled(dateObj.date);
                          
                          return (
                            <div
                              key={index}
                              style={{
                                padding: '8px',
                                textAlign: 'center',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                borderRadius: '6px',
                                backgroundColor: isDisabled ? '#f5f5f5' :
                                               isSelected ? '#007bff' : 
                                               isInRange ? 'rgba(0, 123, 255, 0.1)' : 
                                               dateObj.isToday ? 'rgba(0, 123, 255, 0.05)' : 'transparent',
                                color: isDisabled ? '#cccccc' :
                                       isSelected ? '#ffffff' : '#333333',
                                fontSize: '13px',
                                fontWeight: dateObj.isToday ? '600' : '400',
                                transition: 'all 0.2s ease',
                                border: dateObj.isToday && !isSelected ? '1px solid rgba(0, 123, 255, 0.3)' : '1px solid transparent',
                                opacity: isDisabled ? 0.5 : 1
                              }}
                              onClick={() => !isDisabled && handleDateSelect(dateObj.date)}
                              onMouseOver={(e) => {
                                if (!isSelected && !isDisabled) {
                                  e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                                }
                              }}
                              onMouseOut={(e) => {
                                if (!isSelected && !isInRange && !isDisabled) {
                                  e.currentTarget.style.backgroundColor = dateObj.isToday ? 'rgba(0, 123, 255, 0.05)' : 'transparent';
                                }
                              }}
                            >
                              {dateObj.day}
                            </div>
                          );
                        });
                      })()}
                    </div>
                    
                    {/* Close button */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <button
                        onClick={() => setShowCalendar(false)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          color: '#666666'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          
          // Bar style (horizontal calendar)
          if (datePickerStyle === 'bar') {
            // Generate dates for current view (7 consecutive days starting from a base date)
            const generateBarDatesForView = () => {
              const dates = [];
              
              // Calculate the base date from current month, year, and offset
              const baseDate = new Date(currentYear, currentMonth, 1 + dateOffset);
              
              for (let i = 0; i < 7; i++) {
                const date = new Date(baseDate);
                date.setDate(baseDate.getDate() + i);
                const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                dates.push({
                  date: dateStr,
                  day: date.getDate(),
                  month: date.getMonth(),
                  year: date.getFullYear(),
                  dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
                });
              }
              return dates;
            };
            
            // Get month name for the first date in the current view
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            // Get the dates for display
            const viewDates = generateBarDatesForView();
            const firstDate = viewDates[0];
            const lastDate = viewDates[viewDates.length - 1];
            
            // Determine month/year display - show range if dates span multiple months
            let monthYearDisplay;
            if (firstDate.month === lastDate.month && firstDate.year === lastDate.year) {
              monthYearDisplay = `${monthNames[firstDate.month]} ${firstDate.year}`;
            } else if (firstDate.year === lastDate.year) {
              monthYearDisplay = `${monthNames[firstDate.month]} - ${monthNames[lastDate.month]} ${firstDate.year}`;
            } else {
              monthYearDisplay = `${monthNames[firstDate.month]} ${firstDate.year} - ${monthNames[lastDate.month]} ${lastDate.year}`;
            }
            
            // Navigation handlers
            const handlePreviousDates = () => {
              const newOffset = dateOffset - 7;
              
              // If going to negative offset, move to previous month
              if (newOffset < 0) {
                if (currentMonth === 0) {
                  // Go to December of previous year
                  setCurrentMonth(11);
                  setCurrentYear(currentYear - 1);
                  // Calculate offset for last week of December
                  const lastDayOfPrevMonth = new Date(currentYear - 1, 11 + 1, 0).getDate();
                  setDateOffset(lastDayOfPrevMonth + newOffset);
                } else {
                  // Go to previous month
                  setCurrentMonth(currentMonth - 1);
                  // Calculate offset for last week of previous month
                  const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
                  setDateOffset(lastDayOfPrevMonth + newOffset);
                }
              } else {
                setDateOffset(newOffset);
              }
            };
            
            const handleNextDates = () => {
              const newOffset = dateOffset + 7;
              const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
              
              // If going beyond current month, move to next month
              if (newOffset >= daysInCurrentMonth) {
                if (currentMonth === 11) {
                  // Go to January of next year
                  setCurrentMonth(0);
                  setCurrentYear(currentYear + 1);
                  setDateOffset(newOffset - daysInCurrentMonth);
                } else {
                  // Go to next month
                  setCurrentMonth(currentMonth + 1);
                  setDateOffset(newOffset - daysInCurrentMonth);
                }
              } else {
                setDateOffset(newOffset);
              }
            };
            
            return (
              <div>
                {/* Month header with navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  padding: '8px 0'
                }}>
                  {/* Previous Dates Button */}
                  <button
                    onClick={isExecuteMode ? handlePreviousDates : undefined}
                    style={{
                      background: 'none',
                      border: `1px solid ${props.borderColor || '#ddd'}`,
                      cursor: isExecuteMode ? 'pointer' : 'default',
                      padding: '8px 12px',
                      borderRadius: `${props.borderRadiusTopLeft || 4}px`,
                      fontSize: '16px',
                      color: props.arrowColor || '#666666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: props.backgroundColor || '#ffffff',
                      transition: 'all 0.2s ease',
                      pointerEvents: isExecuteMode ? 'auto' : 'none'
                    }}
                    onMouseOver={isExecuteMode ? (e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                    } : undefined}
                    onMouseOut={isExecuteMode ? (e) => {
                      e.currentTarget.style.backgroundColor = props.backgroundColor || '#ffffff';
                    } : undefined}
                  >
                    ‹
                  </button>
                  
                  {/* Month/Year Display */}
                  <div style={{
                    fontSize: `${props.fontSize || 16}px`,
                    fontWeight: props.fontWeight || '600',
                    color: props.textColor || '#333333',
                    textAlign: 'center',
                    flex: 1
                  }}>
                    {monthYearDisplay}
                  </div>
                  
                  {/* Next Dates Button */}
                  <button
                    onClick={isExecuteMode ? handleNextDates : undefined}
                    style={{
                      background: 'none',
                      border: `1px solid ${props.borderColor || '#ddd'}`,
                      cursor: isExecuteMode ? 'pointer' : 'default',
                      padding: '8px 12px',
                      borderRadius: `${props.borderRadiusTopLeft || 4}px`,
                      fontSize: '16px',
                      color: props.arrowColor || '#666666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: props.backgroundColor || '#ffffff',
                      transition: 'all 0.2s ease',
                      pointerEvents: isExecuteMode ? 'auto' : 'none'
                    }}
                    onMouseOver={isExecuteMode ? (e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                    } : undefined}
                    onMouseOut={isExecuteMode ? (e) => {
                      e.currentTarget.style.backgroundColor = props.backgroundColor || '#ffffff';
                    } : undefined}
                  >
                    ›
                  </button>
                </div>
                
                {/* Bar dates */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  padding: '8px 0'
                }}>
                  {viewDates.map((dateObj, index) => {
                    const isSelected = selectMode === 'single' 
                      ? selectedDate === dateObj.date
                      : (selectedStartDate === dateObj.date || selectedEndDate === dateObj.date);
                    const isInRange = selectMode === 'range' && selectedStartDate && selectedEndDate &&
                      dateObj.date >= selectedStartDate && dateObj.date <= selectedEndDate;
                    const isDisabled = isDateDisabled(dateObj.date);
                    
                    return (
                      <div
                        key={index}
                        style={{
                          minWidth: '60px',
                          padding: '12px 8px',
                          border: `1px solid ${props.borderColor || '#ddd'}`,
                          borderRadius: `${props.borderRadiusTopLeft || 8}px`,
                          backgroundColor: isDisabled ? '#f5f5f5' :
                                         isSelected ? (props.textColor || '#007bff') : 
                                         isInRange ? 'rgba(0, 123, 255, 0.1)' : (props.backgroundColor || '#ffffff'),
                          color: isDisabled ? '#cccccc' :
                                 isSelected ? '#ffffff' : (props.textColor || '#333333'),
                          cursor: isDisabled ? 'not-allowed' : (isExecuteMode ? 'pointer' : 'default'),
                          textAlign: 'center',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          transition: 'all 0.2s ease',
                          pointerEvents: isExecuteMode ? 'auto' : 'none',
                          opacity: isDisabled ? 0.5 : 1
                        }}
                        onClick={isExecuteMode && !isDisabled ? () => handleDateSelect(dateObj.date) : undefined}
                        onMouseOver={(e) => {
                          if (isExecuteMode && !isSelected && !isDisabled) {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (isExecuteMode && !isSelected && !isInRange && !isDisabled) {
                            e.currentTarget.style.backgroundColor = props.backgroundColor || '#ffffff';
                          }
                        }}
                      >
                        <div style={{
                          fontSize: '10px',
                          opacity: 0.7
                        }}>
                          {dateObj.dayName}
                        </div>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600'
                        }}>
                          {dateObj.day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          
          return <div>Unknown date picker style</div>;
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
    
    // Toggle Configuration
    toggleType: 'radio', // 'radio', 'checkbox', 'switch'
    radioSelectedOption: '',
    radioAvailableOptions: '',
    checkboxLabel: 'Label',
    switchLabel: '',
    
    // Date Picker Configuration
    datePickerStyle: 'default', // 'default', 'bar'
    datePickerSelectMode: 'single', // 'single', 'range'
    datePickerLabel: 'Select Date',
    datePickerMinDate: '',
    datePickerMaxDate: '',
    datePickerDisabledDates: '',
    
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
    
    // Toggle Colors
    toggleLabelColor: '#333333',
    toggleUnselectedColor: '#e0e0e0',
    toggleSelectedColor: '#007bff',
    toggleBackgroundColor: '#007bff',
    toggleCheckColor: '#007bff',
    toggleSwitchColor: '#6b7280',
    toggleThumbColor: '#ffffff',
    
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
