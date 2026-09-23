'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  submitted_at: string;
  volunteer_areas?: string;
  organization?: string;
  organization_details?: string;
};
type RegistrationKind = 'volunteer' | 'guest' | 'sponsor';
function RegistrationTable({
  kind,
  rows,
  total,
}: {
  kind: RegistrationKind;
  rows: Registration[];
  total: number;
}) {
  const submitted = (value: string) => (value ? new Date(value).toLocaleString() : '—');
  const label = kind === 'guest' ? 'guest registrations' : kind === 'volunteer' ? 'volunteers' : 'sponsors';
  return (
    <div className="table-wrap registration-table">
      <table>
        <thead>
          <tr>
            <th>First name</th>
            <th>Last name</th>
            {kind === 'sponsor' ? (
              <>
                <th>Phone</th>
                <th>Email</th>
                <th>Organization</th>
                <th>Organization details</th>
              </>
            ) : (
              <>
                <th>Email</th>
                <th>Phone</th>
              </>
            )}
            {kind === 'volunteer' && <th>Volunteer areas</th>}
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.first_name}</td>
              <td>{row.last_name}</td>
              {kind === 'sponsor' ? (
                <>
                  <td>{row.phone}</td>
                  <td>{row.email}</td>
                  <td>{row.organization || '—'}</td>
                  <td>{row.organization_details || '—'}</td>
                </>
              ) : (
                <>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                </>
              )}
              {kind === 'volunteer' && <td>{row.volunteer_areas || '—'}</td>}
              <td>{submitted(row.submitted_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <p className="empty">
          {total ? 'No matches for this search.' : `No ${label} yet.`}
        </p>
      )}
    </div>
  );
}
type DashboardData = {
  volunteers: Registration[];
  guest_registrations: Registration[];
  sponsors: Registration[];
};
export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [registrationKind, setRegistrationKind] = useState<RegistrationKind>('volunteer');
  const [registrationQuery, setRegistrationQuery] = useState('');
  const [error, setError] = useState('');
  async function load() {
    try {
      const r = await fetch('/api/admin');
      if (r.status === 401) {
        location.assign('/admin/login');
        return;
      }
      const body = (await r.json()) as { error?: string } & DashboardData;
      if (!r.ok) throw Error(body.error);
      setData(body);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load guest list.');
    }
  }
  useEffect(() => {
    load();
  }, []);
  const volunteers = data?.volunteers ?? [];
  const guestRegistrations = data?.guest_registrations ?? [];
  const sponsors = data?.sponsors ?? [];
  const registrationSource =
    registrationKind === 'volunteer'
      ? volunteers
      : registrationKind === 'sponsor'
        ? sponsors
        : guestRegistrations;
  const registrationRows = registrationSource.filter((row) =>
    [
      row.first_name,
      row.last_name,
      row.email,
      row.phone,
      row.volunteer_areas,
      row.organization,
      row.organization_details,
    ]
      .join(' ')
      .toLowerCase()
      .includes(registrationQuery.toLowerCase()),
  );
  function exportRegistrations() {
    const keys =
      registrationKind === 'volunteer'
        ? (['first_name', 'last_name', 'email', 'phone', 'volunteer_areas', 'submitted_at'] as const)
        : registrationKind === 'sponsor'
          ? ([
              'first_name',
              'last_name',
              'phone',
              'email',
              'organization',
              'organization_details',
              'submitted_at',
            ] as const)
          : (['first_name', 'last_name', 'email', 'phone', 'submitted_at'] as const);
    const safe = (v: unknown) => {
      let s = String(v ?? '');
      if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
      return '"' + s.replaceAll('"', '""') + '"';
    };
    const text = [keys.join(','), ...registrationRows.map((row) => keys.map((key) => safe(row[key])).join(','))].join(
      '\r\n',
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' }));
    a.download = `merveille-${registrationKind}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  return (
    <main className="admin">
      <a href="/">← Back to the Event Page</a>
      <div className="admin-top">
        <div>
          <span className="eyebrow">Tent of Hope · SEPTEMBER 18–19</span>
          <h1>Registrations</h1>
        </div>
        <Button onClick={exportRegistrations} disabled={!data}>
          Export CSV
        </Button>
      </div>
      {error && (
        <div className="error" role="alert">
          {error} <Button onClick={load}>Retry</Button>
        </div>
      )}
      {!data && !error && <p>Loading registrations…</p>}
      {data && (
        <>
          <div className="metrics registration-metrics">
            {(
              [
                ['volunteer', 'Volunteers', volunteers.length],
                ['guest', 'Guests', guestRegistrations.length],
                ['sponsor', 'Sponsors', sponsors.length],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                className={registrationKind === id ? 'metric selected' : 'metric'}
                aria-pressed={registrationKind === id}
                onClick={() => setRegistrationKind(id)}
              >
                <span>{label}</span>
                <strong>{count}</strong>
              </button>
            ))}
          </div>
          <div className="admin-controls">
            <Input
              aria-label={`Search ${registrationKind === 'guest' ? 'guests' : registrationKind === 'volunteer' ? 'volunteers' : 'sponsors'}`}
              placeholder="Search by name, email or phone"
              value={registrationQuery}
              onChange={(e) => setRegistrationQuery(e.target.value)}
            />
          </div>
          <h2 className="registration-title">
            {registrationKind === 'volunteer' ? 'Volunteers' : registrationKind === 'guest' ? 'Guests' : 'Sponsors'}
          </h2>
          <RegistrationTable kind={registrationKind} rows={registrationRows} total={registrationSource.length} />
        </>
      )}
    </main>
  );
}
