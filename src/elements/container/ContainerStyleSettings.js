import React from 'react';

const ContainerStyleSettings = ({ 
  getValue, 
  handleInputChange, 
  handleKeyPress, 
  updateProperty 
}) => {
  return (
    <>
      {/* Layout Properties */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Layout
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Width:
          </label>
          <input
            type="text"
            value={getValue('width')}
            onChange={(e) => handleInputChange('width', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="auto, 100px, 50%"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Height:
          </label>
          <input
            type="text"
            value={getValue('height')}
            onChange={(e) => handleInputChange('height', e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="auto, 100px, 50%"
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Direction:
          </label>
          <select
            value={getValue('orientation')}
            onChange={(e) => updateProperty('orientation', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="column">Column</option>
            <option value="row">Row</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            V-Align:
          </label>
          <select
            value={getValue('verticalAlignment')}
            onChange={(e) => updateProperty('verticalAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            H-Align:
          </label>
          <select
            value={getValue('horizontalAlignment')}
            onChange={(e) => updateProperty('horizontalAlignment', e.target.value)}
            style={{
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          >
            <option value="flex-start">Start</option>
            <option value="center">Center</option>
            <option value="flex-end">End</option>
            <option value="stretch">Stretch</option>
          </select>
        </div>
      </div>

      {/* Styling */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Styling
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Background:
          </label>
          <input
            type="color"
            value={getValue('backgroundColor')}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
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

      {/* Border Radius */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Border Radius
        </h4>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', color: '#555' }}>
            Corners:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
            <input
              type="number"
              value={getValue('borderRadiusTopLeft')}
              onChange={(e) => handleInputChange('borderRadiusTopLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('borderRadiusTopRight')}
              onChange={(e) => handleInputChange('borderRadiusTopRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Top Right"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('borderRadiusBottomLeft')}
              onChange={(e) => handleInputChange('borderRadiusBottomLeft', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom Left"
              style={{
                padding: '4px 8px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                fontSize: '12px'
              }}
            />
            <input
              type="number"
              value={getValue('borderRadiusBottomRight')}
              onChange={(e) => handleInputChange('borderRadiusBottomRight', parseInt(e.target.value) || 0)}
              onKeyPress={handleKeyPress}
              placeholder="Bottom Right"
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

      {/* Shadow */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
          Shadow
        </h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <label style={{ minWidth: '80px', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
            Color:
          </label>
          <input
            type="color"
            value={getValue('shadowColor')}
            onChange={(e) => updateProperty('shadowColor', e.target.value)}
            style={{
              width: '100%',
              height: '30px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
          <input
            type="number"
            value={getValue('shadowX')}
            onChange={(e) => handleInputChange('shadowX', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="X"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <input
            type="number"
            value={getValue('shadowY')}
            onChange={(e) => handleInputChange('shadowY', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="Y"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
          <input
            type="number"
            value={getValue('shadowBlur')}
            onChange={(e) => handleInputChange('shadowBlur', parseInt(e.target.value) || 0)}
            onKeyPress={handleKeyPress}
            placeholder="Blur"
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ContainerStyleSettings;