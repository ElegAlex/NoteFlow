// ===========================================
// UserContributionsTable - Contributions par utilisateur (P3 Dashboard)
// ===========================================

import { Users, FileText, Edit, Clock } from 'lucide-react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

export function UserContributionsTable() {
  const { userContributions, isLoadingContributions } = useAnalyticsStore();

  if (isLoadingContributions) {
    return (
      <Card>
        <CardHeader className="py-3 px-6">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Contributions par utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
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
          <Users className="h-5 w-5 text-primary" />
          Contributions par utilisateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        {userContributions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            Aucune contribution
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Utilisateur</th>
                  <th className="pb-2 font-medium text-center">
                    <FileText className="h-3 w-3 inline mr-1" />
                    Créées
                  </th>
                  <th className="pb-2 font-medium text-center">
                    <Edit className="h-3 w-3 inline mr-1" />
                    Modifs
                  </th>
                  <th className="pb-2 font-medium text-right">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Activité
                  </th>
                </tr>
              </thead>
              <tbody>
                {userContributions.map((user) => (
                  <tr key={user.userId} className="border-b last:border-0">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {getInitials(user.userName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-center text-sm">
                      {user.notesCreated}
                    </td>
                    <td className="py-2 text-center text-sm">
                      {user.notesModified}
                    </td>
                    <td className="py-2 text-right text-xs text-muted-foreground">
                      {formatRelativeDate(user.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    return "À l'instant";
  } else if (diffHours < 24) {
    return `Il y a ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays}j`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  }
}
