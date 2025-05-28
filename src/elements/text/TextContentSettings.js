import React from 'react';
import SuperText from '../../components/SuperText';

const TextContentSettings = ({ 
  getValue, 
  handleInputChange, 
  availableElements = [] 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Content
      </h4>
      
      <SuperText
        label="Text Value"
        placeholder="Enter your text..."
        value={getValue('value')}
        onChange={(value) => handleInputChange('value', value)}
        availableElements={availableElements}
      />
    </div>
  );
};

export default TextContentSettings;