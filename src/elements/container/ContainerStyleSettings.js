import React, { useState, useCallback } from 'react';

const ContainerStyleSettings = ({ 
  getValue, 
  handleInputChange, 
  handleKeyPress, 
  updateProperty,
  element, // Add element prop to check if this is inside a slider container
  isInsideSliderContainer = false, // Flag to indicate if this container is inside a slider container
  isInsideTabsContainer = false // Flag to indicate if this container is inside a tabs container
}) => {
  // Check if this element should have active mode (if it's a child in a slider/tabs container or is a slider/tabs container itself)
  const containerType = element?.containerType || 'basic';
  const shouldShowActiveMode = isInsideSliderContainer || isInsideTabsContainer || containerType === 'slider' || containerType === 'tabs';
  
  // Determine which type of active mode we're in
  const isTabsMode = isInsideTabsContainer || containerType === 'tabs';
  const isSliderMode = isInsideSliderContainer || containerType === 'slider';
  
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
  
  // Style for labels in active mode (different colors for tabs vs slider)
  const activeColor = isTabsMode ? '#007bff' : '#8b5cf6';
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
      {/* Active Mode Toggle for Slider/Tabs Containers */}
      {shouldShowActiveMode && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            backgroundColor: isActiveMode ? (isTabsMode ? '#f0f8ff' : '#f3f4f6') : 'transparent',
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
                ? (isTabsMode ? 'Editing active tab styles' : 'Editing active slide styles')
                : 'Editing default styles'
              }
            </span>
          </div>
          {isActiveMode && (
            <div style={{
              fontSize: '11px',
              color: activeColor,
              marginTop: '4px',
              padding: '4px 8px',
              backgroundColor: isTabsMode ? '#e6f3ff' : '#faf5ff',
              borderRadius: '3px'
            }}>
              {isTabsMode 
                ? 'These styles will only apply when this element is the active tab'
                : 'These styles will only apply when this element is the active slide'
              }
            </div>
          )}
        </div>
      )}

      {/* Layout Properties */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Layout
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Width:
          </label>
          <input
            type="text"
            value={getValueWithActiveMode('width')}
            onChange={(e) => handleInputChangeWithActiveMode('width', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="auto, 100px, 50%"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Height:
          </label>
          <input
            type="text"
            value={getValueWithActiveMode('height')}
            onChange={(e) => handleInputChangeWithActiveMode('height', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="auto, 100px, 50%"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Direction:
          </label>
          <select
            value={getValueWithActiveMode('orientation')}
            onChange={(e) => updatePropertyWithActiveMode('orientation', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="column">Column</option>
            <option value="row">Row</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            V-Align:
          </label>
          <select
            value={getValueWithActiveMode('verticalAlignment')}
            onChange={(e) => updatePropertyWithActiveMode('verticalAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            H-Align:
          </label>
          <select
            value={getValueWithActiveMode('horizontalAlignment')}
            onChange={(e) => updatePropertyWithActiveMode('horizontalAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
      </div>

      {/* Styling */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Styling
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Background:
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
            color: isActiveMode ? '#8b5cf6' : '#555' 
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
            color: isActiveMode ? '#8b5cf6' : '#555' 
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
            color: isActiveMode ? '#8b5cf6' : '#555' 
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

      {/* Shadow */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={headerStyle}>
          Shadow
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={labelStyle}>
            Color:
          </label>
          <input
            type="color"
            value={getValueWithActiveMode('shadowColor')}
            onChange={(e) => updatePropertyWithActiveMode('shadowColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <input
            type="number"
            value={getValueWithActiveMode('shadowX')}
            onChange={(e) => handleInputChangeWithActiveMode('shadowX', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="X"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <input
            type="number"
            value={getValueWithActiveMode('shadowY')}
            onChange={(e) => handleInputChangeWithActiveMode('shadowY', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="Y"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <input
            type="number"
            value={getValueWithActiveMode('shadowBlur')}
            onChange={(e) => handleInputChangeWithActiveMode('shadowBlur', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="Blur"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ContainerStyleSettings;
