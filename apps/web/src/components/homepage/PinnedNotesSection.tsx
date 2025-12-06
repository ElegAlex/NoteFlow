// ===========================================
// PinnedNotesSection - P1: Section notes épinglées
// ===========================================

import { useHomepageStore } from '../../stores/homepage';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { NoteTable } from './NoteTable';

export function PinnedNotesSection() {
  const { pinnedNotes } = useHomepageStore();

  // Ne pas afficher la section si aucune note épinglée
  if (pinnedNotes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Notes épinglées
          <span className="text-muted-foreground font-normal text-sm">
            ({pinnedNotes.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <NoteTable notes={pinnedNotes} showPinAction />
      </CardContent>
    </Card>
  );
}
