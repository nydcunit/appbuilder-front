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

export default DatabaseList;