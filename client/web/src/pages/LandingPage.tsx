import {
  ArrowRight,
  ArrowUpRight,
  Eye,
  Lock,
  Power,
  QrCode,
  ScanFace,
  UploadCloud,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ChatPhone, DashMock, TableCard } from '../components/Mockups';
import { MatchBox, Photo } from '../components/Photo';
import { PHOTO } from '../lib/photos';
import { useAuth } from '../context/AuthContext';

const occasions: Array<{ photo: string; position: string; title: string; note: string }> = [
  { photo: PHOTO.couple2, position: '50% 40%', title: 'Weddings and receptions', note: 'Hundreds of guests, thousands of photos.' },
  { photo: PHOTO.festival, position: '45% 40%', title: 'Bratabandha, Pasni and pujas', note: 'Every relative finds their own pictures.' },
  { photo: PHOTO.birthday, position: '50% 45%', title: 'Sangeet, birthdays and parties', note: 'No more group chats full of files.' },
  { photo: PHOTO.tossing, position: '50% 30%', title: 'College fests and reunions', note: 'Everyone in the batch gets their own gallery.' },
  { photo: PHOTO.crowd, position: '55% 40%', title: 'Concerts and live shows', note: 'Find yourself in a crowd of thousands.' },
];

export function LandingPage() {
  const { user, loading } = useAuth();
  const workspacePath = user || loading ? '/dashboard' : '/sign-up';
  const primaryLabel = loading ? 'Open PhotoDey' : user ? 'Open dashboard' : 'Create your event';

  return (
    <main className="lp">
      <header className="lp-nav-wrap">
        <nav className="lp-nav lp-container" aria-label="Main navigation">
          <Brand />
          <div className="lp-nav-links">
            <a href="#occasions">Events</a>
            <a href="#how-it-works">How it works</a>
            <a href="#organizers">For organizers</a>
            <a href="#privacy">Privacy</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="lp-nav-actions">
            {!loading && !user && <Link className="lp-nav-signin" to="/sign-in">Sign in</Link>}
            <Link className="btn btn-primary btn-sm" to={workspacePath}>
              {loading ? 'Open PhotoDey' : user ? 'Dashboard' : 'Get started'}
            </Link>
          </div>
        </nav>
      </header>

      <section className="lp-hero lp-container">
        <div className="lp-hero-copy">
          <h1>Find yourself in every event photo.</h1>
          <p className="lp-lede">
            Upload your event once. Guests scan a QR code, send one selfie on Telegram,
            and get only the photos they are in.
          </p>
          <div className="lp-hero-actions">
            <Link className="btn btn-primary btn-lg" to={workspacePath}>
              {primaryLabel} <ArrowUpRight size={18} />
            </Link>
            <a className="btn btn-ghost btn-lg" href="#how-it-works">See how it works</a>
          </div>
          <ul className="lp-hero-facts">
            <li>Up to 5,000 photos per event</li>
            <li>Guests need only Telegram</li>
            <li>You control who can search</li>
          </ul>
        </div>

        <div className="lp-hero-stage" aria-label="A wedding photo with faces matched to a guest">
          <div className="lp-hero-frame">
            <Photo id={PHOTO.couple} width={1000} position="50% 22%" eager alt="A bride and groom at their wedding" />
            <MatchBox left={55} top={36.4} width={15} height={15} />
            <MatchBox left={39} top={40} width={15.5} height={15.6} label="You · 98%" hot />
          </div>
          <div className="lp-hero-phone">
            <ChatPhone />
          </div>
          <div className="lp-hero-chip">
            <span className="lp-chip-dot" />
            <div>
              <strong>24 photos found</strong>
              <small>from 1,240 in 3 seconds</small>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-section lp-container" id="occasions">
        <div className="lp-head">
          <h2>Made for the way we celebrate.</h2>
          <p>From a Kathmandu wedding to a Delhi college fest, the guest list is big and the camera roll is bigger.</p>
        </div>
        <div className="lp-occasions">
          {occasions.map((item) => (
            <article className="lp-occasion" key={item.title}>
              <div className="lp-occasion-art"><Photo id={item.photo} width={560} position={item.position} /></div>
              <h3>{item.title}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lp-section lp-container" id="how-it-works">
        <div className="lp-head">
          <h2>Three steps. No sorting, no sending.</h2>
          <p>You do the first two. Your guests do the third, on their own phones.</p>
        </div>
        <ol className="lp-steps">
          <li className="lp-step">
            <div className="lp-stage lp-stage-upload" aria-hidden="true">
              <div className="mini-upload">
                <div className="mini-upload-icon"><UploadCloud size={22} /></div>
                <b>Priya &amp; Arjun Wedding</b>
                <span>1,240 photos added</span>
                <i><u /></i>
                <small>Matching faces, 100% done</small>
              </div>
            </div>
            <span className="lp-step-no">1</span>
            <h3>Upload the event</h3>
            <p>Add every photo in batches. PhotoDey finds the faces in the background and shows live progress.</p>
          </li>
          <li className="lp-step">
            <div className="lp-stage lp-stage-card"><TableCard /></div>
            <span className="lp-step-no">2</span>
            <h3>Share one QR code</h3>
            <p>Download it, print it for the tables, or post the link in your family group.</p>
          </li>
          <li className="lp-step">
            <div className="lp-stage lp-stage-phone"><ChatPhone /></div>
            <span className="lp-step-no">3</span>
            <h3>Guests send a selfie</h3>
            <p>The Telegram bot matches the selfie to the event and replies with a personal gallery link.</p>
          </li>
        </ol>
      </section>

      <section className="lp-organizers" id="organizers">
        <div className="lp-container lp-organizers-grid">
          <div className="lp-organizers-copy">
            <h2>Your whole event, in one place.</h2>
            <p>See upload and matching progress as it happens, and share only when you are ready.</p>
            <ul>
              <li><span><UploadCloud size={18} /></span><div><b>Resume-safe uploads</b><small>A dropped connection never duplicates photos. Retry and carry on.</small></div></li>
              <li><span><Power size={18} /></span><div><b>One switch for guest access</b><small>Turn searching off at any time, even after the QR is printed.</small></div></li>
              <li><span><QrCode size={18} /></span><div><b>QR and link, ready to use</b><small>Download the QR or copy the event link as soon as processing finishes.</small></div></li>
            </ul>
            <Link className="btn btn-gold btn-lg" to={workspacePath}>{primaryLabel} <ArrowRight size={18} /></Link>
          </div>
          <div className="lp-organizers-visual"><DashMock /></div>
        </div>
      </section>

      <section className="lp-section lp-container" id="privacy">
        <div className="lp-head">
          <h2>Private by design.</h2>
          <p>Guests find their own photos. They never get a browsable album of everyone else.</p>
        </div>
        <div className="lp-privacy">
          <article>
            <span><Lock size={20} /></span>
            <h3>Limited to one event</h3>
            <p>A selfie is only compared with photos from the event the guest scanned. Nothing crosses between events.</p>
          </article>
          <article>
            <span><ScanFace size={20} /></span>
            <h3>Used to find photos, nothing else</h3>
            <p>The selfie is used to search that event, not to build a public profile of the guest.</p>
          </article>
          <article>
            <span><Eye size={20} /></span>
            <h3>You decide who can search</h3>
            <p>Switch off public access on any event and new searches stop immediately.</p>
          </article>
        </div>
      </section>

      <section className="lp-section lp-container lp-faq" id="faq">
        <div className="lp-head lp-head-narrow"><h2>Questions organizers ask first</h2></div>
        <div className="lp-faq-list">
          <details>
            <summary>Do guests need an account?</summary>
            <p>No. Guests scan the QR code, open the PhotoDey bot in Telegram, and send one selfie. They need Telegram on their phone, nothing else.</p>
          </details>
          <details>
            <summary>When can guests start searching?</summary>
            <p>Once your photos finish processing. The event page shows live progress, and the QR code becomes shareable when it is done.</p>
          </details>
          <details>
            <summary>Can I stop guests from searching?</summary>
            <p>Yes. Turn off public access on the event at any time and new searches stop, even for guests who already have the QR code.</p>
          </details>
          <details>
            <summary>How many photos can one event hold?</summary>
            <p>Up to 5,000 photographs per event, uploaded in batches.</p>
          </details>
          <details>
            <summary>What if a guest isn’t found?</summary>
            <p>The bot asks them to try again with a clear, front-facing selfie in good light. Photos that are still uploading can be searched later.</p>
          </details>
        </div>
      </section>

      <section className="lp-container lp-final">
        <div className="lp-final-card">
          <div>
            <h2>Give every guest their own gallery.</h2>
            <p>Create your first event in a few minutes.</p>
            <Link className="btn btn-gold btn-lg" to={workspacePath}>{primaryLabel} <ArrowUpRight size={18} /></Link>
          </div>
          <div className="lp-final-art"><TableCard event="Your event" url="https://photodey.com" /></div>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-grid">
          <div>
            <Brand light />
            <p>Find yourself in every event photo.</p>
          </div>
          <div>
            <b>Product</b>
            <a href="#how-it-works">How it works</a>
            <a href="#privacy">Privacy</a>
            <Link to={user || loading ? '/dashboard' : '/sign-in'}>{loading ? 'Open PhotoDey' : user ? 'Dashboard' : 'Organizer sign in'}</Link>
          </div>
          <div>
            <b>Help</b>
            <a href="#faq">FAQ</a>
            <a href="mailto:hello@photodey.com">hello@photodey.com</a>
          </div>
        </div>
        <div className="lp-container lp-footer-base">© {new Date().getFullYear()} PhotoDey</div>
      </footer>
    </main>
  );
}
