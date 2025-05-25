import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await axios.get('/api/apps');
      if (response.data.success) {
        setApps(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      alert('Error loading apps: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const createApp = async () => {
    if (!newAppName.trim()) return;
    
    setCreating(true);
    try {
      const response = await axios.post('/api/apps', { 
        name: newAppName,
        description: '' 
      });
      
      if (response.data.success) {
        setApps([...apps, response.data.data]);
        setNewAppName('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating app:', error);
      alert('Error creating app: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const deleteApp = async (appId) => {
    if (!window.confirm('Are you sure you want to delete this app?')) return;
    
    try {
      const response = await axios.delete(`/api/apps/${appId}`);
      if (response.data.success) {
        setApps(apps.filter(app => app._id !== appId));
      }
    } catch (error) {
      console.error('Error deleting app:', error);
      alert('Error deleting app: ' + (error.response?.data?.message || 'Unknown error'));
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
        Loading your apps...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1>My Apps</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          + Create New App
        </button>
      </div>

      {apps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h3 style={{ color: '#666', marginBottom: '1rem' }}>No apps yet</h3>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Get started by creating your first app.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Create Your First App
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {apps.map((app) => (
            <div key={app._id} style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{app.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Created: {new Date(app.createdAt).toLocaleDateString()}
              </p>
              <p style={{ fontSize: '12px', color: '#888' }}>
                {app.screens?.length || 1} screen{(app.screens?.length || 1) !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link to={`/builder/${app._id}`}>
                  <button style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Edit
                  </button>
                </Link>
                <button 
                  onClick={() => deleteApp(app._id)}
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
              </div>
            </div>
          ))}
        </div>
      )}

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
            <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Create New App</h3>
            <input
              type="text"
              placeholder="App name"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                marginBottom: '1.5rem',
                fontSize: '1rem'
              }}
              onKeyPress={(e) => e.key === 'Enter' && createApp()}
            />
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setNewAppName('');
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
                onClick={createApp}
                disabled={creating || !newAppName.trim()}
                style={{
                  backgroundColor: creating || !newAppName.trim() ? '#ccc' : '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  cursor: creating || !newAppName.trim() ? 'not-allowed' : 'pointer'
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

export default Dashboard;