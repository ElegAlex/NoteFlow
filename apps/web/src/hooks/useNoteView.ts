// ===========================================
// Hook useNoteView - P1
// Enregistre automatiquement les vues de notes
// ===========================================

import { useEffect, useRef } from 'react';
import { useHomepageStore } from '../stores/homepage';

/**
 * Hook pour enregistrer automatiquement une vue sur une note
 * - Enregistre une seule vue par montage du composant
 * - Ignore les erreurs silencieusement (UX non bloquante)
 *
 * @param noteId - L'ID de la note à tracker
 * @param enabled - Permet de désactiver le tracking (ex: mode preview)
 */
export function useNoteView(noteId: string | undefined, enabled = true): void {
  const { recordNoteView } = useHomepageStore();
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    // Ne pas enregistrer si désactivé ou pas d'ID
    if (!enabled || !noteId) {
      return;
    }

    // Éviter les enregistrements multiples
    if (hasRecordedRef.current) {
      return;
    }

    // Enregistrer la vue
    hasRecordedRef.current = true;
    recordNoteView(noteId);

    // Reset si noteId change
    return () => {
      hasRecordedRef.current = false;
    };
  }, [noteId, enabled, recordNoteView]);
}
