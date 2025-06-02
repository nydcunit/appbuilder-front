import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getElementByType } from '../elements';
import websocketService from '../services/websocketService';
import { InMemoryExecutionEngine } from '../utils/InMemoryExecutionEngine';

const AppRuntimeV2 = () => {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Core app state
  const [app, setApp] = useState(null);
  const [currentScreenId, setCurrentScreenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Execution state - all in memory
  const [executionEngine, setExecutionEngine] = useState(null);
  const [renderedElements, setRenderedElements] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionErrors, setExecutionErrors] = useState({});

  // Load app and initialize execution engine
  useEffect(() => {
    const loadApp = async () => {
      try {
        setLoading(true);
        
        // Set up authentication for V2 runtime (same as Old Execute)
        // Check for token in URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
          localStorage.setItem('token', urlToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;
          
          // Clean up URL by removing token parameter
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('token');
          window.history.replaceState({}, document.title, newUrl.toString());
        } else {
          // Check if we already have a token in localStorage and set up axios
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
          } else {
            console.log('⚠️ No authentication token found for V2 runtime');
          }
        }
        
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
          console.log('🚀 Loaded app data for in-memory execution:', appData);
          
          // Debug: Check if calculations are attached to elements
          const checkCalculations = (elements) => {
            elements.forEach(element => {
              if (element.calculations && Object.keys(element.calculations).length > 0) {
                console.log(`✅ Found calculations on element ${element.id}:`, element.calculations);
              }
              if (element.children) {
                checkCalculations(element.children);
              }
            });
          };
          
          appData.screens.forEach(screen => {
            console.log(`🔍 Checking screen ${screen.name} for calculations...`);
            checkCalculations(screen.elements || []);
          });
          
          setApp(appData);
          
          // Initialize in-memory execution engine with full app data
          const engine = new InMemoryExecutionEngine(appData);
          setExecutionEngine(engine);
          
          // Set execution engine globally for Container elements to access
          window.__v2ExecutionEngine = engine;
          
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

  // Handle URL-based routing for screens
  useEffect(() => {
    if (app && app.screens && app.screens.length > 0) {
      const currentPath = location.pathname;
      
      // Find screen by URL path
      let targetScreen = null;
      
      if (currentPath !== '/') {
        targetScreen = app.screens.find(screen => {
          const screenUrl = screen.url && screen.url.trim() !== '' ? screen.url : null;
          let normalizedScreenUrl = null;
          
          if (screenUrl) {
            normalizedScreenUrl = screenUrl.startsWith('/') ? screenUrl : `/${screenUrl}`;
          }
          
          return normalizedScreenUrl === currentPath;
        });
      }
      
      // If no screen found by URL, use home screen or first screen
      if (!targetScreen) {
        const homeScreenId = app.homeScreenId || app.screens[0]?.id;
        targetScreen = app.screens.find(screen => screen.id === homeScreenId) || app.screens[0];
      }
      
      if (targetScreen && targetScreen.id !== currentScreenId) {
        setCurrentScreenId(targetScreen.id);
      }
    }
  }, [app, location.pathname, currentScreenId]);

  // Execute when screen changes
  useEffect(() => {
    if (executionEngine && currentScreenId) {
      executeCurrentScreen();
      
      // Set up state change callback for tab clicks
      executionEngine.setStateChangeCallback((type, containerId, data) => {
        if (type === 'tab') {
          console.log(`🔄 Tab state changed, re-executing screen...`);
          executeCurrentScreen();
        }
      });
    }
  }, [executionEngine, currentScreenId]);

  // Execute current screen with in-memory engine
  const executeCurrentScreen = async () => {
    if (!executionEngine || !currentScreenId) return;
    
    setIsExecuting(true);
    setExecutionErrors({});
    
    try {
      console.log('🎯 Executing screen:', currentScreenId);
      
      // Execute screen with in-memory engine
      const result = await executionEngine.executeScreen(currentScreenId);
      
      console.log('✅ Screen execution result:', result);
      
      setRenderedElements(result.elements);
      setExecutionErrors(result.errors || {});
      
    } catch (error) {
      console.error('❌ Screen execution failed:', error);
      setExecutionErrors({ general: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  // Render element with execution results
  const renderElement = (element, depth = 0, parentIsTabsContainer = false, parentActiveTab = -1, elementIndex = -1) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    const handlers = {
      onClick: () => {}, // No editing in runtime
      onDelete: () => {},
      onDragOver: () => {},
      onDragLeave: () => {},
      onDrop: () => {},
      onDragStart: () => {}
    };

    // Determine if this element is the active tab
    const isActiveTab = parentIsTabsContainer && elementIndex === parentActiveTab;
    
    // Check if this element is a tabs container to pass info to children
    const isTabsContainer = element.containerType === 'tabs';
    let activeTabIndex = -1;
    
    if (isTabsContainer && executionEngine) {
      // Get active tab from execution engine
      const tabOrder = executionEngine.getTabValue(element.id, 'order');
      activeTabIndex = tabOrder - 1; // Convert to 0-based
    }

    const children = element.children && element.children.length > 0 
      ? element.children.map((child, index) => renderElement(
          child, 
          depth + 1, 
          isTabsContainer, // Pass if this is a tabs container
          activeTabIndex, // Pass active tab index
          index // Pass child index
        ))
      : null;

    // Render element in runtime mode
    const renderedElement = elementDef.render(
      element, 
      depth, 
      false, // not selected
      false, // not drop zone
      handlers, 
      children, 
      null, // matched condition index
      true, // isExecuteMode
      false, // isActiveSlide
      isActiveTab, // isActiveTab - NOW PROPERLY PASSED!
      app?.screens || [], // availableScreens
      {}, // calculationResults (handled by engine)
      {} // repeatingContainerData (handled by engine)
    );
    
    return React.cloneElement(renderedElement, {
      key: element.id,
      style: {
        ...renderedElement.props.style,
        // Add error styling if there's an execution error
        ...(executionErrors[element.id] && {
          backgroundColor: '#ffebee',
          border: '1px solid #f44336'
        })
      }
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
          {app.name} <span style={{ fontSize: '14px', color: '#666' }}>(V2 - In-Memory)</span>
        </h1>
        
        {/* Screen Navigation */}
        {app.screens.length > 1 && (
          <div style={{ display: 'flex', gap: '10px' }}>
            {app.screens.map(screen => {
              const handleScreenNavigation = () => {
                if (screen.url && screen.url.trim() !== '') {
                  navigate(screen.url);
                } else {
                  navigate('/');
                }
              };
              
              return (
                <button
                  key={screen.id}
                  onClick={handleScreenNavigation}
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
              );
            })}
          </div>
        )}
      </div>

      {/* App Content */}
      <div style={{
        padding: '20px',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {isExecuting && (
          <div style={{
            padding: '10px',
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#2e7d32'
          }}>
            🔄 Executing in-memory calculations and conditions...
          </div>
        )}
        
        {Object.keys(executionErrors).length > 0 && (
          <div style={{
            padding: '10px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#d32f2f'
          }}>
            ⚠️ Some calculations failed. Check console for details.
          </div>
        )}
        
        {renderedElements.length > 0 ? (
          renderedElements.map(element => renderElement(element))
        ) : (
          !isExecuting && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: '#999',
              fontSize: '16px'
            }}>
              {currentScreen?.elements?.length === 0 
                ? "No elements to display" 
                : "No elements are visible (all hidden by conditions)"
              }
            </div>
          )
        )}
      </div>
    </div>
  );
};

// Live Preview Listener component
const LivePreviewListener = ({ appId }) => {
  useEffect(() => {
    const isPreviewWindow = window.location.hostname !== 'localhost' && 
                           window.location.hostname.includes('.localhost');
    
    if (!isPreviewWindow || !appId) {
      return;
    }

    console.log('🔴 Setting up live preview for app:', appId);

    websocketService.connect();
    websocketService.joinApp(appId);

    const handleAppUpdate = (data) => {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    websocketService.onAppUpdated(handleAppUpdate);

    return () => {
      websocketService.offAppUpdated(handleAppUpdate);
      websocketService.leaveApp(appId);
    };
  }, [appId]);

  return null;
};

export default AppRuntimeV2;
