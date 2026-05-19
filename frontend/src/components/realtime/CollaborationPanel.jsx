import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Copy, Check, X, Mail } from 'lucide-react';
import socketService from '../../services/socketService';
import api from '../../services/api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from 'sonner';

const CollaborationPanel = ({ documentId, documentType, isOwner }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [shareableLink, setShareableLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCollaborationStatus();
    
    // Socket event listeners
    socketService.on('room:user-joined', handleUserJoined);
    socketService.on('room:user-left', handleUserLeft);
    socketService.on('users:online', handleOnlineUsers);
    
    // Join collaboration room
    socketService.joinRoom(documentId, documentType);
    
    return () => {
      socketService.leaveRoom(documentId);
      socketService.off('room:user-joined', handleUserJoined);
      socketService.off('room:user-left', handleUserLeft);
      socketService.off('users:online', handleOnlineUsers);
    };
  }, [documentId, documentType]);

  const fetchCollaborationStatus = async () => {
    try {
      const response = await api.get(`/realtime/collaboration/${documentType}/${documentId}`);
      setCollaborators(response.data.data.collaborators || []);
      setShareableLink(response.data.data.shareableLink);
    } catch (error) {
      console.error('Failed to fetch collaboration status:', error);
    }
  };

  const handleUserJoined = (data) => {
    toast.info(`${data.name} joined the collaboration`);
    // Refresh online users
    fetchCollaborationStatus();
  };

  const handleUserLeft = (data) => {
    // User left notification
  };

  const handleOnlineUsers = (users) => {
    setOnlineUsers(users);
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post(`/realtime/collaboration/${documentType}/${documentId}/share`, {
        email: inviteEmail,
        permission
      });
      
      // Send real-time invite via socket
      socketService.inviteCollaborator(documentId, documentType, inviteEmail, permission);
      
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInviteModal(false);
      fetchCollaborationStatus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    if (!confirm('Remove this collaborator?')) return;
    
    try {
      await api.delete(`/realtime/collaboration/${documentType}/${documentId}/collaborator/${collaboratorId}`);
      toast.success('Collaborator removed');
      fetchCollaborationStatus();
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };

  const copyShareableLink = () => {
    const link = `${window.location.origin}/${documentType}s/public/${shareableLink}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard');
  };

  const getPermissionBadge = (perm) => {
    const colors = {
      view: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      edit: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[perm] || colors.view;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Collaborators</h3>
            <span className="text-xs text-gray-500">
              ({collaborators.length + 1} total)
            </span>
          </div>
          {isOwner && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Invite collaborator"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Owner */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <span className="text-sm font-medium text-purple-600">👑</span>
            </div>
            <div>
              <p className="text-sm font-medium">You (Owner)</p>
              <p className="text-xs text-gray-500">Full access</p>
            </div>
          </div>
          {onlineUsers.includes('owner-id') && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              Online
            </span>
          )}
        </div>

        {/* Collaborators */}
        {collaborators.map((collaborator) => (
          <div key={collaborator._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {collaborator.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm">{collaborator.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPermissionBadge(collaborator.permission)}`}>
                  {collaborator.permission}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onlineUsers.includes(collaborator.userId) && (
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
              )}
              {isOwner && (
                <button
                  onClick={() => handleRemoveCollaborator(collaborator._id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Shareable Link */}
        {shareableLink && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-2">Shareable Link (Read-Only)</p>
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/${documentType}s/public/${shareableLink}`}
                readOnly
                className="flex-1 text-sm"
              />
              <Button onClick={copyShareableLink} variant="outline" size="sm">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite Collaborator</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collaborator@example.com"
                icon={Mail}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Permission Level</label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-2"
                >
                  <option value="view">Can view only</option>
                  <option value="edit">Can edit</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} isLoading={isLoading}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationPanel;