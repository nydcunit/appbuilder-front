import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getElementByType } from '../elements';
import websocketService from '../services/websocketService';
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
    
    
    const handleMessage = (event) => {
      
      
      // Check for CORS issues
      const expectedOrigin = 'http://localhost:3000';
      if (event.origin !== expectedOrigin) {
        console.warn('⚠️ CORS: Message from unexpected origin:', event.origin, 'Expected:', expectedOrigin);
        // Still process the message if it looks valid
      }
      
      if (event.data && event.data.type === 'CALCULATION_DATA') {
        
        
        // Store calculations in global storage
        window.superTextCalculations = event.data.calculations;
        
        // Store active tabs state
        window.__activeTabs = event.data.activeTabs;
        
        // Store authentication token
        if (event.data.authToken) {
          localStorage.setItem('token', event.data.authToken);

          
          // Set up axios defaults for authentication
          axios.defaults.headers.common['Authorization'] = `Bearer ${event.data.authToken}`;
          
        }
        
        // Also store in localStorage for backup
        Object.entries(event.data.calculations).forEach(([calcId, calcData]) => {
          try {
            localStorage.setItem(`calc_${calcId}`, JSON.stringify(calcData));

          } catch (error) {
            console.error(`❌ Error storing calculation ${calcId} in localStorage:`, error);
          }
        });
        
        
        
        // Re-execute calculations if app is already loaded
        if (app && currentScreenId) {
          const currentScreen = app.screens.find(screen => screen.id === currentScreenId);
          if (currentScreen) {
            
            executeCalculationsAndConditions(currentScreen);
          }
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Also try to request data from parent immediately
    if (window.parent && window.parent !== window) {
      
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
          
          setApp(appData);
          
          // Don't set currentScreenId here - let the URL routing effect handle it
          
        } else {
          
          setError('App not found');
        }
      } catch (err) {
        console.error('URL_ROUTING: Error loading app:', err);
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
      
      // First, try to find a screen with matching URL
      if (currentPath !== '/') {
        
        targetScreen = app.screens.find(screen => {
          const screenUrl = screen.url && screen.url.trim() !== '' ? screen.url : null;
          
          // Normalize URLs for comparison
          let normalizedScreenUrl = null;
          let normalizedCurrentPath = currentPath;
          
          if (screenUrl) {
            // Ensure screen URL starts with /
            normalizedScreenUrl = screenUrl.startsWith('/') ? screenUrl : `/${screenUrl}`;
          }
          
          
          const matches = normalizedScreenUrl === normalizedCurrentPath;
          
          return matches;
        });
        
      } else {
        
      }
      
      // If no screen found by URL, use home screen or first screen
      if (!targetScreen) {
        
        const homeScreenId = app.homeScreenId || app.screens[0]?.id;
        
        targetScreen = app.screens.find(screen => screen.id === homeScreenId) || app.screens[0];
        
      }
      
      if (targetScreen) {
        
        if (targetScreen.id !== currentScreenId) {
          
          setCurrentScreenId(targetScreen.id);
        } else {
          
        }
      } else {
        
      }
    } else {
      
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
      
      const containerData = await loadRepeatingContainerData(currentScreen.elements);
      setRepeatingContainerData(containerData);
      
      // Step 2: Expand repeating containers into multiple instances
      
      const expandedElements = await expandRepeatingContainers(currentScreen.elements, containerData);

      
      // Step 3: Execute conditional rendering on expanded elements
      
      const { visibleElements: filteredElements, conditionMatches } = await getVisibleElementsWithMatches(expandedElements, allElements);
      
      
      setVisibleElements(filteredElements);
      setElementConditionMatches(conditionMatches);
      
      // Step 4: Execute calculations on visible elements
      
      const results = {};
      const errors = {};
      const visibleFlatElements = getAllElementsInScreen(filteredElements);
      
      for (const element of visibleFlatElements) {
        // Handle text elements with calculations
        if (element.type === 'text' && element.properties?.value) {
          try {
            const calculationStorage = extractCalculationStorage(element.properties.value);
            
            
            
            // Get repeating context if element is inside a repeating container
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            
            // ENHANCED: Create synthetic calculations for missing calculations, whether in repeating context or not
            if (element.properties.value.includes('{{CALC:')) {
              const calcMatches = element.properties.value.match(/{{CALC:([^}]+)}}/g);
              if (calcMatches) {
                for (const match of calcMatches) {
                  const originalCalcId = match.match(/{{CALC:([^}]+)}}/)[1];
                  
                  // Check if calculation already exists in storage
                  const existsInStorage = calculationStorage[originalCalcId] || 
                                        (window.superTextCalculations && window.superTextCalculations[originalCalcId]);
                  
                  if (!existsInStorage) {
                    
                    
                    // Check if this might be a tabs container calculation
                    if (originalCalcId.includes('calc_') && (element.properties.value.toLowerCase().includes('tab') || 
                        element.properties.value.toLowerCase().includes('active'))) {
                      
                      
                      // Determine the correct calculation type based on the specific calculation ID and text context
                      let containerValueType = 'active_tab_value'; // Default
                      
                      // Check the text around this specific calculation
                      const calcText = element.properties.value.toLowerCase();
                      const calcPosition = calcText.indexOf(`{{calc:${originalCalcId.toLowerCase()}}`);
                      
                      if (calcPosition >= 0) {
                        // Find the closest prefix before this specific calculation
                        const textBeforeCalc = calcText.substring(0, calcPosition);
                        const orderIndex = textBeforeCalc.lastIndexOf('order:');
                        const valueIndex = textBeforeCalc.lastIndexOf('value:');
                        
                        
                        
                        // Use the closest prefix to this specific calculation
                        if (orderIndex > valueIndex && orderIndex >= 0) {
                          containerValueType = 'active_tab_order';
                          
                        } else if (valueIndex > orderIndex && valueIndex >= 0) {
                          containerValueType = 'active_tab_value';
                          
                        } else {
                          
                        }
                      }
                      
                      
                      
                      // Create synthetic tabs calculation
                      calculationStorage[originalCalcId] = {
                        id: originalCalcId,
                        steps: [{
                          id: 'synthetic_tabs_step',
                          config: {
                            source: 'element',
                            elementId: '1748746946008', // The tabs container ID from the canvas
                            containerValueType: containerValueType
                          }
                        }]
                      };
                      
                      // Store in global storage
                      if (!window.superTextCalculations) {
                        window.superTextCalculations = {};
                      }
                      window.superTextCalculations[originalCalcId] = calculationStorage[originalCalcId];
                      
                    }
                  }
                }
              }
            }
            
            // ENHANCED: If we have repeating context, always create/update synthetic calculations
            // for this specific row instance, even if calculations exist globally
            if (repeatingContext && element.properties.value.includes('{{CALC:')) {
              const calcMatches = element.properties.value.match(/{{CALC:([^}]+)}}/g);
              if (calcMatches) {
                for (const match of calcMatches) {
                  const originalCalcId = match.match(/{{CALC:([^}]+)}}/)[1];
                  // Create a unique calculation ID for this row instance
                  const rowSpecificCalcId = `${originalCalcId}_row_${repeatingContext.rowIndex}`;
                  
                  
                  // Try to determine the correct column from the calculation ID or element context
                  let columnName = 'value'; // Default fallback
                  
                  // More sophisticated column detection based on the element's text content
                  const elementText = element.properties.value.toLowerCase();
                  
                  
                  // Find the specific calculation in the text and check what prefix comes before it
                  const escapedCalcId = originalCalcId.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const calcPattern = new RegExp(`{{calc:${escapedCalcId}}}`, 'i');
                  const calcMatch = elementText.match(calcPattern);
                  
                  if (calcMatch) {
                    const calcPosition = calcMatch.index;
                    const textBeforeCalc = elementText.substring(0, calcPosition);
                    
                    
                    // Find the closest prefix before this specific calculation
                    const idIndex = textBeforeCalc.lastIndexOf('id:');
                    const valueIndex = textBeforeCalc.lastIndexOf('value:');
                    
                    
                    
                    if (idIndex > valueIndex && idIndex >= 0) {
                      columnName = 'id';
                      
                    } else if (valueIndex > idIndex && valueIndex >= 0) {
                      columnName = 'value';
                      
                    }
                    // Check if calculation ID itself suggests a column
                    else if (originalCalcId.toLowerCase().includes('id')) {
                      columnName = 'id';
                      
                    }
                    else if (originalCalcId.toLowerCase().includes('value')) {
                      columnName = 'value';
                      
                    }
                    else {
                      // Default to 'value' but log this decision
                      
                    }
                  } else {
                    
                    // Fallback to original logic
                    if (originalCalcId.toLowerCase().includes('id')) {
                      columnName = 'id';
                      
                    } else if (originalCalcId.toLowerCase().includes('value')) {
                      columnName = 'value';
                    
                    } else {
                      
                    }
                  }
                  
                  
                  
                  // Create a synthetic calculation that references the repeating container
                  // Store both with original ID (for local use) and row-specific ID (for global storage)
                  calculationStorage[originalCalcId] = {
                    id: originalCalcId,
                    steps: [{
                      id: 'synthetic_step',
                      config: {
                        source: 'repeating_container',
                        repeatingContainerId: repeatingContext.containerId,
                        repeatingColumn: columnName,
                        rowIndex: repeatingContext.rowIndex
                      }
                    }]
                  };
                  
                  
                  // CRITICAL: Store both original and row-specific versions in global storage
                  if (!window.superTextCalculations) {
                    window.superTextCalculations = {};
                  }
                  // Store with row-specific ID to avoid conflicts between rows
                  window.superTextCalculations[rowSpecificCalcId] = {
                    ...calculationStorage[originalCalcId],
                    id: rowSpecificCalcId
                  };
                  // Also store with original ID for this specific context
                  window.superTextCalculations[originalCalcId] = calculationStorage[originalCalcId];
                  
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
        
        // Handle input elements with calculations
        if (element.type === 'input') {
          try {
            // Get repeating context if element is inside a repeating container
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            
            // Execute calculations for placeholder
            if (element.properties?.placeholder && element.properties.placeholder.includes('{{CALC:')) {
              const calculationStorage = extractCalculationStorage(element.properties.placeholder);
              const executedValue = await executeTextCalculations(
                element.properties.placeholder,
                allElements,
                calculationStorage,
                repeatingContext,
                filteredElements
              );
              results[`${element.id}_placeholder`] = executedValue;
            }
            
            // Execute calculations for defaultValue
            if (element.properties?.defaultValue && element.properties.defaultValue.includes('{{CALC:')) {
              const calculationStorage = extractCalculationStorage(element.properties.defaultValue);
              const executedValue = await executeTextCalculations(
                element.properties.defaultValue,
                allElements,
                calculationStorage,
                repeatingContext,
                filteredElements
              );
              results[`${element.id}_defaultValue`] = executedValue;
            }
          } catch (error) {
            console.error(`Error executing calculations for input element ${element.id}:`, error);
            errors[element.id] = error.message;
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
        }),
        ...(element.type === 'input' && {
          ...(calculationResults[`${element.id}_placeholder`] && {
            placeholder: calculationResults[`${element.id}_placeholder`]
          }),
          ...(calculationResults[`${element.id}_defaultValue`] && {
            defaultValue: calculationResults[`${element.id}_defaultValue`]
          })
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
    
    // Also find repeating containers in page content
    const pageContainers = findPageContainers(elements);
    for (const pageContainer of pageContainers) {
      if (pageContainer.pageConfig?.selectedPageId && app?.screens) {
        const selectedScreen = app.screens.find(screen => screen.id == pageContainer.pageConfig.selectedPageId);
        if (selectedScreen && selectedScreen.elements) {
          const pageRepeatingContainers = findRepeatingContainers(selectedScreen.elements);
          
          repeatingContainers.push(...pageRepeatingContainers);
        }
      }
    }
    
    
    
    for (const container of repeatingContainers) {
      const { databaseId, tableId, filters } = container.repeatingConfig;
      
      try {
        
        const records = await executeRepeatingContainerQuery(databaseId, tableId, filters);
        
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
    
    return null;
  };

  // Execute calculations for nested page elements
  const executeNestedPageElementCalculations = async (pageElements, parentContainerId, allElements, results, errors, containerData) => {
    
    const processElements = async (elements, depth = 0) => {
      for (const element of elements) {
        if (element.type === 'text' && element.properties?.value) {
          try {
            const calculationStorage = extractCalculationStorage(element.properties.value);
            
            // Get repeating context for this element if it exists
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            
            const executedValue = await executeTextCalculations(
              element.properties.value,
              allElements,
              calculationStorage,
              repeatingContext,
              elements
            );
            
            // Store with multiple ID patterns
            const nestedId = `nested_${parentContainerId}_${element.id}`;
            const simpleNestedId = `nested_${element.id}`;
            
            results[nestedId] = executedValue;
            results[simpleNestedId] = executedValue;
            results[element.id] = executedValue;
          } catch (error) {
            console.error(`Error executing calculation for nested page element ${element.id}:`, error);
            errors[element.id] = error.message;
          }
        }
        
        // Recursively process children
        if (element.children && element.children.length > 0) {
          await processElements(element.children, depth + 1);
        }
      }
    };
    
    await processElements(pageElements);
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
      <LivePreviewListenerIntegrated appId={app._id} />
      
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

// Integrated LivePreviewListener component
const LivePreviewListenerIntegrated = ({ appId }) => {
  useEffect(() => {
    // Only set up live preview if we're in a subdomain (preview window)
    const isPreviewWindow = window.location.hostname !== 'localhost' && 
                           window.location.hostname.includes('.localhost');
    
    if (!isPreviewWindow || !appId) {
      return;
    }

    console.log('🔴 Setting up live preview for app:', appId);

    // Connect to WebSocket and join app room
    websocketService.connect();
    websocketService.joinApp(appId);

    // Listen for app updates
    const handleAppUpdate = (data) => {
      
      
      // Add a small delay to ensure the backend has processed the save
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    websocketService.onAppUpdated(handleAppUpdate);

    // Cleanup on unmount
    return () => {
      websocketService.offAppUpdated(handleAppUpdate);
      websocketService.leaveApp(appId);
    };
  }, [appId]);

  // This component doesn't render anything
  return null;
};

export default AppRuntime;
