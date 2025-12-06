// ===========================================
// DashboardPage - Page principale statistiques (P3 Dashboard)
// ===========================================

import { useEffect } from 'react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { StatsCards } from './StatsCards';
import { ActivityChart } from './ActivityChart';
import { DistributionCharts } from './DistributionCharts';
import { TopNotesTable } from './TopNotesTable';
import { UserContributionsTable } from './UserContributionsTable';
import { Skeleton } from '../ui/Skeleton';

export function DashboardPage() {
  const { loadAll, error, isLoadingOverview, clearError } = useAnalyticsStore();

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center h-full"
        data-testid="dashboard-error"
      >
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              loadAll();
            }}
            className="text-primary hover:underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page h-full overflow-auto" data-testid="dashboard-page">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-background/95 sticky top-0 z-10">
        <h1 className="text-2xl font-semibold">Statistiques</h1>
        <p className="text-sm text-muted-foreground">
          Vue d'ensemble de l'activité et du contenu
        </p>
      </header>

      {/* Contenu */}
      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Cartes de stats */}
        {isLoadingOverview ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <StatsCards />
        )}

        {/* Graphique d'activité + Distribution status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityChart />
          </div>
          <div>
            <DistributionCharts field="status" title="Par statut" />
          </div>
        </div>

        {/* Tags + Priority */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistributionCharts field="tags" title="Top tags" chartType="bar" />
          <DistributionCharts field="priority" title="Par priorité" />
        </div>

        {/* Top notes + Contributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopNotesTable />
          <UserContributionsTable />
        </div>
      </main>
    </div>
  );
}
