// ===========================================
// Hook pour suggestions de tags (US-017)
// Gère l'état et la logique de suggestion
// ===========================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';

export interface TagSuggestion {
  id: string;
  name: string;
  color: string | null;
  noteCount: number;
}

interface UseTagSuggestionOptions {
  editor: Editor | null;
  onSearch: (query: string) => Promise<TagSuggestion[]>;
  onSelect: (tag: TagSuggestion) => void;
  onCreateNew?: (name: string) => Promise<TagSuggestion | null>;
}

interface SuggestionState {
  isOpen: boolean;
  query: string;
  items: TagSuggestion[];
  selectedIndex: number;
  position: { top: number; left: number } | null;
}

export function useTagSuggestion({
  editor,
  onSearch,
  onSelect,
  onCreateNew,
}: UseTagSuggestionOptions) {
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

  // Sélectionner un tag
  const selectTag = useCallback(
    (tag: TagSuggestion) => {
      if (!editor || triggerPosRef.current === null) return;

      const { from } = editor.state.selection;
      const triggerPos = triggerPosRef.current;

      // Supprimer le texte de recherche (#query) et insérer le tag
      editor
        .chain()
        .focus()
        .deleteRange({ from: triggerPos, to: from })
        .insertContent(`#${tag.name} `)
        .run();

      onSelect(tag);
      closeSuggestion();
    },
    [editor, onSelect, closeSuggestion]
  );

  // Créer un nouveau tag
  const createNewTag = useCallback(async () => {
    if (!state.query || !onCreateNew || !editor) return;

    const newTag = await onCreateNew(state.query);
    if (newTag) {
      selectTag(newTag);
    }
  }, [state.query, onCreateNew, editor, selectTag]);

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
              (prev.selectedIndex - 1 + prev.items.length) % Math.max(prev.items.length, 1),
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
            selectTag(selectedItem);
          } else if (state.query && onCreateNew) {
            createNewTag();
          }
          return true;

        case 'Escape':
          event.preventDefault();
          closeSuggestion();
          return true;

        default:
          return false;
      }
    },
    [state, selectTag, createNewTag, closeSuggestion, onCreateNew]
  );

  // Surveiller les changements dans l'éditeur
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { selection } = editor.state;
      const { from } = selection;

      // Obtenir le texte avant le curseur
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        '\n'
      );

      // Chercher un # non suivi d'un espace (début de tag)
      const match = textBefore.match(/#([\w\-/]*)$/);

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
    selectTag,
    createNewTag,
    closeSuggestion,
  };
}
