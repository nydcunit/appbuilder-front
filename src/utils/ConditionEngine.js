import { CalculationEngine } from './calculationEngine.js';

export class ConditionEngine {
  constructor(availableElements = [], repeatingContext = null) {
    // FIX: Pass repeating context to CalculationEngine
    this.calculationEngine = new CalculationEngine(availableElements, repeatingContext);
    
    if (repeatingContext) {
      
    }
  }

  // Main function to evaluate if an element should be rendered
  async shouldRenderElement(element) {
    

    // Default behavior - always render if no conditions or if fixed
    if (!element.conditions || element.renderType === 'fixed' || element.conditions.length === 0) {
      
      return true;
    }

    

    // Evaluate conditions in order - first true condition wins
    for (let i = 0; i < element.conditions.length; i++) {
      const condition = element.conditions[i];
      
      
      try {
        const conditionResult = await this.evaluateCondition(condition);
        
        
        if (conditionResult) {
          
          return { shouldRender: true, conditionIndex: i }; // Return which condition matched
        }
      } catch (error) {
        console.error(`❌ Error evaluating condition ${i + 1}:`, error);
        // Continue to next condition on error
      }
    }

    // No conditions were true
    
    return { shouldRender: false, conditionIndex: -1 };
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
          
          const newResult = await this.applyConditionOperation(result, stepValue, step.operation);
          
          result = newResult;
        }
      } catch (error) {
        console.error(`❌ Error evaluating condition step ${i + 1}:`, error);
        
        return false;
      }
    }

    const finalResult = this.toBooleanResult(result);
    
    return finalResult;
  }

  // Evaluate a single condition step to get its value
  async evaluateConditionStep(step) {
    
    
    // Create a mock calculation step for the calculation engine
    const calculationStep = {
      config: step.config
    };
    
    try {
      
      const value = await this.calculationEngine.executeStep(calculationStep);
      
      return value;
    } catch (error) {
      console.error('❌ Error in calculation engine:', error);
      throw error;
    }
  }

  // Apply condition operations (logical and mathematical)
  async applyConditionOperation(leftValue, rightValue, operation) {
    

    const left = this.convertValue(leftValue);
    const right = this.convertValue(rightValue);

    

    let operationResult;

    switch (operation) {
      // Mathematical operations
      case 'add':
        operationResult = this.toNumber(left) + this.toNumber(right);
        console.log(`➕ Addition: ${this.toNumber(left)} + ${this.toNumber(right)} = ${operationResult}`);
        return operationResult;
      
      case 'subtract':
        operationResult = this.toNumber(left) - this.toNumber(right);
        console.log(`➖ Subtraction: ${this.toNumber(left)} - ${this.toNumber(right)} = ${operationResult}`);
        return operationResult;
      
      case 'multiply':
        operationResult = this.toNumber(left) * this.toNumber(right);
        console.log(`✖️ Multiplication: ${this.toNumber(left)} * ${this.toNumber(right)} = ${operationResult}`);
        return operationResult;
      
      case 'divide':
        const divisor = this.toNumber(right);
        if (divisor === 0) {
          
          throw new Error('Division by zero in condition');
        }
        operationResult = this.toNumber(left) / divisor;
        
        return operationResult;
      
      case 'concatenate':
        operationResult = String(left) + String(right);
        
        return operationResult;

      // Logical operations
      case 'and':
        const leftBool = this.toBooleanResult(left);
        const rightBool = this.toBooleanResult(right);
        operationResult = leftBool && rightBool;
        
        return operationResult;
      
      case 'or':
        const leftBool2 = this.toBooleanResult(left);
        const rightBool2 = this.toBooleanResult(right);
        operationResult = leftBool2 || rightBool2;
        
        return operationResult;

      // Comparison operations - FIXED: Better type handling
      case 'equals':
        // For numeric comparisons, convert both to numbers if they look like numbers
        if (this.isNumeric(left) && this.isNumeric(right)) {
          const leftNum = this.toNumber(left);
          const rightNum = this.toNumber(right);
          operationResult = leftNum === rightNum;
          
        } else {
          // String comparison
          const leftStr = String(left).trim();
          const rightStr = String(right).trim();
          operationResult = leftStr === rightStr;
          
        }
        return operationResult;
      
      case 'not_equals':
        // For numeric comparisons, convert both to numbers if they look like numbers
        if (this.isNumeric(left) && this.isNumeric(right)) {
          const leftNum = this.toNumber(left);
          const rightNum = this.toNumber(right);
          operationResult = leftNum !== rightNum;
          
        } else {
          // String comparison
          const leftStr = String(left).trim();
          const rightStr = String(right).trim();
          operationResult = leftStr !== rightStr;
          
        }
        return operationResult;
      
      case 'greater_than':
        const leftNum = this.toNumber(left);
        const rightNum = this.toNumber(right);
        operationResult = leftNum > rightNum;
        
        return operationResult;
      
      case 'less_than':
        const leftNum2 = this.toNumber(left);
        const rightNum2 = this.toNumber(right);
        operationResult = leftNum2 < rightNum2;
        
        return operationResult;
      
      case 'greater_equal':
        const leftNum3 = this.toNumber(left);
        const rightNum3 = this.toNumber(right);
        operationResult = leftNum3 >= rightNum3;
        
        return operationResult;
      
      case 'less_equal':
        const leftNum4 = this.toNumber(left);
        const rightNum4 = this.toNumber(right);
        operationResult = leftNum4 <= rightNum4;
        
        return operationResult;
      
      default:
        
        throw new Error(`Unknown condition operation: ${operation}`);
    }
  }

  // Helper: Check if a value is numeric
  isNumeric(value) {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed !== '' && !isNaN(trimmed) && !isNaN(parseFloat(trimmed));
    }
    return false;
  }

  // Helper: Convert value to appropriate type
  convertValue(value) {
    
    
    if (value === null || value === undefined) {
      
      return '';
    }

    // If it's already a string, return as-is
    if (typeof value === 'string') {
      
      return value;
    }

    // Try to convert to number if it looks like a number
    if (typeof value === 'number') {
      
      return value;
    }

    // Convert to string for everything else
    const converted = String(value);
    
    return converted;
  }

  // Helper: Force conversion to number
  toNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    const num = parseFloat(value);
    const result = isNaN(num) ? 0 : num;
    
    return result;
  }

  // Helper: Convert value to boolean
  toBooleanResult(value) {
    let result;
    
    if (typeof value === 'boolean') {
      result = value;
    } else if (typeof value === 'number') {
      result = value !== 0;
    } else if (typeof value === 'string') {
      const trimmed = value.trim().toLowerCase();
      result = trimmed !== '' && trimmed !== 'false' && trimmed !== '0';
    } else {
      result = Boolean(value);
    }
    
    
    return result;
  }
}

// FIXED: Helper function to evaluate all elements and return filtered list with condition matching
export async function getVisibleElements(elements, availableElements = []) {
  
  
  const visibleElements = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    
    try {
      // FIX: Extract repeating context from the element itself
      let repeatingContext = null;
      if (element.repeatingContext) {
        repeatingContext = element.repeatingContext;
      } else if (element.parentRepeatingContext) {
        repeatingContext = element.parentRepeatingContext;
      }
      
      // FIX: Create ConditionEngine with the repeating context
      const conditionEngine = new ConditionEngine(availableElements, repeatingContext);
      
      const evaluationResult = await conditionEngine.shouldRenderElement(element);
      
      // Handle both old boolean return and new object return
      let shouldRender, matchedConditionIndex;
      if (typeof evaluationResult === 'boolean') {
        shouldRender = evaluationResult;
        matchedConditionIndex = evaluationResult ? 0 : -1;
      } else {
        shouldRender = evaluationResult.shouldRender;
        matchedConditionIndex = evaluationResult.conditionIndex;
      }
      
      
      
      if (shouldRender) {
        // Create element with the matched condition's properties
        let elementToRender = { ...element };
        
        if (element.renderType === 'conditional' && 
            element.conditions && 
            element.conditions.length > 0 && 
            matchedConditionIndex >= 0) {
          
          const matchedCondition = element.conditions[matchedConditionIndex];
          if (matchedCondition && matchedCondition.properties) {
            // Merge the matched condition's properties with base properties
            elementToRender.properties = {
              ...element.properties,
              ...matchedCondition.properties
            };
            
          }
        }
        
        // If element has children, recursively filter them too
        if (elementToRender.children && elementToRender.children.length > 0) {
          
          const visibleChildren = await getVisibleElements(elementToRender.children, availableElements);
          
          elementToRender.children = visibleChildren;
        }
        
        visibleElements.push(elementToRender);
      }
    } catch (error) {
      console.error(`❌ Error evaluating visibility for element ${element.id}:`, error);
      // Include element if evaluation fails (fail-safe)
      
      visibleElements.push(element);
    }
  }


  
  return visibleElements;
}