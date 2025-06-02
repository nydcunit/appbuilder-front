import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentAppId = null;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      if (this.currentAppId) {
        this.leaveApp(this.currentAppId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentAppId = null;
    }
  }

  joinApp(appId) {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    // Leave previous app if any
    if (this.currentAppId && this.currentAppId !== appId) {
      this.leaveApp(this.currentAppId);
    }

    this.currentAppId = appId;
    this.socket.emit('join-app', appId);

  }

  leaveApp(appId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-app', appId);

    }
    if (this.currentAppId === appId) {
      this.currentAppId = null;
    }
  }

  notifyAppSaved(appId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('app-saved', appId);

    }
  }

  onAppUpdated(callback) {
    if (this.socket) {
      this.socket.on('app-updated', callback);
    }
  }

  offAppUpdated(callback) {
    if (this.socket) {
      this.socket.off('app-updated', callback);
    }
  }

  openPreviewWindow(appSubdomain, additionalParams = '') {
    // Get auth token and pass it via URL parameter
    const authToken = localStorage.getItem('token');
    const tokenParam = authToken ? `?token=${encodeURIComponent(authToken)}` : '';
    
    // Combine token param with additional params
    let finalParams = tokenParam;
    if (additionalParams) {
      if (tokenParam) {
        // If we have a token, append additional params with &
        finalParams = tokenParam + '&' + additionalParams.replace(/^\?/, '');
      } else {
        // If no token, use additional params as-is
        finalParams = additionalParams;
      }
    }
    
    const previewUrl = `http://${appSubdomain}.localhost:3000${finalParams}`;
    
    console.log('🔐 Opening preview with URL:', previewUrl.replace(authToken || '', '[TOKEN]'));
    
    const previewWindow = window.open(
      previewUrl,
      `preview-${appSubdomain}`,
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (!previewWindow) {
      alert('Preview window was blocked by your browser. Please allow popups for this site.');
      return null;
    }

    // Wait for the window to load, then send calculation data
    const sendCalculationData = () => {
      try {
        // Collect all calculation data from localStorage and global storage
        const calculationData = {};
        
        
        
        // Get from global storage
        if (window.superTextCalculations) {
          Object.assign(calculationData, window.superTextCalculations);
          
        }
        
        // Get from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('calc_')) {
            try {
              const calcId = key.replace('calc_', '');
              const calcData = JSON.parse(localStorage.getItem(key));
              calculationData[calcId] = calcData;
              
            } catch (error) {
              console.error(`❌ Error parsing calculation ${key}:`, error);
            }
          }
        }
        
        // Get active tabs state
        const activeTabsData = window.__activeTabs || {};
        
        // Get authentication token from localStorage
        const authToken = localStorage.getItem('token');
        
        console.log('📊 Final calculation data to send:', calculationData);
        console.log('📊 Active tabs data to send:', activeTabsData);
        console.log('🔐 Auth token to send:', authToken ? 'Token found' : 'No token');
        
        // Send data to preview window
        previewWindow.postMessage({
          type: 'CALCULATION_DATA',
          calculations: calculationData,
          activeTabs: activeTabsData,
          authToken: authToken
        }, '*');
        
        console.log('📊 Sent calculation data to preview window:', Object.keys(calculationData).length, 'calculations');
      } catch (error) {
        console.error('❌ Error sending calculation data to preview window:', error);
      }
    };
    
    // Listen for requests from the child window
    const handleMessage = (event) => {
      console.log('📨 Received message from:', event.origin, 'Data:', event.data);
      
      // Check for CORS issues
      if (event.origin !== `http://${appSubdomain}.localhost:3000`) {
        console.warn('⚠️ CORS: Message from unexpected origin:', event.origin, 'Expected:', `http://${appSubdomain}.localhost:3000`);
      }
      
      if (event.data && event.data.type === 'REQUEST_CALCULATION_DATA') {
        console.log('📨 Received request for calculation data from child window');
        sendCalculationData();
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Add error handling for postMessage
    window.addEventListener('error', (error) => {
      console.error('❌ Window error (possible CORS issue):', error);
    });
    
    // Send data after a short delay (can't use addEventListener on cross-origin window)
    // Try multiple times to ensure the window is ready
    setTimeout(sendCalculationData, 500);
    setTimeout(sendCalculationData, 1500);
    setTimeout(sendCalculationData, 3000);
    setTimeout(sendCalculationData, 5000);

    return previewWindow;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
