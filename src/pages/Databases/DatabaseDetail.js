import React, { useState, useEffect, useRef } from 'react';
import { useDatabases } from './hooks/useDatabases';

const DatabaseDetail = ({ database, onBack }) => {
  const { 
    fetchTables, createTable, deleteTable,
    fetchColumns, createColumn, deleteColumn,
    fetchRecords, createRecord, updateRecord, deleteRecords,
    creating 
  } = useDatabases();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [columns, setColumns] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedRows, setSelectedRows] = useState(new Set());

  const [showCreateTableModal, setShowCreateTableModal] = useState(false);
  const [showCreateColumnModal, setShowCreateColumnModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newColumnName, setNewColumnName] = useState('');

  // Google Sheets style editing
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef(null);

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

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const loadTables = async () => {
    try {
      const tablesData = await fetchTables(database._id);
      setTables(tablesData);
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
      setNewTableName('');
      setShowCreateTableModal(false);
    } catch (error) {
      alert('Error creating table: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    
    try {
      await deleteTable(database._id, tableId);
      setTables(tables.filter(table => table._id !== tableId));
      if (selectedTable && selectedTable._id === tableId) {
        setSelectedTable(null);
        setColumns([]);
        setRecords([]);
      }
    } catch (error) {
      alert('Error deleting table: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !selectedTable) return;
    
    try {
      const newColumn = await createColumn(database._id, selectedTable._id, newColumnName);
      setColumns([...columns, newColumn]);
      setNewColumnName('');
      setShowCreateColumnModal(false);
    } catch (error) {
      alert('Error creating column: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!window.confirm('Are you sure you want to delete this column?')) return;
    
    try {
      await deleteColumn(database._id, selectedTable._id, columnId);
      setColumns(columns.filter(column => column._id !== columnId));
      loadRecords(); // Refresh records to reflect column deletion
    } catch (error) {
      alert('Error deleting column: ' + (error.response?.data?.message || 'Unknown error'));
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

  // Google Sheets style editing functions
  const startEditing = (recordId, columnName, currentValue) => {
    setEditingCell({ recordId, columnName });
    setEditingValue(currentValue || '');
    setOriginalValue(currentValue || '');
  };

  const saveEdit = async () => {
    if (!editingCell) return;

    const { recordId, columnName } = editingCell;
    
    if (editingValue !== originalValue) {
      try {
        await updateRecord(database._id, selectedTable._id, recordId, {
          [columnName]: editingValue
        });
        
        setRecords(records.map(record => 
          record._id === recordId ? { ...record, [columnName]: editingValue } : record
        ));
      } catch (error) {
        alert('Error saving changes');
      }
    }

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

  const handleDeleteSelectedRecords = async () => {
    if (selectedRows.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.size} record(s)?`)) return;
    
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

  return (
    <div>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <button 
          onClick={onBack}
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
        <h1>{database.name}</h1>
      </div>

      {/* Table and Column Management */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        {/* Tables Section */}
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
                setEditingCell(null);
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
                onClick={() => handleDeleteTable(selectedTable._id)}
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

        {/* Columns Section */}
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
                      onClick={() => handleDeleteColumn(column._id)}
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
                onClick={handleAddRecord}
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
                  onClick={handleDeleteSelectedRecords}
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
                              cursor: 'text'
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
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTable()}
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
                onClick={handleCreateTable}
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
              onKeyPress={(e) => e.key === 'Enter' && handleCreateColumn()}
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
                onClick={handleCreateColumn}
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

export default DatabaseDetail;