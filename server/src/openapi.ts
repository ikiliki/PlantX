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
    { name: 'identify', description: 'Photo diagnosis providers and fallback chain' },
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
        properties: {
          error: { type: 'string' },
          message: { type: 'string', description: 'Why the request failed' },
        },
        required: ['error'],
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          kind: {
            type: 'string',
            enum: ['photo', 'water', 'propagate', 'grade', 'passport', 'listing', 'scan', 'added'],
            description: '`scan` and `added` are written by identify and Add Plant only; POST /api/activities rejects them.',
          },
          userId: { type: 'string' },
          plantId: { type: 'string', description: 'On a `scan`, set once the scanned plant is added.' },
          identifyRequestId: { type: 'string' },
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
          identification: { $ref: '#/components/schemas/PlantIdentification' },
        },
        required: ['id', 'title'],
      },
      PlantIdentification: {
        type: 'object',
        description: 'Set by the server from a saved Add Plant identify request. Client values are ignored.',
        properties: {
          source: { type: 'string', enum: ['ai', 'edited', 'manual'] },
          provider: { type: 'string', enum: ['plantid', 'plantnet', 'gemini'] },
          mode: { type: 'string', enum: ['mock', 'live'] },
          label: { type: 'string' },
          scientificName: { type: 'string' },
          probability: { type: 'number' },
          requestId: { type: 'string' },
          at: { type: 'string', format: 'date-time' },
          photos: { type: 'array', items: { $ref: '#/components/schemas/PhotoCheck' } },
        },
        required: ['source', 'at'],
      },
      PhotoCheck: {
        type: 'object',
        description: 'AI check of one saved photo, in photo order.',
        properties: {
          position: { type: 'integer' },
          result: { type: 'string', enum: ['match', 'mismatch', 'notPlant', 'failed', 'unscanned'] },
          requestId: { type: 'string' },
          provider: { type: 'string', enum: ['plantid', 'plantnet', 'gemini'] },
          mode: { type: 'string', enum: ['mock', 'live'] },
          label: { type: 'string' },
          probability: { type: 'number' },
        },
        required: ['position', 'result'],
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
      IdentifyTried: {
        type: 'object',
        properties: {
          provider: { type: 'string', enum: ['plantid', 'plantnet', 'gemini'] },
          reason: { type: 'string', enum: ['disabled', 'missingKey', 'exhausted', 'error', 'timeout'] },
          detail: { type: 'string' },
        },
        required: ['provider', 'reason'],
      },
      IdentifyProviderStatus: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: ['plantid', 'plantnet', 'gemini'] },
          order: { type: 'integer' },
          name: { type: 'string' },
          returns: { type: 'string' },
          docsUrl: { type: 'string' },
          keySet: { type: 'boolean' },
          enabled: {
            type: 'boolean',
            description: 'Admin switch. POST /api/identify skips a disabled provider; the playground ignores it.',
          },
          response: {
            type: 'string',
            enum: ['ready', 'mock'],
            description: 'Add Plant only. ready calls the real API. mock uses scenario and spends nothing.',
          },
          scenario: { type: 'string', enum: ['match', 'notInCatalog', 'notPlant', 'error'] },
          match: {
            type: 'object',
            description: 'Catalog fill used when response is mock and scenario is match.',
            additionalProperties: true,
          },
          suggestionId: {
            type: 'string',
            description: 'Catalog suggestion used when response is mock and scenario is notInCatalog.',
          },
          status: { type: 'string', enum: ['ready', 'missingKey', 'exhausted', 'unreachable'] },
          credits: { type: 'object', additionalProperties: true },
          model: { type: 'string' },
          lastError: { type: 'string' },
          lastUsedAt: { type: 'string', format: 'date-time' },
        },
        required: ['id', 'order', 'name', 'returns', 'docsUrl', 'keySet', 'enabled', 'response', 'scenario', 'match', 'suggestionId', 'status'],
      },
      Diagnosis: {
        type: 'object',
        properties: {
          provider: { type: 'string', enum: ['plantid', 'plantnet', 'gemini'] },
          mode: { type: 'string', enum: ['mock', 'live'] },
          label: { type: 'string' },
          scientificName: { type: 'string' },
          commonNames: { type: 'array', items: { type: 'string' } },
          probability: { type: 'number' },
          isPlant: { type: 'boolean' },
          draft: { type: 'object', additionalProperties: true, description: 'Existing catalog ids only' },
          tried: { type: 'array', items: { $ref: '#/components/schemas/IdentifyTried' } },
        },
        required: ['provider', 'mode', 'label', 'scientificName', 'commonNames', 'probability', 'isPlant', 'draft', 'tried'],
      },
      IdentifyRequestRecord: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          userId: { type: 'string' },
          userName: { type: 'string' },
          source: { type: 'string', enum: ['addPlant', 'playground'] },
          mode: { type: 'string', enum: ['mock', 'live'] },
          target: { type: 'string', enum: ['chain', 'plantid', 'plantnet', 'gemini'] },
          scenario: { type: 'string', enum: ['match', 'notInCatalog', 'notPlant', 'error'], description: 'Mock only' },
          status: { type: 'string', enum: ['ok', 'unavailable'] },
          thumb: { type: 'string', description: 'Small image data URL; dropped when over ~40KB' },
          durationMs: { type: 'integer' },
          diagnosis: { $ref: '#/components/schemas/Diagnosis' },
          tried: { type: 'array', items: { $ref: '#/components/schemas/IdentifyTried' } },
          plantId: { type: 'string', description: 'Plant this Add Plant request was saved with. Absent: never added.' },
          photoIndex: { type: 'integer' },
          fields: {
            type: 'object',
            description: 'Per class field (category, subcategory, quality, size, stage): kept, changed, or manual.',
            additionalProperties: { type: 'string', enum: ['kept', 'changed', 'manual'] },
          },
        },
        required: ['id', 'createdAt', 'userId', 'source', 'mode', 'target', 'status', 'durationMs', 'tried'],
      },
      IdentifyOk: {
        type: 'object',
        properties: {
          diagnosis: { $ref: '#/components/schemas/Diagnosis' },
          record: { $ref: '#/components/schemas/IdentifyRequestRecord' },
          activity: { $ref: '#/components/schemas/Activity', description: 'Add Plant only: the `scan` activity' },
        },
        required: ['diagnosis', 'record'],
      },
      IdentifyUnavailable: {
        type: 'object',
        properties: {
          error: { type: 'string', enum: ['unavailable'] },
          tried: { type: 'array', items: { $ref: '#/components/schemas/IdentifyTried' } },
          record: { $ref: '#/components/schemas/IdentifyRequestRecord' },
        },
        required: ['error', 'tried', 'record'],
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
    '/api/identify': {
      post: {
        tags: ['identify'],
        summary: 'Diagnose a plant photo',
        description:
          'Signed-in only. Tries Plant.id, then Pl@ntNet, then Gemini. Stops on the first answer (including is_plant false). Always live (real APIs, spends credits); providers the admin switched off are skipped with reason disabled. Every request is saved to history.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  image: {
                    type: 'string',
                    description: 'JPEG/PNG data URL from the client photo picker',
                  },
                  thumb: { type: 'string', description: 'Small JPEG data URL kept in history' },
                },
                required: ['image'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Diagnosis with mapped draft and skipped providers, plus the saved request',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentifyOk' } } },
          },
          '400': {
            description: 'Missing or non-image body',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '503': {
            description: 'Every provider skipped or failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentifyUnavailable' } } },
          },
        },
      },
    },
    '/api/identify/test': {
      post: {
        tags: ['identify'],
        summary: 'Admin identify playground',
        description:
          'Admin only. Runs the chain or one provider in the chosen mode, ignoring the enabled switch. Live spends real credits; mock uses the scenario (default match).',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', description: 'Image data URL' },
                  thumb: { type: 'string' },
                  mode: { type: 'string', enum: ['mock', 'live'] },
                  target: { type: 'string', enum: ['chain', 'plantid', 'plantnet', 'gemini'] },
                  scenario: { type: 'string', enum: ['match', 'notInCatalog', 'notPlant', 'error'] },
                },
                required: ['image', 'mode', 'target'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Diagnosis plus the saved request',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentifyOk' } } },
          },
          '400': {
            description: 'Invalid image, mode, target, or scenario',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '403': {
            description: 'Not admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '503': {
            description: 'Every tried provider skipped or failed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/IdentifyUnavailable' } } },
          },
        },
      },
    },
    '/api/identify/history': {
      get: {
        tags: ['identify'],
        summary: 'Identify request history',
        description: 'Admin only. Newest first. Empty when the identify_requests table is not migrated yet.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'mode', in: 'query', schema: { type: 'string', enum: ['mock', 'live'] } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, minimum: 1, maximum: 200 } },
        ],
        responses: {
          '200': {
            description: 'Saved requests',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    requests: { type: 'array', items: { $ref: '#/components/schemas/IdentifyRequestRecord' } },
                  },
                  required: ['requests'],
                },
              },
            },
          },
          '400': {
            description: 'Invalid mode',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '403': {
            description: 'Not admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/identify/providers': {
      get: {
        tags: ['identify'],
        summary: 'Provider status, credits, and enabled switch',
        description: 'Admin only. Reports key set or not, never the secret. Credits fetched in parallel.',
        security: [{ cookieAuth: [] }],
        responses: {
          '200': {
            description: 'Provider statuses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    providers: { type: 'array', items: { $ref: '#/components/schemas/IdentifyProviderStatus' } },
                  },
                  required: ['providers'],
                },
              },
            },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '403': {
            description: 'Not admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/identify/providers/{id}': {
      put: {
        tags: ['identify'],
        summary: 'Save a provider switch for Add Plant',
        description:
          'Admin only. Saved in identify_provider_settings. A disabled provider is skipped by POST /api/identify. response ready calls the real API; mock uses the scenario. The playground ignores both.',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', enum: ['plantid', 'plantnet', 'gemini'] } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  response: { type: 'string', enum: ['ready', 'mock'] },
                  scenario: { type: 'string', enum: ['match', 'notInCatalog', 'notPlant', 'error'] },
                  match: { type: 'object', additionalProperties: true },
                  suggestionId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated provider status',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { provider: { $ref: '#/components/schemas/IdentifyProviderStatus' } },
                  required: ['provider'],
                },
              },
            },
          },
          '400': {
            description: 'Unknown id or no settings field',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '401': {
            description: 'Not signed in',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '403': {
            description: 'Not admin',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          '503': {
            description: 'identify_provider_settings table not migrated',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
        },
      },
    },
    '/api/activities/{type}/{userId}': {
      get: {
        tags: ['activities'],
        summary: 'List one kind for one user',
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Basic activity rows',
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
    },
    '/api/activities/{type}': {
      get: {
        tags: ['activities'],
        summary: 'List one kind',
        description: 'Basic rows only. `scan`, `added`, `water`, `photo`, `propagate`, `grade`, `passport`, `listing`.',
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'userId', in: 'query', schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Basic activity rows',
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
    },
    '/api/activities/user/{userId}': {
      get: {
        tags: ['activities'],
        summary: 'List every kind for one user',
        parameters: [
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': {
            description: 'Basic activity rows',
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
    },
    '/api/activities/id/{id}': {
      get: {
        tags: ['activities'],
        summary: 'One activity with its linked identify request',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Activity and optional identify detail',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    activity: { $ref: '#/components/schemas/Activity' },
                    detail: { type: 'object', nullable: true },
                  },
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
    '/api/activities': {
      get: {
        tags: ['activities'],
        summary: 'List activities',
        description: 'Basic rows for every kind. Filter with plantId or userId. Extended identify detail is on GET /api/activities/id/{id}.',
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
        description:
          'Up to 3 photos. Send `identifyRequestIds[i]` (the `record.id` from `POST /api/identify`) for `photos[i]`. Each trusted request is linked to the plant and gets a photo check; the first matching photo credits its provider. Without any the plant is saved as manual.',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/Plant' },
                  {
                    type: 'object',
                    properties: {
                      identifyRequestIds: { type: 'array', items: { type: 'string', nullable: true }, maxItems: 3 },
                      identifyRequestId: { type: 'string', deprecated: true, description: 'Same as identifyRequestIds[0]' },
                    },
                  },
                ],
              },
            },
          },
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
