import io from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No token found, skipping socket connection');
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.reconnectAttempts = 0;
      this.emit('user:online', { status: 'online' });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Reconnect manually
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        toast.error('Unable to establish real-time connection. Some features may be limited.');
      }
    });

    // User status events
    this.socket.on('user:status', (data) => {
      this.trigger('user:status', data);
    });

    this.socket.on('users:online', (users) => {
      this.trigger('users:online', users);
    });

    // Room events
    this.socket.on('room:user-joined', (data) => {
      this.trigger('room:user-joined', data);
      toast.info(`${data.name} joined the collaboration`);
    });

    this.socket.on('room:user-left', (data) => {
      this.trigger('room:user-left', data);
    });

    // Document events
    this.socket.on('document:updated', (data) => {
      this.trigger('document:updated', data);
    });

    this.socket.on('document:saved', (data) => {
      this.trigger('document:saved', data);
    });

    // Typing events
    this.socket.on('typing:started', (data) => {
      this.trigger('typing:started', data);
    });

    this.socket.on('typing:stopped', (data) => {
      this.trigger('typing:stopped', data);
    });

    // Cursor events
    this.socket.on('cursor:moved', (data) => {
      this.trigger('cursor:moved', data);
    });

    // Collaboration events
    this.socket.on('collaboration:invite', (data) => {
      this.trigger('collaboration:invite', data);
      toast.info(`${data.invitedBy.name} invited you to collaborate`);
    });

    // Notification events
    this.socket.on('notification:new', (data) => {
      this.trigger('notification:new', data);
      toast.info(data.message);
    });
  }

  // Join a room for real-time collaboration
  joinRoom(roomId, type = 'document') {
    if (!this.socket) return;
    this.socket.emit('room:join', { roomId, type });
  }

  // Leave a room
  leaveRoom(roomId) {
    if (!this.socket) return;
    this.socket.emit('room:leave', { roomId });
  }

  // Send document edit
  sendDocumentEdit(roomId, documentId, changes, version) {
    if (!this.socket) return;
    this.socket.emit('document:edit', { roomId, documentId, changes, version });
  }

  // Send document save
  sendDocumentSave(roomId, documentId, content, version) {
    if (!this.socket) return;
    this.socket.emit('document:save', { roomId, documentId, content, version });
  }

  // Start typing
  startTyping(roomId, documentId) {
    if (!this.socket) return;
    this.socket.emit('typing:start', { roomId, documentId });
  }

  // Stop typing
  stopTyping(roomId, documentId) {
    if (!this.socket) return;
    this.socket.emit('typing:stop', { roomId, documentId });
  }

  // Send cursor position
  sendCursorPosition(roomId, documentId, position) {
    if (!this.socket) return;
    this.socket.emit('cursor:move', { roomId, documentId, position });
  }

  // Invite collaborator
  inviteCollaborator(documentId, documentType, collaboratorEmail, permission) {
    if (!this.socket) return;
    this.socket.emit('collaborator:invite', {
      documentId,
      documentType,
      collaboratorEmail,
      permission
    });
  }

  // Accept collaboration invite
  acceptCollaboration(documentId, documentType) {
    if (!this.socket) return;
    this.socket.emit('collaborator:accept', { documentId, documentType });
  }

  // Reject collaboration invite
  rejectCollaboration(documentId, documentType) {
    if (!this.socket) return;
    this.socket.emit('collaborator:reject', { documentId, documentType });
  }

  // Mark notification as read
  markNotificationRead(notificationId) {
    if (!this.socket) return;
    this.socket.emit('notification:read', { notificationId });
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  trigger(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();