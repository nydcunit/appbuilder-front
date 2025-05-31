import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';

// ============================================
// USE DATABASES HOOK
// ============================================

export const useDatabases = () => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Database operations
  const fetchDatabases = async () => {
    try {
      const response = await axios.get('/api/databases');
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching databases:', error);
      throw error;
    }
  };

  const createDatabase = async (name) => {
    setCreating(true);
    try {
      const response = await axios.post('/api/databases', { name });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create database');
    } catch (error) {
      console.error('Error creating database:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const deleteDatabase = async (databaseId) => {
    try {
      const response = await axios.delete(`/api/databases/${databaseId}`);
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete database');
    } catch (error) {
      console.error('Error deleting database:', error);
      throw error;
    }
  };

  // Table operations
  const fetchTables = async (databaseId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  };

  const createTable = async (databaseId, name) => {
    setCreating(true);
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables`, { name });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create table');
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const deleteTable = async (databaseId, tableId) => {
    try {
      const response = await axios.delete(`/api/databases/${databaseId}/tables/${tableId}`);
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete table');
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  // Column operations
  const fetchColumns = async (databaseId, tableId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/columns`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching columns:', error);
      throw error;
    }
  };

  const createColumn = async (databaseId, tableId, name) => {
    setCreating(true);
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/columns`, {
        name,
        type: 'string'
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create column');
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const deleteColumn = async (databaseId, tableId, columnId) => {
    try {
      const response = await axios.delete(`/api/databases/${databaseId}/tables/${tableId}/columns/${columnId}`);
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete column');
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  };

  // Record operations
  const fetchRecords = async (databaseId, tableId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/records`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  };

  const createRecord = async (databaseId, tableId, recordData) => {
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/records`, recordData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create record');
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  };

  const updateRecord = async (databaseId, tableId, recordId, updateData) => {
    try {
      const response = await axios.put(`/api/databases/${databaseId}/tables/${tableId}/records/${recordId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to update record');
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const deleteRecords = async (databaseId, tableId, recordIds) => {
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/records/delete-multiple`, {
        recordIds
      });
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete records');
    } catch (error) {
      console.error('Error deleting records:', error);
      throw error;
    }
  };

  return {
    loading,
    creating,
    // Database operations
    fetchDatabases,
    createDatabase,
    deleteDatabase,
    // Table operations
    fetchTables,
    createTable,
    deleteTable,
    // Column operations
    fetchColumns,
    createColumn,
    deleteColumn,
    // Record operations
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecords
  };
};

// ============================================
// DATABASE LIST COMPONENT
// ============================================

const DatabaseList = ({ databases, onSelectDatabase, onDatabasesChange }) => {
  const { createDatabase, deleteDatabase, creating } = useDatabases();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDbName, setNewDbName] = useState('');

  const handleCreateDatabase = async () => {
    if (!newDbName.trim()) return;
    
    try {
      const newDatabase = await createDatabase(newDbName);
      onDatabasesChange([...databases, newDatabase]);
      setNewDbName('');
      setShowCreateModal(false);
    } catch (error) {
      alert('Error creating database: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  const handleDeleteDatabase = async (databaseId, event) => {
    // Prevent triggering the card click when delete button is clicked
    event.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this database? This will permanently delete all tables and data.')) return;
    
    try {
      await deleteDatabase(databaseId);
      onDatabasesChange(databases.filter(db => db._id !== databaseId));
    } catch (error) {
      alert('Error deleting database: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <div>
      {/* Enhanced Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', color: '#333' }}>
            🗄️ My Databases
          </h1>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '1rem' }}>
            Manage your data collections and tables
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            boxShadow: '0 2px 4px rgba(40, 167, 69, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>+</span>
          Create Database
        </button>
      </div>

      {/* Database Grid or Empty State */}
      {databases.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗄️</div>
          <h3 style={{ color: '#666', marginBottom: '1rem', fontSize: '1.5rem' }}>No databases yet</h3>
          <p style={{ color: '#999', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
            Create your first database to start organizing and storing your data. 
            You can create tables, add columns, and manage records.
          </p>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>+</span>
            Create Your First Database
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {databases.map((db) => (
            <div 
              key={db._id} 
              onClick={() => onSelectDatabase(db)}
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                border: '1px solid #e9ecef'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.borderColor = '#007bff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#e9ecef';
              }}
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteDatabase(db._id, e)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(220, 53, 69, 0.1)',
                  color: '#dc3545',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                title="Delete Database"
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                  e.currentTarget.style.color = '#dc3545';
                }}
              >
                🗑️
              </button>
              
              {/* Database Card Content */}
              <div style={{ paddingRight: '2rem' }}>
                <div style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  🗄️
                  <div style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Active
                  </div>
                </div>
                
                <h3 style={{ 
                  marginBottom: '0.75rem', 
                  color: '#333',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {db.name}
                </h3>
                
                <div style={{ 
                  color: '#6c757d', 
                  fontSize: '0.9rem',
                  marginBottom: '1rem',
                  lineHeight: '1.4'
                }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    📅 Created: {new Date(db.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div>
                    🔧 Last updated: {new Date(db.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div style={{
                    color: '#007bff',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>Click to manage</span>
                    <span style={{ fontSize: '1.1rem' }}>→</span>
                  </div>
                  
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    color: '#495057',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                  }}>
                    ID: {db._id.slice(-6)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Database Modal */}
      {showCreateModal && (
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
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '1.5rem' }}>
              Create New Database
            </h3>
            <input
              type="text"
              placeholder="Enter database name..."
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#007bff'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#ddd'}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateDatabase()}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewDbName('');
                }}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateDatabase}
                disabled={creating || !newDbName.trim()}
                style={{
                  backgroundColor: creating || !newDbName.trim() ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: creating || !newDbName.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                {creating ? 'Creating...' : 'Create Database'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// ============================================
// DATABASE DETAIL COMPONENT
// ============================================

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

  // Enhanced editing state with CMD+A support and file upload prevention
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingCapsules, setEditingCapsules] = useState([]);
  const [originalValue, setOriginalValue] = useState('');
  const [isAllSelected, setIsAllSelected] = useState(false); // New state for CMD+A
  const [isUploadingFile, setIsUploadingFile] = useState(false); // Prevent blur during upload
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

  // Parse value into capsules for editing - properly handle file objects
  const parseValueToCapsules = (value) => {
    if (Array.isArray(value)) {
      return { capsules: value, text: '' };
    }
    
    // Handle single file object (already parsed)
    if (typeof value === 'object' && value?.isFile) {
      return { capsules: [value], text: '' };
    }
    
    // Handle string that might contain file objects or regular text
    if (typeof value === 'string') {
      // First, try to parse the entire string as a single JSON object
      if (value.includes('"isFile":true')) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object' && parsed.isFile) {
            return { capsules: [parsed], text: '' };
          }
        } catch (e) {
          console.log('Failed to parse as single JSON in edit mode:', e);
          // Continue to other parsing methods
        }
      }
      
      // Handle comma-separated values - BUT be smart about JSON objects with commas
      if (value.includes(',')) {
        // Smart splitting: don't split on commas that are inside JSON objects
        const parts = [];
        let currentPart = '';
        let braceCount = 0;
        let inQuotes = false;
        let escapeNext = false;
        
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          
          if (escapeNext) {
            currentPart += char;
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            currentPart += char;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inQuotes = !inQuotes;
          }
          
          if (!inQuotes) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
            }
          }
          
          if (char === ',' && braceCount === 0 && !inQuotes) {
            // This comma is a separator, not part of a JSON object
            parts.push(currentPart.trim());
            currentPart = '';
          } else {
            currentPart += char;
          }
        }
        
        // Add the last part
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
        }
        
        // Only treat as multiple parts if we actually have multiple parts
        if (parts.length > 1) {
          const capsules = [];
          
          parts.forEach(part => {
            // Try to parse each part as JSON
            if (part.includes('"isFile":true')) {
              try {
                const parsed = JSON.parse(part);
                if (parsed && typeof parsed === 'object' && parsed.isFile) {
                  capsules.push(parsed);
                } else {
                  capsules.push(part);
                }
              } catch (e) {
                console.log('Failed to parse part in edit mode:', part, e);
                capsules.push(part);
              }
            } else {
              capsules.push(part);
            }
          });
          
          return { capsules, text: '' };
        }
      }
      
      // Single text value
      return { capsules: [], text: value || '' };
    }
    
    return { capsules: [], text: '' };
  };

  // Convert capsules back to value for saving - properly handle file objects
  const capsulesAndTextToValue = (capsules, text) => {
    const allParts = [...capsules, ...(text.trim() ? [text.trim()] : [])];
    if (allParts.length === 0) return '';
    if (allParts.length === 1) {
      const part = allParts[0];
      // If it's a file object, save as JSON string
      if (typeof part === 'object' && part?.isFile) {
        return JSON.stringify(part);
      }
      return part;
    }
    
    // For multiple items, convert file objects to JSON strings and join with commas
    const processedParts = allParts.map(part => {
      if (typeof part === 'object' && part?.isFile) {
        return JSON.stringify(part);
      }
      return part;
    });
    return processedParts.join(', ');
  };

  const startEditing = (recordId, columnName, currentValue) => {
    const parsed = parseValueToCapsules(currentValue);
    
    setEditingCell({ recordId, columnName });
    setEditingCapsules(parsed.capsules);
    setEditingValue(parsed.text);
    setOriginalValue(currentValue);
    setIsAllSelected(false); // Reset selection state
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
    setIsAllSelected(false);
    setIsUploadingFile(false);
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
    setEditingCapsules([]);
    setOriginalValue('');
    setIsAllSelected(false);
    setIsUploadingFile(false);
  };

  // Handle blur with file upload protection
  const handleInputBlur = () => {
    // Don't save if we're in the middle of a file upload
    if (isUploadingFile) {
      console.log('Preventing blur during file upload');
      return;
    }
    saveEdit();
  };

  // FIXED: Remove capsule function for proper file deletion
  const removeCapsule = (indexToRemove) => {
    const newCapsules = editingCapsules.filter((_, index) => index !== indexToRemove);
    setEditingCapsules(newCapsules);
  };

  // Enhanced key handler with CMD+A support and FIXED file deletion
  const handleKeyPress = (e) => {
    console.log('Key pressed:', e.key, 'isAllSelected:', isAllSelected);
    
    // CMD+A or Ctrl+A - Select all content
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault();
      console.log('CMD+A pressed, setting isAllSelected to true');
      setIsAllSelected(true);
      
      // Ensure input stays focused
      if (inputRef.current) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 0);
      }
      return;
    }

    // If content is selected (CMD+A was pressed)
    if (isAllSelected) {
      console.log('Handling key while selected:', e.key);
      
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        console.log('Clearing all content');
        // Clear everything and return to normal editing mode
        setEditingCapsules([]);
        setEditingValue('');
        setIsAllSelected(false);
        
        // Ensure focus stays on input for continued typing
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
        return;
      } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Replace everything with new character (only for printable characters)
        e.preventDefault();
        console.log('Replacing all content with:', e.key);
        setEditingCapsules([]);
        setEditingValue(e.key);
        setIsAllSelected(false);
        
        // Ensure focus stays on input for continued typing
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 0);
        return;
      } else if (e.key === 'Enter') {
        // Save on Enter even when selected
        e.preventDefault();
        saveEdit();
        return;
      } else if (e.key === 'Escape') {
        // Cancel on Escape even when selected
        e.preventDefault();
        cancelEdit();
        return;
      } else {
        // For other keys (arrows, etc.), just reset selection
        console.log('Resetting selection for key:', e.key);
        setIsAllSelected(false);
      }
    }

    // Normal key handling (when not selected)
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
      // FIXED: When backspace is pressed and input is empty, remove the last capsule
      e.preventDefault();
      const newCapsules = [...editingCapsules];
      const removedCapsule = newCapsules.pop();
      setEditingCapsules(newCapsules);
      
      // FIXED: For file objects, don't put them back in the text field
      // Only put text back for regular string capsules
      if (typeof removedCapsule === 'string' && !isFileCapsule(removedCapsule)) {
        setEditingValue(removedCapsule);
      }
      // For file objects, just remove them completely (don't set editingValue)
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    
    if (files.length === 0) {
      setIsUploadingFile(false);
      return;
    }
    
    // Process each file and create file objects with metadata
    const fileObjects = files.map(file => {
      const fileObj = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        isFile: true
      };
      
      // For images, create thumbnail URL
      if (file.type.startsWith('image/')) {
        fileObj.thumbnailUrl = URL.createObjectURL(file);
        fileObj.isImage = true;
      } else {
        fileObj.isImage = false;
        // Extract file extension
        const extension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
        fileObj.extension = extension;
      }
      
      return fileObj;
    });
    
    // Add file objects to capsules
    setEditingCapsules([...editingCapsules, ...fileObjects]);
    setIsAllSelected(false);
    e.target.value = ''; // Reset file input
    
    // Reset upload state and refocus
    setIsUploadingFile(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    setIsUploadingFile(true);
    fileInputRef.current?.click();
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

  // Enhanced function to detect if a capsule is a file object
  const isFileCapsule = (capsule) => {
    // Check if it's a file object
    if (typeof capsule === 'object' && capsule?.isFile) {
      return true;
    }
    
    // Legacy check for file extensions in strings
    if (typeof capsule === 'string') {
      const fileExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.zip', '.mp4', '.mov', '.avi'];
      return fileExtensions.some(ext => capsule.toLowerCase().includes(ext));
    }
    
    return false;
  };

  // Function to get file type label from file object
  const getFileTypeLabel = (capsule) => {
    if (typeof capsule === 'object' && capsule?.isFile) {
      if (capsule.isImage) {
        return 'Image';
      }
      
      // Get file type from extension or MIME type
      const extension = capsule.extension?.toLowerCase();
      const mimeType = capsule.type?.toLowerCase();
      
      // Common file types
      if (extension === 'pdf' || mimeType?.includes('pdf')) return 'PDF';
      if (['doc', 'docx'].includes(extension) || mimeType?.includes('word')) return 'Document';
      if (['xls', 'xlsx'].includes(extension) || mimeType?.includes('sheet')) return 'Spreadsheet';
      if (['ppt', 'pptx'].includes(extension) || mimeType?.includes('presentation')) return 'Presentation';
      if (['txt'].includes(extension) || mimeType?.includes('text')) return 'Text';
      if (['zip', 'rar', '7z'].includes(extension) || mimeType?.includes('zip')) return 'Archive';
      if (['mp4', 'avi', 'mov', 'mkv'].includes(extension) || mimeType?.includes('video')) return 'Video';
      if (['mp3', 'wav', 'flac', 'aac'].includes(extension) || mimeType?.includes('audio')) return 'Audio';
      if (['json'].includes(extension) || mimeType?.includes('json')) return 'JSON';
      if (['csv'].includes(extension) || mimeType?.includes('csv')) return 'CSV';
      
      // Fallback to extension or generic file
      return extension ? extension.toUpperCase() : 'File';
    }
    
    return 'File';
  };

  // FIXED: Function to render file capsule with thumbnail (used in both edit and display modes)
  const renderFileCapsule = (capsule, index, isInEditMode = false) => {
    if (typeof capsule === 'object' && capsule?.isFile) {
      return (
        <div
          key={index}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#000',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            gap: '6px',
            maxWidth: '200px',
            margin: '2px'
          }}
        >
          {/* Thumbnail or Extension */}
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            backgroundColor: capsule.isImage ? 'transparent' : 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            fontWeight: 'bold',
            overflow: 'hidden'
          }}>
            {capsule.isImage ? (
              <img 
                src={capsule.thumbnailUrl} 
                alt={getFileTypeLabel(capsule)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  // Hide the broken image and show extension fallback
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span style="color: white; font-size: 8px; font-weight: bold;">${capsule.extension || 'IMG'}</span>`;
                  }
                }}
              />
            ) : (
              <span style={{ color: 'white' }}>{capsule.extension}</span>
            )}
          </div>
          
          {/* File type label instead of file name */}
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '140px'
          }}>
            {getFileTypeLabel(capsule)}
          </span>
        </div>
      );
    }
    
    // Legacy string-based file rendering
    if (typeof capsule === 'string' && isFileCapsule(capsule)) {
      return (
        <span
          key={index}
          style={{
            backgroundColor: '#000',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            margin: '2px'
          }}
        >
          {capsule}
        </span>
      );
    }
    
    // Regular text capsule
    return (
      <span
        key={index}
        style={{
          backgroundColor: '#f0f0f0',
          color: '#333',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          margin: '2px'
        }}
      >
        {typeof capsule === 'object' ? JSON.stringify(capsule) : capsule}
      </span>
    );
  };

  // FIXED: Main render function for cell content - Enhanced to handle multiple files properly
  const renderCellContent = (record, column) => {
    const value = record[column.name];
    
    // Handle null/undefined values
    if (!value) {
      return <span style={{ color: '#999' }}>Empty</span>;
    }
    
    // Handle array values
    if (Array.isArray(value)) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          {value.map((item, index) => (
            <React.Fragment key={index}>
              {renderFileCapsule(item, index, false)}
              {index < value.length - 1 && (
                <span style={{ color: '#666', fontSize: '12px' }}>,</span>
              )}
            </React.Fragment>
          ))}
        </div>
      );
    }
    
    // Handle single file object
    if (typeof value === 'object' && value?.isFile) {
      return renderFileCapsule(value, 0, false);
    }
    
    // FIXED: Handle string values - Enhanced multiple file parsing
    if (typeof value === 'string') {
      // Try to parse as single JSON object first (check for full JSON structure)
      if (value.trim().startsWith('{"') && value.trim().endsWith('"}') && value.includes('"isFile":true')) {
        try {
          const parsed = JSON.parse(value);
          if (parsed && typeof parsed === 'object' && parsed.isFile) {
            return renderFileCapsule(parsed, 0, false);
          }
        } catch (e) {
          console.log('Failed to parse single JSON:', e);
          // If parsing fails, fall through to string handling
        }
      }
      
      // ENHANCED: Better detection and parsing of multiple file objects
      if (value.includes('"isFile":true')) {
        // This contains file objects, let's parse them properly
        const parts = [];
        let currentPart = '';
        let braceCount = 0;
        let inQuotes = false;
        let escapeNext = false;
        
        for (let i = 0; i < value.length; i++) {
          const char = value[i];
          
          if (escapeNext) {
            currentPart += char;
            escapeNext = false;
            continue;
          }
          
          if (char === '\\') {
            escapeNext = true;
            currentPart += char;
            continue;
          }
          
          if (char === '"' && !escapeNext) {
            inQuotes = !inQuotes;
          }
          
          if (!inQuotes) {
            if (char === '{') {
              braceCount++;
            } else if (char === '}') {
              braceCount--;
              
              // When we close a JSON object (braceCount becomes 0), 
              // we might have a complete file object
              if (braceCount === 0 && currentPart.trim().startsWith('{')) {
                const potentialJson = currentPart + char;
                if (potentialJson.includes('"isFile":true')) {
                  try {
                    const parsed = JSON.parse(potentialJson);
                    if (parsed && typeof parsed === 'object' && parsed.isFile) {
                      parts.push(parsed);
                      currentPart = '';
                      continue;
                    }
                  } catch (e) {
                    // Continue building the current part
                  }
                }
              }
            }
          }
          
          // Handle comma separators when not inside JSON objects
          if (char === ',' && braceCount === 0 && !inQuotes) {
            const trimmedPart = currentPart.trim();
            if (trimmedPart) {
              // Try to parse as JSON first
              if (trimmedPart.includes('"isFile":true')) {
                try {
                  const parsed = JSON.parse(trimmedPart);
                  if (parsed && typeof parsed === 'object' && parsed.isFile) {
                    parts.push(parsed);
                  } else {
                    parts.push(trimmedPart);
                  }
                } catch (e) {
                  parts.push(trimmedPart);
                }
              } else {
                parts.push(trimmedPart);
              }
            }
            currentPart = '';
          } else {
            currentPart += char;
          }
        }
        
        // Handle the last part
        const trimmedPart = currentPart.trim();
        if (trimmedPart) {
          if (trimmedPart.includes('"isFile":true')) {
            try {
              const parsed = JSON.parse(trimmedPart);
              if (parsed && typeof parsed === 'object' && parsed.isFile) {
                parts.push(parsed);
              } else {
                parts.push(trimmedPart);
              }
            } catch (e) {
              parts.push(trimmedPart);
            }
          } else {
            parts.push(trimmedPart);
          }
        }
        
        // If we successfully parsed multiple parts, render them
        if (parts.length > 0) {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              {parts.map((part, index) => (
                <React.Fragment key={index}>
                  {renderFileCapsule(part, index, false)}
                  {index < parts.length - 1 && (
                    <span style={{ color: '#666', fontSize: '12px' }}>,</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        }
      }
      
      // Handle regular comma-separated values (non-file objects)
      if (value.includes(',') && !value.includes('"isFile":true')) {
        const parts = value.split(',').map(part => part.trim()).filter(part => part);
        if (parts.length > 1) {
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              {parts.map((part, index) => (
                <React.Fragment key={index}>
                  {renderFileCapsule(part, index, false)}
                  {index < parts.length - 1 && (
                    <span style={{ color: '#666', fontSize: '12px' }}>,</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        }
      }
      
      // Check if the entire string might be a malformed JSON object
      if (value.includes('"name"') && value.includes('"isFile"') && value.includes('true')) {
        try {
          // Try to clean up common JSON parsing issues
          let cleanedValue = value;
          
          // Fix common issues with JSON strings
          if (!cleanedValue.startsWith('{')) {
            cleanedValue = '{' + cleanedValue;
          }
          if (!cleanedValue.endsWith('}')) {
            cleanedValue = cleanedValue + '}';
          }
          
          const parsed = JSON.parse(cleanedValue);
          if (parsed && typeof parsed === 'object' && parsed.isFile) {
            return renderFileCapsule(parsed, 0, false);
          }
        } catch (e) {
          console.log('Failed to parse cleaned JSON:', e);
          // If still fails, fall through to regular string display
        }
      }
      
      // Single string value - display as regular text
      return <span style={{ color: '#333' }}>{value}</span>;
    }
    
    // Fallback for any other data types
    return <span style={{ color: '#333' }}>{String(value)}</span>;
  };

  const renderEditingCell = () => {
    // If all content is selected, show selected state with individual word selections
    if (isAllSelected) {
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
          {/* Show capsules with selected appearance */}
          {editingCapsules.map((capsule, index) => (
            <React.Fragment key={index}>
              <div
                style={{
                  backgroundColor: '#e3f2fd', // Selected blue background
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  flexShrink: 0,
                  border: '1px solid #2196f3' // Selected border
                }}
              >
                {typeof capsule === 'object' && capsule?.isFile ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#333'
                  }}>
                    {/* Thumbnail or Extension */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '2px',
                      backgroundColor: capsule.isImage ? 'transparent' : 'rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '6px',
                      fontWeight: 'bold',
                      overflow: 'hidden'
                    }}>
                      {capsule.isImage ? (
                        <img 
                          src={capsule.thumbnailUrl} 
                          alt={getFileTypeLabel(capsule)}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '2px'
                          }}
                          onError={(e) => {
                            // Hide the broken image and show extension fallback
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span style="color: #333; font-size: 6px; font-weight: bold;">${capsule.extension || 'IMG'}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span>{capsule.extension}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px' }}>{getFileTypeLabel(capsule)}</span>
                  </div>
                ) : (
                  <span style={{ color: '#333' }}>{capsule}</span>
                )}
              </div>
              {/* Comma remains unselected (white) */}
              <span style={{ color: '#666', fontSize: '12px', flexShrink: 0 }}>,</span>
            </React.Fragment>
          ))}
          
          {/* Show current text input with selected appearance if it has content */}
          {editingValue && (
            <>
              <span
                style={{
                  backgroundColor: '#e3f2fd', // Selected blue background
                  color: '#333',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  flexShrink: 0,
                  border: '1px solid #2196f3' // Selected border
                }}
              >
                {editingValue}
              </span>
            </>
          )}
          
          {/* Hidden input for keyboard handling - only when selected */}
          <input
            ref={inputRef}
            type="text"
            value=""
            onChange={() => {}} // No onChange needed, we handle via onKeyDown
            onKeyDown={handleKeyPress}
            autoFocus
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              zIndex: 10,
              cursor: 'text'
            }}
          />
          
          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <button
            onMouseDown={(e) => e.preventDefault()} // Prevent blur on input
            onClick={handleUploadClick}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: '8px'
            }}
          >
            + Upload
          </button>
        </div>
      );
    }

    // Normal editing view with capsules and FIXED individual file deletion
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
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              {renderFileCapsule(capsule, index, true)}
              {/* FIXED: Add delete button for each capsule */}
              <button
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
                onClick={() => removeCapsule(index)}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  fontSize: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>
            {/* Always show comma after each capsule */}
            <span style={{ color: '#666', fontSize: '12px', flexShrink: 0 }}>,</span>
          </React.Fragment>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyPress}
          placeholder={editingCapsules.length > 0 ? "Type to add item..." : "Type and press comma..."}
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
          onMouseDown={(e) => e.preventDefault()} // Prevent blur on input
          onClick={handleUploadClick}
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



// ============================================
// DATABASES ROUTER COMPONENT
// ============================================

const Databases = () => {
  // All hooks must be called at the top level
  const location = useLocation();
  const params = useParams();
  const { fetchDatabases } = useDatabases();
  const navigate = useNavigate();
  
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Check if we're on a detail page
  const isDetailPage = params.databaseId !== undefined;

  const loadDatabases = async () => {
    try {
      const databasesData = await fetchDatabases();
      setDatabases(databasesData);
    } catch (error) {
      console.error('Error loading databases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isDetailPage) {
      loadDatabases();
    }
  }, [isDetailPage]);
  
  // Conditional return after all hooks
  if (isDetailPage) {
    return <DatabaseDetail />;
  }

  const handleSelectDatabase = (database) => {
    navigate(`/databases/${database._id}`);
  };

  const handleDatabasesChange = (newDatabases) => {
    setDatabases(newDatabases);
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
      <DatabaseList 
        databases={databases}
        onSelectDatabase={handleSelectDatabase}
        onDatabasesChange={handleDatabasesChange}
      />
    </div>
  );
};



// Export the main Databases component
export default Databases;
