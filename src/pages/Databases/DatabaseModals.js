import React, { useState } from 'react';

// ============================================
// CREATE DATABASE MODAL
// ============================================

export const CreateDatabaseModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setCreating(true);
    try {
      await onCreate(name);
      setName('');
      onClose();
    } catch (error) {
      alert('Error creating database: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
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
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            fontSize: '1rem',
            outline: 'none'
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
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
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            style={{
              backgroundColor: creating || !name.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: creating || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {creating ? 'Creating...' : 'Create Database'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CREATE TABLE MODAL
// ============================================

export const CreateTableModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setCreating(true);
    try {
      await onCreate(name);
      setName('');
      onClose();
    } catch (error) {
      alert('Error creating table: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
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
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            style={{
              padding: '10px 16px',
              backgroundColor: creating || !name.trim() ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: creating || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// CREATE COLUMN MODAL
// ============================================

export const CreateColumnModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setCreating(true);
    try {
      await onCreate(name);
      setName('');
      onClose();
    } catch (error) {
      alert('Error creating column: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
        />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
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
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            style={{
              padding: '10px 16px',
              backgroundColor: creating || !name.trim() ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: creating || !name.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
