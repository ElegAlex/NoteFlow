// ===========================================
// Routes Propriétés (P2)
// CRUD pour les définitions de propriétés de métadonnées
// ===========================================

import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  getPropertyDefinitions,
  getPropertyDefinitionById,
  createPropertyDefinition,
  updatePropertyDefinition,
  deletePropertyDefinition,
} from '../services/metadata.js';
import { createAuditLog } from '../services/audit.js';

// ----- Schémas de validation -----

const propertyTypeSchema = z.enum([
  'text',
  'number',
  'date',
  'datetime',
  'checkbox',
  'tags',
  'select',
  'multiselect',
  'link',
]);

const createPropertySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, {
      message: 'Name must start with lowercase letter and contain only lowercase letters, numbers, and underscores',
    }),
  displayName: z.string().min(1).max(100),
  type: propertyTypeSchema,
  description: z.string().max(255).optional(),
  options: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
  defaultValue: z.string().max(255).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().max(7).regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

const updatePropertySchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/)
    .optional(),
  displayName: z.string().min(1).max(100).optional(),
  type: propertyTypeSchema.optional(),
  description: z.string().max(255).optional().nullable(),
  options: z.array(z.string()).optional(),
  isDefault: z.boolean().optional(),
  defaultValue: z.string().max(255).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  color: z.string().max(7).regex(/^#[0-9a-fA-F]{6}$/).optional().nullable(),
  position: z.number().int().min(0).optional(),
});

// ----- Routes -----

export const propertiesRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', app.authenticate);

  /**
   * GET /api/v1/properties
   * Liste toutes les définitions de propriétés
   */
  app.get('/', {
    schema: {
      tags: ['Properties'],
      summary: 'List all property definitions',
      security: [{ cookieAuth: [] }],
    },
  }, async (_request, reply) => {
    const properties = await getPropertyDefinitions();
    return reply.send({ properties });
  });

  /**
   * GET /api/v1/properties/:id
   * Récupère une définition par ID
   */
  app.get('/:id', {
    schema: {
      tags: ['Properties'],
      summary: 'Get property definition by ID',
      security: [{ cookieAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const property = await getPropertyDefinitionById(id);

    if (!property) {
      return reply.status(404).send({
        error: 'NOT_FOUND',
        message: 'Property definition not found',
      });
    }

    return reply.send(property);
  });

  /**
   * POST /api/v1/properties
   * Crée une nouvelle définition de propriété
   */
  app.post('/', {
    schema: {
      tags: ['Properties'],
      summary: 'Create property definition',
      security: [{ cookieAuth: [] }],
    },
  }, async (request, reply) => {
    const parseResult = createPropertySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Invalid property data',
        details: parseResult.error.flatten(),
      });
    }

    const userId = request.user.userId;

    try {
      const property = await createPropertyDefinition(parseResult.data, userId);

      await createAuditLog({
        userId,
        action: 'NOTE_CREATED', // Réutiliser l'action existante
        resourceType: 'PROPERTY',
        resourceId: property.id,
        details: { name: property.name, type: property.type },
        ipAddress: request.ip,
      });

      return reply.status(201).send(property);
    } catch (error) {
      // Erreur de contrainte unique (nom déjà existant)
      if ((error as { code?: string }).code === 'P2002') {
        return reply.status(409).send({
          error: 'CONFLICT',
          message: 'A property with this name already exists',
        });
      }
      throw error;
    }
  });

  /**
   * PATCH /api/v1/properties/:id
   * Met à jour une définition de propriété
   */
  app.patch('/:id', {
    schema: {
      tags: ['Properties'],
      summary: 'Update property definition',
      security: [{ cookieAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = updatePropertySchema.safeParse(request.body);

    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Invalid update data',
        details: parseResult.error.flatten(),
      });
    }

    try {
      const property = await updatePropertyDefinition(id, parseResult.data);

      if (!property) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Property definition not found',
        });
      }

      await createAuditLog({
        userId: request.user.userId,
        action: 'NOTE_UPDATED',
        resourceType: 'PROPERTY',
        resourceId: id,
        details: { fields: Object.keys(parseResult.data) },
        ipAddress: request.ip,
      });

      return reply.send(property);
    } catch (error) {
      if ((error as Error).message.includes('system properties')) {
        return reply.status(403).send({
          error: 'FORBIDDEN',
          message: 'Cannot modify system properties',
        });
      }
      throw error;
    }
  });

  /**
   * DELETE /api/v1/properties/:id
   * Supprime une définition de propriété
   */
  app.delete('/:id', {
    schema: {
      tags: ['Properties'],
      summary: 'Delete property definition',
      security: [{ cookieAuth: [] }],
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const deleted = await deletePropertyDefinition(id);

      if (!deleted) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: 'Property definition not found',
        });
      }

      await createAuditLog({
        userId: request.user.userId,
        action: 'NOTE_DELETED',
        resourceType: 'PROPERTY',
        resourceId: id,
        ipAddress: request.ip,
      });

      return reply.status(204).send();
    } catch (error) {
      if ((error as Error).message.includes('system properties')) {
        return reply.status(403).send({
          error: 'FORBIDDEN',
          message: 'Cannot delete system properties',
        });
      }
      throw error;
    }
  });

  /**
   * POST /api/v1/properties/reorder
   * Réordonne les propriétés
   */
  app.post('/reorder', {
    schema: {
      tags: ['Properties'],
      summary: 'Reorder property definitions',
      security: [{ cookieAuth: [] }],
    },
  }, async (request, reply) => {
    const { order } = request.body as { order: string[] };

    if (!Array.isArray(order)) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Expected array of property IDs',
      });
    }

    // Mettre à jour les positions
    await Promise.all(
      order.map((id, index) =>
        updatePropertyDefinition(id, { position: index })
      )
    );

    return reply.send({ success: true });
  });
};
