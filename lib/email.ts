import 'server-only';
import nodemailer from 'nodemailer';

const ADMIN_INBOX = process.env.NOTIFY_EMAIL?.trim() || 'notifications@usfjesus.org';
const NAVY = '#142560';
const GOLD = '#db9e04';
const WHITE = '#ffffff';
const LAVENDER = '#f4f6fb';
const BORDER = '#dbe3f4';

function mailConfigured(): boolean {
  return Boolean(process.env.MAIL_HOST && process.env.MAIL_USER && process.env.MAIL_PASS);
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function origin(): string {
  return (process.env.APP_ORIGIN || '').replace(/\/$/, '');
}

function celebrationIcs(): string {
  const events = [
    {
      day: 16,
      start: '20261017T000000Z',
      end: null as string | null,
      time: 'October 16 at 7 PM Central Time.',
    },
    {
      day: 17,
      start: '20261017T163000Z',
      end: '20261017T213000Z',
      time: 'October 17 from 11:30 AM to 4:30 PM Central Time.',
    },
  ];
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tent of Hope//EN',
    ...events.flatMap((e) => [
      'BEGIN:VEVENT',
      `UID:USFJ-Tent of Hope-202610${e.day}@celebration`,
      'DTSTAMP:20260922T000000Z',
      'SEQUENCE:2',
      `DTSTART:${e.start}`,
      ...(e.end ? [`DTEND:${e.end}`] : []),
      'SUMMARY:United Servants for Jesus',
      'LOCATION:Hill of Terror- full address to be announced',
      `DESCRIPTION:United Servants for Jesus Tent of Hope Event. ${e.time}`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ].join('\r\n');
}

function brandedEmail({
  title,
  intro,
  content = '',
  action,
  footer = 'United Servants for Jesus | Serving our community in faith',
}: {
  title: string;
  intro: string;
  content?: string;
  action?: { url: string; label: string };
  footer?: string;
}): string {
  const site = origin();
  const logo = site
    ? `<img src="${escapeHtml(`${site}/usfj_white_logo.png`)}" alt="United Servants for Jesus" height="42" style="height:42px;display:inline-block;border:0;" />`
    : 'United Servants for Jesus';
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:${LAVENDER};">
  <div style="margin:0;background:${LAVENDER};padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:${NAVY};line-height:1.6;">
    <div style="max-width:600px;margin:0 auto;background:${WHITE};border:1px solid ${BORDER};">
      <div style="padding:28px 32px;background:${NAVY};text-align:center;color:${WHITE};">
        ${logo}
        <h1 style="margin:20px 0 0;color:${WHITE};font-size:20px;font-weight:normal;line-height:1.3;">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:32px;">
        <p style="margin:0 0 18px;font-size:16px;">${escapeHtml(intro)}</p>
        ${content}
        ${
          action?.url
            ? `<p style="margin:32px 0 0;text-align:center;"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:13px 22px;background:${NAVY};color:${WHITE};text-decoration:none;font-weight:bold;border-radius:4px;">${escapeHtml(action.label)}</a></p>`
            : ''
        }
      </div>
      <div style="padding:18px 32px;background:${NAVY};color:${WHITE};font-size:13px;font-weight:bold;text-align:center;">${escapeHtml(footer)}</div>
    </div>
  </div>
</body>
</html>`;
}

function detailBox(rows: [label: string, value: string][]): string {
  const lines = rows.map(([label, value], i) => {
    const display = escapeHtml(value.trim() || '—').replace(/\n/g, '<br />');
    const margin = i === rows.length - 1 ? '0' : '0 0 10px';
    return `<p style="margin:${margin};"><strong>${escapeHtml(label)}:</strong> ${display}</p>`;
  });
  return `<div style="padding:20px;background:${LAVENDER};border-left:4px solid ${GOLD};">${lines.join('')}</div>`;
}

async function sendMail(options: {
  to: { name?: string; address: string };
  subject: string;
  html: string;
  text: string;
  ics?: boolean;
}): Promise<void> {
  if (!mailConfigured()) return;
  const port = Number(process.env.MAIL_PORT || 465);
  const fromName = process.env.MAIL_FROM_NAME?.trim() || 'United Servants for Jesus';
  const fromAddress = process.env.MAIL_FROM?.trim() || process.env.MAIL_USER || '';
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port,
    secure: port === 465,
    connectionTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  await transporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to: options.to.name ? `${options.to.name} <${options.to.address}>` : options.to.address,
    subject: options.subject,
    html: options.html,
    text: options.text,
    attachments: options.ics
      ? [
          {
            filename: 'USFJ-Tent-of-Hope.ics',
            content: celebrationIcs(),
            contentType: 'text/calendar; charset=utf-8',
          },
        ]
      : undefined,
  });
}

export type RegistrationNotice = {
  kind: 'volunteer' | 'guest' | 'sponsor';
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  volunteer_areas?: string;
  organization?: string;
  organization_details?: string;
};

const registrationLabel = {
  volunteer: 'Volunteer',
  guest: 'Guest',
  sponsor: 'Sponsor',
} as const;

function registrationHtml(entry: RegistrationNotice, audience: 'guest' | 'admin'): string {
  const name = `${entry.first_name} ${entry.last_name}`;
  const label = registrationLabel[entry.kind];
  if (audience === 'guest') {
    const thanks =
      entry.kind === 'volunteer'
        ? 'Your volunteer interest is saved. Thank you for offering your time.'
        : entry.kind === 'sponsor'
          ? 'Your sponsorship details are saved. Thank you for your support.'
          : 'You’re registered. We can’t wait to celebrate with you.';
    return brandedEmail({
      title: `${label} form received`,
      intro: `Thank you, ${name}`,
      content: `<p style="margin:0;font-size:16px;">${thanks}</p>`,
    });
  }
  const site = origin();
  return brandedEmail({
    title: `New ${label.toLowerCase()} · United Servants for Jesus`,
    intro: name,
    content: detailBox([
      ['Form', label],
      ['First name', entry.first_name],
      ['Last name', entry.last_name],
      ['Email', entry.email],
      ['Phone', entry.phone],
      ...(entry.kind === 'volunteer'
        ? ([['Volunteer areas', entry.volunteer_areas || '']] as [string, string][])
        : []),
      ...(entry.kind === 'sponsor'
        ? ([
            ['Organization', entry.organization || ''],
            ['Organization details', entry.organization_details || ''],
          ] as [string, string][])
        : []),
    ]),
    action: site ? { url: `${site}/admin`, label: 'Open organizer dashboard' } : undefined,
  });
}

function registrationText(entry: RegistrationNotice, audience: 'guest' | 'admin'): string {
  const name = `${entry.first_name} ${entry.last_name}`;
  const label = registrationLabel[entry.kind];
  if (audience === 'guest') return `Thank you, ${name}. Your ${label.toLowerCase()} form was received.`;
  return [
    `New ${label.toLowerCase()}: ${name}`,
    `Email: ${entry.email}`,
    `Phone: ${entry.phone}`,
    ...(entry.kind === 'volunteer' ? [`Volunteer areas: ${entry.volunteer_areas || '—'}`] : []),
    ...(entry.kind === 'sponsor'
      ? [
          `Organization: ${entry.organization || '—'}`,
          `Organization details: ${entry.organization_details || '—'}`,
        ]
      : []),
  ].join('\n');
}

export async function sendRegistrationNotifications(entry: RegistrationNotice): Promise<void> {
  const name = `${entry.first_name} ${entry.last_name}`;
  const label = registrationLabel[entry.kind];
  const tasks: Promise<void>[] = [
    sendMail({
      to: { name: 'Celebration organizer', address: ADMIN_INBOX },
      subject: `New ${label.toLowerCase()}: ${name}`,
      html: registrationHtml(entry, 'admin'),
      text: registrationText(entry, 'admin'),
    }),
    sendMail({
      to: { name, address: entry.email },
      subject: `Your ${label.toLowerCase()} form was received — United Servants for Jesus`,
      html: registrationHtml(entry, 'guest'),
      text: registrationText(entry, 'guest'),
      ics: entry.kind === 'guest',
    }),
  ];
  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === 'rejected') console.error('Registration email failed');
  }
}
