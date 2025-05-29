import React from 'react';
import { Link } from 'react-router-dom';
import ScreenSelector from './ScreenSelector';

const BuilderHeader = ({
  app,
  screens,
  currentScreenId,
  setCurrentScreenId,
  setSelectedElement,
  setShowPropertiesPopup,
  setShowCreateScreenModal,
  deleteScreen,
  copyCanvasToClipboard,
  copySuccess,
  handleExecute,
  handleOldExecute,
  saveApp,
  saving
}) => {
  return (
    <div style={{ 
      padding: '10px 20px', 
      borderBottom: '1px solid #ddd',
      backgroundColor: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 100
    }}>
      <Link to="/dashboard">← Back to Dashboard</Link>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>{app.name}</h2>
        
        {/* Screen Selector */}
        <ScreenSelector
          screens={screens}
          currentScreenId={currentScreenId}
          setCurrentScreenId={setCurrentScreenId}
          setSelectedElement={setSelectedElement}
          setShowPropertiesPopup={setShowPropertiesPopup}
          setShowCreateScreenModal={setShowCreateScreenModal}
          deleteScreen={deleteScreen}
        />

        {/* Copy Canvas Button */}
        <button
          onClick={copyCanvasToClipboard}
          style={{
            padding: '8px 15px',
            backgroundColor: copySuccess ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'background-color 0.3s ease'
          }}
          title="Copy all canvas data to clipboard for sharing/debugging"
        >
          {copySuccess ? '✓ Copied!' : '📋 Copy Canvas'}
        </button>

        {/* Old Execute Button */}
        <button
          onClick={handleOldExecute}
          style={{
            padding: '8px 15px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Open inbuilder execute popup with calculations and conditions"
        >
          🔍 Old Execute
        </button>

        {/* Execute Button */}
        <button
          onClick={handleExecute}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Open app in new window - auto-updates when you save"
        >
          ▶️ Execute
        </button>

        <button
          onClick={saveApp}
          disabled={saving}
          style={{
            padding: '8px 15px',
            backgroundColor: saving ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? 'Saving...' : 'Save App'}
        </button>
      </div>
    </div>
  );
};

export default BuilderHeader;
