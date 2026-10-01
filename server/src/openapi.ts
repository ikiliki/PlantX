/** OpenAPI 3 description of the PlantX live API. */
export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'PlantX API',
    version: '0.1.0',
    description:
      'Feature-based JSON API. Greenhouse care records into the activity service. Home feed and plant cards read activities separately from plant state. Session cookie: `plantx_session`.',
  },
  servers: [{ url: 'http://127.0.0.1:8787', description: 'QA API' }],
  tags: [
    { name: 'live', description: 'Boot payload' },
    { name: 'session', description: 'Demo login and register' },
    { name: 'system', description: 'Admin release config' },
    { name: 'catalog', description: 'Market catalog taxonomy' },
    { name: 'activities', description: 'Generic activity log (news + plant timeline)' },
    { name: 'plants', description: 'Greenhouse plants and care' },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'plantx_session',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          kind: {
            type: 'string',
            enum: ['photo', 'water', 'propagate', 'grade', 'passport', 'listing'],
          },
          userId: { type: 'string' },
          plantId: { type: 'string' },
          body: { type: 'string' },
          bodyHe: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'kind', 'userId', 'body', 'bodyHe', 'createdAt'],
      },
      LiveMeta: {
        type: 'object',
        properties: {
          users: { type: 'integer' },
          plants: { type: 'integer' },
          updates: { type: 'integer' },
          pending: { type: 'integer' },
          transactions: { type: 'integer' },
          catalog: {
            type: 'object',
            properties: {
              categories: { type: 'integer' },
              subcategories: { type: 'integer' },
              properties: { type: 'integer' },
            },
            required: ['categories', 'subcategories', 'properties'],
          },
        },
        required: ['users', 'plants', 'updates', 'pending', 'transactions', 'catalog'],
      },
      Live: {
        type: 'object',
        properties: {
          system: { type: 'object', additionalProperties: true },
          currentUser: { type: 'object', additionalProperties: true, nullable: true },
          currentUserId: { type: 'string', nullable: true },
          meta: { $ref: '#/components/schemas/LiveMeta' },
        },
        required: ['system', 'currentUser', 'currentUserId', 'meta'],
      },
      Plant: {
        type: 'object',
        additionalProperties: true,
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          titleHe: { type: 'string' },
          ownerId: { type: 'string' },
          wateredAt: { type: 'string' },
          photoAt: { type: 'string' },
        },
        required: ['id', 'title'],
      },
      SessionBody: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          userId: { type: 'string', nullable: true, description: 'Persona id, or null to sign out' },
        },
      },
      RegisterBody: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['name', 'email'],
      },
      PlantActionResult: {
        type: 'object',
        properties: {
          plant: { $ref: '#/components/schemas/Plant' },
          activity: { $ref: '#/components/schemas/Activity' },
          update: { $ref: '#/components/schemas/Activity' },
          activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
          updates: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
        },
        required: ['plant', 'activity', 'activities'],
      },
    },
  },
  paths: {
    '/api/live': {
      get: {
        tags: ['live'],
        summary: 'Live metadata',
        description: 'Boot metadata for every collection: members, plants, updates, pending members, pending transactions, and catalog counts. Full rows are loaded from their own routes.',
        responses: {
          '200': {
            description: 'Live payload',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Live' } } },
          },
        },
      },
    },
    '/api/catalog': {
      get: {
        tags: ['catalog'],
        summary: 'Get catalog',
        responses: {
          '200': {
            description: 'Catalog taxonomy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { catalog: { type: 'object', additionalProperties: true } },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['catalog'],
        summary: 'Replace catalog',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { catalog: { type: 'object', additionalProperties: true } },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Saved catalog',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { catalog: { type: 'object', additionalProperties: true } },
                },
              },
            },
          },
        },
      },
    },
    '/api/activities': {
      get: {
        tags: ['activities'],
        summary: 'List activities',
        description: 'Home feed. Filter with plantId or userId.',
        parameters: [
          { name: 'plantId', in: 'query', schema: { type: 'string' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Activity list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['activities'],
        summary: 'Record an activity',
        description: 'Generic write. Future event bus will call this (or the service directly).',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Activity' } } },
        },
        responses: {
          '200': {
            description: 'Recorded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activity: { $ref: '#/components/schemas/Activity' },
                    activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid body',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/system': {
      put: {
        tags: ['system'],
        summary: 'Update release config',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', additionalProperties: true },
            },
          },
        },
        responses: {
          '200': {
            description: 'Saved system config',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { system: { type: 'object', additionalProperties: true } },
                },
              },
            },
          },
          '403': {
            description: 'Not admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/session': {
      post: {
        tags: ['session'],
        summary: 'Sign in or sign out',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SessionBody' } } },
        },
        responses: {
          '200': {
            description: 'Live payload for the session',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Live' } } },
          },
          '404': {
            description: 'Unknown user',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/session/register': {
      post: {
        tags: ['session'],
        summary: 'Register a grower',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } },
        },
        responses: {
          '200': {
            description: 'Created and signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Live' } } },
          },
          '400': {
            description: 'Invalid body',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '409': {
            description: 'Email already exists',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/plants': {
      post: {
        tags: ['plants'],
        summary: 'Add a greenhouse plant',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Plant' } } },
        },
        responses: {
          '200': {
            description: 'Created plant',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    plant: { $ref: '#/components/schemas/Plant' },
                    activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '400': {
            description: 'Invalid plant',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/plants/{id}': {
      get: {
        tags: ['plants'],
        summary: 'Get one plant',
        description: 'Plant state only. Load activities from GET /api/plants/{id}/activities.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Plant',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { plant: { $ref: '#/components/schemas/Plant' } },
                },
              },
            },
          },
          '404': {
            description: 'Missing',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/plants/{id}/activities': {
      get: {
        tags: ['activities'],
        summary: 'Activities for one plant',
        description: 'Plant card / passport timeline. Calls the activity service filtered by plantId.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Plant activities',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    plantId: { type: 'string' },
                    activities: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                  },
                },
              },
            },
          },
          '404': {
            description: 'Plant missing',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/plants/{id}/water': {
      post: {
        tags: ['plants'],
        summary: 'Confirm watering',
        description: 'Updates plant state, then records a water activity via the activity service.',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Plant and activity list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PlantActionResult' } },
            },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Plant not found for owner',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/plants/{id}/photo': {
      post: {
        tags: ['plants'],
        summary: 'Refresh plant photo',
        description: 'Updates plant state, then records a photo activity via the activity service.',
        security: [{ cookieAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Plant and activity list',
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PlantActionResult' } },
            },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '404': {
            description: 'Plant not found for owner',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
  },
} as const
