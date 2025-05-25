import axios from 'axios';

export class CalculationEngine {
  constructor(availableElements = []) {
    this.availableElements = availableElements;
    this.elementValues = {};
    
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
        return this.executeElementValue(config.elementId);
      
      case 'database':
        return await this.executeDatabaseQuery(config);
      
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
  executeElementValue(elementId) {
    if (!elementId) {
      throw new Error('No element ID provided');
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
    const { databaseId, tableId, filters = [], action = 'value', selectedColumn } = config;

    if (!databaseId || !tableId) {
      throw new Error('Database and table must be selected');
    }

    if ((action === 'value' || action === 'values') && !selectedColumn) {
      throw new Error('Column must be selected for value operations');
    }

    try {
      // Build query filters
      const queryFilters = [];
      for (const filter of filters) {
        if (filter.column && filter.operator && filter.value !== '') {
          const filterValue = await this.executeCustomValue(filter.value);
          queryFilters.push({
            column: filter.column,
            operator: filter.operator,
            value: filterValue,
            logic: filter.logic
          });
        }
      }

      // Execute database query via API
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/query`, {
        filters: queryFilters,
        action: action,
        column: selectedColumn
      });

      if (response.data.success) {
        return this.formatDatabaseResult(response.data.data, action);
      } else {
        throw new Error(response.data.message || 'Database query failed');
      }
    } catch (error) {
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

// Execute all calculations in a text string
export async function executeTextCalculations(textValue, availableElements, calculationStorage = {}) {
  if (!textValue || !textValue.includes('{{CALC:')) {
    return textValue;
  }

  const engine = new CalculationEngine(availableElements);
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