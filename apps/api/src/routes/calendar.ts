// ===========================================
// Routes Calendar (US-043)
// Extraction d'événements depuis le frontmatter
// ===========================================

import type { FastifyPluginAsync } from 'fastify';
import { prisma } from '@collabnotes/database';

interface CalendarEvent {
  id: string;
  noteId: string;
  noteTitle: string;
  noteSlug: string;
  date: string;
  type: 'date' | 'due' | 'deadline';
}

export const calendarRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticate);

  /**
   * GET /api/v1/calendar/events
   * US-043: Récupérer les événements depuis le frontmatter des notes
   * Extrait les champs: date, due, deadline
   */
  app.get('/events', {
    schema: {
      tags: ['Calendar'],
      summary: 'Get calendar events from notes frontmatter',
      security: [{ cookieAuth: [] }],
    },
  }, async (request) => {
    const { from, to } = request.query as { from?: string; to?: string };

    // Récupérer toutes les notes avec frontmatter
    const notes = await prisma.note.findMany({
      where: {
        isDeleted: false,
        frontmatter: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        frontmatter: true,
      },
    });

    const events: CalendarEvent[] = [];

    // Extraire les dates du frontmatter
    for (const note of notes) {
      const fm = note.frontmatter as Record<string, unknown> | null;
      if (!fm) continue;

      // Champs de date à extraire
      const dateFields: Array<{ key: string; type: CalendarEvent['type'] }> = [
        { key: 'date', type: 'date' },
        { key: 'due', type: 'due' },
        { key: 'deadline', type: 'deadline' },
        { key: 'dueDate', type: 'due' },
        { key: 'deadlineDate', type: 'deadline' },
      ];

      for (const { key, type } of dateFields) {
        const value = fm[key];
        if (!value) continue;

        // Parser la date (supporte ISO string et YYYY-MM-DD)
        let dateStr: string | null = null;
        if (typeof value === 'string') {
          dateStr = value;
        } else if (value instanceof Date) {
          dateStr = value.toISOString();
        }

        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            // Filtrer par plage si spécifiée
            if (from && date < new Date(from)) continue;
            if (to && date > new Date(to)) continue;

            events.push({
              id: `${note.id}-${key}`,
              noteId: note.id,
              noteTitle: note.title,
              noteSlug: note.slug,
              date: date.toISOString(),
              type,
            });
          }
        }
      }
    }

    // Trier par date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { events };
  });
};
