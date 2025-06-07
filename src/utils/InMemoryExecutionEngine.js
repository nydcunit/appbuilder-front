import axios from 'axios';

export class InMemoryExecutionEngine {
  constructor(appData) {
    this.appData = appData;
    this.calculations = new Map(); // Store all calculations from app data
    this.conditions = new Map(); // Store all conditions from app data
    this.databases = new Map(); // Cache database data
    this.elementValues = new Map(); // Cache element values
    this.activeStates = new Map(); // Store active tab/slider states
    this.tabStates = new Map(); // Store active tab states per container
    this.onStateChange = null; // Callback for state changes
    
    console.log('🚀 Initializing InMemoryExecutionEngine with app data:', appData);
    
    // Extract and index all calculations and conditions from app data
    this.indexAppData();
  }

  // Index all calculations and conditions from the app data
  indexAppData() {
    console.log('📊 Indexing app data for calculations and conditions...');
    
    // Traverse all screens and elements to find calculations and conditions
    if (this.appData.screens) {
      for (const screen of this.appData.screens) {
        this.indexScreenElements(screen.elements || []);
      }
    }
    
    console.log('✅ Indexing complete:', {
      calculations: this.calculations.size,
      conditions: this.conditions.size
    });
  }

  // Deep index calculations in children recursively
  indexCalculationsInChildren(children) {
    if (!children || children.length === 0) {
      console.log(`🔍 No children to index calculations from`);
      return;
    }
    
    console.log(`🔍 Indexing calculations in ${children.length} children:`, children.map(c => ({ id: c.id, type: c.type, hasCalculations: !!c.calculations })));
    
    for (const child of children) {
      console.log(`🔍 Checking child ${child.id} (${child.type}) for calculations...`);
      
      // Index calculations on this child
      if (child.calculations) {
        console.log(`✅ Found calculations on child ${child.id}:`, Object.keys(child.calculations));
        for (const [calcId, calculation] of Object.entries(child.calculations)) {
          console.log(`📊 Indexing calculation ${calcId} from child element ${child.id}:`, calculation);
          this.calculations.set(calcId, calculation);
        }
      } else {
        console.log(`❌ No calculations found on child ${child.id}`);
      }
      
      // Recursively index calculations in grandchildren
      if (child.children && child.children.length > 0) {
        console.log(`🔍 Recursively checking ${child.children.length} grandchildren of ${child.id}`);
        this.indexCalculationsInChildren(child.children);
      }
    }
  }

  // Index elements in a screen recursively
  indexScreenElements(elements) {
    for (const element of elements) {
      // Index calculations that are attached to this element
      if (element.calculations) {
        for (const [calcId, calculation] of Object.entries(element.calculations)) {
          console.log(`📊 Indexing calculation ${calcId} from element ${element.id}:`, calculation);
          this.calculations.set(calcId, calculation);
        }
      }
      
      // SPECIAL: Deep search for calculations in all nested children (especially in repeating containers)
      this.indexCalculationsInChildren(element.children || []);
      
      // Index calculations from text elements (fallback for missing calculations)
      if (element.type === 'text' && element.properties?.value) {
        this.extractCalculationsFromText(element.properties.value, element.id);
      }
      
      // Index calculations from input elements
      if (element.type === 'input') {
        if (element.properties?.placeholder) {
          this.extractCalculationsFromText(element.properties.placeholder, element.id);
        }
        if (element.properties?.defaultValue) {
          this.extractCalculationsFromText(element.properties.defaultValue, element.id);
        }
      }
      
      // Index calculations from page container parameters
      if (element.type === 'container' && element.contentType === 'page' && element.pageConfig?.parameters) {
        for (const param of element.pageConfig.parameters) {
          if (param.value) {
            this.extractCalculationsFromText(param.value, element.id);
          }
        }
      }
      
      // Index conditions from conditional elements
      if (element.renderType === 'conditional' && element.conditions) {
        for (const condition of element.conditions) {
          this.conditions.set(condition.id, {
            ...condition,
            elementId: element.id
          });
        }
      }
      
      // Store element values for reference
      if (element.type === 'text' && element.properties?.value) {
        this.elementValues.set(element.id, element.properties.value);
      }
      
      // Recursively index children
      if (element.children && element.children.length > 0) {
        this.indexScreenElements(element.children);
      }
    }
  }

  // Extract calculation references from text and store them
  extractCalculationsFromText(text, elementId) {
    if (!text || typeof text !== 'string') return;
    
    const calcMatches = text.match(/{{CALC:([^}]+)}}/g);
    if (calcMatches) {
      for (const match of calcMatches) {
        const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
        
        // Only create synthetic calculation if not already indexed from element.calculations
        if (!this.calculations.has(calcId)) {
          // Check if calculation exists in app data
          if (this.appData.calculations && this.appData.calculations[calcId]) {
            console.log(`📊 Found calculation ${calcId} in app.calculations`);
            this.calculations.set(calcId, this.appData.calculations[calcId]);
          } else {
            // Create synthetic calculation if not found anywhere
            console.log(`⚠️ Creating synthetic calculation for ${calcId} - not found in element or app data`);
            this.calculations.set(calcId, {
              id: calcId,
              elementId: elementId,
              steps: this.createSyntheticCalculationSteps(calcId, elementId)
            });
          }
        } else {
          console.log(`✅ Calculation ${calcId} already indexed from element`);
        }
      }
    }
  }

  // Execute a screen and return rendered elements
  async executeScreen(screenId) {
    console.log('🎯 Executing screen:', screenId);
    
    const screen = this.appData.screens.find(s => s.id === screenId);
    if (!screen) {
      throw new Error(`Screen ${screenId} not found`);
    }
    
    try {
      // Step 1: Load repeating container data
      const repeatingData = await this.loadRepeatingContainerData(screen.elements);
      
      // Step 2: Expand repeating containers
      const expandedElements = await this.expandRepeatingContainers(screen.elements, repeatingData);
      
      // Step 3: Execute calculations on all elements
      const calculatedElements = await this.executeCalculations(expandedElements, repeatingData);
      
      // Step 4: Apply conditional rendering
      const visibleElements = await this.applyConditionalRendering(calculatedElements);
      
      // Store the last executed screen for Container.js to access
      this.lastExecutedScreen = {
        id: screenId,
        elements: calculatedElements // Store the calculated elements (before conditional rendering)
      };
      
      return {
        elements: visibleElements,
        errors: {},
        metadata: {
          originalElementCount: screen.elements.length,
          expandedElementCount: expandedElements.length,
          visibleElementCount: visibleElements.length
        }
      };
      
    } catch (error) {
      console.error('❌ Screen execution failed:', error);
      return {
        elements: [],
        errors: { general: error.message },
        metadata: {}
      };
    }
  }

  // Load data for repeating containers
  async loadRepeatingContainerData(elements) {
    const repeatingData = new Map();
    const repeatingContainers = this.findRepeatingContainers(elements);
    
    for (const container of repeatingContainers) {
      const { databaseId, tableId, filters } = container.repeatingConfig;
      
      try {
        console.log(`📊 Loading data for repeating container ${container.id}`);
        
        // Use cached data if available
        const cacheKey = `${databaseId}_${tableId}`;
        let records;
        
        if (this.databases.has(cacheKey)) {
          records = this.databases.get(cacheKey);
        } else {
          // Get auth token from localStorage
          const token = localStorage.getItem('token');
          console.log('🔑 Auth token for database request:', token ? 'Found' : 'Not found');
          
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          console.log('📡 Making database request with headers:', headers);
          
          const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/records`, {
            headers
          });
          if (response.data.success) {
            records = response.data.data;
            this.databases.set(cacheKey, records);
          } else {
            records = [];
          }
        }
        
        // Apply filters if any
        if (filters && filters.length > 0) {
          records = this.applyFilters(records, filters);
        }
        
        repeatingData.set(container.id, {
          records,
          config: container.repeatingConfig
        });
        
      } catch (error) {
        console.error(`❌ Error loading data for container ${container.id}:`, error);
        repeatingData.set(container.id, {
          records: [],
          config: container.repeatingConfig,
          error: error.message
        });
      }
    }
    
    return repeatingData;
  }

  // Find repeating containers in elements
  findRepeatingContainers(elements) {
    const containers = [];
    
    const traverse = (elementList) => {
      for (const element of elementList) {
        if (element.type === 'container' && 
            element.contentType === 'repeating' && 
            element.repeatingConfig?.databaseId && 
            element.repeatingConfig?.tableId) {
          containers.push(element);
        }
        
        if (element.children && element.children.length > 0) {
          traverse(element.children);
        }
      }
    };
    
    traverse(elements);
    return containers;
  }

  // Apply filters to records
  applyFilters(records, filters) {
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
        
        if (currentLogic === 'and') {
          result = result && conditionResult;
        } else if (currentLogic === 'or') {
          result = result || conditionResult;
        }
        
        currentLogic = filter.logic || 'and';
      }
      
      return result;
    });
  }

  // Expand repeating containers into multiple instances
  async expandRepeatingContainers(elements, repeatingData) {
    const expanded = [];
    
    for (const element of elements) {
      if (element.type === 'container' && element.contentType === 'repeating') {
        const data = repeatingData.get(element.id);
        
        if (data && data.records && data.records.length > 0) {
          for (let i = 0; i < data.records.length; i++) {
            const record = data.records[i];
            const instanceId = `${element.id}_instance_${i}`;
            
            const containerInstance = {
              ...element,
              id: instanceId,
              originalId: element.id,
              repeatingContext: {
                containerId: element.id,
                recordData: record,
                rowIndex: i
              },
              children: element.children ? await this.expandRepeatingContainers(element.children, repeatingData) : []
            };
            
            // Update children with repeating context
            containerInstance.children = this.updateChildrenWithRepeatingContext(
              containerInstance.children, 
              element.id, 
              record, 
              i
            );
            
            expanded.push(containerInstance);
          }
        } else {
          expanded.push({
            ...element,
            children: element.children ? await this.expandRepeatingContainers(element.children, repeatingData) : []
          });
        }
      } else {
        const expandedElement = {
          ...element,
          children: element.children ? await this.expandRepeatingContainers(element.children, repeatingData) : []
        };
        expanded.push(expandedElement);
      }
    }
    
    return expanded;
  }

  // Update children with repeating context
  updateChildrenWithRepeatingContext(children, containerId, recordData, rowIndex) {
    return children.map(child => ({
      ...child,
      id: `${child.id}_repeat_${containerId}_${rowIndex}`,
      originalId: child.id,
      parentRepeatingContext: {
        containerId,
        recordData,
        rowIndex
      },
      children: child.children ? this.updateChildrenWithRepeatingContext(
        child.children, 
        containerId, 
        recordData, 
        rowIndex
      ) : []
    }));
  }

  // Execute calculations on elements
  async executeCalculations(elements, repeatingData) {
    const calculated = [];
    
    for (const element of elements) {
      const calculatedElement = { ...element };
      
      // Execute calculations for text elements
      if (element.type === 'text' && element.properties?.value) {
        try {
          const executedValue = await this.executeTextCalculations(
            element.properties.value,
            element.repeatingContext || element.parentRepeatingContext
          );
          calculatedElement.properties = {
            ...element.properties,
            value: executedValue
          };
        } catch (error) {
          console.error(`❌ Error executing calculations for text element ${element.id}:`, error);
          calculatedElement.properties = {
            ...element.properties,
            value: `[Error: ${error.message}]`
          };
        }
      }
      
      // Execute calculations for input elements
      if (element.type === 'input') {
        const updatedProperties = { ...element.properties };
        
        if (element.properties?.placeholder) {
          try {
            updatedProperties.placeholder = await this.executeTextCalculations(
              element.properties.placeholder,
              element.repeatingContext || element.parentRepeatingContext
            );
          } catch (error) {
            console.error(`❌ Error executing placeholder calculation for ${element.id}:`, error);
          }
        }
        
        if (element.properties?.defaultValue) {
          try {
            updatedProperties.defaultValue = await this.executeTextCalculations(
              element.properties.defaultValue,
              element.repeatingContext || element.parentRepeatingContext
            );
          } catch (error) {
            console.error(`❌ Error executing defaultValue calculation for ${element.id}:`, error);
          }
        }
        
        calculatedElement.properties = updatedProperties;
      }
      
      // Handle page containers - execute calculations on referenced page content
      if (element.type === 'container' && element.contentType === 'page' && element.pageConfig?.selectedPageId) {
        try {
          console.log(`\n🔥 ===== PAGE CONTAINER PROCESSING START =====`);
          console.log(`📄 Processing page container ${element.id} referencing page ${element.pageConfig.selectedPageId}`);
          console.log(`📄 Page container config:`, element.pageConfig);
          console.log(`📄 Page container parameters:`, element.pageConfig.parameters);
          
          // Find the referenced screen (use loose equality to handle string vs number mismatch)
          const referencedScreen = this.appData.screens.find(s => s.id == element.pageConfig.selectedPageId);
          if (referencedScreen && referencedScreen.elements) {
            console.log(`📄 Found referenced screen '${referencedScreen.name}' with ${referencedScreen.elements.length} elements`);
            console.log(`📄 Referenced screen elements:`, referencedScreen.elements.map(el => ({ id: el.id, type: el.type, value: el.properties?.value })));
            
            // Create parameter context for the target page
            const parameterContext = this.createParameterContext(element.pageConfig.parameters || []);
            console.log(`📄 Created parameter context with ${parameterContext.size} parameters:`);
            parameterContext.forEach((value, key) => {
              console.log(`📄   - ${key}: ${value}`);
            });
            
            // Execute calculations on the referenced page elements with parameter context
            console.log(`📄 Starting calculation execution with parameter context...`);
            const processedPageElements = await this.executeCalculationsWithParameterContext(
              referencedScreen.elements, 
              repeatingData, 
              parameterContext
            );
            
            // Store the processed page elements in the container
            calculatedElement.processedPageElements = processedPageElements;
            console.log(`📄 Processed ${processedPageElements.length} page elements for container ${element.id}`);
            console.log(`📄 Processed elements:`, processedPageElements.map(el => ({ id: el.id, type: el.type, value: el.properties?.value })));
            console.log(`🔥 ===== PAGE CONTAINER PROCESSING END =====\n`);
          } else {
            console.log(`⚠️ Referenced screen ${element.pageConfig.selectedPageId} not found`);
            console.log(`⚠️ Available screens:`, this.appData.screens.map(s => ({ id: s.id, name: s.name })));
            console.log(`⚠️ Looking for screen with ID: ${element.pageConfig.selectedPageId}`);
            console.log(`⚠️ Available screen IDs: ${this.appData.screens.map(s => s.id).join(', ')}`);
            console.log(`⚠️ Screen ID types:`, this.appData.screens.map(s => ({ id: s.id, type: typeof s.id })));
            console.log(`⚠️ Target screen ID type:`, typeof element.pageConfig.selectedPageId);
          }
        } catch (error) {
          console.error(`❌ Error processing page container ${element.id}:`, error);
        }
      }
      
      // Recursively process children
      if (element.children && element.children.length > 0) {
        calculatedElement.children = await this.executeCalculations(element.children, repeatingData);
      }
      
      calculated.push(calculatedElement);
    }
    
    return calculated;
  }

  // Execute calculations in text
  async executeTextCalculations(text, repeatingContext = null) {
    if (!text || !text.includes('{{CALC:')) {
      return text;
    }
    
    let result = text;
    const calcMatches = text.match(/{{CALC:([^}]+)}}/g);
    
    if (calcMatches) {
      for (const match of calcMatches) {
        const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
        
        try {
          const calculatedValue = await this.executeCalculation(calcId, repeatingContext);
          result = result.replace(match, calculatedValue);
        } catch (error) {
          console.error(`❌ Error executing calculation ${calcId}:`, error);
          result = result.replace(match, `[Error: ${error.message}]`);
        }
      }
    }
    
    return result;
  }

  // Create synthetic calculation steps for missing calculations
  createSyntheticCalculationSteps(calcId, elementId) {
    const steps = [];
    
    // Determine calculation type based on calcId
    if (calcId.toLowerCase().includes('tab')) {
      // Tabs calculation
      steps.push({
        id: 'synthetic_step_1',
        type: 'operation',
        config: {
          source: 'element',
          elementId: '1748746946008', // Default tabs container ID
          containerValueType: calcId.toLowerCase().includes('order') ? 'active_tab_order' : 'active_tab_value'
        }
      });
    } else if (calcId.toLowerCase().includes('id') || calcId.toLowerCase().includes('value')) {
      // Repeating container calculation
      steps.push({
        id: 'synthetic_step_1',
        type: 'operation',
        config: {
          source: 'repeating_container',
          repeatingContainerId: 'unknown', // Will be determined at runtime
          repeatingColumn: calcId.toLowerCase().includes('id') ? 'id' : 'value'
        }
      });
    } else {
      // Custom value calculation
      steps.push({
        id: 'synthetic_step_1',
        type: 'operation',
        config: {
          source: 'custom',
          value: `Synthetic value for ${calcId}`
        }
      });
    }
    
    return steps;
  }

  // Execute a single calculation using stored steps
  async executeCalculation(calcId, repeatingContext = null) {
    console.log(`🧮 Executing calculation: ${calcId}`);
    
    // Get calculation from stored calculations
    const calculation = this.calculations.get(calcId);
    if (!calculation || !calculation.steps || calculation.steps.length === 0) {
      console.log(`⚠️ No calculation steps found for ${calcId}, using fallback`);
      return this.executeCalculationFallback(calcId, repeatingContext);
    }
    
    // Execute calculation steps
    let result = null;
    
    for (let i = 0; i < calculation.steps.length; i++) {
      const step = calculation.steps[i];
      
      try {
        const stepValue = await this.executeCalculationStep(step, repeatingContext);
        
        if (i === 0) {
          result = stepValue;
        } else {
          // Check for operation in step.config.operation or step.operation
          const operation = step.config?.operation || step.operation;
          console.log(`🔧 Applying operation: ${operation} between ${result} and ${stepValue}`);
          result = this.applyCalculationOperation(result, stepValue, operation);
        }
      } catch (error) {
        console.error(`❌ Error executing calculation step ${i}:`, error);
        return `[Error: ${error.message}]`;
      }
    }
    
    return result !== null ? String(result) : '';
  }

  // Execute a calculation step
  async executeCalculationStep(step, repeatingContext = null) {
    console.log(`🔧 Executing step:`, step);
    
    const { config } = step;
    
    switch (config.source) {
      case 'custom':
        console.log(`📝 Custom value: ${config.value}`);
        return config.value || '';
      
      case 'element':
        return this.getElementValue(config.elementId, config.containerValueType);
      
      case 'repeating_container':
        return this.getRepeatingContainerValueForCalculation(config, repeatingContext);
      
      case 'database':
        return await this.executeDatabaseQuery(config);
      
      case 'passed_parameter':
        return this.getPassedParameterValue(config);
      
      case 'timestamp':
        return new Date().toISOString();
      
      case 'screen_width':
        return window.innerWidth;
      
      case 'screen_height':
        return window.innerHeight;
      
      default:
        console.log(`⚠️ Unknown source: ${config.source}`);
        return '';
    }
  }

  // Fallback calculation execution for missing calculations
  executeCalculationFallback(calcId, repeatingContext = null) {
    if (repeatingContext) {
      // Handle repeating container calculations
      const { recordData, rowIndex } = repeatingContext;
      
      // Determine column from calcId
      let columnName = 'value';
      if (calcId.toLowerCase().includes('id')) {
        columnName = 'id';
      } else if (calcId.toLowerCase().includes('value')) {
        columnName = 'value';
      }
      
      if (columnName === 'row_number') {
        return rowIndex + 1;
      }
      
      if (recordData && recordData[columnName] !== undefined) {
        return recordData[columnName];
      }
      
      return '';
    }
    
    // Handle other calculation types
    if (calcId.includes('calc_') && calcId.toLowerCase().includes('tab')) {
      // Handle tabs calculations
      return this.executeTabsCalculation(calcId);
    }
    
    // Default fallback
    return `[Calc: ${calcId}]`;
  }

  // Get repeating container value for calculations
  getRepeatingContainerValueForCalculation(config, repeatingContext) {
    const { repeatingContainerId, repeatingColumn } = config;
    
    console.log(`🔄 Getting repeating container value:`, {
      repeatingContainerId,
      repeatingColumn,
      hasRepeatingContext: !!repeatingContext,
      repeatingContext
    });
    
    if (!repeatingContext) {
      console.log(`⚠️ No repeating context available for ${repeatingContainerId}`);
      return '';
    }
    
    const { recordData, rowIndex } = repeatingContext;
    
    if (repeatingColumn === 'row_number') {
      return rowIndex + 1;
    }
    
    const value = recordData[repeatingColumn] || '';
    console.log(`✅ Repeating container value: ${repeatingColumn} = ${value}`);
    return value;
  }

  // Apply calculation operation
  applyCalculationOperation(leftValue, rightValue, operation) {
    const left = this.convertValue(leftValue);
    const right = this.convertValue(rightValue);
    
    console.log(`🔢 Operation: ${operation} with values ${left} (${typeof left}) and ${right} (${typeof right})`);
    
    switch (operation) {
      case 'add':
        // Always try numeric addition first for 'add' operation
        const leftNum = this.toNumber(left);
        const rightNum = this.toNumber(right);
        console.log(`🔢 Numeric conversion: ${leftNum} + ${rightNum}`);
        return leftNum + rightNum;
      
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
        return rightValue; // Default to right value if no operation
    }
  }

  // Helper: Force conversion to number
  toNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  // Execute database query for calculations
  async executeDatabaseQuery(config) {
    const { databaseId, tableId, filters = [], action = 'value', selectedColumn } = config;
    
    if (!databaseId || !tableId) {
      throw new Error('Database and table must be selected');
    }
    
    try {
      const queryPayload = {
        filters: filters,
        action: action,
        column: selectedColumn
      };
      
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/query`, queryPayload);
      
      if (response.data.success) {
        return this.formatDatabaseResult(response.data.data, action);
      } else {
        throw new Error(response.data.message || 'Database query failed');
      }
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Format database query results
  formatDatabaseResult(data, action) {
    switch (action) {
      case 'count':
        return data.count || (Array.isArray(data) ? data.length : 0);
      
      case 'value':
        if (Array.isArray(data) && data.length > 0) {
          const firstRow = data[0];
          const firstValue = Object.values(firstRow)[0];
          return firstValue !== undefined ? firstValue : '';
        }
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          const firstValue = Object.values(data)[0];
          return firstValue !== undefined ? firstValue : '';
        }
        return '';
      
      case 'values':
        if (Array.isArray(data)) {
          return data
            .map(row => Object.values(row)[0])
            .filter(val => val !== undefined && val !== null)
            .join(', ');
        }
        return '';
      
      default:
        return String(data);
    }
  }

  // Execute tabs calculations
  executeTabsCalculation(calcId) {
    // Extract container ID from calculation config
    const calculation = this.calculations.get(calcId);
    if (calculation && calculation.steps && calculation.steps[0]) {
      const elementId = calculation.steps[0].config?.elementId;
      if (elementId) {
        return this.getTabValue(elementId, calcId.toLowerCase().includes('order') ? 'order' : 'value');
      }
    }
    
    // Fallback to default values
    if (calcId.toLowerCase().includes('order')) {
      return 1; // Default active tab order
    } else {
      return 'Tab 1'; // Default active tab value
    }
  }

  // Get tab value (order or value) for a tabs container
  getTabValue(containerId, type) {
    const tabState = this.tabStates.get(containerId);
    if (!tabState) {
      // Initialize tab state if not exists
      this.initializeTabState(containerId);
      return type === 'order' ? 1 : this.getTabValueByOrder(containerId, 1);
    }
    
    if (type === 'order') {
      return tabState.activeTabOrder;
    } else {
      return tabState.activeTabValue;
    }
  }

  // Initialize tab state for a container
  initializeTabState(containerId) {
    // Find the tabs container in the current screen
    const tabsContainer = this.findTabsContainer(containerId);
    if (!tabsContainer) {
      console.warn(`Tabs container ${containerId} not found`);
      return;
    }
    
    // Get initial active tab from tabsConfig or default to 1
    const initialActiveTab = parseInt(tabsContainer.tabsConfig?.activeTab || '1');
    const tabValue = this.getTabValueByOrder(containerId, initialActiveTab);
    
    this.tabStates.set(containerId, {
      activeTabOrder: initialActiveTab,
      activeTabValue: tabValue,
      totalTabs: tabsContainer.children?.length || 0
    });
    
    console.log(`🏷️ Initialized tab state for ${containerId}:`, this.tabStates.get(containerId));
  }

  // Find tabs container by ID in current screen
  findTabsContainer(containerId) {
    const findInElements = (elements) => {
      for (const element of elements) {
        if (element.id === containerId && element.containerType === 'tabs') {
          return element;
        }
        if (element.children) {
          const found = findInElements(element.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Search in all screens
    for (const screen of this.appData.screens) {
      const found = findInElements(screen.elements || []);
      if (found) return found;
    }
    
    return null;
  }

  // Get tab value by order (find text element with isTabValue: true)
  getTabValueByOrder(containerId, order) {
    const tabsContainer = this.findTabsContainer(containerId);
    if (!tabsContainer || !tabsContainer.children) {
      return `Tab ${order}`;
    }
    
    // Get the tab at the specified order (1-based)
    const tabContainer = tabsContainer.children[order - 1];
    if (!tabContainer) {
      return `Tab ${order}`;
    }
    
    // Find text element with isTabValue: true
    const findTabValueText = (elements) => {
      for (const element of elements) {
        if (element.type === 'text' && element.properties?.isTabValue) {
          return element.properties.value || `Tab ${order}`;
        }
        if (element.children) {
          const found = findTabValueText(element.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    const tabValue = findTabValueText(tabContainer.children || []);
    return tabValue || `Tab ${order}`;
  }

  // Handle tab click - switch active tab
  handleTabClick(containerId, tabOrder) {
    console.log(`🖱️ Tab clicked: container ${containerId}, tab ${tabOrder}`);
    
    const tabValue = this.getTabValueByOrder(containerId, tabOrder);
    
    // Update tab state
    this.tabStates.set(containerId, {
      activeTabOrder: tabOrder,
      activeTabValue: tabValue,
      totalTabs: this.tabStates.get(containerId)?.totalTabs || 0
    });
    
    console.log(`🏷️ Updated tab state for ${containerId}:`, this.tabStates.get(containerId));
    
    // Trigger state change callback if set
    if (this.onStateChange) {
      this.onStateChange('tab', containerId, { order: tabOrder, value: tabValue });
    }
  }

  // Set state change callback
  setStateChangeCallback(callback) {
    this.onStateChange = callback;
  }

  // Trigger calculation update when input values change
  triggerCalculationUpdate() {
    console.log('🔄 Triggering calculation update due to input value change');
    
    // Trigger state change callback if set (this will cause the UI to re-render with new calculations)
    if (this.onStateChange) {
      this.onStateChange('input_change', null, { timestamp: Date.now() });
    }
  }

  // Apply conditional rendering
  async applyConditionalRendering(elements) {
    const visible = [];
    
    for (const element of elements) {
      if (element.renderType === 'conditional' && element.conditions && element.conditions.length > 0) {
        try {
          const shouldRender = await this.evaluateConditions(element.conditions, element);
          
          if (shouldRender) {
            let elementToRender = { ...element };
            
            // Process children recursively
            if (element.children && element.children.length > 0) {
              elementToRender.children = await this.applyConditionalRendering(element.children);
            }
            
            visible.push(elementToRender);
          }
        } catch (error) {
          console.error(`❌ Error evaluating conditions for element ${element.id}:`, error);
          // Include element on error (fail-safe)
          visible.push(element);
        }
      } else {
        let elementToRender = { ...element };
        
        // Process children recursively
        if (element.children && element.children.length > 0) {
          elementToRender.children = await this.applyConditionalRendering(element.children);
        }
        
        visible.push(elementToRender);
      }
    }
    
    return visible;
  }

  // Evaluate conditions for an element
  async evaluateConditions(conditions, element) {
    // Evaluate conditions in order - first true condition wins
    for (const condition of conditions) {
      try {
        const result = await this.evaluateCondition(condition, element);
        if (result) {
          return true;
        }
      } catch (error) {
        console.error(`❌ Error evaluating condition:`, error);
        // Continue to next condition on error
      }
    }
    
    return false;
  }

  // Evaluate a single condition
  async evaluateCondition(condition, element) {
    if (!condition.steps || condition.steps.length === 0) {
      return false;
    }
    
    let result = null;
    
    for (let i = 0; i < condition.steps.length; i++) {
      const step = condition.steps[i];
      
      try {
        const stepValue = await this.evaluateConditionStep(step, element);
        
        if (i === 0) {
          result = stepValue;
        } else {
          result = this.applyConditionOperation(result, stepValue, step.operation);
        }
      } catch (error) {
        console.error(`❌ Error evaluating condition step:`, error);
        return false;
      }
    }
    
    return this.toBooleanResult(result);
  }

  // Evaluate a condition step
  async evaluateConditionStep(step, element) {
    const { config } = step;
    
    switch (config.source) {
      case 'custom':
        return config.value || '';
      
      case 'element':
        return this.getElementValue(config.elementId);
      
      case 'repeating_container':
        return this.getRepeatingContainerValue(config, element);
      
      case 'timestamp':
        return new Date().toISOString();
      
      default:
        return '';
    }
  }

  // Get element value
  getElementValue(elementId, containerValueType = null) {
    // Handle tabs container values
    if (containerValueType === 'active_tab_order') {
      return this.getTabValue(elementId, 'order');
    }
    
    if (containerValueType === 'active_tab_value') {
      return this.getTabValue(elementId, 'value');
    }
    
    // Check if this is an input element by finding it in the app data
    const inputElement = this.findElementById(elementId);
    if (inputElement && inputElement.type === 'input') {
      return this.getInputElementValue(elementId);
    }
    
    // Handle regular element values
    return this.elementValues.get(elementId) || '';
  }

  // Get repeating container value
  getRepeatingContainerValue(config, element) {
    const { repeatingContainerId, repeatingColumn } = config;
    
    const repeatingContext = element.repeatingContext || element.parentRepeatingContext;
    
    if (!repeatingContext || repeatingContext.containerId !== repeatingContainerId) {
      return '';
    }
    
    const { recordData, rowIndex } = repeatingContext;
    
    if (repeatingColumn === 'row_number') {
      return rowIndex + 1;
    }
    
    return recordData[repeatingColumn] || '';
  }

  // Apply condition operation
  applyConditionOperation(leftValue, rightValue, operation) {
    const left = this.convertValue(leftValue);
    const right = this.convertValue(rightValue);
    
    switch (operation) {
      case 'equals':
        return String(left) === String(right);
      
      case 'not_equals':
        return String(left) !== String(right);
      
      case 'greater_than':
        return Number(left) > Number(right);
      
      case 'less_than':
        return Number(left) < Number(right);
      
      case 'greater_equal':
        return Number(left) >= Number(right);
      
      case 'less_equal':
        return Number(left) <= Number(right);
      
      case 'and':
        return this.toBooleanResult(left) && this.toBooleanResult(right);
      
      case 'or':
        return this.toBooleanResult(left) || this.toBooleanResult(right);
      
      default:
        return false;
    }
  }

  // Convert value to appropriate type
  convertValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return value;
  }

  // Convert to boolean result
  toBooleanResult(value) {
    if (typeof value === 'boolean') {
      return value;
    } else if (typeof value === 'number') {
      return value !== 0;
    } else if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      return trimmed !== '' && trimmed !== 'false' && trimmed !== '0';
    } else {
      return Boolean(value);
    }
  }

  // Get passed parameter value from page containers
  getPassedParameterValue(config) {
    const { passedParameterName, passedParameterFromScreen } = config;
    
    console.log(`📄 Getting passed parameter: ${passedParameterName} from screen: ${passedParameterFromScreen}`);
    
    if (!passedParameterName || !passedParameterFromScreen) {
      console.log(`⚠️ Missing parameter name or source screen`);
      return '';
    }
    
    // Find the source screen
    const sourceScreen = this.appData.screens.find(screen => screen.name === passedParameterFromScreen);
    if (!sourceScreen) {
      console.log(`⚠️ Source screen '${passedParameterFromScreen}' not found`);
      return '';
    }
    
    // Find page containers in the source screen that pass this parameter
    const pageContainer = this.findPageContainerWithParameter(sourceScreen.elements, passedParameterName);
    if (!pageContainer) {
      console.log(`⚠️ No page container found with parameter '${passedParameterName}' in screen '${passedParameterFromScreen}'`);
      return '';
    }
    
    // Get the parameter value
    const parameter = pageContainer.pageConfig.parameters.find(param => param.name === passedParameterName);
    if (!parameter) {
      console.log(`⚠️ Parameter '${passedParameterName}' not found in page container`);
      return '';
    }
    
    console.log(`✅ Found passed parameter value: ${parameter.value}`);
    return parameter.value || '';
  }
  
  // Find page container with specific parameter
  findPageContainerWithParameter(elements, parameterName) {
    for (const element of elements) {
      if (element.type === 'container' && 
          element.contentType === 'page' && 
          element.pageConfig?.parameters) {
        const hasParameter = element.pageConfig.parameters.some(param => param.name === parameterName);
        if (hasParameter) {
          return element;
        }
      }
      
      // Recursively search in children
      if (element.children && element.children.length > 0) {
        const found = this.findPageContainerWithParameter(element.children, parameterName);
        if (found) return found;
      }
    }
    
    return null;
  }

  // Create parameter context from page container parameters
  createParameterContext(parameters) {
    const context = new Map();
    
    for (const param of parameters) {
      if (param.name && param.value !== undefined) {
        context.set(param.name, param.value);
        console.log(`📄 Added parameter to context: ${param.name} = ${param.value}`);
      }
    }
    
    return context;
  }

  // Execute calculations with parameter context for page elements
  async executeCalculationsWithParameterContext(elements, repeatingData, parameterContext) {
    const calculated = [];
    
    for (const element of elements) {
      const calculatedElement = { ...element };
      
      // Add parameter context to element for passed_parameter calculations
      calculatedElement.parameterContext = parameterContext;
      
      // Execute calculations for text elements
      if (element.type === 'text' && element.properties?.value) {
        try {
          const executedValue = await this.executeTextCalculationsWithParameterContext(
            element.properties.value,
            element.repeatingContext || element.parentRepeatingContext,
            parameterContext
          );
          calculatedElement.properties = {
            ...element.properties,
            value: executedValue
          };
        } catch (error) {
          console.error(`❌ Error executing calculations for text element ${element.id}:`, error);
          calculatedElement.properties = {
            ...element.properties,
            value: `[Error: ${error.message}]`
          };
        }
      }
      
      // Execute calculations for input elements
      if (element.type === 'input') {
        const updatedProperties = { ...element.properties };
        
        if (element.properties?.placeholder) {
          try {
            updatedProperties.placeholder = await this.executeTextCalculationsWithParameterContext(
              element.properties.placeholder,
              element.repeatingContext || element.parentRepeatingContext,
              parameterContext
            );
          } catch (error) {
            console.error(`❌ Error executing placeholder calculation for ${element.id}:`, error);
          }
        }
        
        if (element.properties?.defaultValue) {
          try {
            updatedProperties.defaultValue = await this.executeTextCalculationsWithParameterContext(
              element.properties.defaultValue,
              element.repeatingContext || element.parentRepeatingContext,
              parameterContext
            );
          } catch (error) {
            console.error(`❌ Error executing defaultValue calculation for ${element.id}:`, error);
          }
        }
        
        calculatedElement.properties = updatedProperties;
      }
      
      // Recursively process children with parameter context
      if (element.children && element.children.length > 0) {
        calculatedElement.children = await this.executeCalculationsWithParameterContext(
          element.children, 
          repeatingData, 
          parameterContext
        );
      }
      
      calculated.push(calculatedElement);
    }
    
    return calculated;
  }

  // Execute text calculations with parameter context
  async executeTextCalculationsWithParameterContext(text, repeatingContext = null, parameterContext = null) {
    console.log(`\n🔥 ===== TEXT CALCULATION WITH PARAMETER CONTEXT =====`);
    console.log(`📄 Input text: ${text}`);
    console.log(`📄 Has parameter context: ${!!parameterContext}`);
    console.log(`📄 Parameter context size: ${parameterContext ? parameterContext.size : 0}`);
    
    if (!text || !text.includes('{{CALC:')) {
      console.log(`📄 No calculations found in text, returning as-is`);
      return text;
    }
    
    let result = text;
    const calcMatches = text.match(/{{CALC:([^}]+)}}/g);
    console.log(`📄 Found ${calcMatches ? calcMatches.length : 0} calculation matches:`, calcMatches);
    
    if (calcMatches) {
      for (const match of calcMatches) {
        const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
        console.log(`📄 Processing calculation: ${calcId}`);
        
        try {
          const calculatedValue = await this.executeCalculationWithParameterContext(
            calcId, 
            repeatingContext, 
            parameterContext
          );
          console.log(`📄 Calculation ${calcId} result: ${calculatedValue}`);
          result = result.replace(match, calculatedValue);
          console.log(`📄 Text after replacement: ${result}`);
        } catch (error) {
          console.error(`❌ Error executing calculation ${calcId}:`, error);
          result = result.replace(match, `[Error: ${error.message}]`);
        }
      }
    }
    
    console.log(`📄 Final result: ${result}`);
    console.log(`🔥 ===== TEXT CALCULATION WITH PARAMETER CONTEXT END =====\n`);
    return result;
  }

  // Execute calculation with parameter context
  async executeCalculationWithParameterContext(calcId, repeatingContext = null, parameterContext = null) {
    console.log(`🧮 Executing calculation with parameter context: ${calcId}`);
    
    // Get calculation from stored calculations
    const calculation = this.calculations.get(calcId);
    if (!calculation || !calculation.steps || calculation.steps.length === 0) {
      console.log(`⚠️ No calculation steps found for ${calcId}, using fallback`);
      return this.executeCalculationFallback(calcId, repeatingContext);
    }
    
    // Execute calculation steps with parameter context
    let result = null;
    
    for (let i = 0; i < calculation.steps.length; i++) {
      const step = calculation.steps[i];
      
      try {
        const stepValue = await this.executeCalculationStepWithParameterContext(
          step, 
          repeatingContext, 
          parameterContext
        );
        
        if (i === 0) {
          result = stepValue;
        } else {
          // Check for operation in step.config.operation or step.operation
          const operation = step.config?.operation || step.operation;
          console.log(`🔧 Applying operation: ${operation} between ${result} and ${stepValue}`);
          result = this.applyCalculationOperation(result, stepValue, operation);
        }
      } catch (error) {
        console.error(`❌ Error executing calculation step ${i}:`, error);
        return `[Error: ${error.message}]`;
      }
    }
    
    return result !== null ? String(result) : '';
  }

  // Execute calculation step with parameter context
  async executeCalculationStepWithParameterContext(step, repeatingContext = null, parameterContext = null) {
    console.log(`🔧 Executing step with parameter context:`, step);
    
    const { config } = step;
    
    switch (config.source) {
      case 'custom':
        console.log(`📝 Custom value: ${config.value}`);
        return config.value || '';
      
      case 'element':
        return this.getElementValue(config.elementId, config.containerValueType);
      
      case 'repeating_container':
        return this.getRepeatingContainerValueForCalculation(config, repeatingContext);
      
      case 'database':
        return await this.executeDatabaseQuery(config);
      
      case 'passed_parameter':
        return this.getPassedParameterValueFromContext(config, parameterContext);
      
      case 'timestamp':
        return new Date().toISOString();
      
      case 'screen_width':
        return window.innerWidth;
      
      case 'screen_height':
        return window.innerHeight;
      
      default:
        console.log(`⚠️ Unknown source: ${config.source}`);
        return '';
    }
  }

  // Get passed parameter value from parameter context
  getPassedParameterValueFromContext(config, parameterContext) {
    const { passedParameterName } = config;
    
    console.log(`📄 Getting passed parameter from context: ${passedParameterName}`);
    console.log(`📄 Available parameters:`, parameterContext ? Array.from(parameterContext.keys()) : 'No context');
    
    if (!passedParameterName || !parameterContext) {
      console.log(`⚠️ Missing parameter name or context`);
      return '';
    }
    
    const value = parameterContext.get(passedParameterName);
    if (value !== undefined) {
      console.log(`✅ Found parameter value in context: ${passedParameterName} = ${value}`);
      return value;
    }
    
    console.log(`⚠️ Parameter '${passedParameterName}' not found in context`);
    return '';
  }

  // Find element by ID in app data
  findElementById(elementId) {
    console.log(`🔍 Finding element by ID: ${elementId}`);
    
    const findInElements = (elements) => {
      for (const element of elements) {
        if (element.id === elementId) {
          console.log(`✅ Found element: ${element.id} (${element.type})`);
          return element;
        }
        if (element.children && element.children.length > 0) {
          const found = findInElements(element.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Search in all screens
    for (const screen of this.appData.screens) {
      const found = findInElements(screen.elements || []);
      if (found) return found;
    }
    
    console.log(`❌ Element ${elementId} not found`);
    return null;
  }

  // CALCULATION INTEGRATION: This method is called by the calculation engine to retrieve 
  // current input values from the DOM. CRITICAL: Must support ALL input element types.
  getInputElementValue(elementId) {
    console.log('🔵 INPUT_DEBUG: Getting input value for element:', elementId);
    
    // CRITICAL FIX: Check if we have a current calculated value for this input element first
    // This ensures that when tab state changes, we get the correct calculated value immediately
    // instead of waiting for DOM updates which happen after calculation execution
    const element = this.findElementById(elementId);
    if (element && element.type === 'input') {
      // For input elements with calculated default values, get the current calculated value
      if (element.properties?.defaultValue && element.properties.defaultValue.includes('{{CALC:')) {
        // This is a dynamic input with calculated default value
        // Execute the calculation to get the current value based on current state
        try {
          const currentCalculatedValue = this.executeTextCalculationsSync(element.properties.defaultValue);
          if (currentCalculatedValue && !currentCalculatedValue.includes('{{CALC:')) {
            console.log('🔵 INPUT_DEBUG: Using current calculated value:', currentCalculatedValue);
            return currentCalculatedValue;
          }
        } catch (error) {
          console.log('🔵 INPUT_DEBUG: Error calculating current value:', error);
        }
      }
      
      // For dropdown inputs, check selectedOption with calculations
      if (element.properties?.inputType === 'dropdown' && element.properties?.selectedOption) {
        if (element.properties.selectedOption.includes('{{CALC:')) {
          try {
            const currentCalculatedValue = this.executeTextCalculationsSync(element.properties.selectedOption);
            if (currentCalculatedValue && !currentCalculatedValue.includes('{{CALC:')) {
              console.log('🔵 INPUT_DEBUG: Using current calculated dropdown value:', currentCalculatedValue);
              return currentCalculatedValue;
            }
          } catch (error) {
            console.log('🔵 INPUT_DEBUG: Error calculating dropdown value:', error);
          }
        }
      }
    }
    
    // BUTTON INPUT HANDLING: Check if this is a button input type first
    // For button inputs, we need to return the button label text, not a form value
    const buttonElement = document.querySelector(`button[data-element-id="${elementId}"][data-input-type="button"]`);
    if (buttonElement) {
      const buttonLabel = buttonElement.textContent || buttonElement.innerText || '';
      console.log('🔵 INPUT_DEBUG: Found button element, label text:', buttonLabel);
      return buttonLabel;
    }
    
    // DOM QUERY REQUIREMENTS: Must include ALL input element types for calculation support
    // - input[data-element-id] : Standard text/number/password inputs
    // - textarea[data-element-id] : Long text inputs  
    // - select[data-element-id] : Dropdown inputs (CRITICAL: Was missing, caused dropdown calc issues)
    // - button[data-element-id] : Button inputs (returns button label text)
    // - Container queries : Fallback for nested input elements
    const inputElement = document.querySelector(`input[data-element-id="${elementId}"]`) ||
                        document.querySelector(`textarea[data-element-id="${elementId}"]`) ||
                        document.querySelector(`select[data-element-id="${elementId}"]`) ||
                        document.querySelector(`[data-element-id="${elementId}"] input`) ||
                        document.querySelector(`[data-element-id="${elementId}"] textarea`) ||
                        document.querySelector(`[data-element-id="${elementId}"] select`);
    
    if (inputElement) {
      const value = inputElement.value || '';
      console.log('🔵 INPUT_DEBUG: Found input element, value:', value);
      return value;
    }
    
    // Fallback: Try to find by element ID in any input/textarea/select
    const allInputs = document.querySelectorAll('input, textarea, select');
    for (const input of allInputs) {
      // Check if the input is inside a container with the element ID
      const container = input.closest(`[data-element-id="${elementId}"]`);
      if (container) {
        const value = input.value || '';
        console.log('🔵 INPUT_DEBUG: Found input via container search, value:', value);
        return value;
      }
    }
    
    // BUTTON FALLBACK: Check if this is a button input by looking at element properties
    if (element && element.type === 'input' && element.properties?.inputType === 'button') {
      const buttonLabel = element.properties.buttonLabel || 'Click Me';
      console.log('🔵 INPUT_DEBUG: Button input fallback, returning button label:', buttonLabel);
      return buttonLabel;
    }
    
    // If we can't find the input in DOM, try to get from element properties as fallback
    if (element && element.properties) {
      // For datepicker inputs, check for datePickerSelectedValue
      if (element.properties.inputType === 'datePicker' && element.properties.datePickerSelectedValue) {
        const value = element.properties.datePickerSelectedValue;
        console.log('🔵 INPUT_DEBUG: Using datepicker selected value from properties:', value);
        
        // Convert MM/DD/YYYY to YYYY-MM-DD for calculations
        const convertToISOForCalc = (displayDate) => {
          if (displayDate.includes(' to ')) {
            // Range format: convert both dates
            const parts = displayDate.split(' to ');
            const startISO = convertSingleDateToISO(parts[0].trim());
            const endISO = convertSingleDateToISO(parts[1].trim());
            return startISO && endISO ? `${startISO} to ${endISO}` : displayDate;
          } else {
            // Single date format
            return convertSingleDateToISO(displayDate) || displayDate;
          }
        };
        
        const convertSingleDateToISO = (dateStr) => {
          if (dateStr.includes('/')) {
            // MM/DD/YYYY format
            const parts = dateStr.trim().split('/');
            if (parts.length === 3) {
              const month = parseInt(parts[0]);
              const day = parseInt(parts[1]);
              const year = parseInt(parts[2]);
              if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
                const date = new Date(year, month - 1, day);
                return date.toISOString().split('T')[0];
              }
            }
          }
          return null;
        };
        
        const isoValue = convertToISOForCalc(value);
        console.log('🔵 INPUT_DEBUG: Converted datepicker value to ISO for calculation:', {
          originalValue: value,
          isoValue: isoValue
        });
        
        return String(isoValue);
      }
      
      // For input elements, try to get the defaultValue or current value
      const fallbackValue = element.properties.defaultValue || element.properties.value || '';
      console.log('🔵 INPUT_DEBUG: Using fallback value from element properties:', fallbackValue);
      return fallbackValue;
    }
    
    console.log('🔵 INPUT_DEBUG: No input value found, returning empty string');
    return '';
  }

  // Synchronous version of executeTextCalculations for immediate value resolution
  executeTextCalculationsSync(text) {
    if (!text || !text.includes('{{CALC:')) {
      return text;
    }
    
    let result = text;
    const calcMatches = text.match(/{{CALC:([^}]+)}}/g);
    
    if (calcMatches) {
      for (const match of calcMatches) {
        const calcId = match.match(/{{CALC:([^}]+)}}/)[1];
        
        try {
          const calculatedValue = this.executeCalculationSync(calcId);
          result = result.replace(match, calculatedValue);
        } catch (error) {
          console.error(`❌ Error executing sync calculation ${calcId}:`, error);
          result = result.replace(match, `[Error: ${error.message}]`);
        }
      }
    }
    
    return result;
  }

  // Synchronous version of executeCalculation for immediate value resolution
  executeCalculationSync(calcId) {
    console.log(`🧮 Executing sync calculation: ${calcId}`);
    
    // Get calculation from stored calculations
    const calculation = this.calculations.get(calcId);
    if (!calculation || !calculation.steps || calculation.steps.length === 0) {
      console.log(`⚠️ No calculation steps found for ${calcId}, using fallback`);
      return this.executeCalculationFallback(calcId, null);
    }
    
    // Execute calculation steps synchronously
    let result = null;
    
    for (let i = 0; i < calculation.steps.length; i++) {
      const step = calculation.steps[i];
      
      try {
        const stepValue = this.executeCalculationStepSync(step);
        
        if (i === 0) {
          result = stepValue;
        } else {
          // Check for operation in step.config.operation or step.operation
          const operation = step.config?.operation || step.operation;
          console.log(`🔧 Applying sync operation: ${operation} between ${result} and ${stepValue}`);
          result = this.applyCalculationOperation(result, stepValue, operation);
        }
      } catch (error) {
        console.error(`❌ Error executing sync calculation step ${i}:`, error);
        return `[Error: ${error.message}]`;
      }
    }
    
    return result !== null ? String(result) : '';
  }

  // Synchronous version of executeCalculationStep for immediate value resolution
  executeCalculationStepSync(step) {
    console.log(`🔧 Executing sync step:`, step);
    
    const { config } = step;
    
    switch (config.source) {
      case 'custom':
        console.log(`📝 Custom value: ${config.value}`);
        return config.value || '';
      
      case 'element':
        return this.getElementValue(config.elementId, config.containerValueType);
      
      case 'repeating_container':
        return this.getRepeatingContainerValueForCalculation(config, null);
      
      case 'passed_parameter':
        return this.getPassedParameterValue(config);
      
      case 'timestamp':
        return new Date().toISOString();
      
      case 'screen_width':
        return window.innerWidth;
      
      case 'screen_height':
        return window.innerHeight;
      
      default:
        console.log(`⚠️ Unknown source: ${config.source}`);
        return '';
    }
  }
}
