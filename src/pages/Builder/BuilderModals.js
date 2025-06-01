import React, { useEffect, useState } from 'react';
import { executeTextCalculations, executeRepeatingContainerQuery } from '../../utils/calculationEngine';
import { getElementByType } from '../../elements';
import { getVisibleElements } from '../../utils/ConditionEngine';

// ============================================
// CREATE SCREEN MODAL
// ============================================

const CreateScreenModal = ({ 
  showCreateScreenModal, 
  newScreenName, 
  setNewScreenName, 
  createScreen, 
  onClose 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      createScreen();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!showCreateScreenModal) return null;

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
        padding: '20px',
        borderRadius: '8px',
        width: '300px'
      }}>
        <h3>Create New Screen</h3>
        <input
          type="text"
          placeholder="Screen name"
          value={newScreenName}
          onChange={(e) => setNewScreenName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            marginBottom: '15px'
          }}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={createScreen}
            disabled={!newScreenName.trim()}
            style={{
              padding: '8px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              opacity: !newScreenName.trim() ? 0.5 : 1
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};



// ============================================
// SCREEN DETAILS MODAL
// ============================================

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



// ============================================
// PREVIEW MODAL
// ============================================

// Preview Modal Component with Real Calculation Execution AND Conditional Rendering AND Repeating Containers
const PreviewModal = ({ screens, currentScreenId, onClose, onScreenChange }) => {
  const currentScreen = screens.find(screen => screen.id === currentScreenId);
  const [calculationResults, setCalculationResults] = useState({});
  const [visibleElements, setVisibleElements] = useState([]);
  const [elementConditionMatches, setElementConditionMatches] = useState({}); // NEW: Track which condition matched for each element
  const [repeatingContainerData, setRepeatingContainerData] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionErrors, setExecutionErrors] = useState({});

  // Execute calculations and conditional rendering for the current screen
  useEffect(() => {
    if (currentScreen) {
      executeCalculationsAndConditions();
    }
  }, [currentScreen]);

  const executeCalculationsAndConditions = async () => {
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
      
      
      // Step 3: Execute conditional rendering on expanded elements - ENHANCED to track condition matches
      
      const { visibleElements: filteredElements, conditionMatches } = await getVisibleElementsWithMatches(expandedElements, allElements);
      
      
      setVisibleElements(filteredElements);
      setElementConditionMatches(conditionMatches); // NEW: Store condition matches
      
      // Step 4: Execute calculations on visible elements AND nested page elements
      
      const results = {};
      const errors = {};
      const visibleFlatElements = getAllElementsInScreen(filteredElements);
      
      // ENHANCED: Also get elements from nested pages
      const nestedPageElements = await getNestedPageElements(filteredElements, screens);
      
      
      // Combine visible elements with nested page elements
      const allElementsToProcess = [...visibleFlatElements, ...nestedPageElements];
      
      for (const element of allElementsToProcess) {
        if (element.type === 'text' && element.properties?.value) {
          try {
            const calculationStorage = extractCalculationStorage(element.properties.value);
            
            // Get repeating context if element is inside a repeating container
            const repeatingContext = getRepeatingContextForElement(element, containerData);
            
            // ENHANCED: For nested page elements, create a custom calculation engine with parameter context
            if (element.parentPageContainer) {
              
              
              // Import and create custom calculation engine
              const { CalculationEngine } = await import('../../utils/calculationEngine');
              const calculationEngine = new CalculationEngine(allElements, repeatingContext, filteredElements);
              
              // Set the nested page context for parameter resolution
              calculationEngine.nestedPageContext = {
                parentPageContainer: element.parentPageContainer
              };
              
              // Execute calculations with the custom engine
              let result = element.properties.value;
              const calcMatches = result.match(/{{CALC:([^}]+)}}/g);
              
              if (calcMatches) {
                for (const match of calcMatches) {
                  const calculationId = match.match(/{{CALC:([^}]+)}}/)[1];
                  
                  try {
                    // Get calculation from storage
                    let calculation = null;
                    if (window.superTextCalculations && window.superTextCalculations[calculationId]) {
                      calculation = window.superTextCalculations[calculationId];
                    } else {
                      const stored = localStorage.getItem(`calc_${calculationId}`);
                      if (stored) {
                        calculation = JSON.parse(stored);
                      }
                    }
                    
                    if (calculation && calculation.steps) {
                      const calculatedValue = await calculationEngine.executeCalculation(calculation.steps);
                      result = result.replace(match, calculatedValue);
                    } else {
                      result = result.replace(match, `[Missing: ${calculationId.slice(-6)}]`);
                    }
                  } catch (error) {
                    console.error(`Error executing nested calculation ${calculationId}:`, error);
                    result = result.replace(match, `[Error: ${error.message}]`);
                  }
                }
              }
              
              results[element.id] = result;
            } else {
              // Regular element calculation
              const executedValue = await executeTextCalculations(
                element.properties.value, 
                allElements, // Use all elements for calculations
                calculationStorage,
                repeatingContext, // Pass repeating context
                filteredElements // ENHANCED: Pass expanded elements for tabs container searches
              );
              results[element.id] = executedValue;
            }
          } catch (error) {
            console.error(`Error executing calculations for element ${element.id}:`, error);
            errors[element.id] = error.message;
            results[element.id] = `[Error: ${error.message}]`;
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

  // ENHANCED: Get visible elements AND track which condition matched for each element
  const getVisibleElementsWithMatches = async (elements, availableElements) => {
    const { getVisibleElements } = await import('../../utils/ConditionEngine');
    
    // We need to modify the ConditionEngine to return condition match info
    // For now, let's implement a simple version here
    const visibleElements = [];
    const conditionMatches = {};
    
    for (const element of elements) {
      if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
        // Import and use the ConditionEngine
        const { ConditionEngine } = await import('../../utils/ConditionEngine');
        
        // Extract repeating context from the element
        let repeatingContext = null;
        if (element.repeatingContext) {
          repeatingContext = element.repeatingContext;
        } else if (element.parentRepeatingContext) {
          repeatingContext = element.parentRepeatingContext;
        }
        
        // Create ConditionEngine with the repeating context
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
          // Store which condition matched
          conditionMatches[element.id] = matchedConditionIndex;
          
          // Create element with the matched condition's properties
          let elementToRender = { ...element };
          
          if (matchedConditionIndex >= 0 && element.conditions[matchedConditionIndex]?.properties) {
            const matchedCondition = element.conditions[matchedConditionIndex];
            elementToRender.properties = {
              ...element.properties,
              ...matchedCondition.properties
            };
          }
          
          // Recursively process children
          if (elementToRender.children && elementToRender.children.length > 0) {
            const { visibleElements: visibleChildren, conditionMatches: childMatches } = 
              await getVisibleElementsWithMatches(elementToRender.children, availableElements);
            elementToRender.children = visibleChildren;
            // Merge child condition matches
            Object.assign(conditionMatches, childMatches);
          }
          
          visibleElements.push(elementToRender);
        }
      } else {
        // Non-conditional element - always include
        let elementToRender = { ...element };
        
        // Recursively process children
        if (elementToRender.children && elementToRender.children.length > 0) {
          const { visibleElements: visibleChildren, conditionMatches: childMatches } = 
            await getVisibleElementsWithMatches(elementToRender.children, availableElements);
          elementToRender.children = visibleChildren;
          // Merge child condition matches
          Object.assign(conditionMatches, childMatches);
        }
        
        visibleElements.push(elementToRender);
      }
    }
    
    return { visibleElements, conditionMatches };
  };

  // Load data for all repeating containers
  const loadRepeatingContainerData = async (elements) => {
    const containerData = {};
    const repeatingContainers = findRepeatingContainers(elements);
    
    console.log('Found repeating containers:', repeatingContainers.length);
    
    for (const container of repeatingContainers) {
      const { databaseId, tableId, filters } = container.repeatingConfig;
      
      try {
        console.log(`Loading data for container ${container.id}:`, { databaseId, tableId, filters });
        const records = await executeRepeatingContainerQuery(databaseId, tableId, filters);
        containerData[container.id] = {
          records,
          config: container.repeatingConfig
        };
        console.log(`Loaded ${records.length} records for container ${container.id}`);
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

  // Find all repeating containers in the element tree
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

  // Expand repeating containers into multiple instances
  const expandRepeatingContainers = async (elements, containerData) => {
    const expanded = [];
    
    for (const element of elements) {
      if (element.type === 'container' && element.contentType === 'repeating') {
        // This is a repeating container
        const data = containerData[element.id];
        
        if (data && data.records && data.records.length > 0) {
          // Create multiple instances of this container
          for (let i = 0; i < data.records.length; i++) {
            const record = data.records[i];
            const instanceId = `${element.id}_instance_${i}`;
            
            // Create container instance with repeating context
            const containerInstance = {
              ...element,
              id: instanceId,
              originalId: element.id, // Keep track of original ID
              // FIXED: Preserve all container configurations including sliderConfig and tabsConfig
              containerType: element.containerType,
              sliderConfig: element.sliderConfig,
              tabsConfig: element.tabsConfig,
              repeatingConfig: element.repeatingConfig,
              repeatingContext: {
                containerId: element.id,
                recordData: record,
                rowIndex: i
              },
              // Recursively expand children
              children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
            };
            
            // Update child elements with repeating context
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
          // No data or error - show empty container
          expanded.push({
            ...element,
            children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
          });
        }
      } else {
        // Regular element - recursively process children
        const expandedElement = {
          ...element,
          children: element.children ? await expandRepeatingContainers(element.children, containerData) : []
        };
        expanded.push(expandedElement);
      }
    }
    
    return expanded;
  };

  // Update children with repeating context information
  const updateChildrenWithRepeatingContext = async (children, containerId, recordData, rowIndex, containerData) => {
    const updated = [];
    
    for (const child of children) {
      const updatedChild = {
        ...child,
        id: `${child.id}_repeat_${containerId}_${rowIndex}`, // Unique ID for this instance
        originalId: child.id, // Keep original ID for reference
        parentRepeatingContext: {
          containerId,
          recordData,
          rowIndex
        }
      };
      
      // Recursively update grandchildren
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

  // Get repeating context for an element (for calculations)
  const getRepeatingContextForElement = (element, containerData) => {
    // Check if element has parent repeating context
    if (element.parentRepeatingContext) {
      return element.parentRepeatingContext;
    }
    
    // Check if element itself is a repeating container instance
    if (element.repeatingContext) {
      return element.repeatingContext;
    }
    
    return null;
  };

  // Helper function to extract calculation storage (simplified)
  const extractCalculationStorage = (textValue) => {
    return {};
  };

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

  // Get elements from nested pages (for page containers)
  const getNestedPageElements = async (elements, availableScreens) => {
    const nestedElements = [];
    
    const findPageContainers = (elementList) => {
      const pageContainers = [];
      elementList.forEach(element => {
        if (element.type === 'container' && element.contentType === 'page' && element.pageConfig?.selectedPageId) {
          pageContainers.push(element);
        }
        if (element.children && element.children.length > 0) {
          pageContainers.push(...findPageContainers(element.children));
        }
      });
      return pageContainers;
    };
    
    const pageContainers = findPageContainers(elements);
    
    
    for (const pageContainer of pageContainers) {
      const selectedScreen = availableScreens.find(screen => screen.id == pageContainer.pageConfig.selectedPageId);
      
      if (selectedScreen && selectedScreen.elements) {
        
        
        // Get all elements from the nested page
        const pageElements = getAllElementsInScreen(selectedScreen.elements);
        
        // Add page container context to each element for parameter resolution
        pageElements.forEach(element => {
          if (element.type === 'text' && element.properties?.value) {
            // Create a unique ID for nested page elements
            const nestedElement = {
              ...element,
              id: `nested_${pageContainer.id}_${element.id}`,
              originalId: element.id,
              parentPageContainer: {
                id: pageContainer.id,
                parameters: pageContainer.pageConfig?.parameters || []
              }
            };
            nestedElements.push(nestedElement);
            
          }
        });
      }
    }
    
    
    return nestedElements;
  };

  // Check if an element should have active tab styling
  const checkIfElementIsActiveTab = (element) => {
    // Helper function to extract original ID from repeating container instance ID
    const getOriginalElementId = (elementId) => {
      // Remove _instance_X suffix if present
      return elementId.replace(/_instance_\d+$/, '');
    };
    
    // Helper function to get the instance index from repeating container ID
    const getInstanceIndex = (elementId) => {
      const match = elementId.match(/_instance_(\d+)$/);
      return match ? parseInt(match[1]) : -1;
    };
    
    // Find tabs containers in the current screen elements (original structure)
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
        // This element is a child of this tabs container!
  
        
        // Get the active tab index from global state or config
        const globalActiveTab = window.__activeTabs && window.__activeTabs[tabsContainer.id];
        const configActiveTab = tabsContainer.tabsConfig?.activeTab;
        
        // Determine the active tab index (0-based)
        let activeTabIndex = 0;
        if (globalActiveTab !== undefined) {
          activeTabIndex = globalActiveTab;
        } else if (configActiveTab) {
          // Convert 1-based string to 0-based index
          activeTabIndex = Math.max(0, parseInt(configActiveTab) - 1);
        }
        
        // For repeating containers, we need to check if this specific instance should be active
        let isActive = false;
        if (instanceIndex >= 0) {
          // This is a repeating container instance
          // For tabs with repeating containers, the active tab index should match the instance index
          // NOT the child index (since all instances have the same child index)
          isActive = (instanceIndex === activeTabIndex);
   
        } else {
          // This is a regular (non-repeating) element
          isActive = (childIndex === activeTabIndex);
     
        }
        
   
        
        return isActive;
      }
    }
    

    return false;
  };

  // Copy focused debug data for parameter passing issue
  const copyDebugData = async () => {
    try {
      // Get current processing data
      const visibleFlatElements = getAllElementsInScreen(visibleElements);
      const nestedPageElements = await getNestedPageElements(visibleElements, screens);
      const allElementsToProcess = [...visibleFlatElements, ...nestedPageElements];
      
      // Find page containers with parameters
      const findPageContainers = (elements) => {
        const pageContainers = [];
        const traverse = (elementList) => {
          elementList.forEach(el => {
            if (el.type === 'container' && el.contentType === 'page') {
              pageContainers.push({
                id: el.id,
                selectedPageId: el.pageConfig?.selectedPageId,
                parameters: el.pageConfig?.parameters || []
              });
            }
            if (el.children && el.children.length > 0) {
              traverse(el.children);
            }
          });
        };
        traverse(elements);
        return pageContainers;
      };

      // Find tabs containers
      const findTabsContainers = (elements) => {
        const tabsContainers = [];
        const traverse = (elementList) => {
          elementList.forEach(el => {
            if (el.type === 'container' && el.containerType === 'tabs') {
              tabsContainers.push({
                id: el.id,
                tabsConfig: el.tabsConfig,
                activeTabValue: window.__activeTabs?.[el.id]
              });
            }
            if (el.children && el.children.length > 0) {
              traverse(el.children);
            }
          });
        };
        traverse(elements);
        return tabsContainers;
      };

      const pageContainers = findPageContainers(currentScreen?.elements || []);
      const tabsContainers = findTabsContainers(currentScreen?.elements || []);
      
      // Get only relevant calculations
      const getRelevantCalculations = () => {
        const relevantCalcs = {};
        
        // Get parameter calculations
        pageContainers.forEach(pc => {
          pc.parameters.forEach(param => {
            if (param.value && param.value.includes('{{CALC:')) {
              const calcMatches = param.value.match(/{{CALC:([^}]+)}}/g) || [];
              calcMatches.forEach(match => {
                const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
                if (window.superTextCalculations?.[calcId]) {
                  relevantCalcs[calcId] = window.superTextCalculations[calcId];
                } else {
                  const stored = localStorage.getItem(`calc_${calcId}`);
                  if (stored) {
                    try {
                      relevantCalcs[calcId] = JSON.parse(stored);
                    } catch (e) {}
                  }
                }
              });
            }
          });
        });
        
        // Get nested page element calculations
        nestedPageElements.forEach(el => {
          if (el.properties?.value?.includes('{{CALC:')) {
            const calcMatches = el.properties.value.match(/{{CALC:([^}]+)}}/g) || [];
            calcMatches.forEach(match => {
              const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
              if (window.superTextCalculations?.[calcId]) {
                relevantCalcs[calcId] = window.superTextCalculations[calcId];
              } else {
                const stored = localStorage.getItem(`calc_${calcId}`);
                if (stored) {
                  try {
                    relevantCalcs[calcId] = JSON.parse(stored);
                  } catch (e) {}
                }
              }
            });
          }
        });
        
        return relevantCalcs;
      };

      const debugData = {
        timestamp: new Date().toISOString(),
        issue: "Parameter passing in nested page containers",
        
        // 1. Current screen info
        currentScreen: {
          id: currentScreen?.id,
          name: currentScreen?.name
        },
        
        // 2. Tabs containers (source of parameter values)
        tabsContainers: tabsContainers,
        
        // 3. Page containers (consumers of parameters)
        pageContainers: pageContainers.filter(pc => pc.parameters.length > 0),
        
        // 4. Nested page elements discovered
        nestedPageElements: nestedPageElements.map(el => ({
          id: el.id,
          originalId: el.originalId,
          originalValue: el.properties?.value,
          parentPageContainer: el.parentPageContainer
        })),
        
        // 5. Calculation results for nested elements
        nestedCalculationResults: Object.keys(calculationResults)
          .filter(key => key.startsWith('nested_'))
          .reduce((acc, key) => {
            acc[key] = calculationResults[key];
            return acc;
          }, {}),
        
        // 6. Parameter calculations
        parameterCalculations: pageContainers.reduce((acc, pc) => {
          pc.parameters.forEach(param => {
            if (param.value && param.value.includes('{{CALC:')) {
              acc.push({
                containerId: pc.id,
                parameterName: param.name,
                parameterValue: param.value,
                calculationTokens: param.value.match(/{{CALC:([^}]+)}}/g) || []
              });
            }
          });
          return acc;
        }, []),
        
        // 7. Relevant calculations only
        relevantCalculations: getRelevantCalculations(),
        
        // 8. Global state
        globalTabsState: window.__activeTabs || {},
        
        // 9. Container processing debug
        containerProcessingDebug: {
          expectedLookupId: `nested_1748526128133_1748519695843`,
          actualCalculationResultKeys: Object.keys(calculationResults),
          containerIdPassedToPageContent: pageContainers.length > 0 ? pageContainers[0].id : 'none'
        },
        
        // 10. Execution errors (if any)
        executionErrors: Object.keys(executionErrors).length > 0 ? executionErrors : "No errors"
      };

      const debugJson = JSON.stringify(debugData, null, 2);
      await navigator.clipboard.writeText(debugJson);
      
      // Show success feedback
      const button = document.querySelector('button[style*="#6f42c1"]');
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        button.style.backgroundColor = '#28a745';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '#6f42c1';
        }, 2000);
      }
      
      console.log('🐛 Focused debug data copied to clipboard:', debugData);
    } catch (error) {
      console.error('Failed to copy debug data:', error);
      alert('Failed to copy debug data. Check console for details.');
    }
  };

  // FIXED: Enhanced renderPreviewElement to use matched condition index
  const renderPreviewElement = (element, depth = 0) => {
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

    const children = element.children && element.children.length > 0 
      ? element.children.map(child => renderPreviewElement(child, depth + 1))
      : null;

    // FIXED: Get the matched condition index for this element
    const matchedConditionIndex = elementConditionMatches[element.id] ?? null;
    
    

    // Check if this element should have active tab styling
    const isActiveTab = checkIfElementIsActiveTab(element);
    
    // FIXED: Render with matched condition index and isActiveTab passed as additional parameters
    const renderedElement = elementDef.render(
      executedElement, 
      depth, 
      false, // not selected
      false, // not drop zone
      {}, // no handlers
      children,
      matchedConditionIndex, // FIXED: Pass the matched condition index
      true, // isExecuteMode - this is preview/execute mode
      false, // isActiveSlide - this will be set by the slider component itself
      isActiveTab, // isActiveTab - check if this element is in the active tab
      screens, // availableScreens - needed for page containers to render nested pages
      calculationResults // calculationResults - pass calculation results to containers
    );
    
    // Add debug info for repeating container instances
    let debugStyle = {};
    if (element.repeatingContext || element.parentRepeatingContext) {
      debugStyle = {
        border: '2px solid #28a745',
        margin: '2px'
      };
    }
    
    return React.cloneElement(renderedElement, {
      key: element.id,
      style: {
        ...renderedElement.props.style,
        ...debugStyle,
        // Remove edit-specific styles
        cursor: 'default',
        // Add error styling if there's an execution error
        ...(executionErrors[element.id] && {
          backgroundColor: '#ffebee',
          border: '1px solid #f44336'
        })
      }
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '1000px',
        height: '80%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Preview Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ margin: 0, color: '#333' }}>
              Preview - {currentScreen?.name}
              {isExecuting && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#28a745', 
                  marginLeft: '10px' 
                }}>
                  🔄 Executing calculations and conditions...
                </span>
              )}
            </h3>
            
            {/* Screen Navigator */}
            <select
              value={currentScreenId}
              onChange={(e) => onScreenChange(parseInt(e.target.value))}
              style={{
                padding: '5px 10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {screens.map(screen => (
                <option key={screen.id} value={screen.id}>
                  {screen.name}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={executeCalculationsAndConditions}
              disabled={isExecuting}
              style={{
                padding: '5px 10px',
                backgroundColor: isExecuting ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isExecuting ? 'not-allowed' : 'pointer',
                fontSize: '12px'
              }}
            >
              {isExecuting ? '🔄' : '🔄 Refresh'}
            </button>

            {/* Debug Data Copy Button */}
            <button
              onClick={copyDebugData}
              style={{
                padding: '5px 10px',
                backgroundColor: '#6f42c1',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              📋 Copy Debug Data
            </button>

            {/* Debug Info */}
            <div style={{ fontSize: '12px', color: '#666' }}>
              Visible: {visibleElements.length} elements | 
              Repeating Containers: {Object.keys(repeatingContainerData).length} |
              Condition Matches: {Object.keys(elementConditionMatches).length}
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Close Preview
          </button>
        </div>

        {/* Execution Errors Display */}
        {Object.keys(executionErrors).length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#ffebee',
            borderBottom: '1px solid #f44336',
            fontSize: '12px',
            color: '#d32f2f'
          }}>
            ⚠️ Execution errors detected. Check console for details.
            {executionErrors.general && ` General error: ${executionErrors.general}`}
          </div>
        )}

        {/* Repeating Container Status */}
        {Object.keys(repeatingContainerData).length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#e8f5e9',
            borderBottom: '1px solid #4caf50',
            fontSize: '12px',
            color: '#2e7d32'
          }}>
            🔄 Repeating Containers Active: {
              Object.entries(repeatingContainerData).map(([containerId, data]) => 
                `${containerId.slice(-6)} (${data.records?.length || 0} records)`
              ).join(', ')
            }
          </div>
        )}

        {/* Condition Matches Display */}
        {Object.keys(elementConditionMatches).length > 0 && (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#e3f2fd',
            borderBottom: '1px solid #2196f3',
            fontSize: '12px',
            color: '#1976d2'
          }}>
            🎯 Conditional Elements: {
              Object.entries(elementConditionMatches).map(([elementId, conditionIndex]) => 
                `${elementId.slice(-6)}→C${conditionIndex + 1}`
              ).join(', ')
            }
          </div>
        )}

        {/* Preview Content */}
        <div style={{
          flex: 1,
          padding: '20px',
          backgroundColor: '#ffffff',
          overflow: 'auto'
        }}>
          {visibleElements.length === 0 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#999',
              fontSize: '18px'
            }}>
              {currentScreen?.elements?.length === 0 
                ? "No elements to preview" 
                : "No elements are visible (all hidden by conditions)"
              }
            </div>
          ) : (
            <div style={{ minHeight: '100%' }}>
              {visibleElements.map(element => renderPreviewElement(element))}
            </div>
          )}
        </div>

        {/* Preview Footer */}
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #ddd',
          backgroundColor: '#f8f9fa',
          fontSize: '12px',
          color: '#666'
        }}>
          💡 This preview shows conditional rendering, calculations, and repeating containers in real-time.
          {Object.keys(executionErrors).length > 0 && (
            <span style={{ color: '#d32f2f', marginLeft: '10px' }}>
              | ⚠️ Some calculations failed - check your database connections and element references.
            </span>
          )}
          <br />
          🔄 Repeating containers are outlined in green. Elements inside show data from each record.
          🎯 Conditional elements show which condition matched (C1, C2, etc.).
        </div>
      </div>
    </div>
  );
};



// Export all modals
export { CreateScreenModal, ScreenDetailsModal, PreviewModal };
