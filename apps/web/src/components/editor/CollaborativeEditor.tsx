// ===========================================
// Éditeur Collaboratif avec Yjs
// (EP-005 - Sprint 3-4)
// ===========================================

import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useCollaboration } from '../../hooks/useCollaboration';
import type { CollaboratorInfo } from '../../hooks/useCollaboration';
import { EditorToolbar } from './EditorToolbar';
import { createWikilinkExtension } from './extensions/Wikilink';
import { CollaboratorList } from './CollaboratorList';
import { api } from '../../lib/api';
import { toast } from '../ui/Toaster';

interface CollaborativeEditorProps {
  noteId: string;
  editable?: boolean;
  onCollaboratorsChange?: (collaborators: CollaboratorInfo[]) => void;
}

export function CollaborativeEditor({
  noteId,
  editable = true,
  onCollaboratorsChange,
}: CollaborativeEditorProps) {
  const navigate = useNavigate();
  const {
    ydoc,
    provider,
    isConnected,
    collaborators,
    isSynced,
  } = useCollaboration({
    documentId: noteId,
    onAwarenessChange: onCollaboratorsChange,
  });

  // Handle wikilink navigation
  const handleWikilinkClick = useCallback(async (title: string) => {
    try {
      // Search for note by title
      const response = await api.get<{ notes: Array<{ id: string; title: string }> }>(
        `/search?q=${encodeURIComponent(title)}&limit=1`
      );

      const notes = response.data?.notes ?? [];
      const exactMatch = notes.find(
        (n: { id: string; title: string }) => n.title.toLowerCase() === title.toLowerCase()
      );

      if (exactMatch) {
        navigate(`/notes/${exactMatch.id}`);
      } else if (notes.length > 0) {
        // Navigate to first result if no exact match
        navigate(`/notes/${notes[0].id}`);
      } else {
        // Note doesn't exist - offer to create it
        const create = window.confirm(
          `La note "${title}" n'existe pas. Voulez-vous la créer ?`
        );
        if (create) {
          const newNote = await api.post<{ id: string }>('/notes', { title });
          navigate(`/notes/${newNote.data.id}`);
          toast.success(`Note "${title}" créée`);
        }
      }
    } catch (error) {
      console.error('Error navigating to wikilink:', error);
      toast.error('Erreur lors de la navigation');
    }
  }, [navigate]);

  // Create wikilink extension with navigation
  const wikilinkExtension = useMemo(
    () => createWikilinkExtension(handleWikilinkClick),
    [handleWikilinkClick]
  );

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          history: false, // Disabled because Yjs handles undo/redo
          heading: {
            levels: [1, 2, 3, 4],
          },
        }),
        Placeholder.configure({
          placeholder: 'Commencez à écrire...',
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline',
          },
        }),
        Highlight.configure({
          multicolor: true,
        }),
        Typography,
        wikilinkExtension,
        // Collaborative editing
        Collaboration.configure({
          document: ydoc,
        }),
        // Collaborative cursors
        ...(provider
          ? [
              CollaborationCursor.configure({
                provider,
                user: provider.awareness.getLocalState()?.user || {
                  name: 'Anonymous',
                  color: '#888888',
                },
              }),
            ]
          : []),
      ],
      editable,
      editorProps: {
        attributes: {
          class:
            'tiptap prose prose-sm max-w-none focus:outline-none p-6 min-h-[calc(100vh-10rem)]',
        },
      },
    },
    [ydoc, provider, wikilinkExtension]
  );

  // Sync is handled by Yjs - no need to update cursor manually

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with collaborators and status */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? (isSynced ? 'Synchronisé' : 'Synchronisation...') : 'Déconnecté'}
            </span>
          </div>
        </div>

        {/* Collaborators */}
        <CollaboratorList collaborators={collaborators} />
      </div>

      {/* Toolbar */}
      {editable && <EditorToolbar editor={editor} />}

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
