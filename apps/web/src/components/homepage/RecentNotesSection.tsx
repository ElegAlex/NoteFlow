// ===========================================
// RecentNotesSection - P1: Section notes récentes
// ===========================================

import { useHomepageStore } from '../../stores/homepage';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { NoteTable } from './NoteTable';

export function RecentNotesSection() {
  const { recentNotes } = useHomepageStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Notes récentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentNotes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <svg
              className="h-12 w-12 mx-auto mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">Aucune note récente</p>
            <p className="text-xs mt-1">
              Vos notes modifiées récemment apparaîtront ici
            </p>
          </div>
        ) : (
          <NoteTable notes={recentNotes} showPinAction />
        )}
      </CardContent>
    </Card>
  );
}
