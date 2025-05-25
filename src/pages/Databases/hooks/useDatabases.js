import { useState } from 'react';
import axios from 'axios';

export const useDatabases = () => {
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Database operations
  const fetchDatabases = async () => {
    try {
      const response = await axios.get('/api/databases');
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching databases:', error);
      throw error;
    }
  };

  const createDatabase = async (name) => {
    setCreating(true);
    try {
      const response = await axios.post('/api/databases', { name });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create database');
    } catch (error) {
      console.error('Error creating database:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const deleteDatabase = async (databaseId) => {
    try {
      const response = await axios.delete(`/api/databases/${databaseId}`);
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete database');
    } catch (error) {
      console.error('Error deleting database:', error);
      throw error;
    }
  };

  // Table operations
  const fetchTables = async (databaseId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  };

  const createTable = async (databaseId, name) => {
    setCreating(true);
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables`, { name });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create table');
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const deleteTable = async (databaseId, tableId) => {
    try {
      const response = await axios.delete(`/api/databases/${databaseId}/tables/${tableId}`);
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete table');
    } catch (error) {
      console.error('Error deleting table:', error);
      throw error;
    }
  };

  // Column operations
  const fetchColumns = async (databaseId, tableId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/columns`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching columns:', error);
      throw error;
    }
  };

  const createColumn = async (databaseId, tableId, name) => {
    setCreating(true);
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/columns`, {
        name,
        type: 'string'
      });
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create column');
    } catch (error) {
      console.error('Error creating column:', error);
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const deleteColumn = async (databaseId, tableId, columnId) => {
    try {
      const response = await axios.delete(`/api/databases/${databaseId}/tables/${tableId}/columns/${columnId}`);
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete column');
    } catch (error) {
      console.error('Error deleting column:', error);
      throw error;
    }
  };

  // Record operations
  const fetchRecords = async (databaseId, tableId) => {
    try {
      const response = await axios.get(`/api/databases/${databaseId}/tables/${tableId}/records`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  };

  const createRecord = async (databaseId, tableId, recordData) => {
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/records`, recordData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to create record');
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  };

  const updateRecord = async (databaseId, tableId, recordId, updateData) => {
    try {
      const response = await axios.put(`/api/databases/${databaseId}/tables/${tableId}/records/${recordId}`, updateData);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error('Failed to update record');
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  };

  const deleteRecords = async (databaseId, tableId, recordIds) => {
    try {
      const response = await axios.post(`/api/databases/${databaseId}/tables/${tableId}/records/delete-multiple`, {
        recordIds
      });
      if (response.data.success) {
        return true;
      }
      throw new Error('Failed to delete records');
    } catch (error) {
      console.error('Error deleting records:', error);
      throw error;
    }
  };

  return {
    loading,
    creating,
    // Database operations
    fetchDatabases,
    createDatabase,
    deleteDatabase,
    // Table operations
    fetchTables,
    createTable,
    deleteTable,
    // Column operations
    fetchColumns,
    createColumn,
    deleteColumn,
    // Record operations
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecords
  };
};