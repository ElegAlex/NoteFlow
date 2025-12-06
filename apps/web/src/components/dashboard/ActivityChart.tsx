// ===========================================
// ActivityChart - Graphique d'activité (P3 Dashboard)
// ===========================================

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

export function ActivityChart() {
  const { activity, isLoadingActivity, activityDays, setActivityDays } =
    useAnalyticsStore();

  // Fusionner les données pour le graphique
  const chartData = useMemo(() => {
    if (!activity) return [];

    return activity.creations.map((creation, index) => ({
      date: formatDate(creation.date),
      creations: creation.count,
      modifications: activity.modifications[index]?.count ?? 0,
    }));
  }, [activity]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-3 px-6">
        <CardTitle className="text-base font-medium">Activité</CardTitle>
        <div className="flex gap-1">
          <Button
            variant={activityDays === 7 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivityDays(7)}
          >
            7 jours
          </Button>
          <Button
            variant={activityDays === 30 ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActivityDays(30)}
          >
            30 jours
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoadingActivity ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="creations"
                name="Créations"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="modifications"
                name="Modifications"
                stroke="hsl(142.1 76.2% 36.3%)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
