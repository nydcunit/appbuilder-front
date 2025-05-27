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

  // Parse value into capsules for editing - ALL comma-separated items become capsules
  const parseValueToCapsules = (value) => {
    if (Array.isArray(value)) {
      return { capsules: value, text: '' };
    }
    if (typeof value === 'string' && value.includes(',')) {
      const parts = value.split(',').map(part => part.trim()).filter(part => part);
      // ALL parts become capsules, text field starts empty for new item
      return { capsules: parts, text: '' };
    }
    // Single value without comma - keep as text for editing
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

  // Enhanced key handler with CMD+A support
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
      e.preventDefault();
      const newCapsules = [...editingCapsules];
      const removedCapsule = newCapsules.pop();
      setEditingCapsules(newCapsules);
      setEditingValue(removedCapsule);
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

  // Function to render file capsule with thumbnail
  const renderFileCapsule = (capsule, index) => {
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
            maxWidth: '200px'
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
                alt={capsule.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : (
              <span style={{ color: 'white' }}>{capsule.extension}</span>
            )}
          </div>
          
          {/* File name (truncated) */}
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '140px'
          }}>
            {capsule.name}
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
            fontSize: '12px'
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
          fontSize: '12px'
        }}
      >
        {capsule}
      </span>
    );
  };

  const renderCellContent = (record, column) => {
    const value = record[column.name];
    
    if (Array.isArray(value)) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
          {value.map((item, index) => (
            <React.Fragment key={index}>
              {renderFileCapsule(item, index)}
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
              {renderFileCapsule(part, index)}
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
                          alt={capsule.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '2px'
                          }}
                        />
                      ) : (
                        <span>{capsule.extension}</span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px' }}>{capsule.name}</span>
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

    // Normal editing view with capsules
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
            {renderFileCapsule(capsule, index)}
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

export default DatabaseDetail;