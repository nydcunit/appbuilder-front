import React, { useState, useEffect } from 'react';

const ScreenDetailsModal = ({
  showModal,
  currentScreen,
  screens,
  app,
  onClose,
  onUpdateScreen,
  onSetHomeScreen,
  onDeleteScreen
}) => {
  const [screenName, setScreenName] = useState('');
  const [screenUrl, setScreenUrl] = useState('');

  useEffect(() => {
    if (currentScreen) {
      setScreenName(currentScreen.name || '');
      setScreenUrl(currentScreen.url || '');
    }
  }, [currentScreen]);

  const handleSave = () => {
    if (!screenName.trim()) {
      alert('Screen name is required');
      return;
    }

    onUpdateScreen({
      ...currentScreen,
      name: screenName.trim(),
      url: screenUrl.trim()
    });
    onClose();
  };

  const handleSetAsHome = () => {
    if (window.confirm('Set this screen as the home screen?')) {
      onSetHomeScreen(currentScreen.id);
    }
  };

  const handleDelete = () => {
    if (screens.length === 1) {
      alert('Cannot delete the last screen. Please create another screen first.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the screen "${currentScreen.name}"?`)) {
      onDeleteScreen(currentScreen.id);
      onClose();
    }
  };

  if (!showModal || !currentScreen) return null;

  const isHomeScreen = app?.homeScreenId === currentScreen.id || 
                      (screens.length > 0 && screens[0].id === currentScreen.id && !app?.homeScreenId);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '500px',
        maxWidth: '90vw',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          color: '#333',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Screen Details
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#555'
          }}>
            Screen Name:
          </label>
          <input
            type="text"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            placeholder="Enter screen name"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#555'
          }}>
            Screen URL:
          </label>
          <input
            type="text"
            value={screenUrl}
            onChange={(e) => setScreenUrl(e.target.value)}
            placeholder="Enter screen URL (optional)"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            URL path for this screen (e.g., /about, /contact)
          </small>
        </div>

        {isHomeScreen && (
          <div style={{
            backgroundColor: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#2e7d32'
          }}>
            ✓ This is the home screen
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          flexWrap: 'wrap',
          marginBottom: '20px'
        }}>
          {!isHomeScreen && (
            <button
              onClick={handleSetAsHome}
              style={{
                padding: '10px 15px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🏠 Set as Home Screen
            </button>
          )}

          <button
            onClick={handleDelete}
            style={{
              padding: '10px 15px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🗑️ Delete Screen
          </button>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px',
          borderTop: '1px solid #eee',
          paddingTop: '20px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScreenDetailsModal;
