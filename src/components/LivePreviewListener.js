import { useEffect } from 'react';
import websocketService from '../services/websocketService';

const LivePreviewListener = ({ appId }) => {
  useEffect(() => {
    // Only set up live preview if we're in a subdomain (preview window)
    const isPreviewWindow = window.location.hostname !== 'localhost' && 
                           window.location.hostname.includes('.localhost');
    
    if (!isPreviewWindow || !appId) {
      return;
    }

    console.log('🔴 Setting up live preview for app:', appId);

    // Connect to WebSocket and join app room
    websocketService.connect();
    websocketService.joinApp(appId);

    // Listen for app updates
    const handleAppUpdate = (data) => {
      console.log('🔄 App updated, refreshing preview...', data);
      
      // Add a small delay to ensure the backend has processed the save
      setTimeout(() => {
        window.location.reload();
      }, 500);
    };

    websocketService.onAppUpdated(handleAppUpdate);

    // Cleanup on unmount
    return () => {
      websocketService.offAppUpdated(handleAppUpdate);
      websocketService.leaveApp(appId);
    };
  }, [appId]);

  // This component doesn't render anything
  return null;
};

export default LivePreviewListener;
