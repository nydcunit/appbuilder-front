import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Databases = () => {
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  
  const [showCreateDbModal, setShowCreateDbModal] = useState(false);
  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  
  const [newDbName, setNewDbName] = useState('');
  const [newTableName, setNewTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Google Sheets style editing
  const [editingCell, setEditingCell] = useState(null); // { recordId, columnName }
  const [editingValue, setEditingValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    if (selectedDatabase) {
      fetchTables(selectedDatabase._id);
    }
  }, [selectedDatabase]);

  useEffect(() => {
    if (selectedTable) {
      fetchColumns(selectedDatabase._id, selectedTable._id);
      fetchRecords(selectedDatabase._id, selectedTable._id);
    }
  }, [selectedTable, selectedDatabase]);

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const fetchDatabases = async () => {
    try {
      const response = await axios.get('/api/databases');
      if (response.data.success) {
        setDatabases(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching databases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async (databaseId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables`);
      if (response.data.success) {
        setTables(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchColumns = async (databaseId, tableId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/columns`);
      if (response.data.success) {
        setColumns(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  };

  const fetchRecords = async (databaseId, tableId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/records`);
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const createDatabase = async () => {
    if (!newDbName.trim()) return;
    
    setCreating(true);
    try {
      const response = await axios.post('/api/databases', { name: newDbName });
      if (response.data.success) {
        setDatabases([...databases, response.data.data]);
        setNewDbName('');
        setShowCreateDbModal(false);
      }
    } catch (error) {
      console.error('Error creating database:', error);
      alert('Error creating database: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const createTable = async () => {
    if (!newTableName.trim() || !selectedDatabase) return;
    
    setCreating(true);
    try {
      const response = await axios.post(`/api/databases/${selectedDatabase._id}/tables`, { 
        name: newTableName 
      });
      if (response.data.success) {
        setTables([...tables, response.data.data]);
        setNewTableName('');
        setShowCreateTableModal(false);
      }
    } catch (error) {
      console.error('Error creating table:', error);
      alert('Error creating table: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const createColumn = async () => {
    if (!newColumnName.trim() || !selectedDatabase || !selectedTable) return;
    
    setCreating(true);
    try {
      const response = await axios.post(`/api/databases/${selectedDatabase._id}/tables/${selectedTable._id}/columns`, {
        name: newColumnName,
        type: 'string'
      });
      if (response.data.success) {
        setColumns([...columns, response.data.data]);
        setNewColumnName('');
        setShowCreateColumnModal(false);
      }
    } catch (error) {
      console.error('Error creating column:', error);
      alert('Error creating column: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const deleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      const response = await axios.delete(`/api/databases/${selectedDatabase._id}/tables/${tableId}`);
      if (response.data.success) {
        setTables(tables.filter(table => table._id !== tableId));
        if (selectedTable && selectedTable._id === tableId) {
          setSelectedTable(null);
          setColumns([]);
          setRecords([]);
        }
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Error deleting table: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const deleteColumn = async (columnId) => {
    if (!window.confirm('Are you sure you want to delete this column?')) return;
    
    try {
      const response = await axios.delete(`/api/databases/${selectedDatabase._id}/tables/${selectedTable._id}/columns/${columnId}`);
      if (response.data.success) {
        setColumns(columns.filter(column => column._id !== columnId));
        // Refresh records to reflect column deletion
        fetchRecords(selectedDatabase._id, selectedTable._id);
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      alert('Error deleting column: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const addRecord = async () => {
    if (!selectedDatabase || !selectedTable) return;
    
    const newRecord = {};
    columns.forEach(column => {
      newRecord[column.name] = '';
    });
    
    try {
      const response = await axios.post(`/api/databases/${selectedDatabase._id}/tables/${selectedTable._id}/records`, newRecord);
      if (response.data.success) {
        setRecords([...records, response.data.data]);
      }
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Error adding record: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // Google Sheets style cell editing functions
  const startEditing = (recordId, columnName, currentValue) => {
    setEditingCell({ recordId, columnName });
    setEditingValue(currentValue || '');
    setOriginalValue(currentValue || '');
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const { recordId, columnName } = editingCell;
    
    // Only save if value actually changed
    if (editingValue !== originalValue) {
      try {
        const response = await axios.put(`/api/databases/${selectedDatabase._id}/tables/${selectedTable._id}/records/${recordId}`, {
          [columnName]: editingValue
        });
        
        if (response.data.success) {
          // Update local state
          setRecords(records.map(record => 
            record._id === recordId ? { ...record, [columnName]: editingValue } : record
          ));
        }
      } catch (error) {
        console.error('Error updating record:', error);
        alert('Error saving changes');
      }
    }

    // Clear editing state
    setEditingCell(null);
    setEditingValue('');
    setOriginalValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
    setOriginalValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const deleteSelectedRecords = async () => {
    if (selectedRows.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.size} record(s)?`)) return;
    
    try {
      const recordIds = Array.from(selectedRows);
      const response = await axios.post(`/api/databases/${selectedDatabase._id}/tables/${selectedTable._id}/records/delete-multiple`, {
        recordIds
      });
      if (response.data.success) {
        setRecords(records.filter(record => !selectedRows.has(record._id)));
        setSelectedRows(new Set());
      }
    } catch (error) {
      console.error('Error deleting records:', error);
      alert('Error deleting records: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const toggleRowSelection = (recordId) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(recordId)) {
      newSelection.delete(recordId);
    } else {
      newSelection.add(recordId);
    }
    setSelectedRows(newSelection);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === records.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(records.map(record => record._id)));
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading databases...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {!selectedDatabase ? (
        // Database List View
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
            <h1>Databases</h1>
            <button 
              onClick={() => setShowCreateDbModal(true)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              + Create Database
            </button>
          </div>

          {databases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <h3 style={{ color: '#666', marginBottom: '1rem' }}>No databases yet</h3>
              <p style={{ color: '#999', marginBottom: '2rem' }}>Create your first database to get started.</p>
              <button 
                onClick={() => setShowCreateDbModal(true)}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '6px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Create Your First Database
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {databases.map((db) => (
                <div 
                  key={db._id} 
                  onClick={() => setSelectedDatabase(db)}
                  style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗄️</div>
                  <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{db.name}</h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Created: {new Date(db.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Database Detail View
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '2rem',
            gap: '1rem'
          }}>
            <button 
              onClick={() => {
                setSelectedDatabase(null);
                setSelectedTable(null);
                setTables([]);
                setColumns([]);
                setRecords([]);
                setEditingCell(null);
              }}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ← Back
            </button>
            <h1>{selectedDatabase.name}</h1>
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            {/* Tables Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Tables:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={selectedTable?._id || ''}
                  onChange={(e) => {
                    const table = tables.find(t => t._id === e.target.value);
                    setSelectedTable(table || null);
                    setEditingCell(null); // Cancel any editing when switching tables
                  }}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    minWidth: '150px'
                  }}
                >
                  <option value="">Select a table</option>
                  {tables.map(table => (
                    <option key={table._id} value={table._id}>{table.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowCreateTableModal(true)}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + New
                </button>
                {selectedTable && (
                  <button 
                    onClick={() => deleteTable(selectedTable._id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Columns Dropdown */}
            {selectedTable && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Columns:
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      minWidth: '150px'
                    }}
                  >
                    <option value="">Column management</option>
                    {columns.map(column => (
                      <option key={column._id} value={column._id}>
                        {column.name}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowCreateColumnModal(true)}
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + New
                  </button>
                </div>
                {columns.length > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    {columns.map(column => (
                      <span 
                        key={column._id}
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#f8f9fa',
                          padding: '0.25rem 0.5rem',
                          marginRight: '0.5rem',
                          marginBottom: '0.25rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          border: '1px solid #dee2e6'
                        }}
                      >
                        {column.name}
                        <button
                          onClick={() => deleteColumn(column._id)}
                          style={{
                            marginLeft: '0.5rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Data Table */}
          {selectedTable && columns.length > 0 && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1rem' 
              }}>
                <h3>Data ({records.length} records)</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={addRecord}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Record
                  </button>
                  {selectedRows.size > 0 && (
                    <button 
                      onClick={deleteSelectedRecords}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Selected ({selectedRows.size})
                    </button>
                  )}
                </div>
              </div>

              <div style={{ 
                overflowX: 'auto',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ 
                        padding: '1rem', 
                        borderBottom: '1px solid #dee2e6',
                        textAlign: 'left'
                      }}>
                        <input
                          type="checkbox"
                          checked={records.length > 0 && selectedRows.size === records.length}
                          onChange={toggleAllRows}
                        />
                      </th>
                      {columns.map(column => (
                        <th key={column._id} style={{ 
                          padding: '1rem', 
                          borderBottom: '1px solid #dee2e6',
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}>
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => (
                      <tr key={record._id} style={{ 
                        backgroundColor: selectedRows.has(record._id) ? '#e3f2fd' : 'white'
                      }}>
                        <td style={{ 
                          padding: '1rem', 
                          borderBottom: '1px solid #dee2e6'
                        }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(record._id)}
                            onChange={() => toggleRowSelection(record._id)}
                          />
                        </td>
                        {columns.map(column => (
                          <td key={column._id} style={{ 
                            padding: '0', 
                            borderBottom: '1px solid #dee2e6',
                            position: 'relative'
                          }}>
                            {editingCell && editingCell.recordId === record._id && editingCell.columnName === column.name ? (
                              <input
                                ref={inputRef}
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={saveEdit}
                                onKeyDown={handleKeyPress}
                                style={{
                                  width: '100%',
                                  padding: '1rem',
                                  border: '2px solid #007bff',
                                  outline: 'none',
                                  backgroundColor: 'white'
                                }}
                              />
                            ) : (
                              <div
                                onClick={() => startEditing(record._id, column.name, record[column.name])}
                                style={{
                                  padding: '1rem',
                                  minHeight: '50px',
                                  cursor: 'text',
                                  borderRadius: '0',
                                  '&:hover': {
                                    backgroundColor: '#f8f9fa'
                                  }
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                {record[column.name] || ''}
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Database Modal */}
      {showCreateDbModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Database</h3>
            <input
              type="text"
              placeholder="Database name"
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1.5rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && createDatabase()}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateDbModal(false);
                  setNewDbName('');
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={createDatabase}
                disabled={creating || !newDbName.trim()}
                style={{
                  backgroundColor: creating || !newDbName.trim() ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: creating || !newDbName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Table Modal */}
      {showCreateTableModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Table</h3>
            <input
              type="text"
              placeholder="Table name"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1.5rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && createTable()}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateTableModal(false);
                  setNewTableName('');
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={createTable}
                disabled={creating || !newTableName.trim()}
                style={{
                  backgroundColor: creating || !newTableName.trim() ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: creating || !newTableName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Column Modal */}
      {showCreateColumnModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Column</h3>
            <input
              type="text"
              placeholder="Column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1.5rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && createColumn()}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateColumnModal(false);
                  setNewColumnName('');
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={createColumn}
                disabled={creating || !newColumnName.trim()}
                style={{
                  backgroundColor: creating || !newColumnName.trim() ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: creating || !newColumnName.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Databases;