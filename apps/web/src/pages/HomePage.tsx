// ===========================================
// Page d'Accueil (Sprint 7: US-041 à US-046)
// Homepage avec widgets personnalisés
// ===========================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotesStore } from '../stores/notes';
import { useAuthStore } from '../stores/auth';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Spinner } from '../components/ui/Spinner';
import { formatRelativeTime } from '../lib/utils';

// ===========================================
// Types
// ===========================================

interface PinnedNote {
  id: string;
  title: string;
  slug: string;
  folderPath?: string;
}

interface CalendarEvent {
  id: string;
  noteId: string;
  noteTitle: string;
  noteSlug: string;
  date: string;
  type: 'date' | 'due' | 'deadline';
}

interface Announcement {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'danger';
  dismissible: boolean;
  createdAt: string;
}

// ===========================================
// Helpers
// ===========================================

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

// ===========================================
// Main Component
// ===========================================

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { recentNotes, fetchRecentNotes, createNote, isLoading } = useNotesStore();

  // Widget states
  const [pinnedNotes, setPinnedNotes] = useState<PinnedNote[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<Set<string>>(
    () => new Set(JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]'))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchRecentNotes();
    fetchPinnedNotes();
    fetchCalendarEvents();
    fetchAnnouncements();
  }, [fetchRecentNotes]);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch pinned notes (US-044)
  const fetchPinnedNotes = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/notes/pinned', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPinnedNotes(data.notes || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch calendar events (US-043)
  const fetchCalendarEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/calendar/events', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCalendarEvents(data.events || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Fetch announcements (US-045)
  const fetchAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/announcements', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch {
      // Silently fail
    }
  }, []);

  // Dismiss announcement
  const dismissAnnouncement = useCallback((id: string) => {
    setDismissedAnnouncements((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // Create new note
  const handleNewNote = async () => {
    try {
      // folderId is optional now, will use root folder on backend
      const note = await createNote({ title: 'Sans titre' } as Parameters<typeof createNote>[0]);
      navigate(`/notes/${note.slug}`);
    } catch {
      // Error handled by store
    }
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Filter visible announcements
  const visibleAnnouncements = announcements.filter(
    (a) => !dismissedAnnouncements.has(a.id)
  );

  // Get upcoming events (next 7 days)
  const upcomingEvents = calendarEvents
    .filter((e) => {
      const eventDate = new Date(e.date);
      const now = new Date();
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      return eventDate >= now && eventDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Announcements Banner (US-045) */}
      {visibleAnnouncements.length > 0 && (
        <div className="border-b">
          {visibleAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className={`px-4 py-2 flex items-center justify-between ${
                announcement.type === 'danger'
                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                  : announcement.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm">{announcement.message}</span>
              </div>
              {announcement.dismissible && (
                <button
                  onClick={() => dismissAnnouncement(announcement.id)}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-6 max-w-6xl mx-auto">
        {/* Header with date (US-041) */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">
            {formatDate(new Date())}
          </p>
          <h1 className="text-3xl font-bold">
            {getGreeting()}, {user?.displayName || user?.username}
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue dans votre espace de notes collaboratif
          </p>
        </div>

        {/* Search Bar (US-046) */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Rechercher des notes..."
              className="w-full pl-12 pr-20 py-3 text-lg border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-muted rounded border text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <Button onClick={handleNewNote} isLoading={isLoading}>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle note
          </Button>
          <Button variant="outline" onClick={() => navigate('/search')}>
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Recherche avancée
          </Button>
        </div>

        {/* Widgets Grid (US-041 AC4) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Notes Widget (US-042) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Notes récentes</CardTitle>
                <Link
                  to="/search?sort=updated"
                  className="text-sm text-primary hover:underline"
                >
                  Voir tout →
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : recentNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
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
                    <p>Aucune note récente</p>
                    <p className="text-sm mt-1">Créez votre première note pour commencer</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentNotes.slice(0, 10).map((note) => {
                      const noteWithFolder = note as typeof note & { folderPath?: string };
                      return (
                        <Link
                          key={note.id}
                          to={`/notes/${note.slug || note.id}`}
                          className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-4 px-4 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium truncate">{note.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {noteWithFolder.folderPath && (
                                <>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                  </svg>
                                  <span className="truncate">{noteWithFolder.folderPath}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>{formatRelativeTime(note.updatedAt)}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Events Widget (US-043) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  À venir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun événement à venir
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/notes/${event.noteSlug}`}
                        className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            event.type === 'deadline'
                              ? 'bg-destructive'
                              : event.type === 'due'
                              ? 'bg-amber-500'
                              : 'bg-primary'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.noteTitle}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            event.type === 'deadline'
                              ? 'bg-destructive/10 text-destructive'
                              : event.type === 'due'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {event.type === 'deadline' ? 'Deadline' : event.type === 'due' ? 'Échéance' : 'Date'}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column (1/3) */}
          <div className="space-y-6">
            {/* Pinned Notes Widget (US-044) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                    <path d="M12 11v6" />
                    <path d="M9 14h6" />
                  </svg>
                  Notes épinglées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pinnedNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Ajoutez <code className="bg-muted px-1 rounded">pinned: true</code> au frontmatter d'une note
                  </p>
                ) : (
                  <div className="space-y-2">
                    {pinnedNotes.slice(0, 5).map((note) => (
                      <Link
                        key={note.id}
                        to={`/notes/${note.slug}`}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span className="text-sm truncate">{note.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Notes récentes</span>
                  <span className="font-semibold">{recentNotes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Notes épinglées</span>
                  <span className="font-semibold">{pinnedNotes.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Événements à venir</span>
                  <span className="font-semibold">{upcomingEvents.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Raccourcis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recherche</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">⌘K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nouvelle note</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">⌘N</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sauvegarder</span>
                  <kbd className="px-2 py-0.5 bg-muted rounded text-xs">⌘S</kbd>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
