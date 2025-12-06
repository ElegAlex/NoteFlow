// ===========================================
// API Client Métadonnées (P2)
// ===========================================

import { api } from '../lib/api';
import type {
  PropertyDefinition,
  NoteMetadata,
  CreatePropertyRequest,
  UpdatePropertyRequest,
} from '@collabnotes/types';

/**
 * Service d'API pour les métadonnées
 */
export const metadataApi = {
  // ----- Définitions de propriétés -----

  /**
   * Récupère toutes les définitions de propriétés
   */
  async getPropertyDefinitions(): Promise<PropertyDefinition[]> {
    const response = await api.get<{ properties: PropertyDefinition[] }>('/properties');
    return response.data.properties;
  },

  /**
   * Récupère une définition par ID
   */
  async getPropertyDefinition(id: string): Promise<PropertyDefinition> {
    const response = await api.get<PropertyDefinition>(`/properties/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle définition de propriété
   */
  async createPropertyDefinition(
    data: CreatePropertyRequest
  ): Promise<PropertyDefinition> {
    const response = await api.post<PropertyDefinition>('/properties', data);
    return response.data;
  },

  /**
   * Met à jour une définition de propriété
   */
  async updatePropertyDefinition(
    id: string,
    data: UpdatePropertyRequest
  ): Promise<PropertyDefinition> {
    const response = await api.patch<PropertyDefinition>(`/properties/${id}`, data);
    return response.data;
  },

  /**
   * Supprime une définition de propriété
   */
  async deletePropertyDefinition(id: string): Promise<void> {
    await api.delete(`/properties/${id}`);
  },

  /**
   * Réordonne les propriétés
   */
  async reorderProperties(order: string[]): Promise<void> {
    await api.post('/properties/reorder', { order });
  },

  // ----- Métadonnées des notes -----

  /**
   * Récupère les métadonnées d'une note
   */
  async getNoteMetadata(noteId: string): Promise<NoteMetadata> {
    const response = await api.get<{ noteId: string; metadata: NoteMetadata }>(
      `/notes/${noteId}/metadata`
    );
    return response.data.metadata;
  },

  /**
   * Met à jour les métadonnées d'une note
   */
  async updateNoteMetadata(
    noteId: string,
    metadata: NoteMetadata
  ): Promise<{ warnings?: string[] }> {
    const response = await api.patch<{ warnings?: string[] }>(
      `/notes/${noteId}/metadata`,
      { metadata }
    );
    return response.data;
  },
};
