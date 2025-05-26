import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabases } from './hooks/useDatabases';
import DatabaseList from './DatabaseList';

const Databases = () => {
  const { fetchDatabases } = useDatabases();
  const navigate = useNavigate();
  
  const [databases, setDatabases] = useState([]);
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
    navigate(`/databases/${database._id}`);
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
      <DatabaseList 
        databases={databases}
        onSelectDatabase={handleSelectDatabase}
        onDatabasesChange={handleDatabasesChange}
      />
    </div>
  );
};

export default Databases;