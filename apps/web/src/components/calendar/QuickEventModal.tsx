// ===========================================
// QuickEventModal - Création rapide d'événement (P3)
// ===========================================

import { useState } from 'react';
import { X, Calendar, Target, Play } from 'lucide-react';
import type { CalendarEventType } from '@collabnotes/types';
import { useCalendarStore } from '../../stores/calendarStore';
import { formatDateKey } from '../../lib/calendarUtils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '../../lib/utils';

interface QuickEventModalProps {
  date: Date;
  onClose: () => void;
}

const EVENT_TYPE_OPTIONS: {
  type: CalendarEventType;
  label: string;
  icon: React.ElementType;
}[] = [
  { type: 'deadline', label: 'Échéance', icon: Target },
  { type: 'event', label: 'Événement', icon: Calendar },
  { type: 'period-start', label: 'Début de période', icon: Play },
];

export function QuickEventModal({ date, onClose }: QuickEventModalProps) {
  const { createQuickEvent } = useCalendarStore();
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEventType>('event');
  const [time, setTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createQuickEvent(title.trim(), formatDateKey(date), eventType, time || undefined);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Nouvel événement</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Date sélectionnée */}
        <p className="text-sm text-muted-foreground mb-4 capitalize">
          {formattedDate}
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Titre */}
          <div>
            <label className="text-sm font-medium">Titre</label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'événement"
              className="mt-1"
              autoFocus
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm font-medium">Type</label>
            <div className="mt-2 flex gap-2">
              {EVENT_TYPE_OPTIONS.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                    eventType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Heure (optionnel) */}
          <div>
            <label className="text-sm font-medium">
              Heure <span className="text-muted-foreground">(optionnel)</span>
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-32"
            />
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>

        {/* Note */}
        <p className="mt-4 text-xs text-muted-foreground">
          Une nouvelle note sera créée avec les métadonnées de cet événement.
        </p>
      </div>
    </div>
  );
}
