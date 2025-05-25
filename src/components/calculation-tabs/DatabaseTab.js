import React, { useState, useCallback, useEffect } from 'react';
import SuperText from '../SuperText';
import axios from 'axios';

const DatabaseTab = ({ config, onUpdate, availableElements = [], parentZIndex = 1000 }) => {
  const [databases, setDatabases] = useState([]);
  const [tables, setTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(config.filters || []);

  // Fetch user's databases on mount
  useEffect(() => {
    fetchDatabases();
  }, []);

  // Fetch tables when database is selected
  useEffect(() => {
    if (config.databaseId) {
      fetchTables(config.databaseId);
    } else {
      setTables([]);
      setColumns([]);
    }
  }, [config.databaseId]);

  // Fetch columns when table is selected
  useEffect(() => {
    if (config.databaseId && config.tableId) {
      fetchColumns(config.databaseId, config.tableId);
    } else {
      setColumns([]);
    }
  }, [config.databaseId, config.tableId]);

  // Update filters when config changes
  useEffect(() => {
    setFilters(config.filters || []);
  }, [config.filters]);

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

  const handleDatabaseSelect = useCallback((databaseId) => {
    onUpdate({
      databaseId,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null
    });
    setTables([]);
    setColumns([]);
    setFilters([]);
  }, [onUpdate]);

  const handleTableSelect = useCallback((tableId) => {
    onUpdate({
      ...config,
      tableId,
      filters: [],
      selectedColumn: null
    });
    setFilters([]);
  }, [config, onUpdate]);

  const handleAddFilter = useCallback(() => {
    const newFilter = {
      id: Date.now().toString(),
      column: '',
      operator: 'equals',
      value: '',
      logic: filters.length > 0 ? 'and' : null
    };
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    onUpdate({ ...config, filters: newFilters });
  }, [filters, config, onUpdate]);

  const handleRemoveFilter = useCallback((filterId) => {
    const newFilters = filters.filter(f => f.id !== filterId);
    setFilters(newFilters);
    onUpdate({ ...config, filters: newFilters });
  }, [filters, config, onUpdate]);

  const handleFilterUpdate = useCallback((filterId, field, value) => {
    const newFilters = filters.map(filter => 
      filter.id === filterId ? { ...filter, [field]: value } : filter
    );
    setFilters(newFilters);
    onUpdate({ ...config, filters: newFilters });
  }, [filters, config, onUpdate]);

  const handleActionChange = useCallback((action) => {
    onUpdate({ ...config, action });
  }, [config, onUpdate]);

  const handleColumnSelect = useCallback((columnId) => {
    onUpdate({ ...config, selectedColumn: columnId });
  }, [config, onUpdate]);

  const renderDatabaseSelection = () => (
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
        value={config.databaseId || ''}
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

      {config.databaseId && (
        <select
          value={config.tableId || ''}
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
  );

  const renderFilters = () => (
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
          Filter
        </label>
        <div>
          <button
            onClick={handleAddFilter}
            disabled={!config.tableId || columns.length === 0}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginRight: '8px',
              opacity: (!config.tableId || columns.length === 0) ? 0.5 : 1
            }}
          >
            +
          </button>
          {filters.length > 0 && (
            <button
              onClick={() => {
                setFilters([]);
                onUpdate({ ...config, filters: [] });
              }}
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
              ×
            </button>
          )}
        </div>
      </div>

      {filters.map((filter, index) => (
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

          {/* Value Input using SuperText */}
          <SuperText
            label=""
            placeholder="Type Here"
            value={filter.value}
            onChange={(value) => handleFilterUpdate(filter.id, 'value', value)}
            availableElements={availableElements}
          />

          {/* Remove button for first filter */}
          {index === 0 && filters.length > 1 && (
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

      {/* Add Filter Set Button */}
      {filters.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button
            onClick={handleAddFilter}
            style={{
              backgroundColor: '#333',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Add Filter Set
          </button>
        </div>
      )}
    </div>
  );

  const renderAction = () => (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        Action
      </label>

      <select
        value={config.action || 'value'}
        onChange={(e) => handleActionChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white',
          marginBottom: '12px'
        }}
      >
        <option value="value">Value Of Column</option>
        <option value="values">Values Of Columns</option>
        <option value="count">Number of Rows</option>
      </select>

      {(config.action === 'value' || config.action === 'values') && (
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            color: '#555',
            marginBottom: '4px'
          }}>
            Select column
          </label>
          <select
            value={config.selectedColumn || ''}
            onChange={(e) => handleColumnSelect(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px',
              backgroundColor: 'white'
            }}
          >
            <option value="">Select</option>
            {columns.map((column) => (
              <option key={column._id} value={column.name}>
                {column.name} ({column.type})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

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
          Database value(s)
        </label>
        <button
          onClick={() => {
            onUpdate({
              source: 'database',
              databaseId: null,
              tableId: null,
              filters: [],
              action: 'value',
              selectedColumn: null
            });
            setFilters([]);
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

      {renderDatabaseSelection()}
      
      {config.tableId && renderFilters()}
      
      {config.tableId && renderAction()}

      {/* Database Connection Status */}
      {databases.length === 0 && !loading && !error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          color: '#856404',
          borderRadius: '6px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          No databases found. Create a database first to use database calculations.
        </div>
      )}
    </div>
  );
};

export default DatabaseTab;