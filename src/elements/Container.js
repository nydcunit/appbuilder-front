import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import ConditionBlock from '../components/ConditionBlock';
import SuperText from '../components/SuperText';
import axios from 'axios';
import { executeTextCalculations } from '../utils/calculationEngine';
import { getElementByType } from './index';

// ============================================
// CONTAINER STYLE SETTINGS COMPONENT
// ============================================

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

// ============================================
// CONTAINER CONTENT SETTINGS COMPONENT
// ============================================

const ContainerContentSettings = ({ element, onUpdate, availableElements = [], availableScreens = [], screens = [], currentScreenId = null }) => {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FIXED: Content settings with proper defaults and initialization
  const contentType = element.contentType || 'fixed';
  const containerType = element.containerType || 'basic';
  const sliderConfig = element.sliderConfig || {
    autoPlay: false,
    loop: false,
    slidesToScroll: 1,
    activeTab: '1'
  };
  const tabsConfig = element.tabsConfig || {
    activeTab: '1'
  };
  const repeatingConfig = element.repeatingConfig || {
    databaseId: null,
    tableId: null,
    filters: []
  };
  const pageConfig = element.pageConfig || {
    selectedPageId: null,
    parameters: []
  };

  console.log('Container Content Settings - Current State:', {
    elementId: element.id,
    contentType,
    containerType,
    sliderConfig,
    repeatingConfig,
    elementContentType: element.contentType,
    elementContainerType: element.containerType,
    elementSliderConfig: element.sliderConfig,
    elementRepeatingConfig: element.repeatingConfig
  });

  // Fetch databases on mount
  useEffect(() => {
    if (contentType === 'repeating') {
      fetchDatabases();
    }
  }, [contentType]);

  // Fetch tables when database is selected
  useEffect(() => {
    if (repeatingConfig.databaseId) {
      fetchTables(repeatingConfig.databaseId);
    } else {
      setTables([]);
      setColumns([]);
    }
  }, [repeatingConfig.databaseId]);

  // Fetch columns when table is selected
  useEffect(() => {
    if (repeatingConfig.databaseId && repeatingConfig.tableId) {
      fetchColumns(repeatingConfig.databaseId, repeatingConfig.tableId);
    } else {
      setColumns([]);
    }
  }, [repeatingConfig.databaseId, repeatingConfig.tableId]);

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

  // Handle container type change
  const handleContainerTypeChange = useCallback((type) => {
    console.log('Changing container type to:', type, 'for element:', element.id);
    
    const updates = {
      containerType: type
    };

    // If switching to slider, initialize slider config
    if (type === 'slider') {
      updates.sliderConfig = {
        autoPlay: false,
        loop: false,
        slidesToScroll: 1,
        activeTab: '1'
      };
    }
    
    // If switching to tabs, initialize tabs config
    if (type === 'tabs') {
      updates.tabsConfig = {
        activeTab: '1'
      };
    }
    
    // If switching away from tabs, remove tabs config
    if (type !== 'tabs' && element.tabsConfig) {
      updates.tabsConfig = null;
    }

    console.log('Container type update payload:', updates);
    onUpdate(updates);
  }, [onUpdate, element.id]);

  // Handle slider config updates
  const updateSliderConfig = useCallback((updates) => {
    console.log('Updating slider config:', updates, 'current:', sliderConfig);
    
    const newSliderConfig = {
      ...sliderConfig,
      ...updates
    };
    
    console.log('New slider config:', newSliderConfig);
    
    onUpdate({
      sliderConfig: newSliderConfig
    });
  }, [sliderConfig, onUpdate]);

  // Handle tabs config updates
  const updateTabsConfig = useCallback((updates) => {
    
    
    const newTabsConfig = {
      ...tabsConfig,
      ...updates
    };
    

    
    onUpdate({
      tabsConfig: newTabsConfig
    });
  }, [tabsConfig, onUpdate]);

  // FIXED: Handle content type change - update element directly, not properties
  const handleContentTypeChange = useCallback((type) => {
    console.log('Changing content type to:', type, 'for element:', element.id);
    
    const updates = {
      contentType: type
    };

    // If switching to repeating, initialize repeating config
    if (type === 'repeating') {
      updates.repeatingConfig = {
        databaseId: null,
        tableId: null,
        filters: []
      };
    } else {
      // If switching away from repeating, remove repeating config
      updates.repeatingConfig = null;
    }

    // If switching to page, initialize page config
    if (type === 'page') {
      updates.pageConfig = {
        selectedPageId: null,
        parameters: []
      };
    } else {
      // If switching away from page, remove page config
      updates.pageConfig = null;
    }

    console.log('Content type update payload:', updates);
    onUpdate(updates);
  }, [onUpdate, element.id]);

  // FIXED: Handle repeating config updates - update element directly
  const updateRepeatingConfig = useCallback((updates) => {
    console.log('Updating repeating config:', updates, 'current:', repeatingConfig);
    
    const newRepeatingConfig = {
      ...repeatingConfig,
      ...updates
    };
    
    console.log('New repeating config:', newRepeatingConfig);
    
    onUpdate({
      repeatingConfig: newRepeatingConfig
    });
  }, [repeatingConfig, onUpdate]);

  // Handle database selection
  const handleDatabaseSelect = useCallback((databaseId) => {
    console.log('Selecting database:', databaseId);
    updateRepeatingConfig({
      databaseId,
      tableId: null,
      filters: []
    });
    setTables([]);
    setColumns([]);
  }, [updateRepeatingConfig]);

  // Handle table selection
  const handleTableSelect = useCallback((tableId) => {
    console.log('Selecting table:', tableId);
    updateRepeatingConfig({
      tableId,
      filters: []
    });
  }, [updateRepeatingConfig]);

  // Handle filter updates
  const handleAddFilter = useCallback(() => {
    const newFilter = {
      id: Date.now().toString(),
      column: '',
      operator: 'equals',
      value: '',
      logic: repeatingConfig.filters.length > 0 ? 'and' : null
    };
    updateRepeatingConfig({
      filters: [...repeatingConfig.filters, newFilter]
    });
  }, [repeatingConfig.filters, updateRepeatingConfig]);

  const handleRemoveFilter = useCallback((filterId) => {
    const newFilters = repeatingConfig.filters.filter(f => f.id !== filterId);
    updateRepeatingConfig({ filters: newFilters });
  }, [repeatingConfig.filters, updateRepeatingConfig]);

  const handleFilterUpdate = useCallback((filterId, field, value) => {
    const newFilters = repeatingConfig.filters.map(filter => 
      filter.id === filterId ? { ...filter, [field]: value } : filter
    );
    updateRepeatingConfig({ filters: newFilters });
  }, [repeatingConfig.filters, updateRepeatingConfig]);

  // Handle page config updates
  const updatePageConfig = useCallback((updates) => {
    console.log('Updating page config:', updates, 'current:', pageConfig);
    
    const newPageConfig = {
      ...pageConfig,
      ...updates
    };
    
    console.log('New page config:', newPageConfig);
    
    onUpdate({
      pageConfig: newPageConfig
    });
  }, [pageConfig, onUpdate]);

  // Handle page selection
  const handlePageSelect = useCallback((pageId) => {
    console.log('Selecting page:', pageId);
    updatePageConfig({
      selectedPageId: pageId
    });
  }, [updatePageConfig]);

  // Handle parameter updates
  const handleAddParameter = useCallback(() => {
    const newParameter = {
      id: Date.now().toString(),
      name: '',
      value: ''
    };
    updatePageConfig({
      parameters: [...pageConfig.parameters, newParameter]
    });
  }, [pageConfig.parameters, updatePageConfig]);

  const handleRemoveParameter = useCallback((parameterId) => {
    const newParameters = pageConfig.parameters.filter(p => p.id !== parameterId);
    updatePageConfig({ parameters: newParameters });
  }, [pageConfig.parameters, updatePageConfig]);

  const handleParameterUpdate = useCallback((parameterId, field, value) => {
    const newParameters = pageConfig.parameters.map(parameter => 
      parameter.id === parameterId ? { ...parameter, [field]: value } : parameter
    );
    updatePageConfig({ parameters: newParameters });
  }, [pageConfig.parameters, updatePageConfig]);

  const renderContainerTypeTabs = () => (
    <div style={{
      marginBottom: '20px'
    }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        Container Type
      </label>
      <div style={{
        display: 'flex',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '16px'
      }}>
        {['basic', 'slider', 'tabs'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleContainerTypeChange(tab)}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              backgroundColor: containerType === tab ? 'white' : 'transparent',
              color: containerType === tab ? '#333' : '#666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: containerType === tab ? '500' : '400',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSliderOptions = () => {
    if (containerType !== 'slider') return null;

    return (
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h4 style={{
          marginBottom: '16px',
          color: '#333',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Slider Options
        </h4>
        
        {/* Auto Play Checkbox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <input
            type="checkbox"
            id="slider-autoplay"
            checked={sliderConfig.autoPlay}
            onChange={(e) => updateSliderConfig({ autoPlay: e.target.checked })}
            style={{
              marginRight: '8px'
            }}
          />
          <label htmlFor="slider-autoplay" style={{
            fontSize: '14px',
            color: '#333',
            cursor: 'pointer'
          }}>
            Auto Play
          </label>
        </div>

        {/* Loop Checkbox */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <input
            type="checkbox"
            id="slider-loop"
            checked={sliderConfig.loop}
            onChange={(e) => updateSliderConfig({ loop: e.target.checked })}
            style={{
              marginRight: '8px'
            }}
          />
          <label htmlFor="slider-loop" style={{
            fontSize: '14px',
            color: '#333',
            cursor: 'pointer'
          }}>
            Loop
          </label>
        </div>

        {/* Slides to Scroll */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            color: '#333',
            marginBottom: '4px'
          }}>
            Slides to Scroll
          </label>
          <input
            type="number"
            min="1"
            value={sliderConfig.slidesToScroll}
            onChange={(e) => updateSliderConfig({ slidesToScroll: parseInt(e.target.value) || 1 })}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Active Tab - Upgraded to SuperText */}
        <div style={{ marginBottom: '12px' }}>
          <SuperText
            label="Active Tab"
            placeholder="Enter slide value or number (e.g., 1, 2, 3)"
            value={sliderConfig.activeTab}
            onChange={(value) => updateSliderConfig({ activeTab: value })}
            availableElements={[]}
            screens={screens}
            currentScreenId={currentScreenId}
          />
        </div>
      </div>
    );
  };

  const renderTabsOptions = () => {
    if (containerType !== 'tabs') return null;

    return (
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '1px solid #b3d9ff'
      }}>
        <h4 style={{
          marginBottom: '16px',
          color: '#333',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Tabs Options
        </h4>
        
        {/* Active Tab - Using SuperText */}
        <div style={{ marginBottom: '12px' }}>
          <SuperText
            label="Active Tab"
            placeholder="Enter tab value or number (e.g., 1, 2, 3)"
            value={tabsConfig.activeTab}
            onChange={(value) => updateTabsConfig({ activeTab: value })}
            availableElements={[]}
            screens={screens}
            currentScreenId={currentScreenId}
          />
        </div>
      </div>
    );
  };

  const renderContentTabs = () => (
    <div style={{
      display: 'flex',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      padding: '4px',
      marginBottom: '16px'
    }}>
      {['fixed', 'repeating', 'page'].map((tab) => (
        <button
          key={tab}
          onClick={() => handleContentTypeChange(tab)}
          style={{
            flex: 1,
            padding: '8px 16px',
            border: 'none',
            backgroundColor: contentType === tab ? 'white' : 'transparent',
            color: contentType === tab ? '#333' : '#666',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: contentType === tab ? '500' : '400',
            transition: 'all 0.2s ease',
            textTransform: 'capitalize'
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderRepeatingConfig = () => (
    <div>
      {/* Database Selection */}
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
          value={repeatingConfig.databaseId || ''}
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

        {repeatingConfig.databaseId && (
          <select
            value={repeatingConfig.tableId || ''}
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

      {/* Filters */}
      {repeatingConfig.tableId && (
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
              Filters (Optional)
            </label>
            <div>
              <button
                onClick={handleAddFilter}
                disabled={columns.length === 0}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginRight: '8px',
                  opacity: columns.length === 0 ? 0.5 : 1
                }}
              >
                +
              </button>
              {repeatingConfig.filters.length > 0 && (
                <button
                  onClick={() => updateRepeatingConfig({ filters: [] })}
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
                  Clear All
                </button>
              )}
            </div>
          </div>

          {repeatingConfig.filters.map((filter, index) => (
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

              {/* Value Input */}
              <input
                type="text"
                value={filter.value}
                onChange={(e) => handleFilterUpdate(filter.id, 'value', e.target.value)}
                placeholder="Filter value"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              />

              {/* Remove button for first filter */}
              {index === 0 && repeatingConfig.filters.length > 1 && (
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
        </div>
      )}
    </div>
  );

  const renderPageConfig = () => (
    <div>
      {/* Page Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '8px'
        }}>
          Select Page
        </label>

        <select
          value={pageConfig.selectedPageId || ''}
          onChange={(e) => handlePageSelect(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            marginBottom: '8px'
          }}
        >
          <option value="">
            Select a page to display
          </option>
          {availableScreens.map((screen) => (
            <option key={screen.id} value={screen.id}>
              {screen.name}
            </option>
          ))}
        </select>
      </div>

      {/* Parameters */}
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
            Parameters (Optional)
          </label>
          <div>
            <button
              onClick={handleAddParameter}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                marginRight: '8px'
              }}
            >
              Add Parameter
            </button>
            {pageConfig.parameters.length > 0 && (
              <button
                onClick={() => updatePageConfig({ parameters: [] })}
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
                Clear All
              </button>
            )}
          </div>
        </div>

        {pageConfig.parameters.map((parameter, index) => (
          <div key={parameter.id} style={{
            backgroundColor: '#f0f8ff',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #b3d9ff'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px'
            }}>
              <span style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#333'
              }}>
                Parameter {index + 1}
              </span>
              <button
                onClick={() => handleRemoveParameter(parameter.id)}
                style={{
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

            {/* Parameter Name */}
            <input
              type="text"
              value={parameter.name}
              onChange={(e) => handleParameterUpdate(parameter.id, 'name', e.target.value)}
              placeholder="Parameter name (e.g., userId, productId)"
              style={{
                width: '100%',
                padding: '8px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px',
                marginBottom: '8px'
              }}
            />

            {/* Parameter Value - Using SuperText */}
            <SuperText
              label="Parameter Value"
              placeholder="Enter parameter value or select from elements"
              value={parameter.value}
              onChange={(value) => handleParameterUpdate(parameter.id, 'value', value)}
              availableElements={availableElements}
              screens={screens}
              currentScreenId={currentScreenId}
            />
          </div>
        ))}

        {pageConfig.parameters.length === 0 && (
          <div style={{
            padding: '20px',
            backgroundColor: '#f0f8ff',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#666',
            fontSize: '14px',
            border: '1px solid #b3d9ff'
          }}>
            No parameters added. Click "Add Parameter" to pass data to the nested page.
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        padding: '12px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#856404'
      }}>
        <strong>Note:</strong> The selected page will be rendered inside this container. 
        You cannot modify elements within the nested page from this view - 
        please navigate to the page itself to make changes.
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Content
      </h4>
      
      {/* Debug info */}
      <div style={{ 
        fontSize: '10px', 
        color: '#666', 
        marginBottom: '8px',
        padding: '4px 8px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        Debug: contentType={contentType}, containerType={containerType}, has repeatingConfig={!!element.repeatingConfig}
      </div>
      
      {renderContainerTypeTabs()}
      {renderSliderOptions()}
      {renderTabsOptions()}
      
      <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Content Mode
      </h4>
      
      {renderContentTabs()}
      
      {contentType === 'fixed' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          Container displays content normally (fixed).
        </div>
      )}
      
      {contentType === 'repeating' && renderRepeatingConfig()}
      
      {contentType === 'page' && renderPageConfig()}
    </div>
  );
};

// ============================================
// CONTAINER PROPERTIES PANEL COMPONENT
// ============================================

// Separate memoized properties panel component
const ContainerPropertiesPanel = memo(({ element, onUpdate, availableElements = [], screens = [], currentScreenId = null }) => {
  const props = element.properties || {};
  
  // FIXED: Initialize activeConditionIndex based on element's conditional state
  const [activeConditionIndex, setActiveConditionIndex] = useState(() => {
    // If element has conditional rendering and conditions, default to first condition
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      return 0; // Default to first condition for editing
    }
    return 0;
  });

  // FIXED: Update activeConditionIndex when element changes, but preserve user selection
  useEffect(() => {
    

    // Only reset if the current activeConditionIndex is out of bounds
    if (element.renderType !== 'conditional' || !element.conditions || element.conditions.length === 0) {
      
      setActiveConditionIndex(0);
    } else if (activeConditionIndex >= element.conditions.length) {
      
      setActiveConditionIndex(0);
    }
    // Otherwise, preserve the current activeConditionIndex to maintain user's selection
  }, [element.id, element.renderType, element.conditions?.length]); // Only depend on essential changes

  // FIXED: Get the current properties - enhanced logic for condition property inheritance
  const getCurrentProperties = useCallback(() => {
    
    
    if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
      const activeCondition = element.conditions[activeConditionIndex];
      
      
      // FIXED: Return condition properties if they exist, otherwise return base properties
      if (activeCondition?.properties) {
        const mergedProps = { ...props, ...activeCondition.properties };
        
        return mergedProps;
      } else {
        // If condition doesn't have properties yet, return base properties
        
        return props;
      }
    }
    
    return props;
  }, [element.renderType, element.conditions, activeConditionIndex, props]);

  // FIXED: Stable update function for properties
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

  // FIXED: Handle condition updates AND manage active condition index
  const handleConditionUpdate = useCallback((updates) => {
    
    
    // If we're adding a new condition, copy properties from the active condition or base
    if (updates.conditions && updates.conditions.length > (element.conditions?.length || 0)) {
      const newConditions = updates.conditions.map((condition, index) => {
        // If this is a new condition and doesn't have properties, copy from active condition or base
        if (!condition.properties) {
          let sourceProperties = { ...props }; // Start with base properties
          
          // If we have an active condition with properties, copy from there
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

  // FIXED: Handle condition selection changes from ConditionBlock
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

  // Handle copying element ID to clipboard
  const copyElementId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(element.id);
      
    } catch (err) {
      console.error('Failed to copy element ID:', err);
    }
  }, [element.id]);

  // Check if this container element is inside a slider container
  const checkIfInsideSliderContainer = useCallback(() => {
    // Helper function to check if an element exists anywhere in a container's tree
    const isElementInContainer = (elementId, container) => {
      if (!container.children || container.children.length === 0) {
        return false;
      }
      
      // Check all children recursively
      for (const child of container.children) {
        if (child.id === elementId) {
          return true;
        }
        // Recursively check if this child contains the element
        if (child.type === 'container' && isElementInContainer(elementId, child)) {
          return true;
        }
      }
      
      return false;
    };
    
    // Check all containers to see if any slider contains this element
    for (const container of availableElements) {
      if (container.type === 'container' && container.containerType === 'slider') {
        if (isElementInContainer(element.id, container)) {
          return true;
        }
      }
    }
    
    return false;
  }, [element.id, availableElements]);

  // Check if this container element is inside a tabs container
  const checkIfInsideTabsContainer = useCallback(() => {
    // Helper function to check if an element exists anywhere in a container's tree
    const isElementInContainer = (elementId, container) => {
      if (!container.children || container.children.length === 0) {
        return false;
      }
      
      // Check all children recursively
      for (const child of container.children) {
        if (child.id === elementId) {
          return true;
        }
        // Recursively check if this child contains the element
        if (child.type === 'container' && isElementInContainer(elementId, child)) {
          return true;
        }
      }
      
      return false;
    };
    
    // Check all containers to see if any tabs container contains this element
    for (const container of availableElements) {
      if (container.type === 'container' && container.containerType === 'tabs') {
        if (isElementInContainer(element.id, container)) {
          return true;
        }
      }
    }
    
    return false;
  }, [element.id, availableElements]);

  return (
    <div>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>Container Properties</h3>
      
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
          Use this ID to reference this element in calculations
        </div>
      </div>

      {/* FIXED: Condition Block with callback for condition selection changes */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        onConditionSelectionChange={handleConditionSelectionChange}
        activeConditionIndex={activeConditionIndex}
        availableElements={availableElements}
        screens={screens}
        currentScreenId={currentScreenId}
      />

      {/* FIXED: Show indicator of which condition's properties are being edited */}
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
            <strong>💡 Tip:</strong> Changes are automatically saved. The background color and other properties you set here will be applied when this condition evaluates to true during preview/execution.
          </div>
        </div>
      )}

      {/* Content Section */}
      <ContainerContentSettings
        element={element}
        onUpdate={onUpdate}
        availableElements={availableElements}
        availableScreens={screens}
        screens={screens}
        currentScreenId={currentScreenId}
      />
      
      {/* Style Settings - These now automatically use the correct condition properties */}
      <ContainerStyleSettings
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

ContainerPropertiesPanel.displayName = 'ContainerPropertiesPanel';

// ============================================
// MAIN CONTAINER COMPONENT AND ELEMENT DEFINITION
// ============================================

// Page Content Container component with hover overlay
const PageContentContainer = ({ pageElements, selectedScreenName, isExecuteMode, props }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: props.orientation || 'column',
        alignItems: props.horizontalAlignment || 'flex-start',
        justifyContent: props.verticalAlignment || 'flex-start',
        marginTop: isExecuteMode ? '0px' : '20px',
        gap: props.orientation === 'row' ? '10px' : '5px',
        position: 'relative'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {pageElements}
      
      {/* Hover overlay for builder mode */}
      {!isExecuteMode && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              textAlign: 'center',
              maxWidth: '300px',
              lineHeight: '1.4'
            }}
          >
            <strong>📄 Nested Page Content</strong>
            <br />
            <span style={{ fontSize: '12px', opacity: 0.9 }}>
              Elements from "{selectedScreenName}" are displayed here.
              To edit them, navigate to that page directly.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Component to handle parameter execution and page content rendering
const PageContainerWithParameters = ({ element, selectedScreen, availableScreens, isExecuteMode, depth, calculationResults = {}, repeatingContainerData = {} }) => {
  // Use executed parameters from AppRuntime if available, otherwise execute our own
  const [executedParameters, setExecutedParameters] = React.useState([]);
  
  React.useEffect(() => {
    if (isExecuteMode && element.pageConfig && element.pageConfig.parameters) {
      // Check if AppRuntime has already executed the parameters
      const hasExecutedParams = element.pageConfig.parameters.some(param => param.executedValue !== undefined);
      
      if (hasExecutedParams) {
        
        setExecutedParameters(element.pageConfig.parameters);
      } else {
        
        const executeParameterCalculations = async () => {
          const executed = [];
          
          // Get all elements from all screens for calculation context
          const getAllElementsFromScreens = () => {
            const allElements = [];
            availableScreens.forEach(screen => {
              if (screen.elements) {
                const traverse = (elementList) => {
                  elementList.forEach(el => {
                    allElements.push(el);
                    if (el.children && el.children.length > 0) {
                      traverse(el.children);
                    }
                  });
                };
                traverse(screen.elements);
              }
            });
            return allElements;
          };
          
          const allElements = getAllElementsFromScreens();
          
          for (const param of element.pageConfig.parameters) {
            let executedValue = param.value;
            
            // Execute calculation if parameter value contains calculation tokens
            if (param.value && param.value.includes('{{CALC:')) {
              try {
                console.log('🧮 Executing parameter calculation:', param.name, param.value);
                executedValue = await executeTextCalculations(
                  param.value,
                  allElements,
                  {},
                  null
                );
                console.log('🧮 Parameter calculation result:', param.name, executedValue);
              } catch (error) {
                console.error('Error executing parameter calculation:', error);
                executedValue = `[Error: ${error.message}]`;
              }
            }
            
            executed.push({
              ...param,
              executedValue
            });
          }
          
          setExecutedParameters(executed);
        };
        
        executeParameterCalculations();
      }
    } else {
      setExecutedParameters(element.pageConfig?.parameters || []);
    }
  }, [isExecuteMode, element.pageConfig?.parameters, availableScreens]);
  
  // Render the PageContentWithCalculations with executed parameters and calculation results
  return React.createElement(PageContentWithCalculations, {
    selectedScreen,
    availableScreens,
    isExecuteMode,
    depth,
    pageParameters: executedParameters,
    calculationResults: calculationResults,
    parentContainerId: element.id
  });
};

// Component to handle page content with calculations
const PageContentWithCalculations = ({ selectedScreen, availableScreens, isExecuteMode, depth, pageParameters = [], calculationResults = {}, parentContainerId = null }) => {
  
  
  // Helper function to apply calculated values to elements
  const applyCalculatedValues = (elements, parentContainerId) => {
    return elements.map(pageElement => {
      let processedElement = { ...pageElement };
      
      // Apply calculated values for text elements if available
      if (pageElement.type === 'text' && pageElement.properties?.value) {
        // Check multiple possible nested element ID patterns
        const possibleIds = [
          `nested_${parentContainerId}_${pageElement.id}`,
          `nested_${pageElement.id}`,
          pageElement.id
        ];
        
        let calculatedValue = undefined;
        let foundId = null;
        
        for (const id of possibleIds) {
          if (calculationResults[id] !== undefined) {
            calculatedValue = calculationResults[id];
            foundId = id;
            break;
          }
        }
        
        if (calculatedValue !== undefined) {
          
          processedElement = {
            ...pageElement,
            properties: {
              ...pageElement.properties,
              value: calculatedValue
            }
          };
        } else {
          
        }
      }
      
      // Recursively process children
      if (pageElement.children && pageElement.children.length > 0) {
        processedElement.children = applyCalculatedValues(pageElement.children, parentContainerId);
      }
      
      return processedElement;
    });
  };

  // Apply calculated values to elements
  const processedElements = isExecuteMode ? applyCalculatedValues(selectedScreen.elements, parentContainerId) : selectedScreen.elements;

  // Render the page elements with calculated values
  return processedElements.map((pageElement, index) => {
    const elementDef = getElementByType(pageElement.type);
    if (!elementDef) return null;
    
    // Render the page element
    const renderedPageElement = elementDef.render(
      pageElement,
      depth + 1,
      false, // not selected
      false, // not drop zone
      {}, // no handlers for nested page elements
      pageElement.children ? pageElement.children.map(child => {
        const childDef = getElementByType(child.type);
        return childDef ? childDef.render(child, depth + 2, false, false, {}, null, null, isExecuteMode) : null;
      }) : null,
      null, // matchedConditionIndex
      isExecuteMode
    );
    
    return React.cloneElement(renderedPageElement, {
      key: `page-${pageElement.id}-${index}`
    });
  });
};

// FIXED: Get properties for rendering - now correctly handles conditional properties based on evaluation
const getRenderProperties = (element, matchedConditionIndex = null) => {

  
  if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
    // FIXED: Use the matched condition index if provided
    let conditionIndex = matchedConditionIndex;
    
    // Fallback to first condition if no specific match provided (for builder mode)
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

export const ContainerElement = {
  type: 'container',
  label: 'Container',
  icon: '📦',
  
  // Default properties when element is created
  getDefaultProps: () => ({
    // Layout
    orientation: 'column',
    width: 'auto',
    height: 'auto',
    verticalAlignment: 'flex-start',
    horizontalAlignment: 'flex-start',
    
    // Styling
    backgroundColor: '#ffffff',
    
    // Content configuration
    contentType: 'fixed',
    pageConfig: {
      selectedPageId: null,
      parameters: []
    },
    repeatingConfig: {
      databaseId: null,
      tableId: null,
      filters: []
    },
    
    // Spacing
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    
    // Border Radius
    borderRadiusTopLeft: 0,
    borderRadiusTopRight: 0,
    borderRadiusBottomLeft: 0,
    borderRadiusBottomRight: 0,
    
    // Border
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopStyle: 'dashed',
    borderBottomStyle: 'dashed',
    borderLeftStyle: 'dashed',
    borderRightStyle: 'dashed',
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    borderLeftColor: '#ccc',
    borderRightColor: '#ccc',
    
    // Shadow
    shadowColor: '#000000',
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    
    // Active state properties (for slider mode)
    activeBackgroundColor: '#ffffff',
    activeMarginTop: 0,
    activeMarginBottom: 0,
    activeMarginLeft: 0,
    activeMarginRight: 0,
    activePaddingTop: 15,
    activePaddingBottom: 15,
    activePaddingLeft: 15,
    activePaddingRight: 15,
    activeBorderRadiusTopLeft: 0,
    activeBorderRadiusTopRight: 0,
    activeBorderRadiusBottomLeft: 0,
    activeBorderRadiusBottomRight: 0,
    activeBorderTopWidth: 1,
    activeBorderBottomWidth: 1,
    activeBorderLeftWidth: 1,
    activeBorderRightWidth: 1,
    activeBorderTopStyle: 'dashed',
    activeBorderBottomStyle: 'dashed',
    activeBorderLeftStyle: 'dashed',
    activeBorderRightStyle: 'dashed',
    activeBorderTopColor: '#ccc',
    activeBorderBottomColor: '#ccc',
    activeBorderLeftColor: '#ccc',
    activeBorderRightColor: '#ccc',
    activeShadowColor: '#000000',
    activeShadowX: 0,
    activeShadowY: 0,
    activeShadowBlur: 0
  }),
  
  getDefaultChildren: () => ([]),

  // FIXED: Render function now accepts matchedConditionIndex parameter
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null, matchedConditionIndex = null, isExecuteMode = false, isActiveSlide = false, isActiveTab = false, availableScreens = [], calculationResults = {}, repeatingContainerData = {}) => {
    const { onClick, onDelete, onDragOver, onDragLeave, onDrop, onDragStart } = handlers;
    
    
    
    // FIXED: Use the fixed getRenderProperties function with matched condition index
    let props = getRenderProperties(element, matchedConditionIndex);
    const contentType = element.contentType || 'fixed';
    
    // Check if this element is in an active slide by checking parent hierarchy
    const checkIfInActiveSlide = () => {
      if (!isExecuteMode) return false;
      
      // Check if any parent element indicates this is in an active slide
      // This works by checking the element's ID pattern for repeating containers
      if (element.id && element.id.includes('_instance_')) {
        // Extract the instance number from repeating container ID
        const match = element.id.match(/_instance_(\d+)/);
        if (match) {
          const instanceIndex = parseInt(match[1]);
          // Check if there's a parent slider container tracking this
          const parentMatch = element.id.match(/^([^_]+)_instance/);
          if (parentMatch) {
            const parentId = parentMatch[1];
            // Check if this parent has active slide info
            if (window.__activeSlides && window.__activeSlides[parentId] === instanceIndex) {
              return true;
            }
          }
        }
      }
      
      // For non-repeating elements, check if they're in a slide that's active
      // by looking at the global active slides tracker
      if (window.__activeSlideElements) {
        // Check each slider to see if this element is in its active slide
        for (const [sliderId, activeIndex] of Object.entries(window.__activeSlideElements)) {
          // This is a simplified check - in practice we'd need to traverse the tree
          // For now, just use the passed isActiveSlide prop
          return isActiveSlide;
        }
      }
      
      return isActiveSlide;
    };
    
    // Apply active styles if this element is in the active slide OR active tab
    const effectiveIsActiveSlide = checkIfInActiveSlide();
    const shouldApplyActiveStyles = (effectiveIsActiveSlide || isActiveTab) && isExecuteMode;
    

    
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
  
    } else {
      
    }
    

    
    // Build styles from properties
    const containerStyle = {
      // Layout
      width: props.width || 'auto',
      height: props.height || 'auto',
      display: 'flex',
      flexDirection: props.orientation || 'column',
      alignItems: props.horizontalAlignment || 'flex-start',
      justifyContent: props.verticalAlignment || 'flex-start',
      
      // Styling - FIXED: Ensure background color is applied
      backgroundColor: props.backgroundColor || '#ffffff',
      
      // Spacing
      marginTop: `${props.marginTop || 0}px`,
      marginBottom: `${props.marginBottom || 0}px`,
      marginLeft: `${props.marginLeft || 0}px`,
      marginRight: `${props.marginRight || 0}px`,
      paddingTop: `${props.paddingTop || 15}px`,
      paddingBottom: `${props.paddingBottom || 15}px`,
      paddingLeft: `${props.paddingLeft || 15}px`,
      paddingRight: `${props.paddingRight || 15}px`,
      
      // Border Radius
      borderTopLeftRadius: `${props.borderRadiusTopLeft || 0}px`,
      borderTopRightRadius: `${props.borderRadiusTopRight || 0}px`,
      borderBottomLeftRadius: `${props.borderRadiusBottomLeft || 0}px`,
      borderBottomRightRadius: `${props.borderRadiusBottomRight || 0}px`,
      
      // Border
      borderTopWidth: `${props.borderTopWidth || 1}px`,
      borderBottomWidth: `${props.borderBottomWidth || 1}px`,
      borderLeftWidth: `${props.borderLeftWidth || 1}px`,
      borderRightWidth: `${props.borderRightWidth || 1}px`,
      borderTopStyle: props.borderTopStyle || 'dashed',
      borderBottomStyle: props.borderBottomStyle || 'dashed',
      borderLeftStyle: props.borderLeftStyle || 'dashed',
      borderRightStyle: props.borderRightStyle || 'dashed',
      borderTopColor: props.borderTopColor || '#ccc',
      borderBottomColor: props.borderBottomColor || '#ccc',
      borderLeftColor: props.borderLeftColor || '#ccc',
      borderRightColor: props.borderRightColor || '#ccc',
      
      // Shadow
      boxShadow: props.shadowBlur > 0 
        ? `${props.shadowX || 0}px ${props.shadowY || 0}px ${props.shadowBlur || 0}px ${props.shadowColor || '#000000'}`
        : 'none',
      
      // Canvas specific styles
      position: 'relative',
      cursor: 'grab',
      transition: 'all 0.2s ease',
      
      // Selection and drop zone styles
      ...(isSelected && {
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderTopColor: '#007bff',
        borderBottomColor: '#007bff',
        borderLeftColor: '#007bff',
        borderRightColor: '#007bff',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '2px',
        borderRightWidth: '2px'
      }),
      
      ...(isDropZone && {
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle: 'solid',
        borderRightStyle: 'solid',
        borderTopColor: '#0056b3',
        borderBottomColor: '#0056b3',
        borderLeftColor: '#0056b3',
        borderRightColor: '#0056b3',
        borderTopWidth: '2px',
        borderBottomWidth: '2px',
        borderLeftWidth: '2px',
        borderRightWidth: '2px',
        backgroundColor: '#e3f2fd'
      })
    };

    // Determine container label based on content type and container type
    const getContainerLabel = () => {
      const containerType = element.containerType || 'basic';
      let label = '';
      
      // Add container type prefix
      if (containerType === 'slider') {
        label = 'Slider Container';
      } else if (containerType === 'tabs') {
        label = 'Tabs Container';
      } else {
        label = 'Container';
      }
      
      // Add content type suffix
      if (contentType === 'repeating') {
        const config = element.repeatingConfig;
        if (config && config.databaseId && config.tableId) {
          label += ' (Repeating)';
        } else {
          label += ' (Repeating - No Data)';
        }
      } else {
        label += ` (${props.orientation || 'column'})`;
      }
      
      return label;
    };
    
    // Helper function to find tab index by value for tabs containers
    const findTabIndexByValue = (value, children) => {
      if (!value || !children) return -1;
      
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (!child || !child.props || !child.props.element) continue;
        
        // Recursively search for text element with matching value
        const findTabValue = (element) => {
          if (element.type === 'text' && element.properties?.isTabValue === true) {
            return element.properties?.value || '';
          }
          
          if (element.children) {
            for (const childEl of element.children) {
              const result = findTabValue(childEl);
              if (result) return result;
            }
          }
          
          return null;
        };
        
        const tabValue = findTabValue(child.props.element);
        if (tabValue === value) {
          return i;
        }
      }
      
      return -1;
    };
    
    // Get initial active tab for tabs containers
    const getInitialActiveTab = (tabsConfig, children) => {
      const activeTab = tabsConfig.activeTab || '1';
      
      // Try to parse as number first
      const tabNumber = parseInt(activeTab);
      if (!isNaN(tabNumber) && tabNumber > 0) {
        return Math.min(tabNumber - 1, (children?.length || 1) - 1);
      }
      
      // Otherwise, try to find by text value
      const tabIndex = findTabIndexByValue(activeTab, children);
      return tabIndex >= 0 ? tabIndex : 0;
    };
    
    // Check if this container is a slider container
    const isSliderContainer = (element.containerType || 'basic') === 'slider';
    
    // Check if this container is a tabs container
    const isTabsContainer = (element.containerType || 'basic') === 'tabs';
    
    // Get slider configuration - FIXED: Don't override existing config
    const sliderConfig = element.sliderConfig ? {
      autoPlay: element.sliderConfig.autoPlay || false,
      loop: element.sliderConfig.loop || false,
      slidesToScroll: element.sliderConfig.slidesToScroll || 1,
      activeTab: element.sliderConfig.activeTab || '1'
    } : {
      autoPlay: false,
      loop: false,
      slidesToScroll: 1,
      activeTab: '1'
    };
    
    // Get tabs configuration
    const tabsConfig = element.tabsConfig ? {
      activeTab: element.tabsConfig.activeTab || '1'
    } : {
      activeTab: '1'
    };
    
    // Debug logging for slider config
    if (isSliderContainer) {

    }
    
    // Debug logging for tabs config
    if (isTabsContainer) {

    }
    
    // Store active slide state in a context-like way
    const SlideContext = React.createContext(false);
    
    // Slider component for execute mode
    const SliderComponent = ({ children, sliderConfig, containerStyle, props, element }) => {
      // Helper function to find slide index by value
      const findSlideIndexByValue = (value) => {
        if (!value || !children) return -1;
        
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (!child || !child.props || !child.props.element) continue;
          
          // Recursively search for text element with matching value
          const findTextValue = (element) => {
            if (element.type === 'text' && element.properties?.isSlideText === true) {
              return element.properties?.value || '';
            }
            
            if (element.children) {
              for (const childEl of element.children) {
                const result = findTextValue(childEl);
                if (result) return result;
              }
            }
            
            return null;
          };
          
          const slideValue = findTextValue(child.props.element);
          if (slideValue === value) {
            return i;
          }
        }
        
        return -1;
      };
      
      // Initialize current slide based on activeTab (could be number or text value)
      const getInitialSlide = () => {
        const activeTab = sliderConfig.activeTab || '1';
        
        // Try to parse as number first
        const slideNumber = parseInt(activeTab);
        if (!isNaN(slideNumber) && slideNumber > 0) {
          return Math.min(slideNumber - 1, (children?.length || 1) - 1);
        }
        
        // Otherwise, try to find by text value
        const slideIndex = findSlideIndexByValue(activeTab);
        return slideIndex >= 0 ? slideIndex : 0;
      };
      
      const [currentSlide, setCurrentSlide] = useState(getInitialSlide());
      const [isTransitioning, setIsTransitioning] = useState(false);
      const sliderRef = useRef(null);
      const autoPlayRef = useRef(null);
      const isVertical = props.orientation === 'column';
      
      // Drag functionality state
      const [isDragging, setIsDragging] = useState(false);
      const [dragStart, setDragStart] = useState(null);
      const [dragOffset, setDragOffset] = useState(0);
      const [startTransform, setStartTransform] = useState(0);
      const dragOffsetRef = useRef(0);
      
      // Auto-play functionality
      useEffect(() => {
        if (sliderConfig.autoPlay && children && children.length > 1) {
          autoPlayRef.current = setInterval(() => {
            const slidesToScroll = sliderConfig.slidesToScroll || 1;
            goToSlide((currentSlide + slidesToScroll) % children.length);
          }, 3000); // 3 second intervals
        }
        
        return () => {
          if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
          }
        };
      }, [currentSlide, sliderConfig.autoPlay, sliderConfig.slidesToScroll, children]);
      
      // Store active slide info globally for elements to check
      useEffect(() => {
        if (element && element.id) {
          window.__activeSlides = window.__activeSlides || {};
          window.__activeSlides[element.id] = currentSlide;
        }
      }, [currentSlide, element]);
      
      const goToSlide = (slideIndex) => {
        if (isTransitioning || !children || slideIndex < 0 || slideIndex >= children.length) return;
        
        // Handle looping
        let targetSlide = slideIndex;
        if (!sliderConfig.loop) {
          targetSlide = Math.max(0, Math.min(slideIndex, children.length - 1));
        } else if (slideIndex >= children.length) {
          targetSlide = 0;
        } else if (slideIndex < 0) {
          targetSlide = children.length - 1;
        }
        
        setIsTransitioning(true);
        setCurrentSlide(targetSlide);
        
        // Update the element's sliderConfig to reflect the current slide
        if (element && element.sliderConfig) {
          element.sliderConfig.activeTab = String(targetSlide + 1); // Convert to 1-based string
          
          // Store active slide globally
          window.__activeSlides = window.__activeSlides || {};
          window.__activeSlides[element.id] = targetSlide;
          
          // Trigger a refresh by clicking the refresh button if it exists
          // This is a workaround to trigger recalculation
          setTimeout(() => {
            // Find all buttons and look for the refresh button
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
              const buttonText = button.textContent || '';
              // Look for refresh button by its text content
              if (buttonText.includes('Refresh') || buttonText.includes('🔄')) {
                button.click();
                break;
              }
            }
          }, 350); // Wait for slide transition to complete
        }
        
        // Reset transition state after animation
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      };
      
      const handleKeyDown = (e) => {
        const slidesToScroll = sliderConfig.slidesToScroll || 1;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          goToSlide(currentSlide - slidesToScroll);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          goToSlide(currentSlide + slidesToScroll);
        }
      };
      
      // Mouse drag functionality
      const onMouseDown = (e) => {
        setIsDragging(true);
        setDragStart(isVertical ? e.clientY : e.clientX);
        setStartTransform(currentSlide * (100 / children.length));
        setDragOffset(0);
        e.preventDefault();
      };
      
      const onMouseMove = (e) => {
        if (!isDragging || dragStart === null) return;
        
        const containerSize = isVertical 
          ? (sliderRef.current?.offsetHeight || 400)
          : (sliderRef.current?.offsetWidth || 800);
        
        const delta = isVertical
          ? (e.clientY - dragStart)
          : (e.clientX - dragStart);
        
        const dragPercentage = (delta / containerSize) * 100;
        
        // Calculate new offset with bounds
        let newOffset = dragPercentage;
        const maxOffset = (children.length - 1) * (100 / children.length);
        
        // Prevent dragging beyond bounds with resistance
        const currentPos = startTransform - (dragPercentage / children.length);
        if (currentPos < 0) {
          newOffset = dragPercentage * 0.3; // Add resistance
        } else if (currentPos > maxOffset) {
          newOffset = dragPercentage * 0.3; // Add resistance
        }
        
        setDragOffset(newOffset);
        dragOffsetRef.current = newOffset;
      };
      
      const onMouseUp = () => {
        if (!isDragging) return;
        
        const finalDragOffset = dragOffsetRef.current;
        
        setIsDragging(false);
        setDragOffset(0);
        dragOffsetRef.current = 0;
        
        // Calculate which slide to snap to
        const slideWidth = 100 / children.length;
        
        // Find nearest slide position with 20% threshold
        const dragThreshold = 0.2; // 20% threshold
        const dragDirection = finalDragOffset > 0 ? -1 : 1;
        
        // Calculate if we've dragged past the threshold
        const draggedPercentage = Math.abs(finalDragOffset) / slideWidth;
        const shouldChangeSlide = draggedPercentage > dragThreshold;
        
        let targetSlide;
        if (shouldChangeSlide) {
          targetSlide = currentSlide + dragDirection;
        } else {
          targetSlide = currentSlide;
        }
        
        const boundedSlide = Math.max(0, Math.min(targetSlide, children.length - 1));
        goToSlide(boundedSlide);
      };
      
      // Add global mouse events
      useEffect(() => {
        const handleGlobalMouseMove = (e) => onMouseMove(e);
        const handleGlobalMouseUp = () => onMouseUp();
        
        if (isDragging) {
          document.addEventListener('mousemove', handleGlobalMouseMove);
          document.addEventListener('mouseup', handleGlobalMouseUp);
        }
        
        return () => {
          document.removeEventListener('mousemove', handleGlobalMouseMove);
          document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
      }, [isDragging, dragStart, startTransform]);
      
      // Touch/swipe support with improved detection
      const [touchStart, setTouchStart] = useState(null);
      const [touchEnd, setTouchEnd] = useState(null);
      
      const onTouchStart = (e) => {
        setTouchEnd(null);
        setIsDragging(false);
        const touch = e.targetTouches[0];
        setTouchStart({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
      };
      
      const onTouchMove = (e) => {
        if (!touchStart) return;
        
        const touch = e.targetTouches[0];
        setTouchEnd({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        });
        
        // Prevent default scrolling if we're swiping horizontally
        const deltaX = Math.abs(touch.clientX - touchStart.x);
        const deltaY = Math.abs(touch.clientY - touchStart.y);
        
        if (props.orientation === 'row' && deltaX > deltaY && deltaX > 10) {
          e.preventDefault();
          setIsDragging(true);
        } else if (props.orientation === 'column' && deltaY > deltaX && deltaY > 10) {
          e.preventDefault();
          setIsDragging(true);
        }
      };
      
      const onTouchEnd = () => {
        if (!touchStart || !touchEnd || !isDragging) {
          setTouchStart(null);
          setTouchEnd(null);
          setIsDragging(false);
          return;
        }
        
        const deltaX = touchStart.x - touchEnd.x;
        const deltaY = touchStart.y - touchEnd.y;
        const deltaTime = touchEnd.time - touchStart.time;
        
        // Minimum swipe distance and maximum time for swipe detection
        const minSwipeDistance = 50;
        const maxSwipeTime = 300;
        
        if (deltaTime > maxSwipeTime) {
          setTouchStart(null);
          setTouchEnd(null);
          setIsDragging(false);
          return;
        }
        
        const slidesToScroll = sliderConfig.slidesToScroll || 1;
        if (props.orientation === 'row') {
          const absDeltaX = Math.abs(deltaX);
          if (absDeltaX > minSwipeDistance) {
            if (deltaX > 0) {
              // Swiped left - go to next slide
              goToSlide(currentSlide + slidesToScroll);
            } else {
              // Swiped right - go to previous slide
              goToSlide(currentSlide - slidesToScroll);
            }
          }
        } else {
          const absDeltaY = Math.abs(deltaY);
          if (absDeltaY > minSwipeDistance) {
            if (deltaY > 0) {
              // Swiped up - go to next slide
              goToSlide(currentSlide + slidesToScroll);
            } else {
              // Swiped down - go to previous slide
              goToSlide(currentSlide - slidesToScroll);
            }
          }
        }
        
        setTouchStart(null);
        setTouchEnd(null);
        setIsDragging(false);
      };
      
      const getTransformValue = () => {
        const slidePercentage = currentSlide * (100 / children.length);
        const offsetPercentage = isDragging ? (dragOffset / children.length) : 0;
        const totalPercentage = slidePercentage - offsetPercentage;
        
        if (props.orientation === 'row') {
          return `translateX(-${totalPercentage}%)`;
        } else {
          return `translateY(-${totalPercentage}%)`;
        }
      };
      
      return (
        <div
          style={{
            ...containerStyle,
            outline: 'none'
          }}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          ref={sliderRef}
        >
          {/* Content Area with Slider */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: props.orientation || 'column',
            alignItems: props.horizontalAlignment || 'flex-start',
            justifyContent: props.verticalAlignment || 'flex-start',
            marginTop: isExecuteMode ? '0px' : '20px',
            gap: '0px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div 
              style={{
                display: 'flex',
                flexDirection: props.orientation === 'row' ? 'row' : 'column',
                width: props.orientation === 'row' ? `${children.length * 100}%` : '100%',
                height: props.orientation === 'column' ? `${children.length * 100}%` : '100%',
                transition: (isTransitioning && !isDragging) ? 'transform 0.3s ease-in-out' : 'none',
                transform: getTransformValue(),
                willChange: 'transform',
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {children.map((child, index) => {
                // Check if this slide is active
                const isActive = index === currentSlide;
                
                return (
                  <div
                    key={child.key || index}
                    className={isActive ? 'active-slide' : 'inactive-slide'}
                    style={{
                      flex: '0 0 auto',
                      width: props.orientation === 'row' ? `${100 / children.length}%` : '100%',
                      height: props.orientation === 'column' ? `${100 / children.length}%` : '100%',
                      display: 'flex',
                      flexDirection: props.orientation === 'row' ? 'row' : 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      overflow: 'hidden',
                      gap: 0
                    }}
                    data-is-active-slide={isActive}
                  >
                    {/* Clone child with isActiveSlide prop if it's the active slide */}
                    {React.isValidElement(child) && isActive ? 
                      React.cloneElement(child, { 
                        ...child.props,
                        isActiveSlide: true,
                        'data-active-slide': 'true'
                      }) : child}
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Navigation Controls */}
          {children && children.length > 1 && (
            <>
              {/* Previous/Next buttons */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const slidesToScroll = sliderConfig.slidesToScroll || 1;
                  goToSlide(currentSlide - slidesToScroll);
                }}
                disabled={!sliderConfig.loop && currentSlide === 0}
                style={{
                  position: 'absolute',
                  top: isVertical ? '10px' : '50%',
                  left: isVertical ? '50%' : '10px',
                  transform: isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: (!sliderConfig.loop && currentSlide === 0) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  pointerEvents: 'auto'
                }}
              >
                {isVertical ? '▲' : '‹'}
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const slidesToScroll = sliderConfig.slidesToScroll || 1;
                  goToSlide(currentSlide + slidesToScroll);
                }}
                disabled={!sliderConfig.loop && currentSlide === children.length - 1}
                style={{
                  position: 'absolute',
                  bottom: isVertical ? '10px' : 'auto',
                  top: isVertical ? 'auto' : '50%',
                  right: isVertical ? 'auto' : '10px',
                  left: isVertical ? '50%' : 'auto',
                  transform: isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: (!sliderConfig.loop && currentSlide === children.length - 1) ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 999,
                  pointerEvents: 'auto'
                }}
              >
                {isVertical ? '▼' : '›'}
              </button>
              
              {/* Dots navigation */}
              <div style={{
                position: 'absolute',
                bottom: isVertical ? 'auto' : '15px',
                left: isVertical ? 'auto' : '50%',
                right: isVertical ? '15px' : 'auto',
                top: isVertical ? '50%' : 'auto',
                transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)',
                display: 'flex',
                flexDirection: isVertical ? 'column' : 'row',
                gap: '8px',
                zIndex: 3
              }}>
                {children.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Dot clicked:', index);
                      goToSlide(index);
                    }}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: index === currentSlide ? '#8b5cf6' : 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: 999,
                      pointerEvents: 'auto'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    };
    
    // Helper function to execute calculations for nested page elements
    const executePageElementCalculations = async (elements, allElements) => {
      const processedElements = [];
      
      for (const pageElement of elements) {
        let processedElement = { ...pageElement };
        
        // Execute calculations for text elements
        if (pageElement.type === 'text' && pageElement.properties?.value && isExecuteMode) {
          try {
            console.log('🧮 Executing calculation for nested page element:', pageElement.id, pageElement.properties.value);
            
            // Extract calculation storage (simplified)
            const calculationStorage = {};
            
            // Execute the calculation
            const executedValue = await executeTextCalculations(
              pageElement.properties.value,
              allElements, // Use all available elements for calculations
              calculationStorage,
              null // No repeating context for nested pages
            );
            
            console.log('🧮 Calculation result for', pageElement.id, ':', executedValue);
            
            // Update the element with the calculated value
            processedElement = {
              ...pageElement,
              properties: {
                ...pageElement.properties,
                value: executedValue
              }
            };
          } catch (error) {
            console.error(`Error executing calculation for nested page element ${pageElement.id}:`, error);
            // Keep original value if calculation fails
            processedElement = {
              ...pageElement,
              properties: {
                ...pageElement.properties,
                value: `[Error: ${error.message}]`
              }
            };
          }
        }
        
        // Recursively process children
        if (pageElement.children && pageElement.children.length > 0) {
          processedElement.children = await executePageElementCalculations(pageElement.children, allElements);
        }
        
        processedElements.push(processedElement);
      }
      
      return processedElements;
    };
    
    // Handle page content type - render selected page elements
    if (contentType === 'page' && element.pageConfig && element.pageConfig.selectedPageId) {
      const selectedScreen = availableScreens.find(screen => screen.id == element.pageConfig.selectedPageId);
      
      if (selectedScreen && selectedScreen.elements) {
        // Use the PageContainerWithParameters component to handle parameter execution and page content
        const pageElements = React.createElement(PageContainerWithParameters, {
          element,
          selectedScreen,
          availableScreens,
          isExecuteMode,
          depth,
          calculationResults,
          repeatingContainerData
        });
        
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
            onDragOver={(e) => {
              if (!isExecuteMode) {
                e.stopPropagation();
                onDragOver && onDragOver(e);
              }
            }}
            onDragLeave={(e) => {
              if (!isExecuteMode) {
                e.stopPropagation();
                onDragLeave && onDragLeave(e);
              }
            }}
            onDrop={(e) => {
              if (!isExecuteMode) {
                e.stopPropagation();
                onDrop && onDrop(e);
              }
            }}
            style={{
              ...containerStyle,
              position: 'relative',
              cursor: isExecuteMode ? 'default' : 'grab'
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
            {/* Container Label - Hide in execute mode */}
            {!isExecuteMode && (
              <div 
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  fontSize: '10px',
                  color: '#6f42c1',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid #6f42c1',
                  zIndex: 1,
                  pointerEvents: 'none',
                  fontWeight: 'bold'
                }}
              >
                Container (Page: {selectedScreen.name})
                {element.renderType === 'conditional' && (
                  <span style={{ color: '#007bff', marginLeft: '4px' }}>• Conditional</span>
                )}
              </div>
            )}
            
            {/* Delete Button - Hide in execute mode */}
            {!isExecuteMode && (
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
                  top: '4px',
                  right: '4px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  width: '18px',
                  height: '18px',
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
            
            {/* Page Content */}
            <PageContentContainer 
              pageElements={pageElements}
              selectedScreenName={selectedScreen.name}
              isExecuteMode={isExecuteMode}
              props={props}
            />
          </div>
        );
      } else {
        // No page selected or page not found
        return (
          <div
            key={element.id}
            style={{
              ...containerStyle,
              cursor: isExecuteMode ? 'default' : containerStyle.cursor
            }}
          >
            {/* Container Label - Hide in execute mode */}
            {!isExecuteMode && (
              <div 
                style={{
                  position: 'absolute',
                  top: '4px',
                  left: '4px',
                  fontSize: '10px',
                  color: '#6f42c1',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: '1px solid #6f42c1',
                  zIndex: 1,
                  pointerEvents: 'none',
                  fontWeight: 'bold'
                }}
              >
                Container (Page - No Page Selected)
                {element.renderType === 'conditional' && (
                  <span style={{ color: '#007bff', marginLeft: '4px' }}>• Conditional</span>
                )}
              </div>
            )}
            
            {/* Delete Button - Hide in execute mode */}
            {!isExecuteMode && (
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
                  top: '4px',
                  right: '4px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  width: '18px',
                  height: '18px',
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
            
            {/* Content Area */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: props.orientation || 'column',
              alignItems: props.horizontalAlignment || 'flex-start',
              justifyContent: props.verticalAlignment || 'flex-start',
              marginTop: isExecuteMode ? '0px' : '20px',
              gap: props.orientation === 'row' ? '10px' : '5px'
            }}>
              <div 
                style={{ 
                  color: '#6f42c1', 
                  fontSize: '14px', 
                  textAlign: 'center',
                  alignSelf: 'center',
                  margin: 'auto',
                  padding: '20px',
                  border: '2px dashed #6f42c1',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9ff',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ fontSize: '24px' }}>📄</div>
                <div style={{ fontWeight: 'bold' }}>Page Container</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>
                  {selectedScreen ? 'Selected page has no elements' : 'Select a page in the properties panel to display its content here'}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }
    
    // Handle tabs container in execute mode - elements are clickable tabs
    if (isExecuteMode && isTabsContainer && children && children.length > 0) {
      // FIXED: Check if we already have an active tab stored globally, otherwise use initial
      let currentActiveTab;
      if (element && element.id && window.__activeTabs && window.__activeTabs[element.id] !== undefined) {
        // Use the stored active tab
        currentActiveTab = window.__activeTabs[element.id];
        
      } else {
        // Use initial active tab from config
        currentActiveTab = getInitialActiveTab(tabsConfig, children);
        
        
        // Store it globally
        if (element && element.id) {
          window.__activeTabs = window.__activeTabs || {};
          window.__activeTabs[element.id] = currentActiveTab;
        }
      }
      
      // Create click handler for tab activation
      const handleTabClick = (tabIndex) => {
        
        
        // Initialize tabsConfig if it doesn't exist
        if (!element.tabsConfig) {
          element.tabsConfig = {
            activeTab: '1'
          };
          
        }
        
        if (element && element.tabsConfig) {
          element.tabsConfig.activeTab = String(tabIndex + 1); // Convert to 1-based string
          
          // Store active tab globally
          window.__activeTabs = window.__activeTabs || {};
          window.__activeTabs[element.id] = tabIndex;
          
   
          
          // Trigger a refresh to update active states
          setTimeout(() => {
            const buttons = document.querySelectorAll('button');
            for (const button of buttons) {
              const buttonText = button.textContent || '';
              if (buttonText.includes('Refresh') || buttonText.includes('🔄')) {
                
                button.click();
                break;
              }
            }
          }, 50);
        }
      };
      
      // Render all children with click handlers and active state
      return (
        <div
          key={element.id}
          style={{
            ...containerStyle,
            cursor: 'default'
          }}
        >
          {/* Container Label - Hide in execute mode */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: props.orientation || 'column',
            alignItems: props.horizontalAlignment || 'flex-start',
            justifyContent: props.verticalAlignment || 'flex-start',
            gap: props.orientation === 'row' ? '10px' : '5px'
          }}>
            {children.map((child, index) => {
              const isActiveTab = index === currentActiveTab;
              
              // Clone child with click handler and active state
              if (React.isValidElement(child)) {
                // Get the element definition to call its render function with isActiveTab
                const elementDef = getElementByType(child.props.element?.type);
                if (elementDef && elementDef.render) {
                  // Re-render the child element with isActiveTab prop
                  return React.cloneElement(
                    elementDef.render(
                      child.props.element,
                      depth + 1,
                      false, // not selected
                      false, // not drop zone
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          handleTabClick(index);
                        }
                      },
                      child.props.children,
                      null, // matchedConditionIndex
                      true, // isExecuteMode
                      false, // isActiveSlide
                      isActiveTab // isActiveTab
                    ),
                    {
                      key: child.key || index,
                      'data-active-tab': isActiveTab ? 'true' : 'false',
                      style: {
                        cursor: 'pointer'
                      }
                    }
                  );
                } else {
                  // Fallback to simple cloning
                  return React.cloneElement(child, {
                    ...child.props,
                    key: child.key || index,
                    isActiveTab: isActiveTab,
                    'data-active-tab': isActiveTab ? 'true' : 'false',
                    onClick: (e) => {
                      e.stopPropagation();
                      handleTabClick(index);
                    },
                    style: {
                      ...child.props.style,
                      cursor: 'pointer'
                    }
                  });
                }
              }
              return child;
            })}
          </div>
        </div>
      );
    }
    
    // Render slider component in execute mode, regular container otherwise
    if (isExecuteMode && isSliderContainer && children && children.length > 0) {
      // For sliders in execute mode, just use the children as-is (preserves repeating containers)
      // The active slide state will be handled by storing it globally
      return (
        <SliderComponent 
          children={children}
          sliderConfig={sliderConfig}
          containerStyle={containerStyle}
          props={props}
          element={element}
        />
      );
    }
    
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
        onDragOver={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDragOver && onDragOver(e);
          }
        }}
        onDragLeave={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDragLeave && onDragLeave(e);
          }
        }}
        onDrop={(e) => {
          if (!isExecuteMode) {
            e.stopPropagation();
            onDrop && onDrop(e);
          }
        }}
        style={{
          ...containerStyle,
          cursor: isExecuteMode ? 'default' : containerStyle.cursor
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
        {/* Container Label - Hide in execute mode */}
        {!isExecuteMode && (
          <div 
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              fontSize: '10px',
              color: isSliderContainer ? '#8b5cf6' : (contentType === 'repeating' ? '#28a745' : '#666'),
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2px 6px',
              borderRadius: '3px',
              border: `1px solid ${isSliderContainer ? '#8b5cf6' : (contentType === 'repeating' ? '#28a745' : '#ddd')}`,
              zIndex: 1,
              pointerEvents: 'none',
              fontWeight: (isSliderContainer || contentType === 'repeating') ? 'bold' : 'normal'
            }}
          >
            {getContainerLabel()}
            {element.renderType === 'conditional' && (
              <span style={{ color: '#007bff', marginLeft: '4px' }}>• Conditional</span>
            )}
          </div>
        )}
        
        {/* Delete Button - Hide in execute mode */}
        {!isExecuteMode && (
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
              top: '4px',
              right: '4px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              width: '18px',
              height: '18px',
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
        {!isExecuteMode && (
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '10px',
              color: '#999',
              cursor: 'grab',
              padding: '2px 4px',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          >
            ⋮⋮
          </div>
        )}

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: props.orientation || 'column',
          alignItems: props.horizontalAlignment || 'flex-start',
          justifyContent: props.verticalAlignment || 'flex-start',
          marginTop: isExecuteMode ? '0px' : '20px',
          gap: props.orientation === 'row' ? '10px' : '5px',
          // Slider-specific styles
          ...(isSliderContainer && {
            overflow: 'hidden',
            position: 'relative'
          })
        }}>
          {children && children.length > 0 ? (
            isSliderContainer && !isExecuteMode ? (
              // Slider wrapper for slides (builder mode)
              <div style={{
                display: 'flex',
                flexDirection: props.orientation === 'row' ? 'row' : 'column',
                width: props.orientation === 'row' ? `${children.length * 100}%` : '100%',
                height: props.orientation === 'column' ? `${children.length * 100}%` : '100%',
                transition: 'transform 0.3s ease-in-out',
                transform: props.orientation === 'row' 
                  ? `translateX(-${(parseInt(sliderConfig.activeTab) - 1) * (100 / children.length)}%)`
                  : `translateY(-${(parseInt(sliderConfig.activeTab) - 1) * (100 / children.length)}%)`
              }}>
                {children.map((child, index) => (
                  <div
                    key={child.key || index}
                    style={{
                      flex: '0 0 auto',
                      width: props.orientation === 'row' ? `${100 / children.length}%` : '100%',
                      height: props.orientation === 'column' ? `${100 / children.length}%` : '100%',
                      display: 'flex',
                      flexDirection: props.orientation === 'row' ? 'row' : 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      overflow: 'hidden',
                      gap: 0
                    }}
                  >
                    {child}
                  </div>
                ))}
              </div>
            ) : (
              !isSliderContainer && children
            )
          ) : (
            !isExecuteMode && (
              <div 
                onDragOver={(e) => {
                  e.stopPropagation();
                  onDragOver && onDragOver(e);
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  onDrop && onDrop(e);
                }}
                style={{ 
                  color: isDropZone ? '#0056b3' : '#999', 
                  fontSize: '12px', 
                  textAlign: 'center',
                  alignSelf: 'center',
                  margin: 'auto',
                  padding: '20px',
                  border: isDropZone 
                    ? '2px dashed #0056b3' 
                    : '2px dashed #ddd',
                  borderRadius: '4px',
                  backgroundColor: isDropZone ? '#ffffff' : 'transparent',
                  fontWeight: isDropZone ? 'bold' : 'normal',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isDropZone ? 'Release to drop here' : (isSliderContainer ? 'Drop slide elements here' : 'Drop elements here')}
              </div>
            )
          )}
        </div>
        
        {/* Slider Navigation Controls (only show in builder mode) */}
        {!isExecuteMode && isSliderContainer && children && children.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            zIndex: 2
          }}>
            {children.map((_, index) => (
              <div
                key={index}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: index === (parseInt(sliderConfig.activeTab) - 1) ? '#8b5cf6' : '#ccc',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // This would be handled by parent component in execute mode
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  },

  // Use the properties panel
  PropertiesPanel: ContainerPropertiesPanel
};
