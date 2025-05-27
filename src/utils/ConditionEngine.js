import { CalculationEngine } from './calculationEngine.js';

export class ConditionEngine {
  constructor(availableElements = [], repeatingContext = null) {
    // FIX: Pass repeating context to CalculationEngine
    this.calculationEngine = new CalculationEngine(availableElements, repeatingContext);
    console.log('🔍 ConditionEngine initialized with', availableElements.length, 'available elements');
    if (repeatingContext) {
      console.log('🔍 ConditionEngine has repeating context for container:', repeatingContext.containerId);
    }
  }

  // Main function to evaluate if an element should be rendered
  async shouldRenderElement(element) {
    console.log('\n🎯 === EVALUATING ELEMENT VISIBILITY ===');
    console.log('Element ID:', element.id);
    console.log('Element Type:', element.type);
    console.log('Render Type:', element.renderType);
    console.log('Has Conditions:', !!element.conditions);
    console.log('Conditions Count:', element.conditions?.length || 0);

    // Default behavior - always render if no conditions or if fixed
    if (!element.conditions || element.renderType === 'fixed' || element.conditions.length === 0) {
      console.log('✅ Element should render: No conditions or fixed rendering');
      return true;
    }

    console.log('📋 Full conditions data:', JSON.stringify(element.conditions, null, 2));

    // Evaluate conditions in order - first true condition wins
    for (let i = 0; i < element.conditions.length; i++) {
      const condition = element.conditions[i];
      console.log(`\n🔄 Evaluating condition ${i + 1}/${element.conditions.length}:`, condition.id);
      
      try {
        const conditionResult = await this.evaluateCondition(condition);
        console.log(`✨ Condition ${i + 1} final result:`, conditionResult);
        
        if (conditionResult) {
          console.log(`✅ Element should render: Found TRUE condition at index ${i + 1}`);
          return { shouldRender: true, conditionIndex: i }; // Return which condition matched
        }
      } catch (error) {
        console.error(`❌ Error evaluating condition ${i + 1}:`, error);
        // Continue to next condition on error
      }
    }

    // No conditions were true
    console.log('❌ Element should NOT render: All conditions evaluated to FALSE');
    return { shouldRender: false, conditionIndex: -1 };
  }

  // Evaluate a single condition (with multiple steps)
  async evaluateCondition(condition) {
    console.log('\n🔍 --- CONDITION EVALUATION START ---');
    console.log('Condition ID:', condition.id);
    console.log('Steps count:', condition.steps?.length || 0);
    
    if (!condition.steps || condition.steps.length === 0) {
      console.log('❌ No steps in condition, returning false');
      return false;
    }

    console.log('📝 All steps:', JSON.stringify(condition.steps, null, 2));

    let result = null;

    for (let i = 0; i < condition.steps.length; i++) {
      const step = condition.steps[i];
      console.log(`\n🔄 Evaluating step ${i + 1}/${condition.steps.length}`);
      console.log('Step type:', step.type);
      console.log('Step operation:', step.operation);
      console.log('Step config:', JSON.stringify(step.config, null, 2));
      
      try {
        // Get value for this step
        const stepValue = await this.evaluateConditionStep(step);
        console.log(`📊 Step ${i + 1} evaluated to:`, typeof stepValue, stepValue);
        
        if (i === 0) {
          // First step - initialize result
          result = stepValue;
          console.log(`📌 Initial result set to:`, typeof result, result);
        } else {
          // Apply operation with previous result
          console.log(`🔧 Applying operation: ${result} ${step.operation} ${stepValue}`);
          const newResult = await this.applyConditionOperation(result, stepValue, step.operation);
          console.log(`📊 Operation result:`, typeof newResult, newResult);
          result = newResult;
        }
      } catch (error) {
        console.error(`❌ Error evaluating condition step ${i + 1}:`, error);
        console.log('🔍 --- CONDITION EVALUATION END (ERROR) ---');
        return false;
      }
    }

    const finalResult = this.toBooleanResult(result);
    console.log(`🎯 Final condition result: ${result} -> ${finalResult}`);
    console.log('🔍 --- CONDITION EVALUATION END ---');
    return finalResult;
  }

  // Evaluate a single condition step to get its value
  async evaluateConditionStep(step) {
    console.log('\n🔄 Evaluating condition step details:');
    console.log('Step config source:', step.config?.source);
    console.log('Step config value:', step.config?.value);
    console.log('Step config databaseId:', step.config?.databaseId);
    console.log('Step config tableId:', step.config?.tableId);
    console.log('Step config filters:', step.config?.filters);
    console.log('Step config action:', step.config?.action);
    console.log('Step config selectedColumn:', step.config?.selectedColumn);
    
    // Create a mock calculation step for the calculation engine
    const calculationStep = {
      config: step.config
    };
    
    try {
      console.log('🔧 Calling calculation engine with:', JSON.stringify(calculationStep, null, 2));
      const value = await this.calculationEngine.executeStep(calculationStep);
      console.log(`✅ Calculation engine returned:`, typeof value, value);
      return value;
    } catch (error) {
      console.error('❌ Error in calculation engine:', error);
      throw error;
    }
  }

  // Apply condition operations (logical and mathematical)
  async applyConditionOperation(leftValue, rightValue, operation) {
    console.log('\n🔧 APPLYING OPERATION:');
    console.log('Left value (raw):', typeof leftValue, leftValue);
    console.log('Right value (raw):', typeof rightValue, rightValue);
    console.log('Operation:', operation);

    const left = this.convertValue(leftValue);
    const right = this.convertValue(rightValue);

    console.log('Left value (converted):', typeof left, left);
    console.log('Right value (converted):', typeof right, right);

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
          console.log('❌ Division by zero error');
          throw new Error('Division by zero in condition');
        }
        operationResult = this.toNumber(left) / divisor;
        console.log(`➗ Division: ${this.toNumber(left)} / ${divisor} = ${operationResult}`);
        return operationResult;
      
      case 'concatenate':
        operationResult = String(left) + String(right);
        console.log(`🔗 Concatenation: "${String(left)}" + "${String(right)}" = "${operationResult}"`);
        return operationResult;

      // Logical operations
      case 'and':
        const leftBool = this.toBooleanResult(left);
        const rightBool = this.toBooleanResult(right);
        operationResult = leftBool && rightBool;
        console.log(`🔗 AND: ${leftBool} && ${rightBool} = ${operationResult}`);
        return operationResult;
      
      case 'or':
        const leftBool2 = this.toBooleanResult(left);
        const rightBool2 = this.toBooleanResult(right);
        operationResult = leftBool2 || rightBool2;
        console.log(`🔗 OR: ${leftBool2} || ${rightBool2} = ${operationResult}`);
        return operationResult;

      // Comparison operations - FIXED: Better type handling
      case 'equals':
        // For numeric comparisons, convert both to numbers if they look like numbers
        if (this.isNumeric(left) && this.isNumeric(right)) {
          const leftNum = this.toNumber(left);
          const rightNum = this.toNumber(right);
          operationResult = leftNum === rightNum;
          console.log(`🟰 EQUALS (numeric): ${leftNum} === ${rightNum} = ${operationResult}`);
        } else {
          // String comparison
          const leftStr = String(left).trim();
          const rightStr = String(right).trim();
          operationResult = leftStr === rightStr;
          console.log(`🟰 EQUALS (string): "${leftStr}" === "${rightStr}" = ${operationResult}`);
        }
        return operationResult;
      
      case 'not_equals':
        // For numeric comparisons, convert both to numbers if they look like numbers
        if (this.isNumeric(left) && this.isNumeric(right)) {
          const leftNum = this.toNumber(left);
          const rightNum = this.toNumber(right);
          operationResult = leftNum !== rightNum;
          console.log(`🚫 NOT EQUALS (numeric): ${leftNum} !== ${rightNum} = ${operationResult}`);
        } else {
          // String comparison
          const leftStr = String(left).trim();
          const rightStr = String(right).trim();
          operationResult = leftStr !== rightStr;
          console.log(`🚫 NOT EQUALS (string): "${leftStr}" !== "${rightStr}" = ${operationResult}`);
        }
        return operationResult;
      
      case 'greater_than':
        const leftNum = this.toNumber(left);
        const rightNum = this.toNumber(right);
        operationResult = leftNum > rightNum;
        console.log(`➡️ GREATER THAN: ${leftNum} > ${rightNum} = ${operationResult}`);
        return operationResult;
      
      case 'less_than':
        const leftNum2 = this.toNumber(left);
        const rightNum2 = this.toNumber(right);
        operationResult = leftNum2 < rightNum2;
        console.log(`⬅️ LESS THAN: ${leftNum2} < ${rightNum2} = ${operationResult}`);
        return operationResult;
      
      case 'greater_equal':
        const leftNum3 = this.toNumber(left);
        const rightNum3 = this.toNumber(right);
        operationResult = leftNum3 >= rightNum3;
        console.log(`➡️ GREATER EQUAL: ${leftNum3} >= ${rightNum3} = ${operationResult}`);
        return operationResult;
      
      case 'less_equal':
        const leftNum4 = this.toNumber(left);
        const rightNum4 = this.toNumber(right);
        operationResult = leftNum4 <= rightNum4;
        console.log(`⬅️ LESS EQUAL: ${leftNum4} <= ${rightNum4} = ${operationResult}`);
        return operationResult;
      
      default:
        console.log(`❌ Unknown operation: ${operation}`);
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
    console.log('🔄 Converting value:', typeof value, value);
    
    if (value === null || value === undefined) {
      console.log('📝 Converted null/undefined to empty string');
      return '';
    }

    // If it's already a string, return as-is
    if (typeof value === 'string') {
      console.log('📝 Value is already string, returning as-is');
      return value;
    }

    // Try to convert to number if it looks like a number
    if (typeof value === 'number') {
      console.log('📝 Value is number, returning as-is');
      return value;
    }

    // Convert to string for everything else
    const converted = String(value);
    console.log('📝 Converted to string:', converted);
    return converted;
  }

  // Helper: Force conversion to number
  toNumber(value) {
    if (typeof value === 'number') {
      return value;
    }
    
    const num = parseFloat(value);
    const result = isNaN(num) ? 0 : num;
    console.log(`🔢 Number conversion: "${value}" -> ${result}`);
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
    
    console.log(`🔀 Boolean conversion: ${typeof value} ${value} -> ${result}`);
    return result;
  }
}

// FIXED: Helper function to evaluate all elements and return filtered list with condition matching
export async function getVisibleElements(elements, availableElements = []) {
  console.log('\n🌟 === STARTING VISIBILITY EVALUATION ===');
  console.log('Total elements to evaluate:', elements.length);
  console.log('Available elements for context:', availableElements.length);
  
  const visibleElements = [];

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    console.log(`\n📋 Evaluating element ${i + 1}/${elements.length}: ${element.id} (${element.type})`);
    
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
      
      console.log(`📊 Element ${element.id} visibility result:`, shouldRender, 'matched condition:', matchedConditionIndex);
      
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
            console.log(`🎨 Applied properties from condition ${matchedConditionIndex + 1}`);
          }
        }
        
        // If element has children, recursively filter them too
        if (elementToRender.children && elementToRender.children.length > 0) {
          console.log(`🔄 Element has ${elementToRender.children.length} children, evaluating recursively`);
          const visibleChildren = await getVisibleElements(elementToRender.children, availableElements);
          console.log(`📊 Visible children: ${visibleChildren.length}/${elementToRender.children.length}`);
          elementToRender.children = visibleChildren;
        }
        
        visibleElements.push(elementToRender);
      }
    } catch (error) {
      console.error(`❌ Error evaluating visibility for element ${element.id}:`, error);
      // Include element if evaluation fails (fail-safe)
      console.log(`🛡️ Including element due to evaluation error (fail-safe)`);
      visibleElements.push(element);
    }
  }

  console.log(`\n🎯 VISIBILITY EVALUATION COMPLETE: ${visibleElements.length}/${elements.length} elements visible`);
  console.log('🌟 === END VISIBILITY EVALUATION ===\n');
  
  return visibleElements;
}