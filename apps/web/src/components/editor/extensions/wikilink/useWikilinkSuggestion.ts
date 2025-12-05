// ===========================================
// Hook pour suggestions de wikilinks (US-037)
// Autocomplétion après [[
// ===========================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';

export interface NoteSuggestion {
  id: string;
  title: string;
  slug: string;
  folderPath: string;
}

interface UseWikilinkSuggestionOptions {
  editor: Editor | null;
  onSearch: (query: string) => Promise<NoteSuggestion[]>;
  onSelect: (note: NoteSuggestion) => void;
  onCreateNew?: (title: string) => Promise<void>;
}

interface SuggestionState {
  isOpen: boolean;
  query: string;
  items: NoteSuggestion[];
  selectedIndex: number;
  position: { top: number; left: number } | null;
}

export function useWikilinkSuggestion({
  editor,
  onSearch,
  onSelect,
  onCreateNew,
}: UseWikilinkSuggestionOptions) {
  const [state, setState] = useState<SuggestionState>({
    isOpen: false,
    query: '',
    items: [],
    selectedIndex: 0,
    position: null,
  });

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerPosRef = useRef<number | null>(null);

  // Fermer les suggestions
  const closeSuggestion = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      query: '',
      items: [],
      selectedIndex: 0,
      position: null,
    }));
    triggerPosRef.current = null;
  }, []);

  // Ouvrir les suggestions
  const openSuggestion = useCallback((position: { top: number; left: number }) => {
    setState((prev) => ({
      ...prev,
      isOpen: true,
      position,
      query: '',
      items: [],
      selectedIndex: 0,
    }));
  }, []);

  // Mettre à jour la recherche
  const updateQuery = useCallback(
    async (query: string) => {
      setState((prev) => ({ ...prev, query }));

      // Debounce search
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(async () => {
        const items = await onSearch(query);
        setState((prev) => ({
          ...prev,
          items,
          selectedIndex: 0,
        }));
      }, 150);
    },
    [onSearch]
  );

  // Sélectionner une note
  const selectNote = useCallback(
    (note: NoteSuggestion) => {
      if (!editor || triggerPosRef.current === null) return;

      const { from } = editor.state.selection;
      const triggerPos = triggerPosRef.current;

      // Supprimer le texte de recherche ([[query) et insérer le wikilink complet
      editor
        .chain()
        .focus()
        .deleteRange({ from: triggerPos, to: from })
        .insertContent(`[[${note.title}]]`)
        .run();

      onSelect(note);
      closeSuggestion();
    },
    [editor, onSelect, closeSuggestion]
  );

  // Créer une nouvelle note
  const createNewNote = useCallback(async () => {
    if (!state.query || !onCreateNew || !editor) return;

    await onCreateNew(state.query);
    closeSuggestion();
  }, [state.query, onCreateNew, editor, closeSuggestion]);

  // Navigation clavier
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): boolean => {
      if (!state.isOpen) return false;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex:
              (prev.selectedIndex - 1 + Math.max(prev.items.length, 1)) %
              Math.max(prev.items.length, 1),
          }));
          return true;

        case 'ArrowDown':
          event.preventDefault();
          setState((prev) => ({
            ...prev,
            selectedIndex: (prev.selectedIndex + 1) % Math.max(prev.items.length, 1),
          }));
          return true;

        case 'Enter':
          event.preventDefault();
          const selectedItem = state.items[state.selectedIndex];
          if (selectedItem) {
            selectNote(selectedItem);
          } else if (state.query && onCreateNew) {
            createNewNote();
          }
          return true;

        case 'Escape':
          event.preventDefault();
          closeSuggestion();
          return true;

        case ']':
          // Si on tape ]] pour fermer, laisser passer
          return false;

        default:
          return false;
      }
    },
    [state, selectNote, createNewNote, closeSuggestion, onCreateNew]
  );

  // Surveiller les changements dans l'éditeur
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { from } = selection;

      // Obtenir le texte avant le curseur
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 100),
        from,
        '\n'
      );

      // Chercher [[ non fermé (début de wikilink)
      // On veut matcher [[ suivi de caractères mais pas de ]]
      const match = textBefore.match(/\[\[([^\]]*?)$/);

      if (match) {
        const query = match[1] ?? '';
        const triggerPos = from - match[0].length;

        // Calculer la position du popup
        const coords = editor.view.coordsAtPos(triggerPos);
        const editorRect = editor.view.dom.getBoundingClientRect();

        triggerPosRef.current = triggerPos;

        if (!state.isOpen) {
          openSuggestion({
            top: coords.bottom - editorRect.top,
            left: coords.left - editorRect.left,
          });
        }

        updateQuery(query);
      } else if (state.isOpen) {
        closeSuggestion();
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, state.isOpen, openSuggestion, updateQuery, closeSuggestion]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOpen: state.isOpen,
    query: state.query,
    items: state.items,
    selectedIndex: state.selectedIndex,
    position: state.position,
    handleKeyDown,
    selectNote,
    createNewNote,
    closeSuggestion,
  };
}
