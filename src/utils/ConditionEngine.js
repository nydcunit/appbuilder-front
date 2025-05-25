import { CalculationEngine } from './calculationEngine.js';

export class ConditionEngine {
  constructor(availableElements = []) {
    this.calculationEngine = new CalculationEngine(availableElements);
  }

  // Main function to evaluate if an element should be rendered
  async shouldRenderElement(element) {
    // Default behavior - always render if no conditions or if fixed
    if (!element.conditions || element.renderType === 'fixed' || element.conditions.length === 0) {
      return true;
    }

    // Evaluate conditions in order - first true condition wins
    for (const condition of element.conditions) {
      try {
        const conditionResult = await this.evaluateCondition(condition);
        if (conditionResult) {
          return true; // First true condition found
        }
      } catch (error) {
        console.error(`Error evaluating condition ${condition.id}:`, error);
        // Continue to next condition on error
      }
    }

    // No conditions were true
    return false;
  }

  // Evaluate a single condition (with multiple steps)
  async evaluateCondition(condition) {
    if (!condition.steps || condition.steps.length === 0) {
      return false;
    }

    let result = null;

    for (let i = 0; i < condition.steps.length; i++) {
      const step = condition.steps[i];
      
      try {
        // Get value for this step
        const stepValue = await this.evaluateConditionStep(step);
        
        if (i === 0) {
          // First step - initialize result
          result = stepValue;
        } else {
          // Apply operation with previous result
          result = await this.applyConditionOperation(result, stepValue, step.operation);
        }
      } catch (error) {
        console.error(`Error evaluating condition step ${i}:`, error);
        return false;
      }
    }

    // Convert final result to boolean
    return this.toBooleanResult(result);
  }

  // Evaluate a single condition step to get its value
  async evaluateConditionStep(step) {
    // Reuse the calculation engine's step evaluation
    return await this.calculationEngine.executeStep({
      config: step.config
    });
  }

  // Apply condition operations (logical and mathematical)
  async applyConditionOperation(leftValue, rightValue, operation) {
    const left = this.convertValue(leftValue);
    const right = this.convertValue(rightValue);

    switch (operation) {
      // Mathematical operations
      case 'add':
        return this.toNumber(left) + this.toNumber(right);
      
      case 'subtract':
        return this.toNumber(left) - this.toNumber(right);
      
      case 'multiply':
        return this.toNumber(left) * this.toNumber(right);
      
      case 'divide':
        const divisor = this.toNumber(right);
        if (divisor === 0) {
          throw new Error('Division by zero in condition');
        }
        return this.toNumber(left) / divisor;
      
      case 'concatenate':
        return String(left) + String(right);

      // Logical operations
      case 'and':
        return this.toBooleanResult(left) && this.toBooleanResult(right);
      
      case 'or':
        return this.toBooleanResult(left) || this.toBooleanResult(right);

      // Comparison operations
      case 'equals':
        return left == right; // Loose equality for mixed types
      
      case 'not_equals':
        return left != right;
      
      case 'greater_than':
        return this.toNumber(left) > this.toNumber(right);
      
      case 'less_than':
        return this.toNumber(left) < this.toNumber(right);
      
      case 'greater_equal':
        return this.toNumber(left) >= this.toNumber(right);
      
      case 'less_equal':
        return this.toNumber(left) <= this.toNumber(right);
      
      default:
        throw new Error(`Unknown condition operation: ${operation}`);
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

  // Helper: Convert value to boolean
  toBooleanResult(value) {
    if (typeof value === 'boolean') {
      return value;
    }
    
    if (typeof value === 'number') {
      return value !== 0;
    }
    
    if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      return trimmed !== '' && trimmed !== 'false' && trimmed !== '0';
    }
    
    return Boolean(value);
  }
}

// Helper function to evaluate all elements and return filtered list
export async function getVisibleElements(elements, availableElements = []) {
  const conditionEngine = new ConditionEngine(availableElements);
  const visibleElements = [];

  for (const element of elements) {
    try {
      const shouldRender = await conditionEngine.shouldRenderElement(element);
      if (shouldRender) {
        // If element has children, recursively filter them too
        if (element.children && element.children.length > 0) {
          const visibleChildren = await getVisibleElements(element.children, availableElements);
          visibleElements.push({
            ...element,
            children: visibleChildren
          });
        } else {
          visibleElements.push(element);
        }
      }
    } catch (error) {
      console.error(`Error evaluating visibility for element ${element.id}:`, error);
      // Include element if evaluation fails (fail-safe)
      visibleElements.push(element);
    }
  }

  return visibleElements;
}