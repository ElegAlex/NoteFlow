// ===========================================
// Tests composant StatsCards - P3 Dashboard
// ===========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCards } from '../StatsCards';
import { useAnalyticsStore } from '../../../stores/analyticsStore';

// Mock du store
vi.mock('../../../stores/analyticsStore', () => ({
  useAnalyticsStore: vi.fn(),
}));

describe('StatsCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when overview is null', () => {
    vi.mocked(useAnalyticsStore).mockReturnValue({
      overview: null,
    } as any);

    const { container } = render(<StatsCards />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render all stat cards', () => {
    vi.mocked(useAnalyticsStore).mockReturnValue({
      overview: {
        totalNotes: 247,
        totalFolders: 32,
        activeUsers: 12,
        notesCreatedThisWeek: 18,
        notesModifiedThisWeek: 45,
        totalViews: 1500,
      },
    } as any);

    render(<StatsCards />);

    expect(screen.getByText('247')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    // Note: French locale formats 1500 as "1 500" with non-breaking space
    expect(screen.getByText(/1[\s ]?500/)).toBeInTheDocument();
  });

  it('should display correct labels', () => {
    vi.mocked(useAnalyticsStore).mockReturnValue({
      overview: {
        totalNotes: 100,
        totalFolders: 10,
        activeUsers: 5,
        notesCreatedThisWeek: 3,
        notesModifiedThisWeek: 8,
        totalViews: 500,
      },
    } as any);

    render(<StatsCards />);

    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Dossiers')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs actifs')).toBeInTheDocument();
    expect(screen.getByText('Créées')).toBeInTheDocument();
    expect(screen.getByText('Modifiées')).toBeInTheDocument();
    expect(screen.getByText('Vues totales')).toBeInTheDocument();
  });

  it('should display description for active users', () => {
    vi.mocked(useAnalyticsStore).mockReturnValue({
      overview: {
        totalNotes: 100,
        totalFolders: 10,
        activeUsers: 5,
        notesCreatedThisWeek: 3,
        notesModifiedThisWeek: 8,
        totalViews: 500,
      },
    } as any);

    render(<StatsCards />);

    expect(screen.getByText('30 derniers jours')).toBeInTheDocument();
  });
});
