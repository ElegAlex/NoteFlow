// ===========================================
// TopNotesTable - Notes les plus consultées (P3 Dashboard)
// ===========================================

import { useNavigate } from 'react-router-dom';
import { Eye, Trophy } from 'lucide-react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export function TopNotesTable() {
  const navigate = useNavigate();
  const { topNotes, isLoadingTopNotes } = useAnalyticsStore();

  if (isLoadingTopNotes) {
    return (
      <Card>
        <CardHeader className="py-3 px-6">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Notes les plus consultées
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-3 px-6">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Notes les plus consultées
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topNotes.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Aucune note consultée
          </div>
        ) : (
          <div className="space-y-1">
            {topNotes.map((note, index) => (
              <div
                key={note.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/notes/${note.id}`)}
              >
                {/* Rang */}
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>

                {/* Titre et chemin */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {note.folderPath}
                  </p>
                </div>

                {/* Vues */}
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span>{note.viewCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
