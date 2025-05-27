import React from 'react';

const ScreenSelector = ({
  screens,
  currentScreenId,
  setCurrentScreenId,
  setSelectedElement,
  setShowPropertiesPopup,
  setShowCreateScreenModal,
  deleteScreen
}) => {
  const handleScreenChange = (screenId) => {
    setCurrentScreenId(parseInt(screenId));
    setSelectedElement(null);
    setShowPropertiesPopup(false);
  };

  const handleDeleteScreen = () => {
    deleteScreen(currentScreenId);
  };

  const handleCreateScreen = () => {
    setShowCreateScreenModal(true);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label>Screen:</label>
      <select
        value={currentScreenId}
        onChange={(e) => handleScreenChange(e.target.value)}
        style={{ padding: '5px', border: '1px solid #ddd' }}
      >
        {screens.map(screen => (
          <option key={screen.id} value={screen.id}>
            {screen.name}
          </option>
        ))}
      </select>
      
      <button
        onClick={handleCreateScreen}
        style={{
          padding: '5px 10px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        + New
      </button>
      
      <button
        onClick={handleDeleteScreen}
        style={{
          padding: '5px 8px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        🗑
      </button>
    </div>
  );
};

export default ScreenSelector;