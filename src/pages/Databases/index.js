import React, { useState, useEffect } from 'react';
import { useDatabases } from './hooks/useDatabases';
import DatabaseList from './DatabaseList';
import DatabaseDetail from './DatabaseDetail';

const Databases = () => {
  const { fetchDatabases } = useDatabases();
  
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDatabases();
  }, []);

  const loadDatabases = async () => {
    try {
      const databasesData = await fetchDatabases();
      setDatabases(databasesData);
    } catch (error) {
      console.error('Error loading databases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDatabase = (database) => {
    setSelectedDatabase(database);
  };

  const handleBackToList = () => {
    setSelectedDatabase(null);
  };

  const handleDatabasesChange = (newDatabases) => {
    setDatabases(newDatabases);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading databases...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {!selectedDatabase ? (
        <DatabaseList 
          databases={databases}
          onSelectDatabase={handleSelectDatabase}
          onDatabasesChange={handleDatabasesChange}
        />
      ) : (
        <DatabaseDetail 
          database={selectedDatabase}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
};

export default Databases;