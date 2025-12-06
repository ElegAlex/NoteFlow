// ===========================================
// Routes Analytics (P3 Dashboard)
// Endpoints pour les statistiques du dashboard
// ===========================================

import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import {
  getOverview,
  getActivityTimeline,
  getMetadataDistribution,
  getTopNotes,
  getUserContributions,
} from '../services/analytics';

// ----- Schémas de validation -----

const GetActivityQuerySchema = z.object({
  days: z.coerce.number().min(7).max(90).optional().default(30),
});

const GetDistributionQuerySchema = z.object({
  field: z.enum(['status', 'priority', 'tags']),
});

const GetTopNotesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(10),
});

// ----- Routes -----

export const analyticsRoutes: FastifyPluginAsync = async (app) => {
  // GET /api/v1/analytics/overview - Métriques globales
  app.get('/overview', {
    schema: {
      tags: ['Analytics'],
      summary: 'Get overview statistics',
      description: 'Returns global metrics for the dashboard',
      response: {
        200: {
          type: 'object',
          properties: {
            totalNotes: { type: 'number' },
            totalFolders: { type: 'number' },
            activeUsers: { type: 'number' },
            notesCreatedThisWeek: { type: 'number' },
            notesModifiedThisWeek: { type: 'number' },
            totalViews: { type: 'number' },
          },
        },
      },
    },
    preHandler: [app.authenticate],
  }, async (request) => {
    const userId = request.user.id;
    return getOverview(userId);
  });

  // GET /api/v1/analytics/activity - Activité temporelle
  app.get('/activity', {
    schema: {
      tags: ['Analytics'],
      summary: 'Get activity timeline',
      description: 'Returns note creations and modifications over time',
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'number', minimum: 7, maximum: 90, default: 30 },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            creations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
            modifications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  count: { type: 'number' },
                },
              },
            },
          },
        },
      },
    },
    preHandler: [app.authenticate],
  }, async (request) => {
    const query = GetActivityQuerySchema.parse(request.query);
    return getActivityTimeline(query.days);
  });

  // GET /api/v1/analytics/distribution - Distribution par métadonnées
  app.get('/distribution', {
    schema: {
      tags: ['Analytics'],
      summary: 'Get metadata distribution',
      description: 'Returns distribution of notes by status, priority, or tags',
      querystring: {
        type: 'object',
        required: ['field'],
        properties: {
          field: { type: 'string', enum: ['status', 'priority', 'tags'] },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
    preHandler: [app.authenticate],
  }, async (request) => {
    const query = GetDistributionQuerySchema.parse(request.query);
    return getMetadataDistribution(query.field);
  });

  // GET /api/v1/analytics/top-notes - Notes les plus consultées
  app.get('/top-notes', {
    schema: {
      tags: ['Analytics'],
      summary: 'Get top viewed notes',
      description: 'Returns the most viewed notes',
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              viewCount: { type: 'number' },
              updatedAt: { type: 'string' },
              folderPath: { type: 'string' },
            },
          },
        },
      },
    },
    preHandler: [app.authenticate],
  }, async (request) => {
    const query = GetTopNotesQuerySchema.parse(request.query);
    const userId = request.user.id;
    return getTopNotes(userId, query.limit);
  });

  // GET /api/v1/analytics/user-contributions - Contributions par utilisateur
  app.get('/user-contributions', {
    schema: {
      tags: ['Analytics'],
      summary: 'Get user contributions',
      description: 'Returns contribution statistics per user',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              userName: { type: 'string' },
              userEmail: { type: 'string' },
              notesCreated: { type: 'number' },
              notesModified: { type: 'number' },
              lastActivity: { type: 'string' },
            },
          },
        },
      },
    },
    preHandler: [app.authenticate],
  }, async () => {
    return getUserContributions();
  });
};
