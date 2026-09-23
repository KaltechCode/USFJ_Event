import { isAdmin } from '@/lib/auth';
import { BackendError, readAll } from '@/lib/supabase';
import { privateHeaders } from '@/lib/security';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
async function readRegistrations<T>(
  table: 'volunteers' | 'guest_registrations' | 'sponsors',
  columns: string,
): Promise<T[]> {
  try {
    return await readAll<T>(table, columns, 'submitted_at.desc');
  } catch (e) {
    if (e instanceof BackendError && (e.code === 'PGRST205' || e.code === '42P01')) return [];
    throw e;
  }
}

export async function GET() {
  if (!(await isAdmin()))
    return Response.json(
      { error: 'Your organizer session has expired. Please sign in again.' },
      { status: 401, headers: privateHeaders },
    );
  try {
    const [volunteers, guest_registrations, sponsors] = await Promise.all([
      readRegistrations(
        'volunteers',
        'id,first_name,last_name,email,phone,volunteer_areas,submitted_at',
      ),
      readRegistrations('guest_registrations', 'id,first_name,last_name,email,phone,submitted_at'),
      readRegistrations(
        'sponsors',
        'id,first_name,last_name,phone,email,organization,organization_details,submitted_at',
      ),
    ]);
    return Response.json(
      { volunteers, guest_registrations, sponsors },
      { headers: privateHeaders },
    );
  } catch {
    return Response.json(
      { error: 'Guest list unavailable. Please try again.' },
      { status: 503, headers: privateHeaders },
    );
  }
}
