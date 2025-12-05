// ===========================================
// Éditeur TipTap (Collaboration désactivée temporairement)
// TODO: Réimplémenter proprement la collaboration Yjs/Hocuspocus
// ===========================================

import { useCallback, useMemo, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { useNavigate } from 'react-router-dom';
import { EditorToolbar } from './EditorToolbar';
import { SaveIndicator } from './SaveIndicator';
import { TagSuggestionPopup, useTagSuggestion } from './extensions/tag';
import { WikilinkSuggestionPopup, useWikilinkSuggestion } from './extensions/wikilink';
import { useAuthStore } from '../../stores/auth';
import { useImageUpload } from '../../hooks/useImageUpload';
import {
  createEditorExtensions,
  type EditorFeatureFlags,
  type EditorConfigOptions,
} from './EditorConfig';

// ===========================================
// Types
// ===========================================

interface CollaborativeEditorProps {
  /** ID de la note */
  noteId: string;
  /** Contenu initial de la note (HTML) */
  initialContent?: string;
  /** Callback de sauvegarde */
  onSave?: (content: string) => Promise<void>;
  /** Mode éditable */
  editable?: boolean;
  /** Feature flags pour les extensions */
  features?: EditorFeatureFlags;
  /** Configuration avancée */
  config?: Omit<EditorConfigOptions, 'features' | 'onTagClick'>;
}

// ===========================================
// Composant Principal
// ===========================================

export function CollaborativeEditor({
  noteId,
  initialContent = '',
  onSave,
  editable = true,
  features,
  config,
}: CollaborativeEditorProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Callback pour clic sur tag
  const handleTagClick = useCallback(
    (tag: string) => {
      navigate(`/search?tag=${encodeURIComponent(tag)}`);
    },
    [navigate]
  );

  // Callback pour clic sur un wikilink (US-038)
  const handleWikilinkClick = useCallback(
    async (title: string) => {
      try {
        // Chercher la note par titre
        const response = await fetch(
          `/api/v1/notes/search?q=${encodeURIComponent(title)}&limit=1`,
          { credentials: 'include' }
        );

        if (response.ok) {
          const data = await response.json();
          const matchingNote = data.notes?.find(
            (n: { title: string; slug: string }) =>
              n.title.toLowerCase() === title.toLowerCase()
          );

          if (matchingNote) {
            // Note trouvée, naviguer vers elle
            navigate(`/notes/${matchingNote.slug}`);
            return;
          }
        }

        // Note non trouvée, proposer de la créer
        if (window.confirm(`La note "${title}" n'existe pas. Voulez-vous la créer ?`)) {
          const createResponse = await fetch('/api/v1/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ title, content: '' }),
          });

          if (createResponse.ok) {
            const newNote = await createResponse.json();
            navigate(`/notes/${newNote.slug}`);
          }
        }
      } catch (error) {
        console.error('Failed to handle wikilink click:', error);
      }
    },
    [navigate]
  );

  // Hook d'upload d'images
  const imageUpload = useImageUpload({
    noteId,
    onError: (error) => console.error('Image upload failed:', error),
  });

  const handleImageUpload = useCallback(
    async (file: File) => {
      const result = await imageUpload.upload(file);
      if (result) {
        return { url: result.url, id: result.id };
      }
      return null;
    },
    [imageUpload]
  );

  // Extensions de l'éditeur (collaboration désactivée temporairement)
  const extensions = useMemo(
    () =>
      createEditorExtensions({
        ...config,
        features,
        onTagClick: handleTagClick,
        onWikilinkClick: handleWikilinkClick,
        imageUpload: { uploadFn: handleImageUpload },
      }),
    [features, config, handleTagClick, handleWikilinkClick, handleImageUpload]
  );

  // Configuration de l'éditeur
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    editable,
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-sm max-w-none focus:outline-none p-6 min-h-[calc(100vh-10rem)]',
      },
    },
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (!editable) return;

      // Marquer comme modifié
      setSaveStatus('pending');

      if (onSave) {
        debounceExportAndSave(editor.getHTML());
      }
    },
  });

  // Debounce pour export HTML vers API classique
  const debounceExportAndSave = useMemo(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return (html: string) => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        if (!onSave) return;

        setSaveStatus('saving');
        try {
          await onSave(html);
          setSaveStatus('saved');
          setLastSaved(new Date());
          setErrorMessage(null);

          // Retourner à idle après 3s
          setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
          setSaveStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Erreur de sauvegarde');
        }
      }, 2000);
    };
  }, [onSave]);

  // Hook pour les suggestions de tags
  const searchTags = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `/api/v1/tags/search?q=${encodeURIComponent(query)}&limit=8`,
        { credentials: 'include' }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.tags || [];
    } catch {
      return [];
    }
  }, []);

  const tagSuggestion = useTagSuggestion({
    editor,
    onSearch: searchTags,
    onSelect: () => {},
  });

  // Hook pour les suggestions de wikilinks (US-037)
  const searchNotes = useCallback(async (query: string) => {
    try {
      const response = await fetch(
        `/api/v1/notes/search?q=${encodeURIComponent(query)}&limit=8`,
        { credentials: 'include' }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.notes || [];
    } catch {
      return [];
    }
  }, []);

  const wikilinkSuggestion = useWikilinkSuggestion({
    editor,
    onSearch: searchNotes,
    onSelect: () => {},
  });

  // Retry de sauvegarde
  const handleRetry = useCallback(async () => {
    if (editor && onSave) {
      setSaveStatus('saving');
      try {
        await onSave(editor.getHTML());
        setSaveStatus('saved');
        setLastSaved(new Date());
        setErrorMessage(null);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        setSaveStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erreur de sauvegarde');
      }
    }
  }, [editor, onSave]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-muted-foreground">
          Chargement de l'éditeur...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar et indicateurs */}
      {editable && (
        <div className="flex items-center justify-between border-b bg-card">
          <EditorToolbar editor={editor} />
          <div className="flex items-center gap-4 px-4 py-2">
            {/* Indicateur de sauvegarde */}
            <SaveIndicator
              status={saveStatus}
              lastSaved={lastSaved}
              errorMessage={errorMessage}
              onRetry={handleRetry}
            />
          </div>
        </div>
      )}

      {/* Zone d'édition */}
      <div className="flex-1 overflow-auto relative">
        <EditorContent editor={editor} />

        {/* Popup suggestions de tags */}
        <TagSuggestionPopup
          isOpen={tagSuggestion.isOpen}
          items={tagSuggestion.items}
          selectedIndex={tagSuggestion.selectedIndex}
          position={tagSuggestion.position}
          query={tagSuggestion.query}
          onSelect={tagSuggestion.selectTag}
        />
        {/* Popup suggestions de wikilinks (US-037) */}
        <WikilinkSuggestionPopup
          isOpen={wikilinkSuggestion.isOpen}
          items={wikilinkSuggestion.items}
          selectedIndex={wikilinkSuggestion.selectedIndex}
          position={wikilinkSuggestion.position}
          query={wikilinkSuggestion.query}
          onSelect={wikilinkSuggestion.selectNote}
        />
      </div>
    </div>
  );
}
