import React, { useState } from 'react';
import { useDatabases } from './hooks/useDatabases';

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

  const handleDeleteDatabase = async (databaseId) => {
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
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1>Databases</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
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

      {/* Database Grid or Empty State */}
      {databases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: '#666', marginBottom: '1rem' }}>No databases yet</h3>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Create your first database to get started.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
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
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                position: 'relative'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDatabase(db._id);
                }}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Delete Database"
              >
                ×
              </button>
              
              {/* Database Card Content */}
              <div 
                onClick={() => onSelectDatabase(db)}
                style={{ width: '100%', height: '100%' }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗄️</div>
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{db.name}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Created: {new Date(db.createdAt).toLocaleDateString()}
                </p>
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
                  borderRadius: '4px',
                  cursor: 'pointer'
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
    </div>
  );
};

export default DatabaseList;