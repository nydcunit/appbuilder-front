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
          
          // File Picker Input Colors
          else if (currentInputType === 'filePicker') {
            return (
              <>
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
                    Label Color:
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
              </>
            );
          }
          
          // Audio Input Colors
          else if (currentInputType === 'audio') {
            return (
              <>
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
              
              {/* Selected Value SuperText */}
              <div style={{ marginBottom: '12px' }}>
                <SuperText
                  label="Selected Value"
                  placeholder={getValue('datePickerSelectMode') === 'range' 
                    ? "Enter initial date range (MM/DD/YYYY to MM/DD/YYYY)" 
                    : "Enter initial date (MM/DD/YYYY format)"}
                  value={getValue('datePickerSelectedValue')}
                  onChange={(value) => handleInputChange('datePickerSelectedValue', value)}
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
              💡 Tip: Use MM/DD/YYYY format for dates. Supports individual dates and ranges. Examples:<br/>
              • Individual dates: 09/12/2025, 09/22/2025<br/>
              • Date ranges: 09/02/2025-09/08/2025, 09/22/2025 - 09/28/2025<br/>
              • Mixed: 09/02/2025-09/08/2025, 09/12/2025, 09/22/2025 - 09/28/2025
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

      {/* Location Configuration */}
      {currentInputType === 'location' && (
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
            Location Configuration:
          </label>
          
          {/* Placeholder SuperText for Location */}
          <div style={{ marginBottom: '12px' }}>
            <SuperText
              label="Placeholder"
              placeholder="Enter placeholder text (e.g., Enter your address)"
              value={getValue('placeholder')}
              onChange={(value) => handleInputChange('placeholder', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>
          
          {/* Default Value SuperText */}
          <div style={{ marginBottom: '8px' }}>
            <SuperText
              label="Default Value"
              placeholder="Enter default address (optional)"
              value={getValue('defaultValue')}
              onChange={(value) => handleInputChange('defaultValue', value)}
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
            💡 Tip: This input uses Google Places Autocomplete to help users select addresses. Users can type to search for locations and select from suggestions.
          </div>
        </div>
      )}

      {/* File Picker Configuration */}
      {currentInputType === 'filePicker' && (
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
            marginBottom: '12px'
          }}>
            File Picker Configuration:
          </label>
          
          {/* File Type Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              Accepted File Types (can select multiple):
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Photo Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="filePicker-photo"
                  checked={(getValue('filePickerTypes') || []).includes('photo')}
                  onChange={(e) => {
                    const currentTypes = getValue('filePickerTypes') || [];
                    let newTypes;
                    if (e.target.checked) {
                      newTypes = [...currentTypes, 'photo'];
                    } else {
                      newTypes = currentTypes.filter(t => t !== 'photo');
                    }
                    handleInputChange('filePickerTypes', newTypes);
                  }}
                />
                <label htmlFor="filePicker-photo" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Photo (jpg, png, gif, webp, etc.)
                </label>
              </div>
              
              {/* Video Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="filePicker-video"
                  checked={(getValue('filePickerTypes') || []).includes('video')}
                  onChange={(e) => {
                    const currentTypes = getValue('filePickerTypes') || [];
                    let newTypes;
                    if (e.target.checked) {
                      newTypes = [...currentTypes, 'video'];
                    } else {
                      newTypes = currentTypes.filter(t => t !== 'video');
                    }
                    handleInputChange('filePickerTypes', newTypes);
                  }}
                />
                <label htmlFor="filePicker-video" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  Video (mp4, avi, mov, webm, etc.)
                </label>
              </div>
              
              {/* All Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="filePicker-all"
                  checked={(getValue('filePickerTypes') || []).includes('all')}
                  onChange={(e) => {
                    const currentTypes = getValue('filePickerTypes') || [];
                    let newTypes;
                    if (e.target.checked) {
                      newTypes = [...currentTypes, 'all'];
                    } else {
                      newTypes = currentTypes.filter(t => t !== 'all');
                    }
                    handleInputChange('filePickerTypes', newTypes);
                  }}
                />
                <label htmlFor="filePicker-all" style={{
                  fontSize: '12px',
                  color: '#333',
                  cursor: 'pointer'
                }}>
                  All (any file type)
                </label>
              </div>
            </div>
          </div>

          {/* MultiSelect Option */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              marginBottom: '8px'
            }}>
              MultiSelect:
            </label>
            <select
              value={getValue('filePickerMultiSelect') || 'enable'}
              onChange={(e) => handleInputChange('filePickerMultiSelect', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: 'white'
              }}
            >
              <option value="disable">Disable</option>
              <option value="enable">Enable</option>
            </select>
          </div>

          {/* Max Files (only show when MultiSelect is enabled) */}
          {getValue('filePickerMultiSelect') === 'enable' && (
            <div style={{ marginBottom: '12px' }}>
              <SuperText
                label="Max Files"
                placeholder="Enter maximum number of files (e.g., 5)"
                value={getValue('filePickerMaxFiles')}
                onChange={(value) => handleInputChange('filePickerMaxFiles', value)}
                availableElements={availableElements}
                screens={screens}
                currentScreenId={currentScreenId}
              />
            </div>
          )}

          {/* Max Size SuperText */}
          <div style={{ marginBottom: '12px' }}>
            <SuperText
              label="Max Size (MB)"
              placeholder="Enter max file size in MB (e.g., 10)"
              value={getValue('filePickerMaxSize')}
              onChange={(value) => handleInputChange('filePickerMaxSize', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>

          {/* Label Text SuperText */}
          <div style={{ marginBottom: '12px' }}>
            <SuperText
              label="Label Text"
              placeholder="Enter upload label (e.g., + Upload)"
              value={getValue('filePickerLabelText')}
              onChange={(value) => handleInputChange('filePickerLabelText', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>

          {/* Height SuperText */}
          <div style={{ marginBottom: '8px' }}>
            <SuperText
              label="Height"
              placeholder="Enter height (e.g., 80px, 120px)"
              value={getValue('filePickerHeight')}
              onChange={(value) => handleInputChange('filePickerHeight', value)}
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
            💡 Tip: Files are stored temporarily in browser memory. Image files will show previews, others will show file names.
          </div>
        </div>
      )}

      {/* Audio Configuration */}
      {currentInputType === 'audio' && (
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
            marginBottom: '8px'
          }}>
            Audio Configuration:
          </label>
          
          <div style={{
            fontSize: '11px',
            color: '#d63384',
            padding: '4px 8px',
            backgroundColor: '#fff0f3',
            borderRadius: '3px'
          }}>
            💡 Tip: Press Record to start recording, Stop to end recording, and Reset to clear the recording and timer.
          </div>
        </div>
      )}

      {/* Show placeholder for other input types */}
      {currentInputType !== 'text' && currentInputType !== 'dropdown' && currentInputType !== 'button' && currentInputType !== 'toggle' && currentInputType !== 'datePicker' && currentInputType !== 'location' && currentInputType !== 'filePicker' && currentInputType !== 'audio' && (
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
  
  // Get render properties with matched condition index FIRST
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
      const initialValue = element.properties?.radioSelectedOption || '';
      console.log('🔵 RADIO_DEBUG: Initializing radio toggle value:', {
        elementId: element.id,
        radioSelectedOption: element.properties?.radioSelectedOption,
        initialValue
      });
      
      // CRITICAL FIX: Immediately expose radio value to calculation engine during initialization
      if (isExecuteMode && initialValue) {
        if (!window.elementValues) {
          window.elementValues = {};
        }
        window.elementValues[element.id] = initialValue;
        console.log('🔵 RADIO_DEBUG: Immediately exposed radio value to calculation engine during init:', {
          elementId: element.id,
          initialValue,
          elementValues: window.elementValues
        });
      }
      
      return initialValue;
    } else if (toggleType === 'checkbox') {
      return false;
    } else if (toggleType === 'switch') {
      return false;
    }
    return '';
  });
  
  // CRITICAL FIX: Ensure toggle value is exposed to calculation engine on initialization
  React.useEffect(() => {
    if (isExecuteMode && element.properties?.inputType === 'toggle') {
      const toggleType = element.properties?.toggleType || 'radio';
      if (toggleType === 'radio' && toggleValue) {
        // Initialize elementValues if it doesn't exist
        if (!window.elementValues) {
          window.elementValues = {};
        }
        window.elementValues[element.id] = toggleValue;
        
        console.log('🔵 RADIO_DEBUG: Exposed initial toggle value to calculation engine:', {
          elementId: element.id,
          toggleValue,
          elementValues: window.elementValues
        });
      }
    }
  }, [isExecuteMode, element.properties?.inputType, element.properties?.toggleType, toggleValue, element.id]);
  
  // State for date picker
  const [selectedDate, setSelectedDate] = React.useState('');
  const [selectedStartDate, setSelectedStartDate] = React.useState('');
  const [selectedEndDate, setSelectedEndDate] = React.useState('');
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [dateOffset, setDateOffset] = React.useState(0); // State for tracking the current date offset within the month
  
  // State for location input
  const [locationValue, setLocationValue] = React.useState('');
  const [suggestions, setSuggestions] = React.useState([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false);
  const locationInputRef = React.useRef(null);
  const suggestionsRef = React.useRef(null);
  
  // State for file picker
  const [selectedFiles, setSelectedFiles] = React.useState([]);
  const fileInputRef = React.useRef(null);
  
  // State for audio recording
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [audioBlob, setAudioBlob] = React.useState(null);
  const [mediaRecorder, setMediaRecorder] = React.useState(null);
  const [recordingState, setRecordingState] = React.useState('idle'); // 'idle', 'recording', 'stopped'
  const audioIntervalRef = React.useRef(null);
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
  
  // Initialize location value
  React.useEffect(() => {
    if (isExecuteMode && !isInitialized && props.inputType === 'location') {
      const initialValue = props.defaultValue || '';
      setLocationValue(initialValue);
      setInputValue(initialValue);
      
      // Expose to calculation engine
      if (!window.elementValues) {
        window.elementValues = {};
      }
      window.elementValues[element.id] = initialValue;
    }
  }, [isExecuteMode, props.defaultValue, isInitialized, props.inputType]);
  
  // Load Google Places API (with duplicate prevention)
  React.useEffect(() => {
    if (isExecuteMode && props.inputType === 'location') {
      // Check if Google API is already loaded or loading
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoadingGoogle(false);
        console.log('🌍 Google Places API already loaded');
        return;
      }
      
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        setIsLoadingGoogle(true);
        // Wait for existing script to load
        existingScript.onload = () => {
          setIsLoadingGoogle(false);
          console.log('🌍 Google Places API loaded from existing script');
        };
        return;
      }
      
      // Load the API for the first time
      setIsLoadingGoogle(true);
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY'}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoadingGoogle(false);
        console.log('🌍 Google Places API loaded successfully');
      };
      script.onerror = () => {
        setIsLoadingGoogle(false);
        console.error('❌ Failed to load Google Places API - check API key and billing');
      };
      document.head.appendChild(script);
    }
  }, [isExecuteMode, props.inputType]);
  
  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    
    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSuggestions]);
  
  // Generate mock suggestions for testing when Google API is not available
  const generateMockSuggestions = (value) => {
    const mockData = [
      { placeId: 'mock1', description: `${value} Street, New York, NY, USA`, mainText: `${value} Street`, secondaryText: 'New York, NY, USA' },
      { placeId: 'mock2', description: `${value} Avenue, Los Angeles, CA, USA`, mainText: `${value} Avenue`, secondaryText: 'Los Angeles, CA, USA' },
      { placeId: 'mock3', description: `${value} Road, Chicago, IL, USA`, mainText: `${value} Road`, secondaryText: 'Chicago, IL, USA' },
      { placeId: 'mock4', description: `${value} Boulevard, Miami, FL, USA`, mainText: `${value} Boulevard`, secondaryText: 'Miami, FL, USA' },
      { placeId: 'mock5', description: `${value} Plaza, Seattle, WA, USA`, mainText: `${value} Plaza`, secondaryText: 'Seattle, WA, USA' }
    ];
    
    return mockData.slice(0, 3); // Return 3 mock suggestions
  };
  
  
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
      defaultValue: element.properties?.defaultValue,
      datePickerSelectedValue: element.properties?.datePickerSelectedValue,
      toggleType: element.properties?.toggleType,
      radioSelectedOption: element.properties?.radioSelectedOption
    });
    
    if (isExecuteMode && !isInitialized) {
      let calculatedValue = '';
      
      // For dropdown inputs, use selectedOption as the initial value
      if (element.properties?.inputType === 'dropdown') {
        calculatedValue = element.properties?.selectedOption || '';
      } 
      // For date picker inputs, use datePickerSelectedValue as the initial value
      else if (element.properties?.inputType === 'datePicker') {
        calculatedValue = element.properties?.datePickerSelectedValue || '';
        
        // Parse and set date picker specific state for bar style
        if (calculatedValue) {
          const selectMode = element.properties?.datePickerSelectMode || 'single';
          
          // Helper function to parse MM/DD/YYYY to YYYY-MM-DD
          const parseDisplayToISO = (displayDate) => {
            // Handle different display formats
            if (displayDate.includes(' to ')) {
              // Range format: "Jun 19, 2025 to Jun 25, 2025" or "MM/DD/YYYY to MM/DD/YYYY"
              const parts = displayDate.split(' to ');
              return parts.map(part => {
                const trimmedPart = part.trim();
                if (trimmedPart.includes('/')) {
                  // MM/DD/YYYY format
                  const dateParts = trimmedPart.split('/');
                  if (dateParts.length === 3) {
                    const month = parseInt(dateParts[0]);
                    const day = parseInt(dateParts[1]);
                    const year = parseInt(dateParts[2]);
                    if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                      const monthStr = month.toString().padStart(2, '0');
                      const dayStr = day.toString().padStart(2, '0');
                      return `${year}-${monthStr}-${dayStr}`;
                    }
                  }
                }
                // Try parsing as a regular date string
                const date = new Date(trimmedPart);
                return date.toISOString().split('T')[0];
              });
            } else if (displayDate.includes('/')) {
              // MM/DD/YYYY format
              const parts = displayDate.trim().split('/');
              if (parts.length === 3) {
                const month = parseInt(parts[0]);
                const day = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                  // Use string formatting to avoid timezone issues
                  const monthStr = month.toString().padStart(2, '0');
                  const dayStr = day.toString().padStart(2, '0');
                  return `${year}-${monthStr}-${dayStr}`;
                }
              }
            } else {
              // Try parsing as a regular date string (could be YYYY-MM-DD format)
              if (displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // Already in YYYY-MM-DD format
                return displayDate;
              }
              const date = new Date(displayDate);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split('T')[0];
              }
            }
            return null;
          };
          
          if (selectMode === 'single') {
            const isoDate = parseDisplayToISO(calculatedValue);
            if (isoDate) {
              setSelectedDate(isoDate);
            }
          } else if (selectMode === 'range') {
            if (calculatedValue.includes(' to ')) {
              const dates = parseDisplayToISO(calculatedValue);
              if (dates && dates.length === 2) {
                setSelectedStartDate(dates[0]);
                setSelectedEndDate(dates[1]);
              }
            } else {
              // Single date in range mode - treat as start date
              const isoDate = parseDisplayToISO(calculatedValue);
              if (isoDate) {
                setSelectedStartDate(isoDate);
                setSelectedEndDate('');
              }
            }
          }
        }
      } 
      // CRITICAL FIX: For toggle inputs (radio, checkbox, switch), use the appropriate initial value
      else if (element.properties?.inputType === 'toggle') {
        const toggleType = element.properties?.toggleType || 'radio';
        if (toggleType === 'radio') {
          calculatedValue = element.properties?.radioSelectedOption || '';
        } else if (toggleType === 'checkbox') {
          calculatedValue = false; // Default to unchecked
        } else if (toggleType === 'switch') {
          calculatedValue = false; // Default to off
        }
      }
      else {
        // For other input types, use defaultValue
        calculatedValue = element.properties?.defaultValue || '';
      }
      
      console.log('🔵 INPUT_DEBUG: Initializing input value:', {
        elementId: element.id,
        inputType: element.properties?.inputType,
        toggleType: element.properties?.toggleType,
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
        
        // CRITICAL: For datepickers, ensure the MM/DD/YYYY format is stored for calculations
        if (element.properties?.inputType === 'datePicker' && calculatedValue) {
          const selectMode = element.properties?.datePickerSelectMode || 'single';
          
          // Helper function to convert any date format to MM/DD/YYYY for calculations
          const convertToMMDDYYYYForCalc = (displayDate) => {
            if (displayDate.includes(' to ')) {
              // Range format: convert both dates
              const parts = displayDate.split(' to ');
              const startMMDDYYYY = convertSingleDateToMMDDYYYY(parts[0].trim());
              const endMMDDYYYY = convertSingleDateToMMDDYYYY(parts[1].trim());
              return startMMDDYYYY && endMMDDYYYY ? `${startMMDDYYYY}-${endMMDDYYYY}` : displayDate;
            } else {
              // Single date format
              return convertSingleDateToMMDDYYYY(displayDate) || displayDate;
            }
          };
          
          const convertSingleDateToMMDDYYYY = (dateStr) => {
            if (dateStr.includes('/')) {
              // Already MM/DD/YYYY format
              return dateStr;
            } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // YYYY-MM-DD format - convert to MM/DD/YYYY
              const parts = dateStr.split('-');
              if (parts.length === 3) {
                const year = parts[0];
                const month = parseInt(parts[1]);
                const day = parseInt(parts[2]);
                if (!isNaN(month) && !isNaN(day)) {
                  return `${month}/${day}/${year}`;
                }
              }
            } else {
              // Try parsing as a date and convert to MM/DD/YYYY
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
              }
            }
            return null;
          };
          
          const mmddyyyyValue = convertToMMDDYYYYForCalc(calculatedValue);
          window.elementValues[element.id] = mmddyyyyValue;
          
          console.log('🔵 DATEPICKER_DEBUG: Converted initial value to MM/DD/YYYY for calculations:', {
            elementId: element.id,
            originalValue: calculatedValue,
            mmddyyyyValue: mmddyyyyValue,
            windowElementValues: window.elementValues
          });
        }
      }
    }
  }, [isExecuteMode, element.properties?.defaultValue, element.properties?.selectedOption, element.properties?.datePickerSelectedValue, element.properties?.inputType, element.properties?.toggleType, element.properties?.radioSelectedOption, isInitialized]);
  
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
      datePickerSelectedValue: element.properties?.datePickerSelectedValue,
      currentInputValue: inputValue,
      isActiveTab,
      isActiveSlide
    });
    
    if (isExecuteMode && isInitialized && !userHasEdited) {
      let calculatedValue = '';
      
      // For dropdown inputs, use selectedOption as the value to track
      if (element.properties?.inputType === 'dropdown') {
        calculatedValue = element.properties?.selectedOption || '';
      } 
      // For date picker inputs, use datePickerSelectedValue as the value to track
      else if (element.properties?.inputType === 'datePicker') {
        calculatedValue = element.properties?.datePickerSelectedValue || '';
      } 
      else {
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
  }, [element.properties?.defaultValue, element.properties?.selectedOption, element.properties?.datePickerSelectedValue, element.properties?.inputType, isExecuteMode, isInitialized, inputValue, userHasEdited, isActiveTab, isActiveSlide]);
  
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
        
          // Handle location input type
        if (props.inputType === 'location') {
          // Handle location input change with autocomplete
          const handleLocationChange = async (value) => {
            setLocationValue(value);
            setInputValue(value);
            setUserHasEdited(true);
            
            // Update calculation engine
            if (!window.elementValues) {
              window.elementValues = {};
            }
            window.elementValues[element.id] = value;
            
            // Get autocomplete suggestions with improved error handling and fallback
            if (value.length > 2) {
              if (window.google && window.google.maps && window.google.maps.places) {
                try {
                  // Use AutocompleteService with better error handling
                  const autocompleteService = new window.google.maps.places.AutocompleteService();
                  
                  const request = {
                    input: value,
                    types: ['geocode'], // Use only geocode to avoid conflicts
                    componentRestrictions: {} // Allow all countries
                  };
                  
                  // Set a timeout to show mock suggestions if API doesn't respond quickly
                  let timeoutId = setTimeout(() => {
                    console.log('🌍 API timeout, showing mock suggestions for:', value);
                    const mockSuggestions = generateMockSuggestions(value);
                    setSuggestions(mockSuggestions);
                    setShowSuggestions(mockSuggestions.length > 0);
                  }, 1000); // 1 second timeout
                  
                  autocompleteService.getPlacePredictions(request, (predictions, status) => {
                    clearTimeout(timeoutId); // Clear timeout since we got a response
                    console.log('🌍 Google Places API response:', { status, predictions: predictions?.length || 0 });
                    
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions.length > 0) {
                      const formattedSuggestions = predictions.slice(0, 5).map(prediction => ({
                        placeId: prediction.place_id,
                        description: prediction.description,
                        mainText: prediction.structured_formatting?.main_text || prediction.description,
                        secondaryText: prediction.structured_formatting?.secondary_text || ''
                      }));
                      setSuggestions(formattedSuggestions);
                      setShowSuggestions(true);
                      console.log('🌍 Formatted suggestions:', formattedSuggestions);
                    } else {
                      console.log('🌍 API failed with status:', status, '- showing mock suggestions for:', value);
                      // Show mock suggestions when API fails
                      const mockSuggestions = generateMockSuggestions(value);
                      setSuggestions(mockSuggestions);
                      setShowSuggestions(mockSuggestions.length > 0);
                    }
                  });
                } catch (error) {
                  console.error('❌ Error getting place predictions, showing mock suggestions:', error);
                  // Show mock suggestions when API throws error
                  const mockSuggestions = generateMockSuggestions(value);
                  setSuggestions(mockSuggestions);
                  setShowSuggestions(mockSuggestions.length > 0);
                }
              } else {
                console.log('🌍 Google API not loaded, showing mock suggestions for:', value);
                // Show mock suggestions when Google API is not loaded
                const mockSuggestions = generateMockSuggestions(value);
                setSuggestions(mockSuggestions);
                setShowSuggestions(mockSuggestions.length > 0);
              }
            } else {
              setSuggestions([]);
              setShowSuggestions(false);
            }
            
            // Trigger calculation update
            if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
              window.__v2ExecutionEngine.triggerCalculationUpdate();
            }
          };
          
          // Handle suggestion selection
          const handleSuggestionSelect = (suggestion) => {
            setLocationValue(suggestion.description);
            setInputValue(suggestion.description);
            setShowSuggestions(false);
            setUserHasEdited(true);
            
            // Update calculation engine
            if (!window.elementValues) {
              window.elementValues = {};
            }
            window.elementValues[element.id] = suggestion.description;
            
            // Trigger calculation update
            if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
              window.__v2ExecutionEngine.triggerCalculationUpdate();
            }
            
            console.log('🌍 Location selected:', suggestion.description);
          };
          
          return (
            <div style={{ position: 'relative' }}>
              {/* Location Input */}
              <input
                ref={locationInputRef}
                data-element-id={element.id}
                data-element-type="input"
                data-input-type="location"
                type="text"
                placeholder={props.placeholder || 'Enter your address'}
                value={isExecuteMode ? locationValue : undefined}
                defaultValue={!isExecuteMode ? (props.defaultValue || '') : undefined}
                onChange={isExecuteMode ? (e) => handleLocationChange(e.target.value) : undefined}
                onFocus={isExecuteMode ? () => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                } : undefined}
                style={{
                  ...inputStyle,
                  pointerEvents: isExecuteMode ? 'auto' : 'none',
                  paddingRight: `${(props.paddingRight || 16) + 24}px`, // Add space for location icon
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(props.arrowColor || '#666666')}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'%3e%3c/path%3e%3ccircle cx='12' cy='10' r='3'%3e%3c/circle%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
                disabled={!isExecuteMode}
              />
              
              {/* Loading indicator */}
              {isLoadingGoogle && isExecuteMode && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  right: '40px',
                  transform: 'translateY(-50%)',
                  fontSize: '12px',
                  color: props.arrowColor || '#666666'
                }}>
                  Loading...
                </div>
              )}
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && isExecuteMode && (
                <div
                  ref={suggestionsRef}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.placeId}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                        transition: 'background-color 0.2s ease'
                      }}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#333333',
                        marginBottom: '2px'
                      }}>
                        {suggestion.mainText}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#666666'
                      }}>
                        {suggestion.secondaryText}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Fallback message when Google API is not available */}
              {!window.google && !isLoadingGoogle && isExecuteMode && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  padding: '8px 12px',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#856404',
                  zIndex: 1000
                }}>
                  ⚠️ Google Places API not configured. Contact administrator to enable location autocomplete.
                </div>
              )}
            </div>
          );
        }
        
        // Handle file picker input type
        if (props.inputType === 'filePicker') {
          // Get file picker configuration
          const fileTypes = props.filePickerTypes || [];
          const multiSelect = props.filePickerMultiSelect === 'enable';
          const maxFiles = parseInt(props.filePickerMaxFiles) || 5;
          const maxSize = parseInt(props.filePickerMaxSize) || 10; // MB
          const labelText = props.filePickerLabelText || '+ Upload';
          const containerHeight = props.filePickerHeight || '80px';
          
          // Generate accept attribute based on file types
          const getAcceptAttribute = () => {
            if (fileTypes.includes('all')) {
              return '*/*';
            }
            
            const acceptTypes = [];
            if (fileTypes.includes('photo')) {
              acceptTypes.push('image/*');
            }
            if (fileTypes.includes('video')) {
              acceptTypes.push('video/*');
            }
            
            return acceptTypes.length > 0 ? acceptTypes.join(',') : '*/*';
          };
          
          // Handle file selection
          const handleFileSelect = (event) => {
            const files = Array.from(event.target.files);
            
            // Validate file size
            const validFiles = files.filter(file => {
              const fileSizeMB = file.size / (1024 * 1024);
              return fileSizeMB <= maxSize;
            });
            
            if (multiSelect) {
              // Multi-select mode
              const newFiles = [...selectedFiles, ...validFiles];
              const limitedFiles = newFiles.slice(0, maxFiles);
              setSelectedFiles(limitedFiles);
              
              // Update calculation engine with file names
              if (!window.elementValues) {
                window.elementValues = {};
              }
              window.elementValues[element.id] = limitedFiles.map(f => f.name).join(', ');
            } else {
              // Single file mode
              const singleFile = validFiles[0];
              if (singleFile) {
                setSelectedFiles([singleFile]);
                
                // Update calculation engine with file name
                if (!window.elementValues) {
                  window.elementValues = {};
                }
                window.elementValues[element.id] = singleFile.name;
              }
            }
            
            // Clear the input to allow re-selecting the same file
            event.target.value = '';
            
            // Trigger calculation update
            if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
              window.__v2ExecutionEngine.triggerCalculationUpdate();
            }
          };
          
          // Handle file removal
          const handleFileRemove = (indexToRemove) => {
            const newFiles = selectedFiles.filter((_, index) => index !== indexToRemove);
            setSelectedFiles(newFiles);
            
            // Update calculation engine
            if (!window.elementValues) {
              window.elementValues = {};
            }
            window.elementValues[element.id] = newFiles.map(f => f.name).join(', ');
            
            // Trigger calculation update
            if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
              window.__v2ExecutionEngine.triggerCalculationUpdate();
            }
          };
          
          // Check if file is an image for preview
          const isImageFile = (file) => {
            return file.type.startsWith('image/');
          };
          
          // File item style with configurable height
          const fileItemStyle = {
            position: 'relative',
            minWidth: '120px',
            height: containerHeight,
            border: `${props.borderWidth || 1}px solid ${props.borderColor || '#ddd'}`,
            borderRadius: `${props.borderRadiusTopLeft || 4}px`,
            backgroundColor: props.backgroundColor || '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '4px',
            padding: '8px',
            fontSize: '12px',
            color: props.textColor || '#333333',
            overflow: 'hidden'
          };
          
          return (
            <div style={{ width: '100%' }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptAttribute()}
                multiple={multiSelect}
                onChange={isExecuteMode ? handleFileSelect : undefined}
                style={{ display: 'none' }}
                disabled={!isExecuteMode}
              />
              
              {/* File picker container */}
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start'
              }}>
                {/* Upload button - always visible and fixed */}
                <div
                  style={{
                    ...fileItemStyle,
                    cursor: isExecuteMode ? 'pointer' : 'default',
                    borderStyle: 'dashed',
                    transition: 'all 0.2s ease',
                    flexShrink: 0 // Prevent shrinking
                  }}
                  onClick={isExecuteMode ? () => fileInputRef.current?.click() : undefined}
                  onMouseOver={isExecuteMode ? (e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
                    e.currentTarget.style.borderColor = '#007bff';
                  } : undefined}
                  onMouseOut={isExecuteMode ? (e) => {
                    e.currentTarget.style.backgroundColor = props.backgroundColor || '#ffffff';
                    e.currentTarget.style.borderColor = props.borderColor || '#ddd';
                  } : undefined}
                >
                  <div style={{
                    fontSize: '12px',
                    color: props.textColor || '#333333',
                    textAlign: 'center',
                    fontWeight: props.fontWeight || '400'
                  }}>
                    {labelText}
                  </div>
                </div>
                
                {/* Selected files container - scrollable */}
                {selectedFiles.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    flex: 1,
                    paddingBottom: '4px' // Add some padding for scrollbar
                  }}>
                    {selectedFiles.map((file, index) => (
                      <div key={index} style={{
                        ...fileItemStyle,
                        flexShrink: 0 // Prevent shrinking of file items
                      }}>
                        {/* Delete button */}
                        {isExecuteMode && (
                          <button
                            onClick={() => handleFileRemove(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              border: 'none',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 1
                            }}
                          >
                            ×
                          </button>
                        )}
                        
                        {/* File preview or icon */}
                        {isImageFile(file) ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              width: '100%',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '2px'
                            }}
                            onLoad={(e) => {
                              // Clean up object URL to prevent memory leaks
                              setTimeout(() => {
                                URL.revokeObjectURL(e.target.src);
                              }, 1000);
                            }}
                          />
                        ) : (
                          <div style={{
                            fontSize: '20px',
                            color: props.textColor || '#333333',
                            marginBottom: '4px'
                          }}>
                            📄
                          </div>
                        )}
                        
                        {/* File name */}
                        <div style={{
                          fontSize: '10px',
                          color: props.textColor || '#333333',
                          textAlign: 'center',
                          wordBreak: 'break-all',
                          lineHeight: '1.2',
                          maxHeight: '24px',
                          overflow: 'hidden'
                        }}>
                          {file.name.length > 15 ? `${file.name.substring(0, 12)}...` : file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }
        
        // Handle audio input type
        if (props.inputType === 'audio') {
          // Format time as MM:SS
          const formatTime = (seconds) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          };
          
          // Start recording
          const startRecording = async () => {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const recorder = new MediaRecorder(stream);
              const chunks = [];
              
              recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                  chunks.push(event.data);
                }
              };
              
              recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                setAudioBlob(blob);
                setRecordingState('stopped');
                
                // Update calculation engine with recording info
                if (!window.elementValues) {
                  window.elementValues = {};
                }
                window.elementValues[element.id] = `Audio recording (${formatTime(recordingTime)})`;
                
                // Trigger calculation update
                if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
                  window.__v2ExecutionEngine.triggerCalculationUpdate();
                }
                
                // Stop all tracks to release microphone
                stream.getTracks().forEach(track => track.stop());
              };
              
              setMediaRecorder(recorder);
              recorder.start();
              setIsRecording(true);
              setRecordingState('recording');
              setRecordingTime(0);
              
              // Start timer
              audioIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
              }, 1000);
              
            } catch (error) {
              console.error('Error accessing microphone:', error);
              alert('Unable to access microphone. Please check permissions.');
            }
          };
          
          // Stop recording
          const stopRecording = () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              setIsRecording(false);
              
              // Clear timer
              if (audioIntervalRef.current) {
                clearInterval(audioIntervalRef.current);
                audioIntervalRef.current = null;
              }
            }
          };
          
          // Reset recording
          const resetRecording = () => {
            setIsRecording(false);
            setRecordingTime(0);
            setAudioBlob(null);
            setRecordingState('idle');
            
            // Clear timer
            if (audioIntervalRef.current) {
              clearInterval(audioIntervalRef.current);
              audioIntervalRef.current = null;
            }
            
            // Update calculation engine
            if (!window.elementValues) {
              window.elementValues = {};
            }
            window.elementValues[element.id] = '';
            
            // Trigger calculation update
            if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
              window.__v2ExecutionEngine.triggerCalculationUpdate();
            }
          };
          
          
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: `${props.paddingTop || 12}px ${props.paddingRight || 16}px ${props.paddingBottom || 12}px ${props.paddingLeft || 16}px`,
              backgroundColor: props.backgroundColor || '#ffffff',
              borderRadius: `${props.borderRadiusTopLeft || 4}px ${props.borderRadiusTopRight || 4}px ${props.borderRadiusBottomRight || 4}px ${props.borderRadiusBottomLeft || 4}px`,
              border: `${props.borderWidth || 1}px solid ${props.borderColor || '#ddd'}`,
              marginTop: `${props.marginTop || 0}px`,
              marginBottom: `${props.marginBottom || 0}px`,
              marginLeft: `${props.marginLeft || 0}px`,
              marginRight: `${props.marginRight || 0}px`,
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* Microphone Icon */}
              <div style={{
                fontSize: '20px',
                color: isRecording ? '#dc3545' : (props.textColor || '#666666'),
                transition: 'color 0.2s ease'
              }}>
                🎤
              </div>
              
              {/* Timer Display */}
              <div style={{
                fontSize: `${props.fontSize || 16}px`,
                fontWeight: props.fontWeight || '400',
                color: props.textColor || '#333333',
                fontFamily: 'monospace',
                minWidth: '50px'
              }}>
                {formatTime(recordingTime)}
              </div>
              
              {/* Control Button */}
              <button
                onClick={isExecuteMode ? () => {
                  if (recordingState === 'idle') {
                    startRecording();
                  } else if (recordingState === 'recording') {
                    stopRecording();
                  } else if (recordingState === 'stopped') {
                    resetRecording();
                  }
                } : undefined}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: recordingState === 'recording' ? '#dc3545' : 
                                 recordingState === 'stopped' ? '#6c757d' : '#007bff',
                  color: 'white',
                  fontSize: `${props.fontSize || 14}px`,
                  fontWeight: '500',
                  cursor: isExecuteMode ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  pointerEvents: isExecuteMode ? 'auto' : 'none',
                  opacity: isExecuteMode ? 1 : 0.7
                }}
                onMouseOver={isExecuteMode ? (e) => {
                  if (recordingState === 'recording') {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  } else if (recordingState === 'stopped') {
                    e.currentTarget.style.backgroundColor = '#5a6268';
                  } else {
                    e.currentTarget.style.backgroundColor = '#0056b3';
                  }
                } : undefined}
                onMouseOut={isExecuteMode ? (e) => {
                  if (recordingState === 'recording') {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                  } else if (recordingState === 'stopped') {
                    e.currentTarget.style.backgroundColor = '#6c757d';
                  } else {
                    e.currentTarget.style.backgroundColor = '#007bff';
                  }
                } : undefined}
                disabled={!isExecuteMode}
              >
                {recordingState === 'idle' ? 'Record' :
                 recordingState === 'recording' ? 'Stop' : 'Reset'}
              </button>
              
              {/* Recording indicator */}
              {isRecording && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
                  animation: 'pulse 1s infinite'
                }} />
              )}
              
              {/* Audio playback (when recording exists) */}
              {audioBlob && recordingState === 'stopped' && (
                <audio
                  controls
                  src={URL.createObjectURL(audioBlob)}
                  style={{
                    height: '30px',
                    fontSize: '12px'
                  }}
                />
              )}
            </div>
          );
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
            // Use string formatting to avoid timezone issues
            const monthStr = month.toString().padStart(2, '0');
            const dayStr = day.toString().padStart(2, '0');
            return `${year}-${monthStr}-${dayStr}`; // YYYY-MM-DD format
          };
          
          // Get date restrictions
          const minDate = parseMMDDYYYY(props.datePickerMinDate);
          const maxDate = parseMMDDYYYY(props.datePickerMaxDate);
          const disabledDatesStr = props.datePickerDisabledDates || '';
          
          // Parse disabled dates and ranges
          const parseDisabledDatesAndRanges = (disabledStr) => {
            const disabledDates = [];
            const disabledRanges = [];
            
            if (!disabledStr || disabledStr.trim() === '') {
              return { disabledDates, disabledRanges };
            }
            
            // Split by commas and process each entry
            const entries = disabledStr.split(',').map(entry => entry.trim()).filter(entry => entry.length > 0);
            
            entries.forEach(entry => {
              // Check if entry contains a range (has dash or "to")
              if (entry.includes('-') || entry.toLowerCase().includes(' to ')) {
                // Parse as range
                let startStr, endStr;
                
                if (entry.includes(' - ') || entry.includes(' to ')) {
                  // Handle "MM/DD/YYYY - MM/DD/YYYY" or "MM/DD/YYYY to MM/DD/YYYY"
                  const parts = entry.split(/ - | to /i);
                  if (parts.length === 2) {
                    startStr = parts[0].trim();
                    endStr = parts[1].trim();
                  }
                } else if (entry.includes('-')) {
                  // Handle "MM/DD/YYYY-MM/DD/YYYY"
                  const parts = entry.split('-');
                  if (parts.length === 2) {
                    startStr = parts[0].trim();
                    endStr = parts[1].trim();
                  }
                }
                
                if (startStr && endStr) {
                  const startDate = parseMMDDYYYY(startStr);
                  const endDate = parseMMDDYYYY(endStr);
                  
                  if (startDate && endDate) {
                    disabledRanges.push({ start: startDate, end: endDate });
                  }
                }
              } else {
                // Parse as single date
                const singleDate = parseMMDDYYYY(entry);
                if (singleDate) {
                  disabledDates.push(singleDate);
                }
              }
            });
            
            return { disabledDates, disabledRanges };
          };
          
          const { disabledDates, disabledRanges } = parseDisabledDatesAndRanges(disabledDatesStr);
          
          // Check if a date is disabled
          const isDateDisabled = (dateStr) => {
            if (minDate && dateStr < minDate) return true;
            if (maxDate && dateStr > maxDate) return true;
            
            // Check individual disabled dates
            if (disabledDates.includes(dateStr)) return true;
            
            // Check disabled date ranges
            for (const range of disabledRanges) {
              if (dateStr >= range.start && dateStr <= range.end) {
                return true;
              }
            }
            
            return false;
          };
          
          // Format date for display (e.g., "Jun 19, 2025")
          const formatDateForDisplay = (dateStr) => {
            // Parse YYYY-MM-DD format manually to avoid timezone issues
            const parts = dateStr.split('-');
            if (parts.length !== 3) return dateStr;
            
            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed
            const day = parseInt(parts[2]);
            
            if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
            
            // Create date in local timezone
            const date = new Date(year, month, day);
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
              
        // CRITICAL FIX: Update calculation engine with MM/DD/YYYY format for calculations
        if (!window.elementValues) {
          window.elementValues = {};
        }
        
        // Convert YYYY-MM-DD back to MM/DD/YYYY for calculations
        const convertToMMDDYYYY = (isoDate) => {
          const parts = isoDate.split('-');
          if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1];
            const day = parts[2];
            return `${month}/${day}/${year}`;
          }
          return isoDate;
        };
        
        const mmddyyyyValue = convertToMMDDYYYY(date);
        window.elementValues[element.id] = mmddyyyyValue; // Store MM/DD/YYYY for calculations
        
        console.log('🔵 DATEPICKER_DEBUG: Updated window.elementValues for single date:', {
          elementId: element.id,
          isoDate: date,
          mmddyyyyValue,
          displayValue,
          windowElementValues: window.elementValues
        });
              
              // Trigger calculation update
              if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
                console.log('🔵 DATEPICKER_DEBUG: Triggering calculation update for single date selection');
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
                
              // CRITICAL FIX: Update calculation engine with MM/DD/YYYY format for calculations
              if (!window.elementValues) {
                window.elementValues = {};
              }
              
              // Convert YYYY-MM-DD to MM/DD/YYYY for calculations
              const convertToMMDDYYYY = (isoDate) => {
                const parts = isoDate.split('-');
                if (parts.length === 3) {
                  const year = parts[0];
                  const month = parts[1];
                  const day = parts[2];
                  return `${month}/${day}/${year}`;
                }
                return isoDate;
              };
              
              const mmddyyyyValue = convertToMMDDYYYY(date);
              window.elementValues[element.id] = mmddyyyyValue; // Store MM/DD/YYYY for calculations
              
              console.log('🔵 DATEPICKER_DEBUG: Updated window.elementValues for range start:', {
                elementId: element.id,
                isoDate: date,
                mmddyyyyValue,
                displayValue,
                windowElementValues: window.elementValues
              });
              } else {
                // Complete range - but first validate that no disabled dates exist in between
                const startDate = new Date(selectedStartDate);
                const endDate = new Date(date);
                
                // Determine the actual start and end dates (handle case where user selects earlier date second)
                let actualStartDate, actualEndDate;
                if (endDate >= startDate) {
                  actualStartDate = selectedStartDate;
                  actualEndDate = date;
                } else {
                  actualStartDate = date;
                  actualEndDate = selectedStartDate;
                }
                
                // Check if any dates in the range (inclusive) are disabled
                const isRangeValid = () => {
                  const start = new Date(actualStartDate);
                  const end = new Date(actualEndDate);
                  
                  // Check each date in the range
                  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    if (isDateDisabled(dateStr)) {
                      return false;
                    }
                  }
                  return true;
                };
                
                if (isRangeValid()) {
                  // Range is valid - complete the selection
                  setSelectedStartDate(actualStartDate);
                  setSelectedEndDate(actualEndDate);
                  const startDisplay = formatDateForDisplay(actualStartDate);
                  const endDisplay = formatDateForDisplay(actualEndDate);
                  const rangeValue = `${startDisplay} to ${endDisplay}`;
                  setInputValue(rangeValue);
                  setUserHasEdited(true);
                  setShowCalendar(false);
                  
                  // CRITICAL FIX: Update calculation engine with MM/DD/YYYY range format for calculations
                  if (!window.elementValues) {
                    window.elementValues = {};
                  }
                  
                  // Convert YYYY-MM-DD back to MM/DD/YYYY for calculations
                  const convertToMMDDYYYY = (isoDate) => {
                    const parts = isoDate.split('-');
                    if (parts.length === 3) {
                      const year = parts[0];
                      const month = parts[1];
                      const day = parts[2];
                      return `${month}/${day}/${year}`;
                    }
                    return isoDate;
                  };
                  
                  const startMMDDYYYY = convertToMMDDYYYY(actualStartDate);
                  const endMMDDYYYY = convertToMMDDYYYY(actualEndDate);
                  const rangeForCalc = `${startMMDDYYYY}-${endMMDDYYYY}`;
                  window.elementValues[element.id] = rangeForCalc; // Store MM/DD/YYYY-MM/DD/YYYY format for calculations
                  
                  console.log('🔵 DATEPICKER_DEBUG: Updated window.elementValues for completed range:', {
                    elementId: element.id,
                    actualStartDate,
                    actualEndDate,
                    startMMDDYYYY,
                    endMMDDYYYY,
                    rangeForCalc,
                    displayValue: rangeValue,
                    windowElementValues: window.elementValues
                  });
                } else {
                  // Range contains disabled dates - start a new range from the clicked date
                  setSelectedStartDate(date);
                  setSelectedEndDate('');
                  const displayValue = formatDateForDisplay(date);
                  setInputValue(displayValue);
                  setUserHasEdited(true);
                  
                  // CRITICAL FIX: Update calculation engine with MM/DD/YYYY format for calculations
                  if (!window.elementValues) {
                    window.elementValues = {};
                  }
                  
                  // Convert YYYY-MM-DD to MM/DD/YYYY for calculations
                  const convertToMMDDYYYY = (isoDate) => {
                    const parts = isoDate.split('-');
                    if (parts.length === 3) {
                      const year = parts[0];
                      const month = parts[1];
                      const day = parts[2];
                      return `${month}/${day}/${year}`;
                    }
                    return isoDate;
                  };
                  
                  const mmddyyyyValue = convertToMMDDYYYY(date);
                  window.elementValues[element.id] = mmddyyyyValue; // Store MM/DD/YYYY for calculations
                  
                  console.log('🔵 DATEPICKER_DEBUG: Updated window.elementValues for new range start:', {
                    elementId: element.id,
                    isoDate: date,
                    mmddyyyyValue,
                    displayValue,
                    windowElementValues: window.elementValues
                  });
                }
              }
              
              // Trigger calculation update
              if (window.__v2ExecutionEngine && window.__v2ExecutionEngine.triggerCalculationUpdate) {
                console.log('🔵 DATEPICKER_DEBUG: Triggering calculation update for range selection');
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
      
      {/* Add CSS for placeholder styling and audio recording animation */}
      <style>
        {`
          input::placeholder, textarea::placeholder {
            color: ${placeholderColor} !important;
          }
          
          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
            100% {
              opacity: 1;
            }
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
    datePickerSelectedValue: '', // Initial selected date or date range
    datePickerMinDate: '',
    datePickerMaxDate: '',
    datePickerDisabledDates: '',
    
    // File Picker Configuration
    filePickerTypes: ['photo'], // Array of accepted file types: 'photo', 'video', 'all'
    filePickerMultiSelect: 'enable', // 'enable', 'disable'
    filePickerMaxFiles: '5',
    filePickerMaxSize: '10', // MB
    filePickerLabelText: '+ Upload',
    filePickerHeight: '80px', // Height of the file picker container
    
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
