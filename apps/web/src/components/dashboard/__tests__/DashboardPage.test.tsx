// ===========================================
// Tests composant DashboardPage - P3 Dashboard
// ===========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import { useAnalyticsStore } from '../../../stores/analyticsStore';

// Mock du store
vi.mock('../../../stores/analyticsStore', () => ({
  useAnalyticsStore: vi.fn(),
}));

// Mock de Recharts pour éviter les erreurs de rendu
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  LineChart: () => <div data-testid="line-chart" />,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  PieChart: () => <div data-testid="pie-chart" />,
  Pie: () => null,
  Cell: () => null,
  BarChart: () => <div data-testid="bar-chart" />,
  Bar: () => null,
}));

const renderPage = () => {
  return render(
    <BrowserRouter>
      <DashboardPage />
    </BrowserRouter>
  );
};

const mockDefaultState = {
  overview: {
    totalNotes: 100,
    totalFolders: 20,
    activeUsers: 5,
    notesCreatedThisWeek: 10,
    notesModifiedThisWeek: 25,
    totalViews: 500,
  },
  activity: {
    creations: [
      { date: '2024-01-01', count: 5 },
      { date: '2024-01-02', count: 3 },
    ],
    modifications: [
      { date: '2024-01-01', count: 8 },
      { date: '2024-01-02', count: 6 },
    ],
  },
  statusDistribution: [
    { label: 'todo', count: 30 },
    { label: 'done', count: 50 },
  ],
  priorityDistribution: [
    { label: 'high', count: 20 },
    { label: 'low', count: 40 },
  ],
  tagsDistribution: [
    { label: 'work', count: 15 },
    { label: 'personal', count: 10 },
  ],
  topNotes: [
    { id: '1', title: 'Note 1', viewCount: 100, updatedAt: '2024-01-01', folderPath: '/docs' },
  ],
  userContributions: [
    {
      userId: 'u1',
      userName: 'Alice',
      userEmail: 'alice@test.com',
      notesCreated: 10,
      notesModified: 20,
      lastActivity: '2024-01-01',
    },
  ],
  isLoadingOverview: false,
  isLoadingActivity: false,
  isLoadingDistributions: false,
  isLoadingTopNotes: false,
  isLoadingContributions: false,
  error: null,
  activityDays: 30 as const,
  loadAll: vi.fn(),
  loadOverview: vi.fn(),
  loadActivity: vi.fn(),
  loadDistributions: vi.fn(),
  loadTopNotes: vi.fn(),
  loadContributions: vi.fn(),
  setActivityDays: vi.fn(),
  clearError: vi.fn(),
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAnalyticsStore).mockReturnValue(mockDefaultState as any);
  });

  it('should render the page title', () => {
    renderPage();
    expect(screen.getByText('Statistiques')).toBeInTheDocument();
  });

  it('should render the page description', () => {
    renderPage();
    expect(screen.getByText("Vue d'ensemble de l'activité et du contenu")).toBeInTheDocument();
  });

  it('should have the correct test id', () => {
    renderPage();
    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });

  it('should call loadAll on mount', () => {
    renderPage();
    expect(mockDefaultState.loadAll).toHaveBeenCalledTimes(1);
  });

  it('should display error message when error exists', () => {
    vi.mocked(useAnalyticsStore).mockReturnValue({
      ...mockDefaultState,
      error: 'Erreur de chargement',
    } as any);

    renderPage();

    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('should have retry button when error exists', () => {
    const clearError = vi.fn();
    const loadAll = vi.fn();

    vi.mocked(useAnalyticsStore).mockReturnValue({
      ...mockDefaultState,
      error: 'Erreur',
      clearError,
      loadAll,
    } as any);

    renderPage();

    const retryButton = screen.getByText('Réessayer');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(clearError).toHaveBeenCalled();
    expect(loadAll).toHaveBeenCalled();
  });

  it('should display loading skeletons when loading overview', () => {
    vi.mocked(useAnalyticsStore).mockReturnValue({
      ...mockDefaultState,
      overview: null,
      isLoadingOverview: true,
    } as any);

    renderPage();

    // Check for skeleton placeholders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display stats cards when data is loaded', () => {
    renderPage();

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Dossiers')).toBeInTheDocument();
  });

  it('should display distribution chart titles', () => {
    renderPage();

    expect(screen.getByText('Par statut')).toBeInTheDocument();
    expect(screen.getByText('Top tags')).toBeInTheDocument();
    expect(screen.getByText('Par priorité')).toBeInTheDocument();
  });

  it('should display top notes section', () => {
    renderPage();

    expect(screen.getByText('Notes les plus consultées')).toBeInTheDocument();
  });

  it('should display user contributions section', () => {
    renderPage();

    expect(screen.getByText('Contributions par utilisateur')).toBeInTheDocument();
  });
});
