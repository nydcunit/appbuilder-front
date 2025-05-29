import React, { useState, useEffect, useRef, useCallback } from 'react';
import CalculationStep from './CalculationStep';

const CalculationPopup = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialSteps = [],
  position = { x: 0, y: 0 },
  zIndex = 1000,
  availableElements = [],
  screens = [],
  currentScreenId = null
}) => {
  const createEmptyStep = useCallback(() => ({
    id: Date.now().toString(),
    type: 'value',
    config: {
      source: 'custom',
      value: '',
    }
  }), []);

  const [steps, setSteps] = useState(() => {
    if (initialSteps.length > 0) {
      return initialSteps;
    }
    return [createEmptyStep()];
  });
  
  const popupRef = useRef(null);

  useEffect(() => {
    if (isOpen && initialSteps.length === 0 && steps.length === 0) {
      setSteps([createEmptyStep()]);
    }
  }, [isOpen, initialSteps.length, steps.length, createEmptyStep]);

  // Reset steps when initialSteps change (editing existing calculation)
  useEffect(() => {
    if (isOpen && initialSteps.length > 0) {
      setSteps(initialSteps);
    }
  }, [isOpen, initialSteps]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleStepUpdate = useCallback((stepId, newConfig) => {
    setSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, config: { ...step.config, ...newConfig } }
          : step
      )
    );
  }, []);

  const handleAddStep = useCallback(() => {
    const newStep = {
      ...createEmptyStep(),
      type: 'operation',
      config: {
        operation: 'add',
        source: 'custom',
        value: ''
      }
    };
    setSteps(prevSteps => [...prevSteps, newStep]);
  }, [createEmptyStep]);

  const handleRemoveStep = useCallback((stepId) => {
    setSteps(prevSteps => {
      const newSteps = prevSteps.filter(step => step.id !== stepId);
      return newSteps.length > 0 ? newSteps : [createEmptyStep()];
    });
  }, [createEmptyStep]);

  const handleSave = useCallback(() => {
    const validSteps = steps.filter(step => {
      if (step.config.source === 'custom') {
        return step.config.value && step.config.value.trim() !== '';
      }
      return true;
    });

    if (validSteps.length === 0) {
      alert('Please add at least one valid step');
      return;
    }

    onSave(steps);
    onClose();
  }, [steps, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: zIndex,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '50px'
      }}
    >
      <div
        ref={popupRef}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ margin: 0, color: '#333', fontSize: '18px', fontWeight: '600' }}>
              Calculation
            </h3>
            <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
              {steps.length === 1 ? '1 Step' : `${steps.length} Steps`} in Calculation
            </p>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Steps Container */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px 24px'
        }}>
          {steps.map((step, index) => (
            <div key={step.id} style={{ marginBottom: '20px' }}>
              <CalculationStep
                step={step}
                stepNumber={index + 1}
                isFirst={index === 0}
                onUpdate={(config) => handleStepUpdate(step.id, config)}
                onRemove={() => handleRemoveStep(step.id)}
                canRemove={steps.length > 1}
                availableElements={availableElements}
                parentZIndex={zIndex}
                screens={screens}
                currentScreenId={currentScreenId}
              />
            </div>
          ))}

          {/* Add Step Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <button
              onClick={handleAddStep}
              style={{
                backgroundColor: '#333',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#555';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#333';
              }}
            >
              + Add Step
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: '#666',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Save Calculation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalculationPopup;
