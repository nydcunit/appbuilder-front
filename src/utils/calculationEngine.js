import axios from 'axios';

export class CalculationEngine {
  constructor(availableElements = [], repeatingContext = null, expandedElements = null) {
    this.availableElements = availableElements;
    this.expandedElements = expandedElements; // NEW: Expanded elements for execute mode
    this.elementValues = {};
    this.repeatingContext = repeatingContext; // { containerId, recordData, rowIndex }
    
    // Pre-compute element values for quick lookup
    this.availableElements.forEach(element => {
      if (element.type === 'text' && element.properties?.value) {
        this.elementValues[element.id] = element.properties.value;
      }
    });
  }

  // Main execution function
  async executeCalculation(calculationSteps) {
    if (!calculationSteps || calculationSteps.length === 0) {
      return '';
    }

    let result = null;
    
    for (let i = 0; i < calculationSteps.length; i++) {
      const step = calculationSteps[i];
      let stepValue;

      try {
        // Execute individual step
        stepValue = await this.executeStep(step);
        
        if (i === 0) {
          // First step - initialize result
          result = stepValue;
        } else {
          // Subsequent steps - apply operation
          result = await this.applyOperation(result, stepValue, step.config.operation);
        }
      } catch (error) {
        console.error(`Error executing step ${i}:`, error);
        return `[Error in step ${i + 1}: ${error.message}]`;
      }
    }

    return result !== null ? String(result) : '';
  }

  // Execute a single calculation step
  async executeStep(step) {
    const { config } = step;

    switch (config.source) {
      case 'custom':
        return await this.executeCustomValue(config.value);
      
      case 'element':
        return await this.executeElementValue(config.elementId, config.containerValueType);
      
      case 'database':
        return await this.executeDatabaseQuery(config);
      
      case 'repeating_container':
        return this.executeRepeatingContainerValue(config);
      
      case 'passed_parameter':
        return this.executePassedParameter(config);
      
      case 'timestamp':
        return new Date().toISOString();
      
      case 'screen_width':
        return window.innerWidth;
      
      case 'screen_height':
        return window.innerHeight;
      
      default:
        throw new Error(`Unknown source type: ${config.source}`);
    }
  }

  // Execute tabs container value
  async executeTabsContainerValue(element, valueType) {
    console.log('\n📑 === TABS CONTAINER VALUE EXECUTION ===');
    console.log('Element:', element.id);
    console.log('Value type:', valueType);
    console.log('Element structure:', JSON.stringify(element, null, 2));
    
    // ENHANCED: Try to find expanded tabs container if available
    let tabsElement = element;
    if (window.__expandedElements) {
      console.log('🔍 Checking for expanded tabs container...');
      for (const screenElements of Object.values(window.__expandedElements)) {
        const findExpandedTabs = (elements) => {
          for (const el of elements) {
            if ((el.id === element.id || el.originalId === element.id) && 
                el.type === 'container' && el.containerType === 'tabs') {
              console.log('✅ Found expanded tabs container:', el.id);
              return el;
            }
            if (el.children && el.children.length > 0) {
              const found = findExpandedTabs(el.children);
              if (found) return found;
            }
          }
          return null;
        };
        
        const expandedTabs = findExpandedTabs(screenElements);
        if (expandedTabs) {
          tabsElement = expandedTabs;
          console.log('🔄 Using expanded tabs container for calculation');
          break;
        }
      }
    }
    
    // Get tabs config
    const tabsConfig = tabsElement.tabsConfig ? {
      activeTab: tabsElement.tabsConfig.activeTab || '1'
    } : {
      activeTab: '1'
    };
    
    console.log('Tabs config:', tabsConfig);
    
    // Check global active tabs state
    let currentActiveTab;
    if (element.id && window.__activeTabs && window.__activeTabs[element.id] !== undefined) {
      currentActiveTab = window.__activeTabs[element.id];
      console.log('Using global active tab:', currentActiveTab);
    } else {
      // Parse activeTab from config (could be number or text value)
      const activeTab = tabsConfig.activeTab || '1';
      const tabNumber = parseInt(activeTab);
      if (!isNaN(tabNumber) && tabNumber > 0) {
        currentActiveTab = tabNumber - 1; // Convert to 0-based
      } else {
        // Try to find by text value
        currentActiveTab = this.findTabIndexByValue(activeTab, tabsElement);
        if (currentActiveTab === -1) currentActiveTab = 0;
      }
      console.log('Using config active tab:', currentActiveTab);
    }
    
    if (valueType === 'active_tab_order') {
      // Return the active tab order (1-based)
      const activeTabOrder = currentActiveTab + 1;
      console.log('✅ Active tab order:', activeTabOrder);
      console.log('📑 === TABS CONTAINER END ===\n');
      return activeTabOrder;
    }
    
    if (valueType === 'active_tab_value') {
      // FIXED: Find the active tab's text value using improved search
      const tabValue = await this.findTabTextValueImproved(tabsElement, currentActiveTab);
      
      if (tabValue === null || tabValue === '') {
        console.log('❌ No tab text element found for tab:', currentActiveTab + 1);
        console.log('Available children:', tabsElement.children?.map(c => ({ id: c.id, type: c.type, properties: c.properties })));
        // Return empty string instead of throwing error
        return '';
      }
      
      console.log('✅ Active tab value:', tabValue);
      console.log('📑 === TABS CONTAINER END ===\n');
      
      return tabValue;
    }
    
    throw new Error(`Unknown tabs container value type: ${valueType}`);
  }

  // Helper function to find tab index by value
  findTabIndexByValue(value, element) {
    if (!value || !element.children) return -1;
    
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i];
      if (!child) continue;
      
      // Recursively search for text element with matching value
      const findTabValue = (el) => {
        if (el.type === 'text' && el.properties?.isTabValue === true) {
          return el.properties?.value || '';
        }
        
        if (el.children) {
          for (const childEl of el.children) {
            const result = findTabValue(childEl);
            if (result) return result;
          }
        }
        
        return null;
      };
      
      const tabValue = findTabValue(child);
      if (tabValue === value) {
        return i;
      }
    }
    
    return -1;
  }

  // Helper function to find tab text value
  findTabTextValue(element, tabIndex) {
    if (!element.children || element.children.length <= tabIndex) {
      return null;
    }
    
    // Get the tab element (first level child at tabIndex)
    const tabElement = element.children[tabIndex];
    if (!tabElement) return null;
    
    // Recursively search for text elements with isTabValue = true
    const findTabText = (el) => {
      if (el.type === 'text' && el.properties?.isTabValue === true) {
        return el.properties?.value || '';
      }
      
      if (el.children) {
        for (const child of el.children) {
          const result = findTabText(child);
          if (result !== null) return result;
        }
      }
      
      return null;
    };
    
    return findTabText(tabElement);
  }

  // Helper function to find expanded element by original ID
  findExpandedElement(originalId) {
    if (!this.expandedElements) {
      return null;
    }
    
    const findInExpanded = (elements) => {
      for (const element of elements) {
        // Check if this element matches the original ID
        if (element.id === originalId || element.originalId === originalId) {
          return element;
        }
        
        // Recursively search children
        if (element.children && element.children.length > 0) {
          const found = findInExpanded(element.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findInExpanded(this.expandedElements);
  }

  // IMPROVED: Helper function to find tab text value with better search logic
  async findTabTextValueImproved(element, tabIndex) {
    console.log('🔍 Finding tab text value for tab index:', tabIndex);
    console.log('🔍 Element children count:', element.children?.length || 0);
    console.log('🔍 Element structure:', {
      id: element.id,
      type: element.type,
      containerType: element.containerType,
      hasExpandedElements: !!this.expandedElements
    });
    
    if (!element.children || element.children.length <= tabIndex) {
      console.log('❌ No children or tab index out of bounds');
      return null;
    }
    
    // Get the tab element (first level child at tabIndex)
    let tabElement = element.children[tabIndex];
    if (!tabElement) {
      console.log('❌ No tab element at index:', tabIndex);
      return null;
    }
    
    console.log('🔍 Original tab element:', {
      id: tabElement.id,
      type: tabElement.type,
      contentType: tabElement.contentType,
      hasChildren: !!tabElement.children,
      childrenCount: tabElement.children?.length || 0
    });
    
    // ENHANCED: If this is a repeating container, find its expanded instances
    if (tabElement.contentType === 'repeating' && this.expandedElements) {
      console.log('🔄 Tab element is a repeating container, searching for expanded instances...');
      
      // Find all expanded instances of this repeating container
      const findExpandedInstances = (elements) => {
        const instances = [];
        for (const element of elements) {
          if (element.originalId === tabElement.id || element.id.startsWith(tabElement.id + '_instance_')) {
            instances.push(element);
          }
          if (element.children && element.children.length > 0) {
            instances.push(...findExpandedInstances(element.children));
          }
        }
        return instances;
      };
      
      const expandedInstances = findExpandedInstances(this.expandedElements);
      console.log('🔄 Found expanded instances:', expandedInstances.length);
      
      // Search through all expanded instances for tab text
      for (const instance of expandedInstances) {
        console.log('🔍 Searching expanded instance:', {
          id: instance.id,
          originalId: instance.originalId,
          hasChildren: !!instance.children
        });
        
        const result = await this.searchForTabText(instance);
        if (result !== null && result !== '') {
          console.log('✅ Found tab text in expanded instance:', result);
          return result;
        }
      }
    }
    
    // Fallback to original search logic
    console.log('🔄 Searching in original tab element structure...');
    const result = await this.searchForTabText(tabElement);
    
    console.log('🔍 Final tab text result:', result);
    return result;
  }

  // Helper function to search for tab text in an element
  async searchForTabText(element) {
    const findTabText = async (el, depth = 0) => {
      const indent = '  '.repeat(depth);
      console.log(`${indent}🔍 Checking element:`, {
        id: el.id,
        type: el.type,
        isTabValue: el.properties?.isTabValue,
        value: el.properties?.value
      });
      
      // Check if this is a text element with isTabValue = true
      if (el.type === 'text' && el.properties?.isTabValue === true) {
        let value = el.properties?.value || '';
        console.log(`${indent}✅ Found tab text:`, value);
        
        // ENHANCED: Check if the value contains nested calculations and execute them
        if (value.includes('{{CALC:')) {
          console.log(`${indent}🔄 Tab text contains nested calculations, executing...`);
          try {
            // ENHANCED: Pass the element's repeating context if it exists
            const elementRepeatingContext = el.parentRepeatingContext || el.repeatingContext;
            console.log(`${indent}🔄 Using element repeating context:`, elementRepeatingContext);
            const executedValue = await this.executeNestedCalculations(value, elementRepeatingContext);
            console.log(`${indent}✅ Executed nested calculations:`, `"${value}" -> "${executedValue}"`);
            return executedValue;
          } catch (error) {
            console.log(`${indent}❌ Error executing nested calculations:`, error.message);
            return `[Error: ${error.message}]`;
          }
        }
        
        return value;
      }
      
      // Recursively search children
      if (el.children && el.children.length > 0) {
        for (const child of el.children) {
          const result = await findTabText(child, depth + 1);
          if (result !== null && result !== '') {
            return result;
          }
        }
      }
      
      return null;
    };
    
    let result = await findTabText(element);
    
    // FALLBACK: If no text with isTabValue=true found, try to find any text element
    if (result === null || result === '') {
      console.log('🔄 No tab value found, searching for any text element as fallback...');
      
      const findAnyText = async (el, depth = 0) => {
        if (el.type === 'text' && el.properties?.value) {
          let value = el.properties.value;
          console.log(`  Found fallback text:`, value);
          
          // ENHANCED: Execute nested calculations in fallback text too
          if (value.includes('{{CALC:')) {
            console.log(`  Fallback text contains calculations, executing...`);
            try {
              // ENHANCED: Pass the element's repeating context if it exists
              const elementRepeatingContext = el.parentRepeatingContext || el.repeatingContext;
              console.log(`  Using fallback element repeating context:`, elementRepeatingContext);
              const executedValue = await this.executeNestedCalculations(value, elementRepeatingContext);
              console.log(`  Executed fallback calculations:`, `"${value}" -> "${executedValue}"`);
              return executedValue;
            } catch (error) {
              console.log(`  Error executing fallback calculations:`, error.message);
              return `[Error: ${error.message}]`;
            }
          }
          
          return value;
        }
        
        if (el.children && el.children.length > 0) {
          for (const child of el.children) {
            const result = await findAnyText(child, depth + 1);
            if (result !== null && result !== '') {
              return result;
            }
          }
        }
        
        return null;
      };
      
      result = await findAnyText(element);
    }
    
    return result;
  }

  // Execute slider container value
  executeSliderContainerValue(element, valueType) {
    console.log('\n🎡 === SLIDER CONTAINER VALUE EXECUTION ===');
    console.log('Element:', element.id);
    console.log('Value type:', valueType);
    
    // FIXED: Don't override existing sliderConfig with defaults
    const sliderConfig = element.sliderConfig ? {
      autoPlay: element.sliderConfig.autoPlay || false,
      loop: element.sliderConfig.loop || false,
      slidesToScroll: element.sliderConfig.slidesToScroll || 1,
      activeTab: element.sliderConfig.activeTab || '1'
    } : {
      autoPlay: false,
      loop: false,
      slidesToScroll: 1,
      activeTab: '1'
    };
    
    console.log('Slider config:', sliderConfig);
    
    if (valueType === 'active_slide_number') {
      // Return the active slide number (1-based)
      const activeSlideNumber = parseInt(sliderConfig.activeTab) || 1;
      console.log('✅ Active slide number:', activeSlideNumber);
      console.log('🎡 === SLIDER CONTAINER END ===\n');
      return activeSlideNumber;
    }
    
    if (valueType === 'active_slide_value') {
      // Find the active slide's text value
      const activeSlideIndex = (parseInt(sliderConfig.activeTab) || 1) - 1; // Convert to 0-based
      
      // Helper function to find text elements marked as slide text within a container
      const findSlideTextInContainer = (container, slideIndex) => {
        if (!container.children || container.children.length <= slideIndex) {
          return null;
        }
        
        // Get the slide element (first level child at slideIndex)
        const slideElement = container.children[slideIndex];
        if (!slideElement) return null;
        
        // Recursively search for text elements with isSlideText = true
        const findSlideText = (element) => {
          if (element.type === 'text' && element.properties?.isSlideText === true) {
            return element.properties?.value || '';
          }
          
          if (element.children) {
            for (const child of element.children) {
              const result = findSlideText(child);
              if (result !== null) return result;
            }
          }
          
          return null;
        };
        
        return findSlideText(slideElement);
      };
      
      const slideValue = findSlideTextInContainer(element, activeSlideIndex);
      
      if (slideValue === null) {
        console.log('❌ No slide text element found for slide:', activeSlideIndex + 1);
        // Return empty string instead of throwing error
        return '';
      }
      
      console.log('✅ Active slide value:', slideValue);
      console.log('🎡 === SLIDER CONTAINER END ===\n');
      
      return slideValue;
    }
    
    throw new Error(`Unknown slider container value type: ${valueType}`);
  }

  // Execute passed parameter value
  executePassedParameter(config) {
    console.log('\n📨 === PASSED PARAMETER EXECUTION ===');
    console.log('Config:', JSON.stringify(config, null, 2));
    
    const { passedParameterName, passedParameterFromScreen } = config;
    
    if (!passedParameterName) {
      throw new Error('Parameter name must be specified');
    }
    
    // Look up the parameter value from page containers
    const parameterValue = this.findParameterValue(passedParameterName, passedParameterFromScreen);
    
    console.log('✅ Parameter value found:', parameterValue);
    console.log('📨 === PASSED PARAMETER END ===\n');
    
    return parameterValue;
  }

  // Helper method to find parameter value from page containers
  async findParameterValue(parameterName, fromScreenName) {
    console.log('🔍 Looking for parameter:', parameterName, 'from screen:', fromScreenName);
    
    // ENHANCED: Check if this calculation engine is for a nested page element
    if (this.nestedPageContext && this.nestedPageContext.parentPageContainer) {
      console.log('🔍 This is a nested page element, checking parent page container parameters');
      const parentContainer = this.nestedPageContext.parentPageContainer;
      
      // Look for the parameter in the parent page container
      for (const param of parentContainer.parameters) {
        if (param.name === parameterName) {
          console.log('✅ Found parameter in parent page container:', param);
          let paramValue = param.executedValue || param.value || '';
          
          // If we have an executed value, use it directly
          if (param.executedValue !== undefined) {
            console.log('✅ Using pre-executed parameter value:', param.executedValue);
            return param.executedValue;
          }
          
          // Otherwise execute the calculation if needed
          if (paramValue && paramValue.includes('{{CALC:')) {
            try {
              console.log('🧮 Executing parameter calculation:', paramValue);
              paramValue = await this.executeNestedCalculations(paramValue);
              console.log('🧮 Parameter calculation result:', paramValue);
            } catch (error) {
              console.error('Error executing parameter calculation:', error);
              paramValue = `[Error: ${error.message}]`;
            }
          }
          
          return paramValue;
        }
      }
      
      console.log('❌ Parameter not found in parent page container');
      return '';
    }
    
    // Original logic for non-nested page elements
    // Search through all available elements to find page containers
    const searchForPageContainers = async (elements) => {
      if (!elements) return null;
      
      for (const element of elements) {
        // Check if this is a page container with parameters
        if (element.type === 'container' && 
            element.contentType === 'page' && 
            element.pageConfig && 
            element.pageConfig.parameters) {
          
          console.log('🔍 Found page container:', element.id, 'with parameters:', element.pageConfig.parameters);
          
          // Look for the specific parameter
          for (const param of element.pageConfig.parameters) {
            if (param.name === parameterName) {
              console.log('✅ Found matching parameter:', param);
              let paramValue = param.value || '';
              
              // Execute calculation if parameter value contains calculation tokens
              if (paramValue && paramValue.includes('{{CALC:')) {
                try {
                  console.log('🧮 Executing parameter calculation:', paramValue);
                  paramValue = await this.executeNestedCalculations(paramValue);
                  console.log('🧮 Parameter calculation result:', paramValue);
                } catch (error) {
                  console.error('Error executing parameter calculation:', error);
                  paramValue = `[Error: ${error.message}]`;
                }
              }
              
              return paramValue;
            }
          }
        }
        
        // Recursively search children
        if (element.children) {
          const result = await searchForPageContainers(element.children);
          if (result !== null) return result;
        }
      }
      
      return null;
    };
    
    // Search through all available elements
    const parameterValue = await searchForPageContainers(this.availableElements);
    
    if (parameterValue !== null) {
      console.log('✅ Parameter value found:', parameterValue);
      return parameterValue;
    }
    
    console.log('❌ Parameter not found, returning empty string');
    return '';
  }

  // Execute repeating container value
  executeRepeatingContainerValue(config) {
    console.log('\n🔄 === REPEATING CONTAINER VALUE EXECUTION ===');
    console.log('Config:', JSON.stringify(config, null, 2));
    console.log('Repeating context:', this.repeatingContext);

    const { repeatingContainerId, repeatingColumn } = config;

    if (!repeatingContainerId || !repeatingColumn) {
      throw new Error('Repeating container ID and column must be specified');
    }

    // Check if we have a repeating context for this container
    if (!this.repeatingContext || this.repeatingContext.containerId !== repeatingContainerId) {
      console.log('❌ No repeating context found for container:', repeatingContainerId);
      throw new Error(`No repeating context found for container ${repeatingContainerId}`);
    }

    const { recordData, rowIndex } = this.repeatingContext;

    // Handle special row_number column
    if (repeatingColumn === 'row_number') {
      const rowNumber = rowIndex + 1; // 1-based indexing
      console.log('✅ Row number result:', rowNumber);
      console.log('🔄 === REPEATING CONTAINER END ===\n');
      return rowNumber;
    }

    // Handle regular column data
    if (!recordData || recordData[repeatingColumn] === undefined) {
      console.log('❌ Column not found in record data:', repeatingColumn);
      console.log('Available columns:', Object.keys(recordData || {}));
      throw new Error(`Column '${repeatingColumn}' not found in repeating container data`);
    }

    const columnValue = recordData[repeatingColumn];
    console.log('✅ Column value result:', typeof columnValue, columnValue);
    console.log('🔄 === REPEATING CONTAINER END ===\n');
    
    return columnValue;
  }

  // Execute custom value (may contain nested calculations)
  async executeCustomValue(value) {
    if (!value || typeof value !== 'string') {
      return '';
    }

    // Check for nested calculations
    if (value.includes('{{CALC:')) {
      return await this.executeNestedCalculations(value);
    }

    return value;
  }

  // Execute nested calculations within text
  async executeNestedCalculations(text, elementRepeatingContext = null) {
    let result = text;
    const calcMatches = text.match(/{{CALC:([^}]+)}}/g);
    
    if (calcMatches) {
      for (const match of calcMatches) {
        const calculationId = match.match(/{{CALC:([^}]+)}}/)[1];
        
        try {
          // Get calculation from global storage or localStorage
          let calculation = null;
          
          // Try global storage first
          if (window.superTextCalculations && window.superTextCalculations[calculationId]) {
            calculation = window.superTextCalculations[calculationId];
          } else {
            // Fallback to localStorage
            const stored = localStorage.getItem(`calc_${calculationId}`);
            if (stored) {
              calculation = JSON.parse(stored);
            }
          }
          
          if (calculation && calculation.steps) {
            // ENHANCED: Create a new calculation engine with the element's repeating context
            const nestedEngine = new CalculationEngine(
              this.availableElements, 
              elementRepeatingContext || this.repeatingContext, // Use element's context if provided
              this.expandedElements
            );
            const calculatedValue = await nestedEngine.executeCalculation(calculation.steps);
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

    return result;
  }

  // Execute element value reference
  async executeElementValue(elementId, containerValueType = null) {
    if (!elementId) {
      throw new Error('No element ID provided');
    }

    // Find the element in availableElements to check if it's a slider container
    const element = this.availableElements.find(el => el.id === elementId);
    
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    
    // Handle slider container calculations
    if (element.type === 'container' && element.containerType === 'slider') {
      return this.executeSliderContainerValue(element, containerValueType);
    }
    
    // Handle tabs container calculations - ENHANCED to use expanded elements
    if (element.type === 'container' && element.containerType === 'tabs') {
      // For tabs containers, we need to use expanded elements if available
      const elementToSearch = this.findExpandedElement(elementId) || element;
      return await this.executeTabsContainerValue(elementToSearch, containerValueType);
    }
    
    const elementValue = this.elementValues[elementId];
    if (elementValue === undefined) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // If the element value contains calculations, execute them too
    if (typeof elementValue === 'string' && elementValue.includes('{{CALC:')) {
      return await this.executeNestedCalculations(elementValue);
    }

    return elementValue;
  }

  // Execute database query
  async executeDatabaseQuery(config) {
    console.log('\n🗄️ === DATABASE QUERY EXECUTION ===');
    console.log('Database config:', JSON.stringify(config, null, 2));
    
    const { databaseId, tableId, filters = [], action = 'value', selectedColumn } = config;

    if (!databaseId || !tableId) {
      console.log('❌ Missing database or table ID');
      throw new Error('Database and table must be selected');
    }

    if ((action === 'value' || action === 'values') && !selectedColumn) {
      console.log('❌ Missing column for value operation');
      throw new Error('Column must be selected for value operations');
    }

    try {
      // Build query filters
      const queryFilters = [];
      console.log('🔧 Processing filters:', filters.length);
      
      for (const filter of filters) {
        console.log('Processing filter:', JSON.stringify(filter, null, 2));
        if (filter.column && filter.operator && filter.value !== '') {
          const filterValue = await this.executeCustomValue(filter.value);
          console.log(`Filter value processed: "${filter.value}" -> "${filterValue}"`);
          queryFilters.push({
            column: filter.column,
            operator: filter.operator,
            value: filterValue,
            logic: filter.logic
          });
        }
      }

      console.log('📝 Final query filters:', JSON.stringify(queryFilters, null, 2));
      console.log('🎯 Query action:', action);
      console.log('📊 Selected column:', selectedColumn);

      // Execute database query via API
      const queryPayload = {
        filters: queryFilters,
        action: action,
        column: selectedColumn
      };
      
      console.log('🚀 Sending API request:', JSON.stringify(queryPayload, null, 2));
      
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/query`, queryPayload);

      console.log('📥 API response status:', response.status);
      console.log('📥 API response data:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const formattedResult = this.formatDatabaseResult(response.data.data, action);
        console.log('✅ Formatted database result:', typeof formattedResult, formattedResult);
        console.log('🗄️ === DATABASE QUERY END ===\n');
        return formattedResult;
      } else {
        console.log('❌ Database query failed:', response.data.message);
        throw new Error(response.data.message || 'Database query failed');
      }
    } catch (error) {
      console.error('❌ Database query error:', error);
      if (error.response?.status === 404) {
        throw new Error('Database or table not found');
      }
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid query parameters');
      }
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Format database query results
  formatDatabaseResult(data, action) {
    console.log('🔄 Formatting database result:', { data, action });
    
    let result;
    
    switch (action) {
      case 'count':
        result = data.count || (Array.isArray(data) ? data.length : 0);
        console.log('📊 Count result:', result);
        return result;
      
      case 'value':
        if (Array.isArray(data) && data.length > 0) {
          const firstRow = data[0];
          const firstValue = Object.values(firstRow)[0];
          result = firstValue !== undefined ? firstValue : '';
          console.log('📊 Value result (from array):', result);
          return result;
        }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const firstValue = Object.values(data)[0];
          result = firstValue !== undefined ? firstValue : '';
          console.log('📊 Value result (from object):', result);
          return result;
        }
        console.log('📊 Value result (empty):', '');
        return '';
      
      case 'values':
        if (Array.isArray(data)) {
          result = data
            .map(row => Object.values(row)[0])
            .filter(val => val !== undefined && val !== null)
            .join(', ');
          console.log('📊 Values result:', result);
          return result;
        }
        console.log('📊 Values result (empty):', '');
        return '';
      
      default:
        result = String(data);
        console.log('📊 Default result:', result);
        return result;
    }
  }

  // Apply mathematical operations between steps
  async applyOperation(leftValue, rightValue, operation) {
    // Convert to appropriate types
    const left = this.convertValue(leftValue);
    const right = this.convertValue(rightValue);

    switch (operation) {
      case 'add':
        if (typeof left === 'number' && typeof right === 'number') {
          return left + right;
        }
        return String(left) + String(right);
      
      case 'subtract':
        return this.toNumber(left) - this.toNumber(right);
      
      case 'multiply':
        return this.toNumber(left) * this.toNumber(right);
      
      case 'divide':
        const divisor = this.toNumber(right);
        if (divisor === 0) {
          throw new Error('Division by zero');
        }
        return this.toNumber(left) / divisor;
      
      case 'concatenate':
        return String(left) + String(right);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // Helper: Convert value to appropriate type
  convertValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    // Try to convert to number if it looks like a number
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '' && !isNaN(trimmed) && !isNaN(parseFloat(trimmed))) {
        return parseFloat(trimmed);
      }
    }

    return value;
  }

  // Helper: Force conversion to number
  toNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
}

// Execute all calculations in a text string with repeating context
export async function executeTextCalculations(textValue, availableElements, calculationStorage = {}, repeatingContext = null, expandedElements = null) {
  if (!textValue || !textValue.includes('{{CALC:')) {
    return textValue;
  }

  const engine = new CalculationEngine(availableElements, repeatingContext, expandedElements);
  let result = textValue;
  const calcMatches = textValue.match(/{{CALC:([^}]+)}}/g);
  
  if (calcMatches) {
    for (const match of calcMatches) {
      const calculationId = match.match(/{{CALC:([^}]+)}}/)[1];
      
      try {
        // Get calculation from multiple sources
        let calculation = calculationStorage[calculationId];
        
        if (!calculation && window.superTextCalculations) {
          calculation = window.superTextCalculations[calculationId];
        }
        
        if (!calculation) {
          try {
            const stored = localStorage.getItem(`calc_${calculationId}`);
            if (stored) {
              calculation = JSON.parse(stored);
            }
          } catch (error) {
            console.error('Error loading calculation from localStorage:', error);
          }
        }
        
        if (calculation && calculation.steps) {
          const calculatedValue = await engine.executeCalculation(calculation.steps);
          result = result.replace(match, calculatedValue);
        } else {
          result = result.replace(match, `[Missing: ${calculationId.slice(-6)}]`);
        }
      } catch (error) {
        console.error(`Error executing calculation ${calculationId}:`, error);
        result = result.replace(match, `[Error: ${error.message}]`);
      }
    }
  }

  return result;
}

// Helper function to get all stored calculations
export function getAllStoredCalculations() {
  const calculations = {};
  
  // Get from global storage
  if (window.superTextCalculations) {
    Object.assign(calculations, window.superTextCalculations);
  }
  
  // Get from localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('calc_')) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const calculation = JSON.parse(stored);
          calculations[calculation.id] = calculation;
        }
      } catch (error) {
        console.error('Error loading calculation from localStorage:', error);
      }
    }
  }
  
  return calculations;
}

// Helper function to execute database queries for repeating containers
export async function executeRepeatingContainerQuery(databaseId, tableId, filters = []) {
  console.log('\n🔄 === REPEATING CONTAINER QUERY ===');
  console.log('Database ID:', databaseId);
  console.log('Table ID:', tableId);
  console.log('Filters:', JSON.stringify(filters, null, 2));

  try {
    const queryPayload = {
      filters: filters,
      action: 'values', // Get all matching records
      column: null // We want all columns
    };
    
    console.log('🚀 Sending repeating container query:', JSON.stringify(queryPayload, null, 2));
    
    // Use a different endpoint that returns full records
    const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/records`);
    
    console.log('📥 Repeating query response:', response.data);
    
    if (response.data.success) {
      let records = response.data.data;
      
      // Apply filters on the frontend if any
      if (filters && filters.length > 0) {
        records = applyFiltersToRecords(records, filters);
      }
      
      console.log('✅ Filtered records count:', records.length);
      console.log('🔄 === REPEATING CONTAINER QUERY END ===\n');
      
      return records;
    } else {
      throw new Error(response.data.message || 'Failed to fetch repeating container data');
    }
  } catch (error) {
    console.error('❌ Repeating container query error:', error);
    throw new Error(`Failed to fetch repeating container data: ${error.message}`);
  }
}

// Helper function to apply filters to records (client-side filtering)
function applyFiltersToRecords(records, filters) {
  return records.filter(record => {
    let result = true;
    let currentLogic = 'and';
    
    for (const filter of filters) {
      if (!filter.column || !filter.operator || filter.value === '') {
        continue;
      }
      
      const recordValue = record[filter.column];
      const filterValue = filter.value;
      let conditionResult = false;
      
      switch (filter.operator) {
        case 'equals':
          conditionResult = String(recordValue) === String(filterValue);
          break;
        case 'not_equals':
          conditionResult = String(recordValue) !== String(filterValue);
          break;
        case 'greater_than':
          conditionResult = Number(recordValue) > Number(filterValue);
          break;
        case 'less_than':
          conditionResult = Number(recordValue) < Number(filterValue);
          break;
        case 'greater_equal':
          conditionResult = Number(recordValue) >= Number(filterValue);
          break;
        case 'less_equal':
          conditionResult = Number(recordValue) <= Number(filterValue);
          break;
        case 'contains':
          conditionResult = String(recordValue).toLowerCase().includes(String(filterValue).toLowerCase());
          break;
        default:
          conditionResult = false;
      }
      
      // Apply logic
      if (currentLogic === 'and') {
        result = result && conditionResult;
      } else if (currentLogic === 'or') {
        result = result || conditionResult;
      }
      
      // Set logic for next iteration
      currentLogic = filter.logic || 'and';
    }
    
    return result;
  });
}
