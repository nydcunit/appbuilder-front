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
    console.log(`📱 Joined app room: ${appId}`);
  }

  leaveApp(appId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-app', appId);
      console.log(`📱 Left app room: ${appId}`);
    }
    if (this.currentAppId === appId) {
      this.currentAppId = null;
    }
  }

  notifyAppSaved(appId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('app-saved', appId);
      console.log(`💾 Notified app saved: ${appId}`);
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

  openPreviewWindow(appSubdomain) {
    const previewUrl = `http://${appSubdomain}.localhost:3000`;
    const previewWindow = window.open(
      previewUrl,
      `preview-${appSubdomain}`,
      'width=1200,height=800,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
    );

    if (!previewWindow) {
      alert('Preview window was blocked by your browser. Please allow popups for this site.');
      return null;
    }

    return previewWindow;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
