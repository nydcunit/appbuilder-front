import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const useAppState = () => {
  const { appId } = useParams();
  
  const [app, setApp] = useState(null);
  const [screens, setScreens] = useState([]);
  const [currentScreenId, setCurrentScreenId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newScreenName, setNewScreenName] = useState('');

  useEffect(() => {
    loadApp();
  }, [appId]);

  const loadApp = async () => {
    try {
      const response = await axios.get(`/api/apps/${appId}`);
      if (response.data.success) {
        const appData = response.data.data;
        console.log('Loaded app data:', appData);
        setApp(appData);
        setScreens(appData.screens || [{ id: 1, name: 'Home', elements: [] }]);
        setCurrentScreenId(appData.screens?.[0]?.id || 1);
      }
    } catch (error) {
      console.error('Error loading app:', error);
      alert('Error loading app: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const saveApp = async () => {
    setSaving(true);
    try {
      console.log('Saving app with screens:', screens);
      
      // Log the current screen elements to see what we're saving
      const currentScreen = screens.find(screen => screen.id === currentScreenId);
      const currentScreenElements = currentScreen?.elements || [];
      console.log('Current screen elements being saved:', JSON.stringify(currentScreenElements, null, 2));
      
      const response = await axios.put(`/api/apps/${appId}`, {
        screens: screens,
        homeScreenId: app?.homeScreenId
      });
      
      if (response.data.success) {
        console.log('App saved successfully. Saved data:', response.data.data);
        alert('App saved successfully!');
        setApp(response.data.data);
      }
    } catch (error) {
      console.error('Error saving app:', error);
      alert('Error saving app: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const createScreen = () => {
    if (!newScreenName.trim()) return;
    
    const newScreen = {
      id: Date.now(),
      name: newScreenName,
      elements: []
    };
    
    setScreens([...screens, newScreen]);
    setCurrentScreenId(newScreen.id);
    setNewScreenName('');
  };

  const deleteScreen = (screenId) => {
    if (screens.length === 1) {
      alert('Please create another screen to delete this.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this screen?')) {
      const updatedScreens = screens.filter(screen => screen.id !== screenId);
      setScreens(updatedScreens);
      
      if (screenId === currentScreenId) {
        setCurrentScreenId(updatedScreens[0].id);
      }
    }
  };

  const updateScreen = (updatedScreen) => {
    const updatedScreens = screens.map(screen => 
      screen.id === updatedScreen.id ? updatedScreen : screen
    );
    setScreens(updatedScreens);
  };

  const setHomeScreen = (screenId) => {
    // Update app to set home screen
    setApp(prevApp => ({
      ...prevApp,
      homeScreenId: screenId
    }));
  };

  const getCurrentScreen = () => {
    return screens.find(screen => screen.id === currentScreenId);
  };

  const updateScreens = (newScreens) => {
    setScreens(newScreens);
  };

  return {
    // State
    app,
    screens,
    currentScreenId,
    loading,
    saving,
    newScreenName,
    
    // Setters
    setCurrentScreenId,
    setNewScreenName,
    updateScreens,
    
    // Actions
    saveApp,
    createScreen,
    deleteScreen,
    updateScreen,
    setHomeScreen,
    getCurrentScreen,
    
    // Computed
    currentScreen: getCurrentScreen()
  };
};
