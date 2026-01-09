
import { z } from 'zod';
import { insertMinistrySchema, insertLeaderSchema, ministries, leaders, prayer_requests, envelope_loads, new_people } from './schema';

export const api = {
  ministries: {
    list: {
      method: 'GET' as const,
      path: '/api/ministries',
      responses: {
        200: z.array(z.custom<typeof ministries.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/ministries',
      input: insertMinistrySchema,
      responses: {
        201: z.custom<typeof ministries.$inferSelect>(),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/ministries/:id',
      responses: {
        200: z.custom<typeof ministries.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  leaders: {
    list: {
      method: 'GET' as const,
      path: '/api/leaders',
      input: z.object({ ministry_id: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof leaders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leaders',
      input: insertLeaderSchema,
      responses: {
        201: z.custom<typeof leaders.$inferSelect>(),
      },
    },
  },
  requests: {
    list: {
      method: 'GET' as const,
      path: '/api/requests',
      responses: {
        200: z.array(z.custom<typeof prayer_requests.$inferSelect>()),
      },
    },
  },
  envelopes: {
    list: {
      method: 'GET' as const,
      path: '/api/envelopes',
      responses: {
        200: z.array(z.custom<typeof envelope_loads.$inferSelect>()),
      },
    },
  },
  institute: {
    enrollments: {
      method: 'GET' as const,
      path: '/api/institute/enrollments',
      responses: {
        200: z.array(z.custom<typeof institute_enrollments.$inferSelect>()),
      },
    },
    payments: {
      method: 'GET' as const,
      path: '/api/institute/payments',
      responses: {
        200: z.array(z.custom<typeof institute_payments.$inferSelect>()),
      },
    },
  },
  newPeople: {
    list: {
      method: 'GET' as const,
      path: '/api/new-people',
      responses: {
        200: z.array(z.custom<typeof new_people.$inferSelect>()),
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
