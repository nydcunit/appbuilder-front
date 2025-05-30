import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getElementByType } from '../elements';
import LivePreviewListener from './LivePreviewListener';
import { executeTextCalculations, executeRepeatingContainerQuery } from '../utils/calculationEngine';
import { getVisibleElements } from '../utils/ConditionEngine';

const AppRuntime = () => {
  const { subdomain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [app, setApp] = useState(null);
  const [currentScreenId, setCurrentScreenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Enhanced state for calculations and conditions
  const [calculationResults, setCalculationResults] = useState({});
  const [visibleElements, setVisibleElements] = useState([]);
  const [elementConditionMatches, setElementConditionMatches] = useState({});
  const [repeatingContainerData, setRepeatingContainerData] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionErrors, setExecutionErrors] = useState({});

  // Listen for calculation data from parent window
  useEffect(() => {
    console.log('🔧 AppRuntime: Setting up message listener for calculation data');
    
    const handleMessage = (event) => {
      console.log('📨 AppRuntime: Received message from:', event.origin, 'Data:', event.data);
      
      // Check for CORS issues
      const expectedOrigin = 'http://localhost:3000';
      if (event.origin !== expectedOrigin) {
        console.warn('⚠️ CORS: Message from unexpected origin:', event.origin, 'Expected:', expectedOrigin);
        // Still process the message if it looks valid
      }
      
      if (event.data && event.data.type === 'CALCULATION_DATA') {
        console.log('📊 Received calculation data from parent window:', Object.keys(event.data.calculations).length, 'calculations');
        console.log('📊 Calculation data:', event.data.calculations);
        console.log('📊 Active tabs data:', event.data.activeTabs);
        console.log('🔐 Auth token received:', event.data.authToken ? 'Token found' : 'No token');
        
        // Store calculations in global storage
        window.superTextCalculations = event.data.calculations;
        
        // Store active tabs state
        window.__activeTabs = event.data.activeTabs;
        
        // Store authentication token
        if (event.data.authToken) {
          localStorage.setItem('token', event.data.authToken);
          console.log('✅ Stored auth token in localStorage');
          
          // Set up axios defaults for authentication
          axios.defaults.headers.common['Authorization'] = `Bearer ${event.data.authToken}`;
          console.log('✅ Set axios authorization header');
        }
        
        // Also store in localStorage for backup
        Object.entries(event.data.calculations).forEach(([calcId, calcData]) => {
          try {
            localStorage.setItem(`calc_${calcId}`, JSON.stringify(calcData));
            console.log(`✅ Stored calculation ${calcId} in localStorage`);
          } catch (error) {
            console.error(`❌ Error storing calculation ${calcId} in localStorage:`, error);
          }
        });
        
        console.log('📊 Global storage after update:', window.superTextCalculations);
        
        // Re-execute calculations if app is already loaded
        if (app && currentScreenId) {
          const currentScreen = app.screens.find(screen => screen.id === currentScreenId);
          if (currentScreen) {
            console.log('🔄 Re-executing calculations with new data...');
            executeCalculationsAndConditions(currentScreen);
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Also try to request data from parent immediately
    if (window.parent && window.parent !== window) {
      console.log('📨 Requesting calculation data from parent window');
      window.parent.postMessage({ type: 'REQUEST_CALCULATION_DATA' }, '*');
    }
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [app, currentScreenId]);

  useEffect(() => {
    const loadApp = async () => {
      try {
        setLoading(true);
        console.log('URL_ROUTING: Starting app load process');
        
        // Check for token in URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
          console.log('URL_ROUTING: Found token in URL parameters, storing and setting up axios');
          localStorage.setItem('token', urlToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${urlToken}`;
          
          // Clean up URL by removing token parameter
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('token');
          window.history.replaceState({}, document.title, newUrl.toString());
          console.log('URL_ROUTING: Cleaned URL after token removal:', newUrl.toString());
        } else {
          // Check if we already have a token in localStorage and set up axios
          const existingToken = localStorage.getItem('token');
          if (existingToken) {
            console.log('URL_ROUTING: Found existing token in localStorage, setting up axios');
            axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
          } else {
            console.log('URL_ROUTING: No token found in localStorage or URL');
          }
        }
        
        // Get subdomain from URL if not from params
        const hostname = window.location.hostname;
        const appSubdomain = subdomain || (hostname !== 'localhost' ? hostname.split('.')[0] : null);
        
        console.log('URL_ROUTING: Hostname:', hostname);
        console.log('URL_ROUTING: Subdomain from params:', subdomain);
        console.log('URL_ROUTING: Extracted app subdomain:', appSubdomain);
        
        if (!appSubdomain) {
          console.log('URL_ROUTING: ERROR - No subdomain found');
          setError('No subdomain found');
          return;
        }

        // Fetch app by subdomain
        console.log('URL_ROUTING: Fetching app with subdomain:', appSubdomain);
        const response = await axios.get(`/api/apps?subdomain=${appSubdomain}`);
        
        if (response.data.success && response.data.data.length > 0) {
          const appData = response.data.data[0];
          console.log('URL_ROUTING: App loaded successfully:', {
            appId: appData._id,
            appName: appData.name,
            screensCount: appData.screens?.length || 0,
            homeScreenId: appData.homeScreenId,
            screens: appData.screens?.map(s => ({ id: s.id, name: s.name, url: s.url })) || []
          });
          setApp(appData);
          
          // Don't set currentScreenId here - let the URL routing effect handle it
          console.log('URL_ROUTING: App state set, URL routing effect will handle screen selection');
        } else {
          console.log('URL_ROUTING: ERROR - App not found in response:', response.data);
          setError('App not found');
        }
      } catch (err) {
        console.error('URL_ROUTING: Error loading app:', err);
        setError('Failed to load app');
      } finally {
        setLoading(false);
        console.log('URL_ROUTING: App loading process completed');
      }
    };

    loadApp();
  }, [subdomain]);

  // Handle URL-based routing for screens
  useEffect(() => {
    console.log('URL_ROUTING: URL routing effect triggered');
    console.log('URL_ROUTING: App loaded:', !!app);
    console.log('URL_ROUTING: App screens count:', app?.screens?.length || 0);
    console.log('URL_ROUTING: Current screen ID:', currentScreenId);
    console.log('URL_ROUTING: Location pathname:', location.pathname);
    
    if (app && app.screens && app.screens.length > 0) {
      const currentPath = location.pathname;
      console.log('URL_ROUTING: Processing URL routing for path:', currentPath);
      console.log('URL_ROUTING: Available screens:', app.screens.map(s => ({ id: s.id, name: s.name, url: s.url })));
      console.log('URL_ROUTING: App home screen ID:', app.homeScreenId);
      
      // Find screen by URL path
      let targetScreen = null;
      
      // First, try to find a screen with matching URL
      if (currentPath !== '/') {
        console.log('URL_ROUTING: Looking for screen with URL matching:', currentPath);
        targetScreen = app.screens.find(screen => {
          const screenUrl = screen.url && screen.url.trim() !== '' ? screen.url : null;
          
          // Normalize URLs for comparison
          let normalizedScreenUrl = null;
          let normalizedCurrentPath = currentPath;
          
          if (screenUrl) {
            // Ensure screen URL starts with /
            normalizedScreenUrl = screenUrl.startsWith('/') ? screenUrl : `/${screenUrl}`;
          }
          
          console.log(`URL_ROUTING: Checking screen "${screen.name}" (ID: ${screen.id}) with URL "${screenUrl}" (normalized: "${normalizedScreenUrl}") against path "${normalizedCurrentPath}"`);
          const matches = normalizedScreenUrl === normalizedCurrentPath;
          console.log(`URL_ROUTING: Match result: ${matches}`);
          return matches;
        });
        console.log('URL_ROUTING: Found screen by URL:', targetScreen ? `${targetScreen.name} (ID: ${targetScreen.id})` : 'None');
      } else {
        console.log('URL_ROUTING: Path is root (/), will use home/default screen');
      }
      
      // If no screen found by URL, use home screen or first screen
      if (!targetScreen) {
        console.log('URL_ROUTING: No screen found by URL, determining home/default screen');
        const homeScreenId = app.homeScreenId || app.screens[0]?.id;
        console.log('URL_ROUTING: Home screen ID to use:', homeScreenId);
        targetScreen = app.screens.find(screen => screen.id === homeScreenId) || app.screens[0];
        console.log('URL_ROUTING: Selected home/default screen:', targetScreen ? `${targetScreen.name} (ID: ${targetScreen.id})` : 'None');
      }
      
      if (targetScreen) {
        console.log('URL_ROUTING: Target screen determined:', `${targetScreen.name} (ID: ${targetScreen.id})`);
        console.log('URL_ROUTING: Current screen ID:', currentScreenId);
        console.log('URL_ROUTING: Need to switch screens:', targetScreen.id !== currentScreenId);
        
        if (targetScreen.id !== currentScreenId) {
          console.log('URL_ROUTING: SWITCHING TO SCREEN:', targetScreen.name, 'ID:', targetScreen.id);
          setCurrentScreenId(targetScreen.id);
        } else {
          console.log('URL_ROUTING: Already on correct screen:', targetScreen.name);
        }
      } else {
        console.log('URL_ROUTING: ERROR - No target screen determined!');
      }
    } else {
      console.log('URL_ROUTING: Skipping URL routing - app not ready');
      console.log('URL_ROUTING: App exists:', !!app);
      console.log('URL_ROUTING: App has screens:', !!(app?.screens));
      console.log('URL_ROUTING: Screens length:', app?.screens?.length || 0);
    }
  }, [app, location.pathname, currentScreenId]);

  // Execute calculations and conditions when app or screen changes
  useEffect(() => {
    if (app && currentScreenId) {
      const currentScreen = app.screens.find(screen => screen.id === currentScreenId);
      if (currentScreen) {
        executeCalculationsAndConditions(currentScreen);
      }
    }
  }, [app, currentScreenId]);

  // Listen for tab state changes and re-execute when tabs are clicked
  useEffect(() => {
    const handleTabStateChange = () => {
      console.log('🔥 TAB STATE CHANGE DETECTED in AppRuntime, re-executing...');
      if (app && currentScreenId) {
        const currentScreen = app.screens.find(screen => screen.id === currentScreenId);
        if (currentScreen) {
          executeCalculationsAndConditions(currentScreen);
        }
      }
    };

    // Listen for custom tab change events
    window.addEventListener('tabStateChanged', handleTabStateChange);
    
    // Also poll for changes in global tab state (fallback)
    const pollInterval = setInterval(() => {
      if (window.__activeTabs && window.__lastKnownTabState) {
        const currentState = JSON.stringify(window.__activeTabs);
        if (currentState !== window.__lastKnownTabState) {
          console.log('🔥 TAB STATE CHANGE DETECTED via polling');
          window.__lastKnownTabState = currentState;
          handleTabStateChange();
        }
      } else if (window.__activeTabs) {
        window.__lastKnownTabState = JSON.stringify(window.__activeTabs);
      }
    }, 100); // Check every 100ms

    return () => {
      window.removeEventListener('tabStateChanged', handleTabStateChange);
      clearInterval(pollInterval);
    };
  }, [app, currentScreenId]);

  // Execute calculations and conditional rendering for the current screen
  const executeCalculationsAndConditions = async (currentScreen) => {
    setIsExecuting(true);
    setExecutionErrors({});
    
    try {
      // First, get all elements for condition evaluation
      const allElements = getAllElementsInScreen(currentScreen.elements);
      
      // Step 1: Load repeating container data
      console.log('🔄 Loading repeating container data...');
      const containerData = await loadRepeatingContainerData(currentScreen.elements);
      setRepeatingContainerData(containerData);
      
      // Step 2: Expand repeating containers into multiple instances
      console.log('🔄 Expanding repeating containers...');
      const expandedElements = await expandRepeatingContainers(currentScreen.elements, containerData);
      console.log('Expanded elements:', expandedElements);
      
      // Step 3: Execute conditional rendering on expanded elements
      console.log('🔄 Executing conditional rendering...');
      const { visibleElements: filteredElements, conditionMatches } = await getVisibleElementsWithMatches(expandedElements, allElements);
      console.log('Visible elements after conditions:', filteredElements);
      console.log('Condition matches:', conditionMatches);
      
      setVisibleElements(filteredElements);
      setElementConditionMatches(conditionMatches);
      
      // Step 4: Execute calculations on visible elements
      console.log('🔄 Executing calculations...');
      const results = {};
      const errors = {};
      const visibleFlatElements = getAllElementsInScreen(filteredElements);
      
      for (const element of visibleFlatElements) {
        // Handle text elements with calculations
        if (element.type === 'text' && element.properties?.value) {
          try {
            const calculationStorage = extractCalculationStorage(element.properties.value);
            
            console.log('🔍 CALC STORAGE: Calculation storage for element', element.id, ':', calculationStorage);
            
            // Get repeating context if element is inside a repeating container
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            
            // ENHANCED: If no calculation storage found but we have repeating context,
            // create a synthetic calculation for repeating container values
            if (Object.keys(calculationStorage).length === 0 && repeatingContext && element.properties.value.includes('{{CALC:')) {
              const calcMatches = element.properties.value.match(/{{CALC:([^}]+)}}/g);
              if (calcMatches) {
                for (const match of calcMatches) {
                  const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
                  console.log('🔧 Creating synthetic calculation for:', calcId);
                  
                  // Create a synthetic calculation that references the repeating container
                  calculationStorage[calcId] = {
                    id: calcId,
                    steps: [{
                      id: 'synthetic_step',
                      config: {
                        source: 'repeating_container',
                        repeatingContainerId: repeatingContext.containerId,
                        repeatingColumn: 'value' // Default to 'value' column
                      }
                    }]
                  };
                  console.log('🔧 Synthetic calculation created:', calculationStorage[calcId]);
                  
                  // CRITICAL: Also store in global storage for the calculation engine
                  if (!window.superTextCalculations) {
                    window.superTextCalculations = {};
                  }
                  window.superTextCalculations[calcId] = calculationStorage[calcId];
                  console.log('🔧 Stored synthetic calculation in global storage');
                }
              }
            }
            
            // ENHANCED: Also ensure expanded elements are available globally for nested calculations
            if (!window.__expandedElements) {
              window.__expandedElements = {};
            }
            window.__expandedElements[currentScreenId] = filteredElements;
            
            const executedValue = await executeTextCalculations(
              element.properties.value, 
              allElements,
              calculationStorage,
              repeatingContext,
              filteredElements
            );
            results[element.id] = executedValue;
          } catch (error) {
            console.error(`Error executing calculations for element ${element.id}:`, error);
            errors[element.id] = error.message;
            results[element.id] = `[Error: ${error.message}]`;
          }
        }
        
        // Handle page containers with parameter calculations AND nested page elements
        if (element.type === 'container' && element.contentType === 'page') {
          try {
            // Execute parameter calculations
            if (element.pageConfig?.parameters) {
              for (const param of element.pageConfig.parameters) {
                if (param.value && typeof param.value === 'string') {
                  const calculationStorage = extractCalculationStorage(param.value);
                  
                  // Get repeating context if element is inside a repeating container
                  const repeatingContext = getRepeatingContextForElement(element, containerData);
                  
                  const executedValue = await executeTextCalculations(
                    param.value, 
                    allElements,
                    calculationStorage,
                    repeatingContext,
                    filteredElements
                  );
                  
                  // Store the executed parameter value
                  const paramKey = `${element.id}_param_${param.id}`;
                  results[paramKey] = executedValue;
                }
              }
            }
            
            // Execute calculations for nested page elements
            if (element.pageConfig?.selectedPageId && app?.screens) {
              const selectedScreen = app.screens.find(screen => screen.id == element.pageConfig.selectedPageId);
              if (selectedScreen && selectedScreen.elements) {
                await executeNestedPageElementCalculations(
                  selectedScreen.elements, 
                  element.id, 
                  allElements, 
                  results, 
                  errors,
                  containerData
                );
              }
            }
          } catch (error) {
            console.error(`Error executing calculations for page container ${element.id}:`, error);
            errors[element.id] = error.message;
          }
        }
      }
      
      setCalculationResults(results);
      setExecutionErrors(errors);
    } catch (error) {
      console.error('Error in executeCalculationsAndConditions:', error);
      setExecutionErrors({ general: error.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const renderElement = (element, depth = 0) => {
    const elementDef = getElementByType(element.type);
    if (!elementDef) return null;

    // Create a copy of the element with executed calculations
    const executedElement = {
      ...element,
      properties: {
        ...element.properties,
        ...(element.type === 'text' && calculationResults[element.id] && {
          value: calculationResults[element.id]
        })
      }
    };
    
    // For page containers, update parameters with executed values
    if (element.type === 'container' && element.contentType === 'page' && element.pageConfig?.parameters) {
      const updatedParameters = element.pageConfig.parameters.map(param => {
        const paramKey = `${element.id}_param_${param.id}`;
        if (calculationResults[paramKey]) {
          return {
            ...param,
            executedValue: calculationResults[paramKey]
          };
        }
        return param;
      });
      
      executedElement.pageConfig = {
        ...element.pageConfig,
        parameters: updatedParameters
      };
    }

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

    // Get the matched condition index for this element
    const matchedConditionIndex = elementConditionMatches[element.id] ?? null;
    
    // Check if this element should have active tab styling
    const isActiveTab = checkIfElementIsActiveTab(element);

    // Render element in runtime mode with full execution features
    const renderedElement = elementDef.render(
      executedElement, 
      depth, 
      false, // not selected
      false, // not drop zone
      handlers, 
      children, 
      matchedConditionIndex, // matched condition index
      true, // isExecuteMode - this is runtime mode
      false, // isActiveSlide - will be set by slider component
      isActiveTab, // isActiveTab - check if element is in active tab
      app?.screens || [], // availableScreens
      calculationResults, // calculationResults
      repeatingContainerData // pass container data to elements
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

  // Check if an element should have active tab styling
  const checkIfElementIsActiveTab = (element) => {
    // Helper function to extract original ID from repeating container instance ID
    const getOriginalElementId = (elementId) => {
      return elementId.replace(/_instance_\d+$/, '');
    };
    
    // Helper function to get the instance index from repeating container ID
    const getInstanceIndex = (elementId) => {
      const match = elementId.match(/_instance_(\d+)$/);
      return match ? parseInt(match[1]) : -1;
    };
    
    // Find tabs containers in the current screen elements
    const findTabsContainers = (elements) => {
      const tabsContainers = [];
      const traverse = (elementList) => {
        elementList.forEach(el => {
          if (el.type === 'container' && el.containerType === 'tabs') {
            tabsContainers.push(el);
          }
          if (el.children && el.children.length > 0) {
            traverse(el.children);
          }
        });
      };
      traverse(elements);
      return tabsContainers;
    };
    
    // Get original element ID (strip instance suffix)
    const originalElementId = getOriginalElementId(element.id);
    const instanceIndex = getInstanceIndex(element.id);
    
    // Find all tabs containers in the original screen structure
    const currentScreenElements = currentScreen?.elements || [];
    const tabsContainers = findTabsContainers(currentScreenElements);
    
    // Check each tabs container to see if this element is a child
    for (const tabsContainer of tabsContainers) {
      if (!tabsContainer.children || tabsContainer.children.length === 0) continue;
      
      // Check if the original element ID is a direct child of this tabs container
      const childIndex = tabsContainer.children.findIndex(child => child.id === originalElementId);
      
      if (childIndex >= 0) {
        // Get the active tab index from global state or config
        const globalActiveTab = window.__activeTabs && window.__activeTabs[tabsContainer.id];
        const configActiveTab = tabsContainer.tabsConfig?.activeTab;
        
        // Determine the active tab index (0-based)
        let activeTabIndex = 0;
        if (globalActiveTab !== undefined) {
          activeTabIndex = globalActiveTab;
        } else if (configActiveTab) {
          activeTabIndex = Math.max(0, parseInt(configActiveTab) - 1);
        }
        
        // For repeating containers, check if this specific instance should be active
        let isActive = false;
        if (instanceIndex >= 0) {
          isActive = (instanceIndex === activeTabIndex);
        } else {
          isActive = (childIndex === activeTabIndex);
        }
        
        return isActive;
      }
    }
    
    return false;
  };

  // Helper functions for calculation execution
  const getAllElementsInScreen = (elements) => {
    const allElements = [];
    const traverse = (elementList) => {
      elementList.forEach(element => {
        allElements.push(element);
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    traverse(elements);
    return allElements;
  };

  const loadRepeatingContainerData = async (elements) => {
    const containerData = {};
    
    // Find repeating containers in main screen elements
    const repeatingContainers = findRepeatingContainers(elements);
    console.log('🔄 Found repeating containers in main screen:', repeatingContainers.map(c => c.id));
    
    // Also find repeating containers in page content
    const pageContainers = findPageContainers(elements);
    for (const pageContainer of pageContainers) {
      if (pageContainer.pageConfig?.selectedPageId && app?.screens) {
        const selectedScreen = app.screens.find(screen => screen.id == pageContainer.pageConfig.selectedPageId);
        if (selectedScreen && selectedScreen.elements) {
          const pageRepeatingContainers = findRepeatingContainers(selectedScreen.elements);
          console.log('🔄 Found repeating containers in page content:', pageRepeatingContainers.map(c => c.id));
          repeatingContainers.push(...pageRepeatingContainers);
        }
      }
    }
    
    console.log('🔄 Total repeating containers to load data for:', repeatingContainers.map(c => c.id));
    
    for (const container of repeatingContainers) {
      const { databaseId, tableId, filters } = container.repeatingConfig;
      
      try {
        console.log(`🔄 Loading data for repeating container ${container.id}:`, { databaseId, tableId, filters });
        const records = await executeRepeatingContainerQuery(databaseId, tableId, filters);
        console.log(`✅ Loaded ${records.length} records for container ${container.id}`);
        containerData[container.id] = {
          records,
          config: container.repeatingConfig
        };
      } catch (error) {
        console.error(`Error loading data for container ${container.id}:`, error);
        containerData[container.id] = {
          records: [],
          config: container.repeatingConfig,
          error: error.message
        };
      }
    }
    
    console.log('🔄 Final container data:', Object.keys(containerData));
    return containerData;
  };

  const findRepeatingContainers = (elements) => {
    const containers = [];
    
    const traverse = (elementList) => {
      elementList.forEach(element => {
        if (element.type === 'container' && 
            element.contentType === 'repeating' && 
            element.repeatingConfig?.databaseId && 
            element.repeatingConfig?.tableId) {
          containers.push(element);
        }
        
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    
    traverse(elements);
    return containers;
  };

  const findPageContainers = (elements) => {
    const containers = [];
    
    const traverse = (elementList) => {
      elementList.forEach(element => {
        if (element.type === 'container' && 
            element.contentType === 'page' && 
            element.pageConfig?.selectedPageId) {
          containers.push(element);
        }
        
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      });
    };
    
    traverse(elements);
    return containers;
  };

  const expandRepeatingContainers = async (elements, containerData) => {
    const expanded = [];
    
    for (const element of elements) {
      if (element.type === 'container' && element.contentType === 'repeating') {
        const data = containerData[element.id];
        
        if (data && data.records && data.records.length > 0) {
          for (let i = 0; i < data.records.length; i++) {
            const record = data.records[i];
            const instanceId = `${element.id}_instance_${i}`;
            
            const containerInstance = {
              ...element,
              id: instanceId,
              originalId: element.id,
              containerType: element.containerType,
              sliderConfig: element.sliderConfig,
              tabsConfig: element.tabsConfig,
              repeatingConfig: element.repeatingConfig,
              repeatingContext: {
                containerId: element.id,
                recordData: record,
                rowIndex: i
              },
              children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
            };
            
            containerInstance.children = await updateChildrenWithRepeatingContext(
              containerInstance.children, 
              element.id, 
              record, 
              i,
              containerData
            );
            
            expanded.push(containerInstance);
          }
        } else {
          expanded.push({
            ...element,
            children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
          });
        }
      } else {
        const expandedElement = {
          ...element,
          children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
        };
        expanded.push(expandedElement);
      }
    }
    
    return expanded;
  };

  const updateChildrenWithRepeatingContext = async (children, containerId, recordData, rowIndex, containerData) => {
    const updated = [];
    
    for (const child of children) {
      const updatedChild = {
        ...child,
        id: `${child.id}_repeat_${containerId}_${rowIndex}`,
        originalId: child.id,
        parentRepeatingContext: {
          containerId,
          recordData,
          rowIndex
        }
      };
      
      if (updatedChild.children && updatedChild.children.length > 0) {
        updatedChild.children = await updateChildrenWithRepeatingContext(
          updatedChild.children, 
          containerId, 
          recordData, 
          rowIndex,
          containerData
        );
      }
      
      updated.push(updatedChild);
    }
    
    return updated;
  };

  const getVisibleElementsWithMatches = async (elements, availableElements) => {
    const visibleElements = [];
    const conditionMatches = {};
    
    for (const element of elements) {
      if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
        const { ConditionEngine } = await import('../utils/ConditionEngine');
        
        let repeatingContext = null;
        if (element.repeatingContext) {
          repeatingContext = element.repeatingContext;
        } else if (element.parentRepeatingContext) {
          repeatingContext = element.parentRepeatingContext;
        }
        
        const conditionEngine = new ConditionEngine(availableElements, repeatingContext);
        const evaluationResult = await conditionEngine.shouldRenderElement(element);
        
        let shouldRender, matchedConditionIndex;
        if (typeof evaluationResult === 'boolean') {
          shouldRender = evaluationResult;
          matchedConditionIndex = evaluationResult ? 0 : -1;
        } else {
          shouldRender = evaluationResult.shouldRender;
          matchedConditionIndex = evaluationResult.conditionIndex;
        }
        
        if (shouldRender) {
          conditionMatches[element.id] = matchedConditionIndex;
          
          let elementToRender = { ...element };
          
          if (matchedConditionIndex >= 0 && element.conditions[matchedConditionIndex]?.properties) {
            const matchedCondition = element.conditions[matchedConditionIndex];
            elementToRender.properties = {
              ...element.properties,
              ...matchedCondition.properties
            };
          }
          
          if (elementToRender.children && elementToRender.children.length > 0) {
            const { visibleElements: visibleChildren, conditionMatches: childMatches } = 
              await getVisibleElementsWithMatches(elementToRender.children, availableElements);
            elementToRender.children = visibleChildren;
            Object.assign(conditionMatches, childMatches);
          }
          
          visibleElements.push(elementToRender);
        }
      } else {
        let elementToRender = { ...element };
        
        if (elementToRender.children && elementToRender.children.length > 0) {
          const { visibleElements: visibleChildren, conditionMatches: childMatches } = 
            await getVisibleElementsWithMatches(elementToRender.children, availableElements);
          elementToRender.children = visibleChildren;
          Object.assign(conditionMatches, childMatches);
        }
        
        visibleElements.push(elementToRender);
      }
    }
    
    return { visibleElements, conditionMatches };
  };

  const getRepeatingContextForElement = (element, containerData) => {
    if (element.parentRepeatingContext) {
      return element.parentRepeatingContext;
    }
    
    if (element.repeatingContext) {
      return element.repeatingContext;
    }
    
    // For nested page elements, check if they need repeating context from main screen containers
    // This handles cases where page elements reference repeating containers from the main screen
    if (element.properties?.value && element.properties.value.includes('{{CALC:')) {
      // Extract calculation IDs to see if they reference repeating containers
      const calcMatches = element.properties.value.match(/{{CALC:([^}]+)}}/g);
      
      if (calcMatches) {
        for (const match of calcMatches) {
          const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
          
          // Get calculation config from global storage
          const calcData = window.superTextCalculations?.[calcId];
          
          if (calcData && calcData.source === 'repeating_container') {
            const containerId = calcData.repeatingContainerId;
            
            // Check if we have container data for this container
            if (containerData[containerId] && containerData[containerId].records) {
              // For page elements, we'll use the first record as context
              const context = {
                containerId: containerId,
                recordData: containerData[containerId].records[0],
                rowIndex: 0
              };
              return context;
            }
          }
        }
      }
      
      // FALLBACK: If no global calculation data is available, but we have container data,
      // provide context for any available repeating container
      // This is a fallback for when calculation data isn't passed properly
      if (!window.superTextCalculations && Object.keys(containerData).length > 0) {
        console.log('🔍 FALLBACK: Using fallback context for element:', element.id);
        console.log('🔍 FALLBACK: Available containers:', Object.keys(containerData));
        console.log('🔍 FALLBACK: Active tabs state:', window.__activeTabs);
        
        // Check if the calculation seems to reference a known container
        for (const containerId of Object.keys(containerData)) {
          if (containerData[containerId] && containerData[containerId].records && containerData[containerId].records.length > 0) {
            // Determine which record to use based on active tab state
            let recordIndex = 0; // Default to first record
            
            console.log(`🔍 FALLBACK: Checking container ${containerId} with ${containerData[containerId].records.length} records`);
            
            // Check if this container is used in a tabs container and get the active tab
            if (window.__activeTabs) {
              console.log('🔍 FALLBACK: Active tabs found:', window.__activeTabs);
              // Find tabs containers that might contain this repeating container
              for (const [tabsContainerId, activeTabIndex] of Object.entries(window.__activeTabs)) {
                console.log(`🔍 FALLBACK: Checking tabs container ${tabsContainerId} with active tab ${activeTabIndex}`);
                // Use the active tab index if available
                if (typeof activeTabIndex === 'number' && activeTabIndex < containerData[containerId].records.length) {
                  recordIndex = activeTabIndex;
                  console.log(`🔍 FALLBACK: Using record index ${recordIndex} for container ${containerId}`);
                  break;
                }
              }
            } else {
              console.log('🔍 FALLBACK: No active tabs found, using default record index 0');
            }
            
            const context = {
              containerId: containerId,
              recordData: containerData[containerId].records[recordIndex],
              rowIndex: recordIndex
            };
            console.log('🔍 FALLBACK: Returning context:', context);
            return context;
          }
        }
      }
    }
    
    return null;
  };

  // Execute calculations for nested page elements
  const executeNestedPageElementCalculations = async (pageElements, parentContainerId, allElements, results, errors, containerData) => {
    console.log('🔄 Executing nested page element calculations for container:', parentContainerId);
    console.log('🔄 Original page elements:', pageElements);
    console.log('🔄 Container data available:', Object.keys(containerData));
    
    // First, expand any repeating containers in the page elements
    const expandedPageElements = await expandRepeatingContainers(pageElements, containerData);
    console.log('🔄 Expanded page elements:', expandedPageElements);
    
    const processElements = async (elements, depth = 0) => {
      for (const element of elements) {
        if (element.type === 'text' && element.properties?.value) {
          try {
            const calculationStorage = extractCalculationStorage(element.properties.value);
            
            // Get repeating context for this element if it exists
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            console.log('🔄 Repeating context for nested element:', element.id, repeatingContext);
            
            // Debug: Log the record data being used
            if (repeatingContext && repeatingContext.recordData) {
              console.log('🔍 CALC DEBUG: Record data for element', element.id, ':', repeatingContext.recordData);
              console.log('🔍 CALC DEBUG: Row index:', repeatingContext.rowIndex);
            }
            
            const executedValue = await executeTextCalculations(
              element.properties.value,
              allElements,
              calculationStorage,
              repeatingContext, // Pass the repeating context
              elements // Use page elements as context
            );
            
            console.log('🔍 CALC RESULT: Executed value for element', element.id, ':', executedValue);
            
            // Use original element ID for storage (strip repeating context suffixes)
            const originalElementId = element.originalId || element.id;
            
            // Store with multiple ID patterns that Container.js expects
            const nestedId = `nested_${parentContainerId}_${originalElementId}`;
            const simpleNestedId = `nested_${originalElementId}`;
            
            results[nestedId] = executedValue;
            results[simpleNestedId] = executedValue;
            results[originalElementId] = executedValue; // Also store with original ID
            
            // Also store with the current (expanded) ID for compatibility
            results[element.id] = executedValue;
            
            console.log('✅ Executed nested page calculation:', {
              elementId: element.id,
              nestedId,
              simpleNestedId,
              value: element.properties.value,
              result: executedValue,
              repeatingContext: repeatingContext
            });
          } catch (error) {
            console.error(`Error executing calculation for nested page element ${element.id}:`, error);
            errors[element.id] = error.message;
            
            // Store error with multiple ID patterns
            const nestedId = `nested_${parentContainerId}_${element.id}`;
            const simpleNestedId = `nested_${element.id}`;
            const errorMessage = `[Error: ${error.message}]`;
            
            results[nestedId] = errorMessage;
            results[simpleNestedId] = errorMessage;
            results[element.id] = errorMessage;
          }
        }
        
        // Recursively process children
        if (element.children && element.children.length > 0) {
          await processElements(element.children, depth + 1);
        }
      }
    };
    
    await processElements(expandedPageElements);
  };

  const extractCalculationStorage = (textValue) => {
    const storage = {};
    
    // Extract calculation IDs from the text value
    const calcMatches = textValue.match(/{{CALC:([^}]+)}}/g);
    if (calcMatches) {
      calcMatches.forEach(match => {
        const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
        
        // Try to get from global storage first
        if (window.superTextCalculations && window.superTextCalculations[calcId]) {
          storage[calcId] = window.superTextCalculations[calcId];
        } else {
          // Try localStorage
          try {
            const stored = localStorage.getItem(`calc_${calcId}`);
            if (stored) {
              storage[calcId] = JSON.parse(stored);
            }
          } catch (error) {
            console.error(`Error loading calculation ${calcId} from localStorage:`, error);
          }
        }
      });
    }
    
    return storage;
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
            {app.screens.map(screen => {
              const handleScreenNavigation = () => {
                // If screen has a URL, navigate to it
                if (screen.url && screen.url.trim() !== '') {
                  console.log('🔗 Navigating to screen URL:', screen.url);
                  navigate(screen.url);
                } else {
                  // If no URL, navigate to root (home screen)
                  console.log('🔗 Navigating to home screen');
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
            🔄 Executing calculations and conditions...
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
        
        {visibleElements.length > 0 ? (
          visibleElements.map(element => renderElement(element))
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

export default AppRuntime;
