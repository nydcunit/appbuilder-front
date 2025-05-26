import React, { useState, useCallback, memo, useEffect } from 'react';
import ConditionBlock from '../components/ConditionBlock';
import axios from 'axios';

// Separate memoized properties panel component
const ContainerPropertiesPanel = memo(({ element, onUpdate, availableElements = [] }) => {
  const props = element.properties || {};
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Content settings with defaults
  const contentType = element.contentType || 'fixed';
  const repeatingConfig = element.repeatingConfig || {
    databaseId: null,
    tableId: null,
    filters: []
  };

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

  // Stable update function for properties
  const updateProperty = useCallback((key, value) => {
    onUpdate({
      properties: {
        ...props,
        [key]: value
      }
    });
  }, [props, onUpdate]);

  // Handle condition updates (these go on the element itself, not properties)
  const handleConditionUpdate = useCallback((updates) => {
    onUpdate(updates);
  }, [onUpdate]);

  // Handle content type change
  const handleContentTypeChange = useCallback((type) => {
    onUpdate({
      contentType: type,
      ...(type === 'repeating' && {
        repeatingConfig: {
          databaseId: null,
          tableId: null,
          filters: []
        }
      })
    });
  }, [onUpdate]);

  // Handle repeating config updates
  const updateRepeatingConfig = useCallback((updates) => {
    onUpdate({
      repeatingConfig: {
        ...repeatingConfig,
        ...updates
      }
    });
  }, [repeatingConfig, onUpdate]);

  // Handle database selection
  const handleDatabaseSelect = useCallback((databaseId) => {
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
    updateRepeatingConfig({
      ...repeatingConfig,
      tableId,
      filters: []
    });
  }, [repeatingConfig, updateRepeatingConfig]);

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

  // Get current value directly from props
  const getValue = useCallback((key) => {
    return props[key] ?? '';
  }, [props]);

  // Handle copying element ID to clipboard
  const copyElementId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(element.id);
      console.log('Element ID copied to clipboard');
    } catch (err) {
      console.error('Failed to copy element ID:', err);
    }
  }, [element.id]);

  const renderContentTabs = () => (
    <div style={{
      display: 'flex',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      padding: '4px',
      marginBottom: '16px'
    }}>
      {['fixed', 'repeating'].map((tab) => (
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

      {/* Content Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Content
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
      </div>

      {/* Condition Block */}
      <ConditionBlock
        element={element}
        onUpdate={handleConditionUpdate}
        availableElements={availableElements}
      />
      
      {/* Layout Properties */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Layout
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Width:
          </label>
          <input
            type="text"
            value={getValue('width')}
            onChange={(e) => handleInputChange('width', e.target.value)}
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
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Height:
          </label>
          <input
            type="text"
            value={getValue('height')}
            onChange={(e) => handleInputChange('height', e.target.value)}
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
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Direction:
          </label>
          <select
            value={getValue('orientation')}
            onChange={(e) => updateProperty('orientation', e.target.value)}
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
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            V-Align:
          </label>
          <select
            value={getValue('verticalAlignment')}
            onChange={(e) => updateProperty('verticalAlignment', e.target.value)}
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
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            H-Align:
          </label>
          <select
            value={getValue('horizontalAlignment')}
            onChange={(e) => updateProperty('horizontalAlignment', e.target.value)}
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
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Styling
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Background:
          </label>
          <input
            type="color"
            value={getValue('backgroundColor')}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
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
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Spacing
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Margin:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('marginTop')}
              onChange={(e) => handleInputChange('marginTop', parseInt(e.target.value) || 0)}
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
              value={getValue('marginBottom')}
              onChange={(e) => handleInputChange('marginBottom', parseInt(e.target.value) || 0)}
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
              value={getValue('marginLeft')}
              onChange={(e) => handleInputChange('marginLeft', parseInt(e.target.value) || 0)}
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
              value={getValue('marginRight')}
              onChange={(e) => handleInputChange('marginRight', parseInt(e.target.value) || 0)}
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Padding:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('paddingTop')}
              onChange={(e) => handleInputChange('paddingTop', parseInt(e.target.value) || 0)}
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
              value={getValue('paddingBottom')}
              onChange={(e) => handleInputChange('paddingBottom', parseInt(e.target.value) || 0)}
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
              value={getValue('paddingLeft')}
              onChange={(e) => handleInputChange('paddingLeft', parseInt(e.target.value) || 0)}
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
              value={getValue('paddingRight')}
              onChange={(e) => handleInputChange('paddingRight', parseInt(e.target.value) || 0)}
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
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Border Radius
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Corners:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('borderRadiusTopLeft')}
              onChange={(e) => handleInputChange('borderRadiusTopLeft', parseInt(e.target.value) || 0)}
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
              value={getValue('borderRadiusTopRight')}
              onChange={(e) => handleInputChange('borderRadiusTopRight', parseInt(e.target.value) || 0)}
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
              value={getValue('borderRadiusBottomLeft')}
              onChange={(e) => handleInputChange('borderRadiusBottomLeft', parseInt(e.target.value) || 0)}
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
              value={getValue('borderRadiusBottomRight')}
              onChange={(e) => handleInputChange('borderRadiusBottomRight', parseInt(e.target.value) || 0)}
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
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Shadow
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Color:
          </label>
          <input
            type="color"
            value={getValue('shadowColor')}
            onChange={(e) => updateProperty('shadowColor', e.target.value)}
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
            value={getValue('shadowX')}
            onChange={(e) => handleInputChange('shadowX', parseInt(e.target.value) || 0)}
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
            value={getValue('shadowY')}
            onChange={(e) => handleInputChange('shadowY', parseInt(e.target.value) || 0)}
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
            value={getValue('shadowBlur')}
            onChange={(e) => handleInputChange('shadowBlur', parseInt(e.target.value) || 0)}
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
    </div>
  );
});

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
    shadowBlur: 0
  }),
  
  getDefaultChildren: () => ([]),

  // Render the element in the canvas (same as before)
  render: (element, depth = 0, isSelected = false, isDropZone = false, handlers = {}, children = null) => {
    const { onClick, onDelete, onDragOver, onDragLeave, onDrop, onDragStart } = handlers;
    const props = element.properties || {};
    const contentType = element.contentType || 'fixed';
    
    // Build styles from properties
    const containerStyle = {
      // Layout
      width: props.width || 'auto',
      height: props.height || 'auto',
      display: 'flex',
      flexDirection: props.orientation || 'column',
      alignItems: props.horizontalAlignment || 'flex-start',
      justifyContent: props.verticalAlignment || 'flex-start',
      
      // Styling
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
      minHeight: '80px',
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

    // Determine container label based on content type
    const getContainerLabel = () => {
      if (contentType === 'repeating') {
        const config = element.repeatingConfig;
        if (config && config.databaseId && config.tableId) {
          return `Repeating Container`;
        }
        return 'Repeating Container (No Data)';
      }
      return `Container (${props.orientation || 'column'})`;
    };
    
    return (
      <div
        key={element.id}
        draggable={true}
        onClick={(e) => onClick && onClick(element, e)}
        onDragStart={(e) => {
          e.stopPropagation();
          onDragStart && onDragStart(e);
        }}
        onDragOver={(e) => {
          e.stopPropagation();
          onDragOver && onDragOver(e);
        }}
        onDragLeave={(e) => {
          e.stopPropagation();
          onDragLeave && onDragLeave(e);
        }}
        onDrop={(e) => {
          e.stopPropagation();
          onDrop && onDrop(e);
        }}
        style={containerStyle}
        onMouseDown={(e) => {
          e.currentTarget.style.cursor = 'grabbing';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.cursor = 'grab';
        }}
      >
        {/* Container Label */}
        <div 
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '10px',
            color: contentType === 'repeating' ? '#28a745' : '#666',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2px 6px',
            borderRadius: '3px',
            border: `1px solid ${contentType === 'repeating' ? '#28a745' : '#ddd'}`,
            zIndex: 1,
            pointerEvents: 'none',
            fontWeight: contentType === 'repeating' ? 'bold' : 'normal'
          }}
        >
          {getContainerLabel()}
        </div>
        
        {/* Delete Button */}
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

        {/* Drag Handle */}
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

        {/* Content Area */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: props.orientation || 'column',
          alignItems: props.horizontalAlignment || 'flex-start',
          justifyContent: props.verticalAlignment || 'flex-start',
          minHeight: '50px',
          marginTop: '20px',
          gap: props.orientation === 'row' ? '10px' : '5px'
        }}>
          {children && children.length > 0 ? (
            children
          ) : (
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
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isDropZone ? 'Release to drop here' : 'Drop elements here'}
            </div>
          )}
        </div>
      </div>
    );
  },

  // Use the updated properties panel with Content section
  PropertiesPanel: ContainerPropertiesPanel
};