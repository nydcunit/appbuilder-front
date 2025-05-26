import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDatabases } from './hooks/useDatabases';

const DatabaseDetail = () => {
  const { databaseId } = useParams();
  const navigate = useNavigate();
  
  const { 
    fetchDatabases,
    fetchTables, createTable, deleteTable,
    fetchColumns, createColumn, deleteColumn,
    fetchRecords, createRecord, updateRecord, deleteRecords,
    creating 
  } = useDatabases();

  const [database, setDatabase] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [columnSearches, setColumnSearches] = useState({});

  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');

  // Enhanced editing state
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingCapsules, setEditingCapsules] = useState([]);
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDatabase();
  }, [databaseId]);

  useEffect(() => {
    if (database) {
      loadTables();
    }
  }, [database]);

  useEffect(() => {
    if (selectedTable) {
      loadColumns();
      loadRecords();
    }
  }, [selectedTable]);

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  const loadDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      const databases = await fetchDatabases();
      const foundDatabase = databases.find(db => db._id === databaseId);
      
      if (!foundDatabase) {
        setError('Database not found');
        return;
      }
      
      setDatabase(foundDatabase);
    } catch (error) {
      console.error('Error loading database:', error);
      setError('Failed to load database');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const tablesData = await fetchTables(database._id);
      setTables(tablesData);
      if (tablesData.length > 0 && !selectedTable) {
        setSelectedTable(tablesData[0]);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const loadColumns = async () => {
    try {
      const columnsData = await fetchColumns(database._id, selectedTable._id);
      setColumns(columnsData);
    } catch (error) {
      console.error('Error loading columns:', error);
    }
  };

  const loadRecords = async () => {
    try {
      const recordsData = await fetchRecords(database._id, selectedTable._id);
      setRecords(recordsData);
    } catch (error) {
      console.error('Error loading records:', error);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return;
    
    try {
      const newTable = await createTable(database._id, newTableName);
      setTables([...tables, newTable]);
      setSelectedTable(newTable);
      setNewTableName('');
      setShowCreateTableModal(false);
    } catch (error) {
      alert('Error creating table: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !selectedTable) return;
    
    try {
      // Always create as 'string' type since we removed type selection
      const newColumn = await createColumn(database._id, selectedTable._id, newColumnName);
      setColumns([...columns, newColumn]);
      setNewColumnName('');
      setShowCreateColumnModal(false);
    } catch (error) {
      alert('Error creating column: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleAddRecord = async () => {
    if (!selectedTable) return;
    
    const newRecord = {};
    columns.forEach(column => {
      newRecord[column.name] = '';
    });
    
    try {
      const record = await createRecord(database._id, selectedTable._id, newRecord);
      setRecords([...records, record]);
    } catch (error) {
      alert('Error adding record: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  // Parse value into capsules for editing - preserves commas in display
  const parseValueToCapsules = (value) => {
    if (Array.isArray(value)) {
      return { capsules: value, text: '' };
    }
    if (typeof value === 'string' && value.includes(',')) {
      const parts = value.split(',').map(part => part.trim()).filter(part => part);
      return { capsules: parts.slice(0, -1), text: parts[parts.length - 1] || '' };
    }
    return { capsules: [], text: value || '' };
  };

  // Convert capsules back to value for saving - includes commas in the saved value
  const capsulesAndTextToValue = (capsules, text) => {
    const allParts = [...capsules, ...(text.trim() ? [text.trim()] : [])];
    if (allParts.length === 0) return '';
    if (allParts.length === 1) return allParts[0];
    return allParts.join(', '); // Save with commas for proper display
  };

  const startEditing = (recordId, columnName, currentValue) => {
    const parsed = parseValueToCapsules(currentValue);
    
    setEditingCell({ recordId, columnName });
    setEditingCapsules(parsed.capsules);
    setEditingValue(parsed.text);
    setOriginalValue(currentValue);
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const { recordId, columnName } = editingCell;
    const newValue = capsulesAndTextToValue(editingCapsules, editingValue);
    
    if (JSON.stringify(newValue) !== JSON.stringify(originalValue)) {
      try {
        await updateRecord(database._id, selectedTable._id, recordId, {
          [columnName]: newValue
        });
        
        setRecords(records.map(record => 
          record._id === recordId ? { ...record, [columnName]: newValue } : record
        ));
      } catch (error) {
        alert('Error saving changes');
      }
    }

    setEditingCell(null);
    setEditingValue('');
    setEditingCapsules([]);
    setOriginalValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
    setEditingCapsules([]);
    setOriginalValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    } else if (e.key === ',') {
      e.preventDefault();
      if (editingValue.trim()) {
        setEditingCapsules([...editingCapsules, editingValue.trim()]);
        setEditingValue('');
      }
    } else if (e.key === 'Backspace' && editingValue === '' && editingCapsules.length > 0) {
      e.preventDefault();
      const newCapsules = [...editingCapsules];
      const removedCapsule = newCapsules.pop();
      setEditingCapsules(newCapsules);
      setEditingValue(removedCapsule);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileNames = files.map(file => file.name);
    setEditingCapsules([...editingCapsules, ...fileNames]);
    e.target.value = ''; // Reset file input
  };

  const handleDeleteSelectedRecords = async () => {
    if (selectedRows.size === 0) return;
    if (!window.confirm(`Delete ${selectedRows.size} record(s)?`)) return;
    
    try {
      const recordIds = Array.from(selectedRows);
      await deleteRecords(database._id, selectedTable._id, recordIds);
      setRecords(records.filter(record => !selectedRows.has(record._id)));
      setSelectedRows(new Set());
    } catch (error) {
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

  const updateColumnSearch = (columnName, value) => {
    setColumnSearches(prev => ({
      ...prev,
      [columnName]: value
    }));
  };

  const getFilteredRecords = () => {
    return records.filter(record => {
      return Object.entries(columnSearches).every(([columnName, searchValue]) => {
        if (!searchValue) return true;
        const recordValue = record[columnName];
        if (Array.isArray(recordValue)) {
          return recordValue.some(item => 
            String(item).toLowerCase().includes(searchValue.toLowerCase())
          );
        }
        return String(recordValue || '').toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  };

  // Detect if a capsule is likely a file (has file extension)
  const isFileCapsule = (capsule) => {
    const fileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip'];
    return fileExtensions.some(ext => capsule.toLowerCase().includes(ext));
  };

  const renderCellContent = (record, column) => {
    const value = record[column.name];
    
    if (Array.isArray(value)) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          {value.map((item, index) => (
            <React.Fragment key={index}>
              <span
                style={{
                  backgroundColor: isFileCapsule(item) ? '#000' : '#f0f0f0',
                  color: isFileCapsule(item) ? 'white' : '#333',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                {item}
              </span>
              {index < value.length - 1 && (
                <span style={{ color: '#666', fontSize: '12px' }}>,</span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'string' && value.includes(',')) {
      const parts = value.split(',').map(part => part.trim()).filter(part => part);
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span
                style={{
                  backgroundColor: isFileCapsule(part) ? '#000' : '#f0f0f0',
                  color: isFileCapsule(part) ? 'white' : '#333',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              >
                {part}
              </span>
              {index < parts.length - 1 && (
                <span style={{ color: '#666', fontSize: '12px' }}>,</span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    
    return <span style={{ color: value ? '#333' : '#999' }}>{value || 'Empty'}</span>;
  };

  const renderEditingCell = () => {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '4px',
        padding: '8px',
        border: '2px solid #007bff',
        borderRadius: '4px',
        backgroundColor: 'white',
        minHeight: '36px',
        width: '100%'
      }}>
        {editingCapsules.map((capsule, index) => (
          <React.Fragment key={index}>
            <span
              style={{
                backgroundColor: isFileCapsule(capsule) ? '#000' : '#f0f0f0',
                color: isFileCapsule(capsule) ? 'white' : '#333',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                flexShrink: 0
              }}
            >
              {capsule}
            </span>
            {/* Show comma after each capsule except the last one or when there's text being typed */}
            {(index < editingCapsules.length - 1 || editingValue === '') && (
              <span style={{ color: '#666', fontSize: '12px', flexShrink: 0 }}>,</span>
            )}
          </React.Fragment>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={handleKeyPress}
          placeholder="Type and press comma..."
          style={{
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '12px',
            minWidth: '100px',
            flex: 1
          }}
        />
        
        {/* Universal upload button for all columns */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          + Upload
        </button>
      </div>
    );
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
        Loading database...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '18px',
        color: '#dc3545'
      }}>
        <div style={{ marginBottom: '1rem' }}>{error}</div>
        <button 
          onClick={() => navigate('/databases')}
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Back to Databases
        </button>
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '20px' }}>
      {/* Minimal Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#333' 
        }}>
          Database Editor
        </h1>
      </div>

      {/* Control Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Database Dropdown */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            color: '#666', 
            marginBottom: '4px' 
          }}>
            Database
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
            backgroundColor: '#f8f9fa',
            minWidth: '200px'
          }}>
            <span style={{ fontSize: '14px' }}>📁</span>
            <span style={{ fontSize: '14px', color: '#333' }}>
              {database?.name}
            </span>
          </div>
        </div>

        {/* Table Dropdown */}
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '12px', 
            color: '#666', 
            marginBottom: '4px' 
          }}>
            Table
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <select
              value={selectedTable?._id || ''}
              onChange={(e) => {
                const table = tables.find(t => t._id === e.target.value);
                setSelectedTable(table || null);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                backgroundColor: 'white',
                fontSize: '14px',
                minWidth: '150px',
                outline: 'none'
              }}
            >
              <option value="">Select table</option>
              {tables.map(table => (
                <option key={table._id} value={table._id}>
                  📊 {table.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateTableModal(true)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              + New
            </button>
          </div>
        </div>

        {/* Column Management */}
        {selectedTable && (
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '12px', 
              color: '#666', 
              marginBottom: '4px' 
            }}>
              Column
            </label>
            <button
              onClick={() => setShowCreateColumnModal(true)}
              style={{
                padding: '8px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              📋 Columns
            </button>
          </div>
        )}

        {/* Add Row Button */}
        {selectedTable && columns.length > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <button
              onClick={handleAddRecord}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              📝 Add Row
            </button>
          </div>
        )}
      </div>

      {/* Data Table */}
      {selectedTable && columns.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              tableLayout: 'fixed' // Fixed table layout to prevent column width changes
            }}>
              <colgroup>
                <col style={{ width: '50px' }} />
                {columns.map(() => (
                  <col key={Math.random()} style={{ width: '200px' }} />
                ))}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <input
                      type="checkbox"
                      checked={filteredRecords.length > 0 && selectedRows.size === filteredRecords.length}
                      onChange={toggleAllRows}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  {columns.map(column => (
                    <th
                      key={column._id}
                      style={{
                        padding: '12px',
                        textAlign: 'left',
                        borderBottom: '1px solid #e0e0e0',
                        width: '200px' // Fixed width
                      }}
                    >
                      <div style={{ marginBottom: '8px' }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          color: '#333' 
                        }}>
                          {column.name}
                        </span>
                      </div>
                      <input
                        type="text"
                        placeholder="Search Here"
                        value={columnSearches[column.name] || ''}
                        onChange={(e) => updateColumnSearch(column.name, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: '#999',
                      fontStyle: 'italic'
                    }}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record, index) => (
                    <tr key={record._id}>
                      <td style={{
                        padding: '12px',
                        borderBottom: '1px solid #f0f0f0',
                        textAlign: 'center'
                      }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.has(record._id)}
                          onChange={() => toggleRowSelection(record._id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      {columns.map(column => (
                        <td
                          key={column._id}
                          style={{
                            padding: '0',
                            borderBottom: '1px solid #f0f0f0',
                            position: 'relative',
                            width: '200px' // Fixed width
                          }}
                        >
                          {editingCell && 
                           editingCell.recordId === record._id && 
                           editingCell.columnName === column.name ? (
                            <div style={{ padding: '8px' }}>
                              {renderEditingCell()}
                            </div>
                          ) : (
                            <div
                              onClick={() => startEditing(record._id, column.name, record[column.name])}
                              style={{
                                padding: '12px',
                                minHeight: '48px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'background-color 0.2s ease',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              {renderCellContent(record, column)}
                            </div>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty States */}
      {!selectedTable && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          Select a table to view and edit data
        </div>
      )}

      {selectedTable && columns.length === 0 && (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          No columns defined. Add columns to start storing data.
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
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Create New Table</h3>
            <input
              type="text"
              placeholder="Table name"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTable()}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateTableModal(false);
                  setNewTableName('');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTable}
                disabled={creating || !newTableName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: creating || !newTableName.trim() ? '#ccc' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: creating || !newTableName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified Create Column Modal - No Type Selection */}
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
            padding: '24px',
            borderRadius: '8px',
            width: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Create New Column</h3>
            <input
              type="text"
              placeholder="Column name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateColumn()}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateColumnModal(false);
                  setNewColumnName('');
                }}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f8f9fa',
                  color: '#333',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateColumn}
                disabled={creating || !newColumnName.trim()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: creating || !newColumnName.trim() ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: creating || !newColumnName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
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

export default DatabaseDetail;