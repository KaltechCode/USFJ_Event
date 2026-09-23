import 'server-only';
import nodemailer from 'nodemailer';

const ADMIN_INBOX = process.env.NOTIFY_EMAIL?.trim() || 'test@kaltechconsultancy.tech';
const PURPLE = '#142560';
const GOLD = '#db9e04';
const CREAM = '#ffffff';
const LAVENDER = '#f4f6fb';
const HEADING = '#142560';
const MUTED = '#667085';

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

function iconCircle(kind: 'check' | 'heart' | 'notice'): string {
  const mark = kind === 'heart' ? '♥' : kind === 'notice' ? '✦' : '✓';
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
    <tr>
      <td width="60" height="60" align="center" valign="middle" style="width:60px;height:60px;border:1px solid ${GOLD};border-radius:50%;color:${GOLD};font-size:22px;line-height:60px;font-family:Kodchasan,Nunito,Arial,sans-serif;">${mark}</td>
    </tr>
  </table>`;
}

function card(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:${LAVENDER};font-family:Nunito,Arial,Helvetica,sans-serif;color:${HEADING};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${LAVENDER};padding:36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${CREAM};padding:48px 40px 52px;">
          <tr><td align="center" style="text-align:center;">${inner}</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  if (!href) return '';
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${PURPLE};color:#ffffff;text-decoration:none;font-size:15px;padding:16px 28px;margin-top:8px;">${escapeHtml(label)}</a>`;
}

function detailLine(label: string, value: string): string {
  const display = value.trim() || '—';
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid #e4dbce;text-align:left;font-size:13px;color:${MUTED};width:42%;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #e4dbce;text-align:left;font-size:14px;color:${HEADING};">${escapeHtml(display)}</td>
  </tr>`;
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
    return card(`
      ${iconCircle(entry.kind === 'guest' ? 'check' : 'heart')}
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.5px;font-weight:600;color:${GOLD};text-transform:uppercase;">Thank you, ${escapeHtml(name)}</p>
      <h1 style="margin:16px 0 18px;font-family:Kodchasan,Nunito,Arial,sans-serif;font-weight:400;font-size:36px;line-height:1.2;color:${HEADING};">${escapeHtml(label)} form received</h1>
      <p style="margin:0;font-size:16px;line-height:1.7;color:${MUTED};">${thanks}</p>
    `);
  }
  return card(`
    ${iconCircle('notice')}
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:2.5px;font-weight:600;color:${GOLD};text-transform:uppercase;">New ${escapeHtml(label.toLowerCase())} · United Servants for Jesus</p>
    <h1 style="margin:16px 0 18px;font-family:Kodchasan,Nunito,Arial,sans-serif;font-weight:400;font-size:32px;line-height:1.2;color:${HEADING};">${escapeHtml(name)}</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="text-align:left;margin:0 auto 28px;">
      ${detailLine('Form', label)}
      ${detailLine('First name', entry.first_name)}
      ${detailLine('Last name', entry.last_name)}
      ${detailLine('Email', entry.email)}
      ${detailLine('Phone', entry.phone)}
      ${entry.kind === 'volunteer' ? detailLine('Volunteer areas', entry.volunteer_areas || '') : ''}
      ${entry.kind === 'sponsor' ? detailLine('Organization', entry.organization || '') : ''}
      ${entry.kind === 'sponsor' ? detailLine('Organization details', entry.organization_details || '') : ''}
    </table>
    ${button(`${origin()}/admin`, 'Open organizer dashboard')}
  `);
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
