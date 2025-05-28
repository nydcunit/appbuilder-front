import axios from 'axios';

export class CalculationEngine {
  constructor(availableElements = [], repeatingContext = null) {
    this.availableElements = availableElements;
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
        return this.executeElementValue(config.elementId, config.containerValueType);
      
      case 'database':
        return await this.executeDatabaseQuery(config);
      
      case 'repeating_container':
        return this.executeRepeatingContainerValue(config);
      
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

  // Execute slider container value
  executeSliderContainerValue(element, valueType) {
    console.log('\n🎡 === SLIDER CONTAINER VALUE EXECUTION ===');
    console.log('Element:', element.id);
    console.log('Value type:', valueType);
    
    const sliderConfig = element.sliderConfig || {
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
  async executeNestedCalculations(text) {
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
            const calculatedValue = await this.executeCalculation(calculation.steps);
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
  executeElementValue(elementId, containerValueType = null) {
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
    
    const elementValue = this.elementValues[elementId];
    if (elementValue === undefined) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    // If the element value contains calculations, execute them too
    if (typeof elementValue === 'string' && elementValue.includes('{{CALC:')) {
      return this.executeNestedCalculations(elementValue);
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
export async function executeTextCalculations(textValue, availableElements, calculationStorage = {}, repeatingContext = null) {
  if (!textValue || !textValue.includes('{{CALC:')) {
    return textValue;
  }

  const engine = new CalculationEngine(availableElements, repeatingContext);
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
