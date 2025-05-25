import React, { useState, useCallback, useEffect } from 'react';
import ValueTab from './calculation-tabs/ValueTab';
import DatabaseTab from './calculation-tabs/DatabaseTab';
import InformationTab from './calculation-tabs/InformationTab';

const CalculationStep = ({ 
  step, 
  stepNumber, 
  isFirst,
  onUpdate, 
  onRemove, 
  canRemove = true,
  availableElements = [],
  parentZIndex = 1000
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    // Better detection of active tab based on step's config
    if (step.config.source === 'database' || step.config.databaseId) return 'database';
    if (['timestamp', 'screen_width', 'screen_height'].includes(step.config.source)) return 'information';
    return 'value';
  });

  // Update active tab when step config changes
  useEffect(() => {
    if (step.config.source === 'database' || step.config.databaseId) {
      setActiveTab('database');
    } else if (['timestamp', 'screen_width', 'screen_height'].includes(step.config.source)) {
      setActiveTab('information');
    } else {
      setActiveTab('value');
    }
  }, [step.config.source, step.config.databaseId]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    // Reset config when switching tabs
    onUpdate({
      source: getDefaultSourceForTab(tab),
      value: '',
      // Clear any tab-specific config
      elementId: null,
      databaseId: null,
      tableId: null,
      filters: [],
      action: 'value',
      selectedColumn: null
    });
  }, [onUpdate]);

  const getDefaultSourceForTab = (tab) => {
    switch (tab) {
      case 'value': return 'custom';
      case 'database': return 'database';
      case 'information': return 'timestamp';
      default: return 'custom';
    }
  };

  const handleOperationChange = useCallback((operation) => {
    onUpdate({ operation });
  }, [onUpdate]);

  const renderTabs = () => (
    <div style={{
      display: 'flex',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      padding: '4px',
      marginBottom: '16px'
    }}>
      {['value', 'database', 'information'].map((tab) => (
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

  const renderTabContent = () => {
    const tabProps = {
      config: step.config,
      onUpdate,
      availableElements,
      parentZIndex
    };

    switch (activeTab) {
      case 'value':
        return <ValueTab {...tabProps} />;
      case 'database':
        return <DatabaseTab {...tabProps} />;
      case 'information':
        return <InformationTab {...tabProps} />;
      default:
        return <ValueTab {...tabProps} />;
    }
  };

  const renderOperationSelector = () => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        marginBottom: '8px'
      }}>
        Operation
      </label>
      
      <select
        value={step.config.operation || 'add'}
        onChange={(e) => handleOperationChange(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: 'white'
        }}
      >
        <option value="add">Added to</option>
        <option value="subtract">Subtracted from</option>
        <option value="multiply">Multiplied by</option>
        <option value="divide">Divided by</option>
        <option value="concatenate">Concatenated with</option>
      </select>
    </div>
  );

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: 'white'
    }}>
      {/* Step Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isFirst ? '#28a745' : '#007bff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            {stepNumber}
          </div>
          
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: '500', 
              color: '#333' 
            }}>
              {isFirst ? 'Value' : 'Operation'}
            </h4>
          </div>
        </div>

        {/* Remove Button */}
        {canRemove && !isFirst && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Remove Step"
          >
            ×
          </button>
        )}
      </div>

      {/* Step Content */}
      <div style={{ padding: '20px' }}>
        {/* Show operation selector for non-first steps */}
        {!isFirst && renderOperationSelector()}
        
        {/* Tabs */}
        {renderTabs()}
        
        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CalculationStep;