import { createHash } from 'node:crypto';
import { z } from 'zod';
import { BackendError, supabaseRequest } from '@/lib/supabase';
import { allowRequest, limitedJson, sameOrigin, privateHeaders } from '@/lib/security';
import { sendRegistrationNotifications } from '@/lib/email';

export const runtime = 'nodejs';

const name = z.string().trim().min(1).max(80);
const email = z.string().trim().email().max(254);
const phone = z.string().trim().min(1).max(40);

const schema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('volunteer'),
    id: z.string().uuid(),
    first_name: name,
    last_name: name,
    email,
    phone,
    volunteer_areas: z.string().trim().min(1).max(2000),
  }),
  z.object({
    kind: z.literal('guest'),
    id: z.string().uuid(),
    first_name: name,
    last_name: name,
    email,
    phone,
  }),
  z.object({
    kind: z.literal('sponsor'),
    id: z.string().uuid(),
    first_name: name,
    last_name: name,
    phone,
    email,
    organization: z.string().trim().max(160).default(''),
    organization_details: z.string().trim().max(2000).default(''),
  }),
]);

const tables = {
  volunteer: 'volunteers',
  guest: 'guest_registrations',
  sponsor: 'sponsors',
} as const;

function reply(body: object, status = 200) {
  return Response.json(body, { status, headers: privateHeaders });
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) return reply({ error: 'Request not allowed.' }, 403);
    let raw: unknown;
    try {
      raw = await limitedJson(request);
    } catch {
      return reply({ error: 'Invalid or oversized response.' }, 400);
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success)
      return reply({ error: 'Please check the required fields and try again.' }, 400);
    if (!(await allowRequest(request, 'register')))
      return reply({ error: 'Too many requests. Please try again in 15 minutes.' }, 429);

    const entry = parsed.data;
    const table = tables[entry.kind];
    const { kind, id, ...fields } = entry;
    const row = {
      ...fields,
      id,
      email: entry.email.toLowerCase(),
      dedupe_key: createHash('sha256').update(entry.email.toLowerCase()).digest('hex'),
    };
    const payloadHash = createHash('sha256').update(JSON.stringify(row)).digest('hex');
    const existing = await supabaseRequest<{ request_hash: string }[]>(
      `/rest/v1/${table}?id=eq.${id}&select=request_hash`,
    );
    if (existing.length)
      return existing[0].request_hash === payloadHash
        ? reply({ ok: true })
        : reply(
            {
              error: 'This submission was already used. Refresh the page to submit again.',
            },
            409,
          );
    try {
      await supabaseRequest(`/rest/v1/${table}`, {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ ...row, request_hash: payloadHash }),
      });
    } catch (e) {
      if (e instanceof BackendError && e.code === '23505') {
        const raced = await supabaseRequest<{ request_hash: string }[]>(
          `/rest/v1/${table}?id=eq.${id}&select=request_hash`,
        );
        if (raced[0]?.request_hash === payloadHash) return reply({ ok: true });
        return reply(
          {
            error:
              'A registration has already been received for this email. Please contact the organizer to make a change.',
          },
          409,
        );
      }
      throw e;
    }
    try {
      await sendRegistrationNotifications({
        kind,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        volunteer_areas: 'volunteer_areas' in row ? row.volunteer_areas : undefined,
        organization: 'organization' in row ? row.organization : undefined,
        organization_details: 'organization_details' in row ? row.organization_details : undefined,
      });
    } catch {
      console.error('Registration email failed');
    }
    return reply({ ok: true }, 201);
  } catch (e) {
    console.error(
      'Registration save failed',
      e instanceof BackendError ? e.code : 'service_unavailable',
    );
    return reply(
      {
        error: 'We could not save your registration. Your answers are still here; please try again shortly.',
      },
      503,
    );
  }
}
