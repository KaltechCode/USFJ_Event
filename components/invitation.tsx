'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  LuCalendarDays as CalendarDays,
  LuMapPin as MapPin,
  LuClock as Clock,
  LuArrowUpRight as ArrowUpRight,
  LuMail as Mail,
} from 'react-icons/lu';
import { FlyingEnvelope } from '@/components/flying-envelope';

export function CelebrantPortrait() {
  return (
    <img
      src="/USFJ.png"
      alt="USFJ event images"
      width="1149"
      height="1369"
      fetchPriority="high"
    />
  );
}
export function EnvelopeAnimation({ done }: { done: () => void }) {
  const [phase, setPhase] = useState('closed');
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done();
      return;
    }
    const timers = [
      setTimeout(() => setPhase('opening'), 2000),
      setTimeout(() => setPhase('message'), 5600),
      setTimeout(() => setPhase('leaving'), 7600),
      setTimeout(done, 9600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [done]);
  return (
    <div className={'intro ' + phase} role="dialog" aria-label="Your invitation">
      <div className="intro-label">A SPECIAL INVITATION FOR YOU</div>
      <div className="envelope">
        <div className="envelope-back" />
        <div className="portrait-card">
          <CelebrantPortrait />
        </div>
        <div className="envelope-front" />
        <div className="flap" />
        <span className="seal">M</span>
      </div>
      <div className="intro-message">
        <h1>
          Prophetess Merveille <br /> invites You <br /> To,
        </h1>
        <p>My Amazing Birthday Celebrations By God's Grace Along with my 10 YEARS in MINISTRY.</p>
      </div>
      <button className="skip" onClick={done}>
        Skip to invitation <ArrowUpRight size={14} />
      </button>
    </div>
  );
}
export function InvitationDetails() {
  return (
    <section className="details" id="details">
      <div className="section-intro">
        <span className="eyebrow">UNITED SERVANTS FOR JESUS PRESENTS</span>
        <h2>
        A community united by hope
          <br />
          {/* <em>A heart full of gratitude.</em> */}
        </h2>
        <p>
        Tent of Hope is a ministry outreach event in Bonnieville, Kentucky, sharing the hope we have in Jesus through prayer, Bible distribution, gospel tracts, and encouragement. <br /> <br />Our desire is to meet people where they are, bless our community, and point hearts to the life-changing hope found in Christ.
        </p>
      </div>
      <div className="detail-grid">
        <article>
          <CalendarDays />
          <span>THE DATE</span>
          <h3>October 16–17</h3>
          <p>Friday & Saturday, 2026</p>
        </article>
        <article>
          <Clock />
          <span>THE TIME</span>
          <h3 className="event-times">
            Oct. 16 · 7:00 PM
            <br />
            Oct. 17 · 11:30 AM–4:30 PM
          </h3>
          <p>All times Central Time</p>
        </article>
        <article>
          <MapPin />
          <span>THE PLACE</span>
          <h3>Hill of Terror</h3>
          <p>Full address to be announced</p>
        </article>
      </div>
      {/* <div className="dress">
        <span>DRESS CODE</span>
        <p>
          White & blue <i>or</i> purple
        </p>
        <div className="swatches">
          <b />
          <b />
          <b />
        </div>
        <small>A touch of elegance, a spirit of celebration.</small>
      </div> */}
    </section>
  );
}
function calendar() {
  const events = [
    { day: 16, start: '20261017T000000Z', end: null, time: 'October 16 at 7 PM Central Time.' },
    {
      day: 17,
      start: '20261017T163000Z',
      end: '20261017T213000Z',
      time: 'October 17 from 11:30 AM to 4:30 PM Central Time.',
    },
  ];
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Merveille Celebration//EN',
    ...events.flatMap((e) => [
      'BEGIN:VEVENT',
      `UID:merveille-202610${e.day}@celebration`,
      `DTSTAMP:20260922T000000Z`,
      'SEQUENCE:2',
      `DTSTART:${e.start}`,
      ...(e.end ? [`DTEND:${e.end}`] : []),
      'SUMMARY:United Servants for Jesus',
      'LOCATION:Hampton Inn & Suites - full address to be announced',
      `DESCRIPTION:Birthday and 10 years in ministry. ${e.time}`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
  ].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }));
  a.download = 'merveille-celebration.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
type FormKind = 'volunteer' | 'guest' | 'sponsor';

const forms: {
  id: FormKind;
  label: string;
  title: string;
  submit: string;
  busy: string;
  thanks: string;
}[] = [
  {
    id: 'volunteer',
    label: 'Volunteer',
    title: 'Volunteer form',
    submit: 'Submit volunteer form',
    busy: 'Saving your volunteer form…',
    thanks: 'Your volunteer interest is saved. Thank you for offering your time.',
  },
  {
    id: 'guest',
    label: 'Guest / Register',
    title: 'Guest registration',
    submit: 'Register',
    busy: 'Saving your registration…',
    thanks: 'You’re registered. We can’t wait to celebrate with you.',
  },
  {
    id: 'sponsor',
    label: 'Sponsor',
    title: 'Sponsor form',
    submit: 'Submit sponsor form',
    busy: 'Saving your sponsor form…',
    thanks: 'Your sponsorship details are saved. Thank you for your support.',
  },
];

function NameFields() {
  return (
    <div className="form-row">
      <label>
        First name *
        <Input name="first_name" placeholder="First name" required maxLength={80} autoComplete="given-name" />
      </label>
      <label>
        Last name *
        <Input name="last_name" placeholder="Last name" required maxLength={80} autoComplete="family-name" />
      </label>
    </div>
  );
}

function EmailField() {
  return (
    <label>
      Email *
      <Input
        name="email"
        type="email"
        placeholder="you@example.com"
        required
        maxLength={254}
        autoComplete="email"
      />
    </label>
  );
}

function PhoneField() {
  return (
    <label>
      Phone *
      <Input
        name="phone"
        type="tel"
        placeholder="Your phone number"
        required
        maxLength={40}
        autoComplete="tel"
      />
    </label>
  );
}

export function RSVPForm() {
  const [kind, setKind] = useState<FormKind>('guest');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<Partial<Record<FormKind, string>>>({});
  const requestIds = useRef<Partial<Record<FormKind, string>>>({});
  const lock = useRef(false);
  const active = forms.find((form) => form.id === kind) || forms[1];
  const savedName = confirmed[kind];

  function choose(next: FormKind) {
    setKind(next);
    setError('');
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    requestIds.current[kind] ||= crypto.randomUUID();
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, kind, id: requestIds.current[kind] }),
      });
      const result = (await res.json()) as { error?: string };
      if (!res.ok) throw Error(result.error || 'Unable to save your form. Please try again.');
      setConfirmed((current) => ({
        ...current,
        [kind]: `${String(data.first_name)} ${String(data.last_name)}`.trim(),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }

  return (
    <section className="rsvp-section" id="rsvp">
      <div className="rsvp-heading">
        <span className="eyebrow">A SEAT SAVED FOR YOU</span>
        <h2>How will you join us?</h2>
        <p>Register as a guest, offer to volunteer, or share a sponsorship. Use the buttons to switch forms.</p>
        <div className="deadline">
          <Mail size={17} /> Kindly respond by October 15, 2026
        </div>
      </div>
      <div className="rsvp-card">
        <div className="form-switch" role="tablist" aria-label="Registration forms">
          {forms.map((form) => (
            <button
              key={form.id}
              type="button"
              role="tab"
              aria-selected={kind === form.id}
              className={kind === form.id ? 'selected' : ''}
              onClick={() => choose(form.id)}
            >
              {form.label}
            </button>
          ))}
        </div>
        {savedName ? (
          <div className="confirmation" role="status">
            <FlyingEnvelope className="mb-2 sm:mb-4" />
            <span className="eyebrow">THANK YOU, {savedName}</span>
            <h2>{active.title} received</h2>
            <p>{active.thanks}</p>
            {kind === 'guest' && (
              <>
                <div className="confirmation-details">
                  October 16, 2026 · 7:00 PM CT
                  <br />
                  October 17, 2026 · 11:30 AM–4:30 PM CT
                  <br />
                  Hampton Inn & Suites
                </div>
                <Button className="primary-button" onClick={calendar}>
                  <CalendarDays /> Add to Calendar
                </Button>
              </>
            )}
          </div>
        ) : (
          <form key={kind} onSubmit={submit}>
            <div className="form-head">
              <h3>{active.title}</h3>
              <span>Fields marked * are required</span>
            </div>
            <NameFields />
            {kind === 'sponsor' ? (
              <>
                <PhoneField />
                <EmailField />
                <label>
                  Organization <span>(optional)</span>
                  <Input name="organization" placeholder="Organization name" maxLength={160} autoComplete="organization" />
                </label>
                <label>
                  Organization details <span>(optional)</span>
                  <Textarea
                    name="organization_details"
                    placeholder="Tell us about your organization"
                    maxLength={2000}
                  />
                </label>
              </>
            ) : (
              <>
                <EmailField />
                <PhoneField />
              </>
            )}
            {kind === 'volunteer' && (
              <label>
                What areas are you interested in volunteering? *
                <Textarea
                  name="volunteer_areas"
                  placeholder="Greeting, setup, hospitality, prayer…"
                  required
                  maxLength={2000}
                />
              </label>
            )}
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <Button className="primary-button submit" disabled={busy}>
              {busy ? active.busy : active.submit}
              {!busy && <ArrowUpRight size={18} />}
            </Button>
            <p className="privacy">Your details are shared only with the event's organizer.</p>
          </form>
        )}
      </div>
    </section>
  );
}
const SHOW_INTRO = false;

export default function Home() {
  const [intro, setIntro] = useState(SHOW_INTRO);
  const finish = useRef(() => setIntro(false)).current;
  return (
    <>
      <link rel="preload" as="image" href="/USFJ.png" />
      {/* {intro && <EnvelopeAnimation done={finish} />} */}
      <div className={'site revealed'} inert={intro ? true : undefined}>
        <header>
          <a className="monogram" href="#">
            <img className="site-logo" src="/USFJ-DARK-Logo.png" alt="USFJ Logo" width="312" height="80" />
          </a>
          <nav>
            <a href="#details">The Event</a>
            <a href="https://buy.stripe.com/fZebMI29Ze2s1TG146" target="_blank" className="nav-donate">
              Donate <ArrowUpRight size={15} />
            </a>
          </nav>
        </header>
        <main>
          <section className="hero">
            <div className="hero-copy">
              {/* <span className="eyebrow">A JOURNEY FROM FEAR TO HOPE</span> */}
              <p className="celebrating">Share the hope we have in Jesus.</p>
              <h1>
                <span>Tent of</span>
                <em>Hope</em>
              </h1>
              <div className="gold-rule" />
              <p className="hero-description">
                For everyone who call on the 
                name <br />of the Lord.
                will be saved.
                <br />
               Romans 10:13
              </p>
              <div className="hero-date">
                OCTOBER 16–17, 2026
                <br />
                <span className="hero-times">
                  FRIDAY · 7 PM CT
                  <br />
                  SATURDAY · 11:30 AM–4:30 PM CT
                </span>
              </div>
              <a className="hero-cta" href="#rsvp">
                You're invited <ArrowUpRight size={18} />
              </a>
             
            </div>
            <div className="hero-art">
              <div className="arch-photo">
                <CelebrantPortrait />
              </div>
              {/* <div className="anniversary">
                <span>10</span>
                <div>
                  YEARS
                  <br />
                  IN MINISTRY
                </div>
              </div> */}
              <div className="photo-caption">A Journey From Fear To Hope.</div>
            </div>
          </section>
          <div className="ribbon">
            <span>Prayer</span>
            <b>✦</b>
            <span>Free Bibles</span>
            <b>✦</b>
            <span>Gospel Tracts</span>
            <b>✦</b>
            <span>Encouragement</span>
          </div>
          <InvitationDetails />
          <RSVPForm />
          <section className="closing">
            <div className="w-full flex justify-center items-center">
            <img className="closing-logo" src="/USFJ-DARK-Logo.png" alt="USFJ Logo" width="200" height="80" />
            </div>
            <h2>Same hope. A brighter tomorrow.</h2>
            <span>Come as you are. There’s a place for you here.</span>
          </section>
        </main>
        <footer>
          <span>October 16–17, 2026</span>
          <a href="/admin">Organizer access</a>
        </footer>
      </div>
    </>
  );
}
