// ===========================================
// Tests composant CalendarPage - P3 Calendrier
// ===========================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CalendarPage } from '../CalendarPage';
import { useCalendarStore } from '../../../stores/calendarStore';

// Mock du store
vi.mock('../../../stores/calendarStore', () => ({
  useCalendarStore: vi.fn(),
}));

const renderPage = () => {
  return render(
    <BrowserRouter>
      <CalendarPage />
    </BrowserRouter>
  );
};

const mockDefaultState = {
  viewMode: 'month' as const,
  currentDate: new Date('2024-03-15'),
  events: [
    {
      id: '1',
      title: 'Test Event',
      date: '2024-03-15',
      noteId: 'note-1',
      noteTitle: 'Note Test',
      type: 'event' as const,
    },
  ],
  selectedEvent: null,
  filters: {
    types: ['deadline', 'event', 'period-start'] as const,
    statuses: ['todo', 'in-progress'] as const,
    tags: [],
    folderId: null,
    search: '',
  },
  calendarMonth: {
    year: 2024,
    month: 2,
    weeks: [
      {
        days: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(2024, 2, i + 1),
          isCurrentMonth: true,
          isToday: i === 14,
          isWeekend: i % 7 === 5 || i % 7 === 6,
          events: [],
        })),
      },
    ],
  },
  availableTags: ['tag1', 'tag2'],
  isLoading: false,
  error: null,
  loadEvents: vi.fn(),
  loadEventDetail: vi.fn(),
  clearSelectedEvent: vi.fn(),
  setViewMode: vi.fn(),
  goToToday: vi.fn(),
  goToPrevious: vi.fn(),
  goToNext: vi.fn(),
  goToDate: vi.fn(),
  setFilter: vi.fn(),
  toggleTypeFilter: vi.fn(),
  toggleStatusFilter: vi.fn(),
  toggleTagFilter: vi.fn(),
  clearFilters: vi.fn(),
  updateEventDate: vi.fn(),
  createQuickEvent: vi.fn(),
};

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCalendarStore).mockReturnValue(mockDefaultState as any);
  });

  it('should render the calendar header', () => {
    renderPage();
    expect(screen.getByText("Aujourd'hui")).toBeInTheDocument();
  });

  it('should render view mode buttons', () => {
    renderPage();
    expect(screen.getByText('Mois')).toBeInTheDocument();
    expect(screen.getByText('Semaine')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('should call loadEvents on mount', () => {
    renderPage();
    expect(mockDefaultState.loadEvents).toHaveBeenCalledTimes(1);
  });

  it('should display error message when error exists', () => {
    vi.mocked(useCalendarStore).mockReturnValue({
      ...mockDefaultState,
      error: 'Erreur de chargement',
    } as any);

    renderPage();
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('should render filters section with search', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  it('should render event type filters', () => {
    renderPage();
    expect(screen.getByText('Échéances')).toBeInTheDocument();
    expect(screen.getByText('Événements')).toBeInTheDocument();
    expect(screen.getByText('Périodes')).toBeInTheDocument();
  });

  it('should render status filters', () => {
    renderPage();
    expect(screen.getByText('À faire')).toBeInTheDocument();
    expect(screen.getByText('En cours')).toBeInTheDocument();
    expect(screen.getByText('Terminé')).toBeInTheDocument();
  });

  it('should render month view by default', () => {
    renderPage();
    // Month view shows weekday headers
    expect(screen.getByText('lun.')).toBeInTheDocument();
    expect(screen.getByText('mar.')).toBeInTheDocument();
  });

  it('should render week view when viewMode is week', () => {
    vi.mocked(useCalendarStore).mockReturnValue({
      ...mockDefaultState,
      viewMode: 'week',
    } as any);

    renderPage();
    expect(screen.getByText('Journée')).toBeInTheDocument();
  });

  it('should render agenda view when viewMode is agenda', () => {
    vi.mocked(useCalendarStore).mockReturnValue({
      ...mockDefaultState,
      viewMode: 'agenda',
      events: [],
    } as any);

    renderPage();
    expect(screen.getByText('Aucun événement')).toBeInTheDocument();
  });

  it('should display available tags when present', () => {
    renderPage();
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });
});
