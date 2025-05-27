import React from 'react';

const CreateScreenModal = ({ 
  showCreateScreenModal, 
  newScreenName, 
  setNewScreenName, 
  createScreen, 
  onClose 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      createScreen();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!showCreateScreenModal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '300px'
      }}>
        <h3>Create New Screen</h3>
        <input
          type="text"
          placeholder="Screen name"
          value={newScreenName}
          onChange={(e) => setNewScreenName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ddd',
            marginBottom: '15px'
          }}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={createScreen}
            disabled={!newScreenName.trim()}
            style={{
              padding: '8px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              opacity: !newScreenName.trim() ? 0.5 : 1
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateScreenModal;