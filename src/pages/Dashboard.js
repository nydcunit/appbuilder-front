import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import CreateAppWizardModal from '../components/CreateAppWizardModal';
import AppSettingsModal from '../components/AppSettingsModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

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

  const handleAppCreated = (newApp) => {
    setApps([...apps, newApp]);
  };

  const handleAppUpdated = (updatedApp) => {
    setApps(apps.map(app => app._id === updatedApp._id ? updatedApp : app));
  };

  const openSettings = (app) => {
    setSelectedApp(app);
    setShowSettingsModal(true);
  };

  const closeSettings = () => {
    setSelectedApp(null);
    setShowSettingsModal(false);
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
          onClick={() => setShowCreateWizard(true)}
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
            onClick={() => setShowCreateWizard(true)}
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
              textAlign: 'center',
              position: 'relative'
            }}>
              {/* Settings Button */}
              <button
                onClick={() => openSettings(app)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #ddd',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: '#666',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e9ecef';
                  e.target.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                  e.target.style.color = '#666';
                }}
                title="App Settings"
              >
                ⚙️
              </button>
              
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
              <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{app.name}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Created: {new Date(app.createdAt).toLocaleDateString()}
              </p>
              {app.subdomain && (
                <p style={{ color: '#667eea', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {app.subdomain}.localhost:3000
                </p>
              )}
              <p style={{ fontSize: '12px', color: '#888', marginBottom: '1.5rem' }}>
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

      <CreateAppWizardModal
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onAppCreated={handleAppCreated}
      />
      
      <AppSettingsModal
        isOpen={showSettingsModal}
        onClose={closeSettings}
        app={selectedApp}
        onAppUpdated={handleAppUpdated}
      />
    </div>
  );
};

export default Dashboard;
