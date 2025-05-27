import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ContainerContentSettings = ({ element, onUpdate }) => {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FIXED: Content settings with proper defaults and initialization
  const contentType = element.contentType || 'fixed';
  const repeatingConfig = element.repeatingConfig || {
    databaseId: null,
    tableId: null,
    filters: []
  };

  console.log('Container Content Settings - Current State:', {
    elementId: element.id,
    contentType,
    repeatingConfig,
    elementContentType: element.contentType,
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
        Debug: contentType={contentType}, has repeatingConfig={!!element.repeatingConfig}
      </div>
      
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
  );
};

export default ContainerContentSettings;