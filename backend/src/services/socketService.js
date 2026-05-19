const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

class SocketService {
  constructor(server) {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSessions = new Map(); // socketId -> userId
    this.roomSubscribers = new Map(); // roomId -> Set of socketIds
    this.typingUsers = new Map(); // roomId -> Set of userIds
    
    this.initialize(server);
  }

  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return next(new Error('User not found'));
        }
        
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });

    logger.info('WebSocket server initialized');
  }

  handleConnection(socket) {
    const userId = socket.user._id.toString();
    
    // Store connection
    this.connectedUsers.set(userId, socket.id);
    this.userSessions.set(socket.id, userId);
    
    logger.info(`User connected: ${userId} (${socket.id})`);
    
    // Emit online status to all connected users
    this.broadcastUserStatus(userId, 'online');
    
    // Send current online users to new user
    socket.emit('users:online', Array.from(this.connectedUsers.keys()));
    
    // Handle joining rooms
    socket.on('room:join', (data) => this.handleJoinRoom(socket, data));
    socket.on('room:leave', (data) => this.handleLeaveRoom(socket, data));
    
    // Handle real-time editing
    socket.on('document:edit', (data) => this.handleDocumentEdit(socket, data));
    socket.on('document:save', (data) => this.handleDocumentSave(socket, data));
    socket.on('typing:start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing:stop', (data) => this.handleTypingStop(socket, data));
    
    // Handle notifications
    socket.on('notification:read', (data) => this.handleNotificationRead(socket, data));
    
    // Handle collaboration
    socket.on('collaborator:invite', (data) => this.handleCollaboratorInvite(socket, data));
    socket.on('collaborator:accept', (data) => this.handleCollaboratorAccept(socket, data));
    socket.on('collaborator:reject', (data) => this.handleCollaboratorReject(socket, data));
    
    // Handle cursor updates
    socket.on('cursor:move', (data) => this.handleCursorMove(socket, data));
    
    // Handle disconnection
    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  handleJoinRoom(socket, { roomId, type }) {
    socket.join(roomId);
    
    if (!this.roomSubscribers.has(roomId)) {
      this.roomSubscribers.set(roomId, new Set());
    }
    this.roomSubscribers.get(roomId).add(socket.id);
    
    // Notify others in room
    socket.to(roomId).emit('room:user-joined', {
      userId: socket.user._id,
      name: socket.user.name,
      timestamp: new Date()
    });
    
    // Send current room participants
    const participants = Array.from(this.roomSubscribers.get(roomId))
      .map(socketId => this.userSessions.get(socketId))
      .filter(id => id);
    
    socket.emit('room:participants', participants);
    
    logger.info(`User ${socket.user._id} joined room ${roomId}`);
  }

  handleLeaveRoom(socket, { roomId }) {
    socket.leave(roomId);
    
    if (this.roomSubscribers.has(roomId)) {
      this.roomSubscribers.get(roomId).delete(socket.id);
      if (this.roomSubscribers.get(roomId).size === 0) {
        this.roomSubscribers.delete(roomId);
      }
    }
    
    // Notify others
    socket.to(roomId).emit('room:user-left', {
      userId: socket.user._id,
      timestamp: new Date()
    });
  }

  handleDocumentEdit(socket, { roomId, documentId, changes, version }) {
    // Broadcast changes to all users in the room except sender
    socket.to(roomId).emit('document:updated', {
      documentId,
      changes,
      version,
      userId: socket.user._id,
      timestamp: new Date()
    });
    
    logger.debug(`Document edit in room ${roomId} by ${socket.user._id}`);
  }

  handleDocumentSave(socket, { roomId, documentId, content, version }) {
    // Broadcast save confirmation
    this.io.to(roomId).emit('document:saved', {
      documentId,
      version,
      userId: socket.user._id,
      timestamp: new Date(),
      content: content // Optionally broadcast content
    });
  }

  handleTypingStart(socket, { roomId, documentId }) {
    if (!this.typingUsers.has(roomId)) {
      this.typingUsers.set(roomId, new Set());
    }
    this.typingUsers.get(roomId).add(socket.user._id.toString());
    
    socket.to(roomId).emit('typing:started', {
      documentId,
      userId: socket.user._id,
      userName: socket.user.name,
      timestamp: new Date()
    });
  }

  handleTypingStop(socket, { roomId, documentId }) {
    if (this.typingUsers.has(roomId)) {
      this.typingUsers.get(roomId).delete(socket.user._id.toString());
    }
    
    socket.to(roomId).emit('typing:stopped', {
      documentId,
      userId: socket.user._id,
      timestamp: new Date()
    });
  }

  handleCursorMove(socket, { roomId, documentId, position }) {
    socket.to(roomId).emit('cursor:moved', {
      documentId,
      userId: socket.user._id,
      userName: socket.user.name,
      position,
      timestamp: new Date()
    });
  }

  handleCollaboratorInvite(socket, { documentId, documentType, collaboratorEmail, permission }) {
    // This would typically save to database and send email
    // For now, emit real-time notification
    const targetUser = Array.from(this.connectedUsers.entries())
      .find(([userId]) => userId === collaboratorEmail);
    
    if (targetUser) {
      this.io.to(targetUser[1]).emit('collaboration:invite', {
        documentId,
        documentType,
        invitedBy: {
          id: socket.user._id,
          name: socket.user.name,
          email: socket.user.email
        },
        permission,
        timestamp: new Date()
      });
    }
  }

  handleCollaboratorAccept(socket, { documentId, documentType }) {
    // Notify the inviter
    // This would update database permissions
    socket.emit('collaboration:accepted', {
      documentId,
      documentType,
      collaborator: {
        id: socket.user._id,
        name: socket.user.name
      }
    });
  }

  handleCollaboratorReject(socket, { documentId, documentType }) {
    // Notify the inviter
    socket.emit('collaboration:rejected', {
      documentId,
      documentType,
      collaborator: {
        id: socket.user._id,
        name: socket.user.name
      }
    });
  }

  handleNotificationRead(socket, { notificationId }) {
    // Mark notification as read in database
    socket.emit('notification:read-confirmed', { notificationId });
  }

  handleDisconnect(socket) {
    const userId = this.userSessions.get(socket.id);
    
    if (userId) {
      this.connectedUsers.delete(userId);
      this.userSessions.delete(socket.id);
      
      // Remove from all rooms
      for (const [roomId, sockets] of this.roomSubscribers.entries()) {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.roomSubscribers.delete(roomId);
          }
          // Notify room members
          socket.to(roomId).emit('room:user-left', {
            userId,
            timestamp: new Date()
          });
        }
      }
      
      // Broadcast offline status
      this.broadcastUserStatus(userId, 'offline');
      
      logger.info(`User disconnected: ${userId}`);
    }
  }

  broadcastUserStatus(userId, status) {
    this.io.emit('user:status', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Public methods for emitting events from outside
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  getOnlineUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = SocketService;