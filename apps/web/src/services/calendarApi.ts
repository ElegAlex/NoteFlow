// ===========================================
// API Client Calendar (P3 Calendrier)
// ===========================================

import { api } from '../lib/api';
import type {
  CalendarEvent,
  CalendarEventDetail,
  CreateQuickEventData,
  CalendarEventType,
} from '@collabnotes/types';

interface GetEventsParams {
  start: string;
  end: string;
  types?: string;
  statuses?: string;
  tags?: string;
  folderId?: string;
}

/**
 * Service d'API pour le calendrier
 */
export const calendarApi = {
  /**
   * Récupère les événements dans une plage de dates
   */
  async getEvents(params: GetEventsParams): Promise<CalendarEvent[]> {
    const queryParams = new URLSearchParams();
    queryParams.set('from', params.start);
    queryParams.set('to', params.end);

    if (params.types) queryParams.set('type', params.types);
    if (params.statuses) queryParams.set('status', params.statuses);
    if (params.tags) queryParams.set('tags', params.tags);
    if (params.folderId) queryParams.set('folderId', params.folderId);

    const response = await api.get<{ events: CalendarEvent[] }>(
      `/calendar/events?${queryParams.toString()}`
    );
    return response.data.events;
  },

  /**
   * Récupère le détail d'un événement
   */
  async getEventById(eventId: string): Promise<CalendarEventDetail> {
    const response = await api.get<CalendarEventDetail>(
      `/calendar/events/${eventId}`
    );
    return response.data;
  },

  /**
   * Met à jour la date d'un événement
   */
  async updateEventDate(
    eventId: string,
    newDate: string,
    field?: string
  ): Promise<CalendarEvent> {
    const response = await api.patch<CalendarEvent>(
      `/calendar/events/${eventId}/date`,
      { newDate, field }
    );
    return response.data;
  },

  /**
   * Crée un événement rapide (nouvelle note avec date)
   */
  async createQuickEvent(
    data: CreateQuickEventData
  ): Promise<{ note: { id: string; title: string }; event: CalendarEvent }> {
    const response = await api.post<{
      note: { id: string; title: string };
      event: CalendarEvent;
    }>('/calendar/quick-event', data);
    return response.data;
  },

  /**
   * Supprime un événement (supprime la note associée)
   */
  async deleteEvent(eventId: string): Promise<void> {
    await api.delete(`/calendar/events/${eventId}`);
  },
};
