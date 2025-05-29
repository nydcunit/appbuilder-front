import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { getElementByType } from '../elements';
import LivePreviewListener from './LivePreviewListener';

const AppRuntime = () => {
  const { subdomain } = useParams();
  const [app, setApp] = useState(null);
  const [currentScreenId, setCurrentScreenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadApp = async () => {
      try {
        setLoading(true);
        
        // Get subdomain from URL if not from params
        const hostname = window.location.hostname;
        const appSubdomain = subdomain || (hostname !== 'localhost' ? hostname.split('.')[0] : null);
        
        if (!appSubdomain) {
          setError('No subdomain found');
          return;
        }

        // Fetch app by subdomain
        const response = await axios.get(`/api/apps?subdomain=${appSubdomain}`);
        
        if (response.data.success && response.data.data.length > 0) {
          const appData = response.data.data[0];
          setApp(appData);
          setCurrentScreenId(appData.screens[0]?.id || 1);
        } else {
          setError('App not found');
        }
      } catch (err) {
        console.error('Error loading app:', err);
        setError('Failed to load app');
      } finally {
        setLoading(false);
      }
    };

    loadApp();
  }, [subdomain]);

  const renderElement = (element, depth = 0) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    const handlers = {
      onClick: () => {}, // No editing in runtime
      onDelete: () => {}, // No editing in runtime
      onDragOver: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
      onDragStart: () => {}
    };

    const children = element.children && element.children.length > 0 
      ? element.children.map(child => renderElement(child, depth + 1))
      : null;

    // Render element in runtime mode (not builder mode)
    const renderedElement = elementDef.render(
      element, 
      depth, 
      false, // not selected
      false, // not drop zone
      handlers, 
      children, 
      null, // no available elements for calculations
      false, // not in builder
      false, // not preview mode
      true, // runtime mode
      app?.screens || []
    );
    
    return React.cloneElement(renderedElement, {
      key: element.id
    });
  };

  const currentScreen = app?.screens?.find(screen => screen.id === currentScreenId);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
        backgroundColor: '#f5f5f5'
      }}>
        Loading app...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#dc3545',
        backgroundColor: '#f5f5f5'
      }}>
        {error}
      </div>
    );
  }

  if (!app || !currentScreen) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666',
        backgroundColor: '#f5f5f5'
      }}>
        App not found
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      overflow: 'auto'
    }}>
      {/* Live Preview Listener for auto-updates */}
      <LivePreviewListener appId={app._id} />
      
      {/* App Header */}
      <div style={{
        padding: '10px 20px',
        backgroundColor: 'white',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#333' }}>
          {app.name}
        </h1>
        
        {/* Screen Navigation */}
        {app.screens.length > 1 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {app.screens.map(screen => (
              <button
                key={screen.id}
                onClick={() => setCurrentScreenId(screen.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentScreenId === screen.id ? '#007bff' : '#f8f9fa',
                  color: currentScreenId === screen.id ? 'white' : '#333',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {screen.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* App Content */}
      <div style={{
        padding: '20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {currentScreen.elements.map(element => renderElement(element))}
      </div>
    </div>
  );
};

export default AppRuntime;
