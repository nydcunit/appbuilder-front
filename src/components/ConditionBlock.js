import React, { useState, useCallback } from 'react';
import { ValueSelector, OperationSelector, CONDITION_OPERATIONS } from './SharedValueSelector';

const ConditionBlock = ({ 
  element, 
  onUpdate, 
  availableElements = [] 
}) => {
  const [activeTab, setActiveTab] = useState(element.renderType || 'fixed');
  const [activeConditionIndex, setActiveConditionIndex] = useState(0);
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
    const newCondition = createNewCondition();
    const newConditions = [...conditions, newCondition];
    onUpdate({ conditions: newConditions });
    
    // Set the new condition as active
    setActiveConditionIndex(newConditions.length - 1);
  }, [conditions, onUpdate]);

  const handleRemoveCondition = useCallback((conditionIndex) => {
    if (conditions.length <= 1) return; // Don't allow removing the last condition
    
    const newConditions = conditions.filter((_, index) => index !== conditionIndex);
    onUpdate({ conditions: newConditions });
    
    // Adjust active condition index if needed
    if (activeConditionIndex >= newConditions.length) {
      setActiveConditionIndex(Math.max(0, newConditions.length - 1));
    } else if (activeConditionIndex > conditionIndex) {
      setActiveConditionIndex(activeConditionIndex - 1);
    }
  }, [conditions, onUpdate, activeConditionIndex]);

  const handleAddConditionStep = useCallback((conditionIndex) => {
    const newConditions = conditions.map((condition, index) => {
      if (index === conditionIndex) {
        return {
          ...condition,
          steps: [...condition.steps, createNewConditionStep()]
        };
      }
      return condition;
    });
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const handleRemoveConditionStep = useCallback((conditionIndex, stepId) => {
    const newConditions = conditions.map((condition, index) => {
      if (index === conditionIndex) {
        return {
          ...condition,
          steps: condition.steps.filter(step => step.id !== stepId)
        };
      }
      return condition;
    });
    onUpdate({ conditions: newConditions });
  }, [conditions, onUpdate]);

  const handleStepUpdate = useCallback((conditionIndex, stepId, updates) => {
    const newConditions = conditions.map((condition, index) => {
      if (index === conditionIndex) {
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

  const renderConditionSelector = () => {
    if (activeTab !== 'conditional' || conditions.length === 0) return null;

    return (
      <div style={{
        marginBottom: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {conditions.map((condition, index) => (
            <div
              key={condition.id || index}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: activeConditionIndex === index ? '#007bff' : '#ffffff',
                color: activeConditionIndex === index ? 'white' : '#333',
                border: `1px solid ${activeConditionIndex === index ? '#007bff' : '#ddd'}`,
                borderRadius: '6px',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                onClick={() => setActiveConditionIndex(index)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Condition {index + 1}
              </button>
              
              {conditions.length > 1 && (
                <button
                  onClick={() => handleRemoveCondition(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderLeft: `1px solid ${activeConditionIndex === index ? 'rgba(255,255,255,0.3)' : '#ddd'}`,
                    color: 'inherit',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  −
                </button>
              )}
            </div>
          ))}
          
          <button
            onClick={handleAddCondition}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '32px',
              height: '32px'
            }}
          >
            +
          </button>
        </div>
      </div>
    );
  };

  const renderConditionStep = (step, stepIndex, isFirst) => {
    const canRemove = conditions[activeConditionIndex]?.steps.length > 1;

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
              onClick={() => handleRemoveConditionStep(activeConditionIndex, step.id)}
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
              onChange={(operation) => handleStepUpdate(activeConditionIndex, step.id, { operation })}
              operations={CONDITION_OPERATIONS}
              placeholder="Select operation"
            />
          </div>
        )}

        {/* Value Selector */}
        <ValueSelector
          config={step.config}
          onUpdate={(config) => handleStepUpdate(activeConditionIndex, step.id, { config })}
          availableElements={availableElements}
          label=""
        />
      </div>
    );
  };

  const renderActiveCondition = () => {
    if (activeTab !== 'conditional' || conditions.length === 0) return null;
    
    const activeCondition = conditions[activeConditionIndex];
    if (!activeCondition) return null;

    return (
      <div>
        <div style={{
          fontSize: '12px',
          color: '#666',
          marginBottom: '16px',
          fontStyle: 'italic'
        }}>
          Configure the steps for Condition {activeConditionIndex + 1}. The first condition that evaluates to true will render this element.
        </div>
        
        {/* Condition Steps */}
        {activeCondition.steps.map((step, stepIndex) => 
          renderConditionStep(step, stepIndex, stepIndex === 0)
        )}
        
        {/* Add Step Button */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => handleAddConditionStep(activeConditionIndex)}
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
            Add Step
          </button>
        </div>
      </div>
    );
  };

  const renderTabs = () => (
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
      
      {renderConditionSelector()}
      
      {activeTab === 'conditional' ? (
        renderActiveCondition()
      ) : (
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
};

export default ConditionBlock;