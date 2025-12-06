// ===========================================
// PinButton - P1: Bouton d'épinglage dans l'éditeur
// ===========================================

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { toast } from '../ui/Toaster';
import { api } from '../../lib/api';

interface PinButtonProps {
  noteId: string;
  initialPinned?: boolean;
  onPinChange?: (isPinned: boolean) => void;
}

export function PinButton({ noteId, initialPinned = false, onPinChange }: PinButtonProps) {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isLoading, setIsLoading] = useState(false);

  // Charger l'état initial depuis l'API
  useEffect(() => {
    const checkPinStatus = async () => {
      try {
        const response = await api.get<{ notes: { id: string }[] }>('/notes/pinned');
        const pinnedIds = response.data.notes.map(n => n.id);
        setIsPinned(pinnedIds.includes(noteId));
      } catch {
        // Ignorer silencieusement
      }
    };

    checkPinStatus();
  }, [noteId]);

  const handleTogglePin = useCallback(async () => {
    setIsLoading(true);

    try {
      if (isPinned) {
        await api.delete(`/notes/${noteId}/pin`);
        setIsPinned(false);
        toast.success('Note désépinglée');
        onPinChange?.(false);
      } else {
        await api.post(`/notes/${noteId}/pin`);
        setIsPinned(true);
        toast.success('Note épinglée');
        onPinChange?.(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setIsLoading(false);
    }
  }, [noteId, isPinned, onPinChange]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleTogglePin}
      disabled={isLoading}
      title={isPinned ? 'Désépingler' : 'Épingler'}
      className={isPinned ? 'text-amber-500' : ''}
    >
      {isPinned ? (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      )}
    </Button>
  );
}
