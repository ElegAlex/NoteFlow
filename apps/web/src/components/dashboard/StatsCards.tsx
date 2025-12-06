// ===========================================
// StatsCards - Cartes de statistiques (P3 Dashboard)
// ===========================================

import { FileText, Folder, Users, PlusCircle, Edit, Eye } from 'lucide-react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

function StatCard({ title, value, icon, description, trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
          {trendValue && (
            <span
              className={cn(
                'text-xs font-medium',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-600',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trendValue}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">{value.toLocaleString('fr-FR')}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { overview } = useAnalyticsStore();

  if (!overview) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard
        title="Notes"
        value={overview.totalNotes}
        icon={<FileText className="h-5 w-5 text-primary" />}
      />
      <StatCard
        title="Dossiers"
        value={overview.totalFolders}
        icon={<Folder className="h-5 w-5 text-primary" />}
      />
      <StatCard
        title="Utilisateurs actifs"
        value={overview.activeUsers}
        icon={<Users className="h-5 w-5 text-primary" />}
        description="30 derniers jours"
      />
      <StatCard
        title="Créées"
        value={overview.notesCreatedThisWeek}
        icon={<PlusCircle className="h-5 w-5 text-primary" />}
        trendValue="+7 jours"
        trend="neutral"
      />
      <StatCard
        title="Modifiées"
        value={overview.notesModifiedThisWeek}
        icon={<Edit className="h-5 w-5 text-primary" />}
        trendValue="+7 jours"
        trend="neutral"
      />
      <StatCard
        title="Vues totales"
        value={overview.totalViews}
        icon={<Eye className="h-5 w-5 text-primary" />}
      />
    </div>
  );
}
