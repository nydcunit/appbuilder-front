import React from 'react';

const TextStyleSettings = ({ 
  getValue, 
  handleInputChange, 
  handleKeyPress, 
  updateProperty 
}) => {
  return (
    <>
      {/* Typography */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Typography
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Font Size:
          </label>
          <input
            type="number"
            value={getValue('fontSize')}
            onChange={(e) => handleInputChange('fontSize', parseInt(e.target.value) || 16)}
            onKeyPress={handleKeyPress}
            placeholder="16"
            min="8"
            max="100"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>px</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Font Weight:
          </label>
          <select
            value={getValue('fontWeight')}
            onChange={(e) => updateProperty('fontWeight', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="100">Thin (100)</option>
            <option value="200">Extra Light (200)</option>
            <option value="300">Light (300)</option>
            <option value="400">Normal (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi Bold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">Extra Bold (800)</option>
            <option value="900">Black (900)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Text Align:
          </label>
          <select
            value={getValue('textAlignment')}
            onChange={(e) => updateProperty('textAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      </div>

      {/* Colors */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Colors
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Text Color:
          </label>
          <input
            type="color"
            value={getValue('textColor')}
            onChange={(e) => updateProperty('textColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Background:
          </label>
          <input
            type="color"
            value={getValue('textBackgroundColor')}
            onChange={(e) => updateProperty('textBackgroundColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* Spacing - Margin */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Spacing
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Margin:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('marginTop')}
              onChange={(e) => handleInputChange('marginTop', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('marginBottom')}
              onChange={(e) => handleInputChange('marginBottom', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('marginLeft')}
              onChange={(e) => handleInputChange('marginLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('marginRight')}
              onChange={(e) => handleInputChange('marginRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Padding:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('paddingTop')}
              onChange={(e) => handleInputChange('paddingTop', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('paddingBottom')}
              onChange={(e) => handleInputChange('paddingBottom', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('paddingLeft')}
              onChange={(e) => handleInputChange('paddingLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('paddingRight')}
              onChange={(e) => handleInputChange('paddingRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TextStyleSettings;