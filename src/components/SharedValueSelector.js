import React, { useState, useCallback, useEffect } from 'react';
import ValueTab from './calculation-tabs/ValueTab';
import DatabaseTab from './calculation-tabs/DatabaseTab';
import InformationTab from './calculation-tabs/InformationTab';

// Shared component for the 3-tab value selector (Value, Database, Information)
export const ValueSelector = ({ 
  config, 
  onUpdate, 
  availableElements = [], 
  parentZIndex = 1000,
  label = "Value"
}) => {
  const [activeTab, setActiveTab] = useState(() => {
    // Better detection of active tab based on config
    if (config.source === 'database' || config.databaseId) return 'database';
    if (['timestamp', 'screen_width', 'screen_height'].includes(config.source)) return 'information';
    return 'value';
  });

  // Update active tab when config changes
  useEffect(() => {
    if (config.source === 'database' || config.databaseId) {
      setActiveTab('database');
    } else if (['timestamp', 'screen_width', 'screen_height'].includes(config.source)) {
      setActiveTab('information');
    } else {
      setActiveTab('value');
    }
  }, [config.source, config.databaseId]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    onUpdate({
      source: getDefaultSourceForTab(tab),
      value: '',
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
      config,
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

  return (
    <div>
      {label && (
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#333',
          marginBottom: '12px'
        }}>
          {label}
        </div>
      )}
      {renderTabs()}
      {renderTabContent()}
    </div>
  );
};

// Shared component for operation/comparison selector
export const OperationSelector = ({ 
  value, 
  onChange, 
  operations,
  placeholder = "Select operation"
}) => {
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '14px',
        backgroundColor: 'white'
      }}
    >
      <option value="">{placeholder}</option>
      {operations.map((op) => (
        <option key={op.value} value={op.value}>
          {op.label}
        </option>
      ))}
    </select>
  );
};

// Define operation types for different contexts
export const CALCULATION_OPERATIONS = [
  { value: 'add', label: 'Added to' },
  { value: 'subtract', label: 'Subtracted from' },
  { value: 'multiply', label: 'Multiplied by' },
  { value: 'divide', label: 'Divided by' },
  { value: 'concatenate', label: 'Concatenated with' }
];

export const CONDITION_OPERATIONS = [
  { value: 'multiply', label: 'Multiplied By' },
  { value: 'divide', label: 'Divided By' },
  { value: 'add', label: 'Added To' },
  { value: 'subtract', label: 'Subtracted By' },
  { value: 'concatenate', label: 'Concatenate With' },
  { value: 'and', label: 'And' },
  { value: 'or', label: 'Or' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: "Doesn't Equal" },
  { value: 'greater_than', label: 'Is Greater Than' },
  { value: 'less_than', label: 'Is Less Than' },
  { value: 'greater_equal', label: 'Is Greater Than or Equal to' },
  { value: 'less_equal', label: 'Is Less Than or Equal to' }
];