import React, { useState, useCallback } from 'react';
import { ValueSelector, OperationSelector, CONDITION_OPERATIONS } from './SharedValueSelector';

const ConditionBlock = ({ 
  element, 
  onUpdate, 
  availableElements = [] 
}) => {
  const [activeTab, setActiveTab] = useState(element.renderType || 'fixed');
  const conditions = element.conditions || [];

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    onUpdate({
      renderType: tab,
      ...(tab === 'conditional' && conditions.length === 0 && {
        conditions: [createNewCondition()]
      })
    });
  }, [onUpdate, conditions.length]);

  const createNewCondition = () => ({
    id: Date.now().toString(),
    steps: [createNewConditionStep('if')]
  });

  const createNewConditionStep = (type = 'operation') => ({
    id: Date.now().toString() + Math.random(),
    type,
    operation: type === 'if' ? 'if' : '',
    config: {
      source: 'custom',
      value: ''
    }
  });

  const handleAddCondition = useCallback(() => {
    const newConditions = [...conditions, createNewCondition()];
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const handleRemoveCondition = useCallback((conditionId) => {
    const newConditions = conditions.filter(c => c.id !== conditionId);
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const handleAddConditionStep = useCallback((conditionId) => {
    const newConditions = conditions.map(condition => {
      if (condition.id === conditionId) {
        return {
          ...condition,
          steps: [...condition.steps, createNewConditionStep()]
        };
      }
      return condition;
    });
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const handleRemoveConditionStep = useCallback((conditionId, stepId) => {
    const newConditions = conditions.map(condition => {
      if (condition.id === conditionId) {
        return {
          ...condition,
          steps: condition.steps.filter(step => step.id !== stepId)
        };
      }
      return condition;
    });
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const handleStepUpdate = useCallback((conditionId, stepId, updates) => {
    const newConditions = conditions.map(condition => {
      if (condition.id === conditionId) {
        return {
          ...condition,
          steps: condition.steps.map(step => {
            if (step.id === stepId) {
              // FIXED: Properly handle source determination
              let updatedStep = { ...step, ...updates };
              
              // If config is being updated, determine the correct source
              if (updates.config) {
                const config = { ...step.config, ...updates.config };
                
                // Determine source based on config properties
                if (config.databaseId && config.tableId) {
                  config.source = 'database';
                } else if (config.elementId) {
                  config.source = 'element';
                } else if (config.repeatingContainerId) {
                  // FIX: Handle repeating container source
                  config.source = 'repeating_container';
                } else if (['timestamp', 'screen_width', 'screen_height'].includes(config.source)) {
                  // Keep information sources as they are
                } else if (config.source) {
                  // FIX: If source is explicitly set, keep it
                  // Don't override it
                } else {
                  config.source = 'custom';
                }
                
                updatedStep.config = config;
              }
              
              return updatedStep;
            }
            return step;
          })
        };
      }
      return condition;
    });
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const renderConditionStep = (condition, step, stepIndex, isFirst) => {
    const canRemove = condition.steps.length > 1;

    return (
      <div 
        key={step.id}
        style={{
          marginBottom: '12px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Step Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#666'
          }}>
            {isFirst ? 'If' : 'Step'} {stepIndex + 1}
          </div>
          
          {canRemove && (
            <button
              onClick={() => handleRemoveConditionStep(condition.id, step.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#dc3545',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '4px'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Operation Selector (not shown for first step) */}
        {!isFirst && (
          <div style={{ marginBottom: '16px' }}>
            <OperationSelector
              value={step.operation}
              onChange={(operation) => handleStepUpdate(condition.id, step.id, { operation })}
              operations={CONDITION_OPERATIONS}
              placeholder="Select operation"
            />
          </div>
        )}

        {/* Value Selector */}
        <ValueSelector
          config={step.config}
          onUpdate={(config) => handleStepUpdate(condition.id, step.id, { config })}
          availableElements={availableElements}
          label=""
        />
      </div>
    );
  };

  const renderCondition = (condition, conditionIndex) => {
    return (
      <div 
        key={condition.id}
        style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px solid #e0e0e0'
        }}
      >
        {/* Condition Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
          }}>
            Condition {conditionIndex + 1}
          </h4>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {/* Add Step Button */}
            <button
              onClick={() => handleAddConditionStep(condition.id)}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Add condition step"
            >
              +
            </button>
            
            {/* Remove Condition Button */}
            {conditions.length > 1 && (
              <button
                onClick={() => handleRemoveCondition(condition.id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '6px 10px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Remove condition"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Condition Steps */}
        {condition.steps.map((step, stepIndex) => 
          renderConditionStep(condition, step, stepIndex, stepIndex === 0)
        )}
      </div>
    );
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ 
        marginBottom: '10px', 
        color: '#333', 
        borderBottom: '1px solid #eee', 
        paddingBottom: '5px' 
      }}>
        Visibility
      </h4>
      
      {renderTabs()}
      
      {activeTab === 'conditional' && (
        <div>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            The first condition that evaluates to true will render this element.
          </div>
          
          {/* Render Conditions */}
          {conditions.map((condition, index) => renderCondition(condition, index))}
          
          {/* Add Condition Button */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={handleAddCondition}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <span style={{ fontSize: '16px' }}>+</span>
              Add Condition
            </button>
          </div>
        </div>
      )}
      
      {activeTab === 'fixed' && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          This element will always be visible (fixed rendering).
        </div>
      )}
    </div>
  );

  function renderTabs() {
    return (
      <div style={{
        display: 'flex',
        backgroundColor: '#f0f0f0',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: '16px'
      }}>
        {['fixed', 'conditional'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            style={{
              flex: 1,
              padding: '8px 16px',
              border: 'none',
              backgroundColor: activeTab === tab ? 'white' : 'transparent',
              color: activeTab === tab ? '#333' : '#666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab ? '500' : '400',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  }
};

export default ConditionBlock;