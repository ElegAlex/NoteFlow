// ===========================================
// Hook de Collaboration Temps Réel
// (EP-005 - Sprint 3-4)
// ===========================================

import { useEffect, useState, useMemo, useRef } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useAuthStore } from '../stores/auth';

const YJS_URL = import.meta.env.VITE_YJS_URL || 'ws://localhost:1234';

export interface CollaboratorInfo {
  id: string;
  name: string;
  color: string;
}

interface UseCollaborationOptions {
  documentId: string;
  onAwarenessChange?: (collaborators: CollaboratorInfo[]) => void;
}

interface UseCollaborationReturn {
  ydoc: Y.Doc;
  provider: HocuspocusProvider | null;
  isConnected: boolean;
  collaborators: CollaboratorInfo[];
  isSynced: boolean;
}

export function useCollaboration({
  documentId,
  onAwarenessChange,
}: UseCollaborationOptions): UseCollaborationReturn {
  const { user } = useAuthStore();
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  // Create Yjs document - stable reference per documentId
  const ydoc = useMemo(() => new Y.Doc(), [documentId]);

  useEffect(() => {
    // Validate documentId - must be a valid UUID-like string
    if (!documentId || documentId.length < 10) {
      console.warn('[Collaboration] Invalid documentId:', documentId);
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('collabnotes-token') || '';

    // Generate user color
    const colors = [
      '#F44336', '#E91E63', '#9C27B0', '#673AB7',
      '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
      '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const userName = user?.displayName || user?.username || 'Anonymous';

    const roomName = `note:${documentId}`;
    console.log('[Collaboration] Connecting to room:', roomName);

    const hocuspocusProvider = new HocuspocusProvider({
      url: YJS_URL,
      name: roomName,
      document: ydoc,
      token,
      onConnect: () => {
        console.log('[Collaboration] Connected to', roomName);
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log('[Collaboration] Disconnected from', roomName);
        setIsConnected(false);
      },
      onSynced: () => {
        console.log('[Collaboration] Synced with', roomName);
        setIsSynced(true);
      },
      onAwarenessChange: ({ states }) => {
        const users: CollaboratorInfo[] = [];

        states.forEach((state: { user?: { name: string; color: string; id: string } }) => {
          if (state.user && state.user.id !== (user?.id || 'anonymous')) {
            users.push({
              id: state.user.id,
              name: state.user.name,
              color: state.user.color,
            });
          }
        });

        setCollaborators(users);
        onAwarenessChange?.(users);
      },
    });

    // Set local user awareness
    hocuspocusProvider.setAwarenessField('user', {
      name: userName,
      color,
      id: user?.id || `anon-${Math.random().toString(36).slice(2, 9)}`,
    });

    providerRef.current = hocuspocusProvider;
    setProvider(hocuspocusProvider);

    return () => {
      console.log('[Collaboration] Cleaning up provider for', roomName);
      hocuspocusProvider.destroy();
      ydoc.destroy();
      providerRef.current = null;
    };
  }, [documentId, user?.id, user?.displayName, user?.username, ydoc, onAwarenessChange]);

  return {
    ydoc,
    provider,
    isConnected,
    collaborators,
    isSynced,
  };
}
