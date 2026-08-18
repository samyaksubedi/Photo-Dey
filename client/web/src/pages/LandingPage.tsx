import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Check,
  Images,
  LockKeyhole,
  QrCode,
  ScanFace,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

export function LandingPage() {
  return (
    <main className="landing-shell">
      <nav className="nav container" aria-label="Main navigation">
        <Brand />
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#for-organizers">For organizers</a>
          <a href="#privacy">Privacy</a>
        </div>
        <div className="nav-actions">
          <Link className="text-link" to="/sign-in">Sign in</Link>
          <Link className="button button-dark button-small" to="/sign-up">
            Create an event <ArrowUpRight size={15} />
          </Link>
        </div>
      </nav>

      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Private photo discovery for every event</p>
          <h1>Every moment<br />you were <em>in.</em></h1>
          <p className="hero-lede">
            PhotoDey finds the photographs that matter to each guest—without
            making anyone scroll through hundreds that don’t.
          </p>
          <div className="hero-actions">
            <Link className="button button-accent" to="/sign-up">
              Create your event <ArrowUpRight size={17} />
            </Link>
            <a className="button button-quiet" href="#how-it-works">See how it works</a>
          </div>
          <div className="hero-notes" aria-label="Product highlights">
            <span>No app for guests</span>
            <span>One selfie</span>
            <span>Private by event</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="A joyful event captured in photographs">
          <div className="hero-photo" />
          <div className="match-card">
            <div className="match-avatar" />
            <div>
              <strong>18 moments found</strong>
              <span>Your private event gallery</span>
            </div>
            <span className="match-check">✓</span>
          </div>
          <p className="photo-caption">A thousand photographs.<br />The right ones, instantly.</p>
        </div>
      </section>

      <section className="signal-bar" aria-label="PhotoDey process summary">
        <div className="container signal-inner">
          <span>Upload the event</span><i />
          <span>Share one QR</span><i />
          <span>Guests find themselves</span>
        </div>
      </section>

      <section className="section process-section container" id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="section-kicker">A simpler way to share</p>
            <h2>From camera roll to<br /><em>their</em> camera roll.</h2>
          </div>
          <p>
            One thoughtful workflow for organizers, photographers, and every
            guest who wants the moments they were part of.
          </p>
        </div>
        <div className="process-grid">
          <article className="process-card">
            <span className="process-number">01</span>
            <div className="process-icon"><Images size={22} /></div>
            <h3>Upload the event</h3>
            <p>Add the photographs once. PhotoDey quietly prepares each face for private discovery.</p>
          </article>
          <article className="process-card process-card-featured">
            <span className="process-number">02</span>
            <div className="process-icon"><QrCode size={22} /></div>
            <h3>Place one QR</h3>
            <p>Guests scan a beautiful event link and continue through the PhotoDey Telegram bot.</p>
          </article>
          <article className="process-card">
            <span className="process-number">03</span>
            <div className="process-icon"><ScanFace size={22} /></div>
            <h3>Send one selfie</h3>
            <p>A clear selfie becomes a private key to their matching photographs—not anyone else’s.</p>
          </article>
        </div>
      </section>

      <section className="editorial-section" id="for-organizers">
        <div className="container editorial-grid">
          <div className="editorial-photo editorial-photo-main">
            <div className="floating-label"><Camera size={14} /> Built for real events</div>
          </div>
          <div className="editorial-copy">
            <p className="section-kicker">For organizers</p>
            <h2>More time in the moment.<br />Less time sending files.</h2>
            <p>
              Give every guest a personal gallery without sorting folders,
              answering messages, or publishing the entire event publicly.
            </p>
            <ul className="check-list">
              <li><Check size={15} /> Live processing progress</li>
              <li><Check size={15} /> Public access you control</li>
              <li><Check size={15} /> One link for the whole event</li>
            </ul>
            <Link className="inline-action" to="/sign-up">Start with your first event <ArrowRight size={17} /></Link>
          </div>
          <div className="editorial-photo editorial-photo-side" />
        </div>
      </section>

      <section className="section privacy-section container" id="privacy">
        <div className="privacy-card">
          <div className="privacy-copy">
            <p className="section-kicker section-kicker-light">Privacy is product design</p>
            <h2>Personal discovery.<br />Not public exposure.</h2>
            <p>
              Searches stay scoped to one event. Organizers control whether an
              event can be discovered, and guests receive only their matched moments.
            </p>
          </div>
          <div className="privacy-points">
            <div><LockKeyhole size={20} /><span><strong>Event-scoped</strong>Face matching never crosses event boundaries.</span></div>
            <div><Sparkles size={20} /><span><strong>Purposeful</strong>Selfies are used to find photographs, not to build a public profile.</span></div>
            <div><ScanFace size={20} /><span><strong>Controlled</strong>Public access can be disabled by the organizer at any time.</span></div>
          </div>
        </div>
      </section>

      <section className="final-cta container">
        <p className="section-kicker">Your moments, our focus.</p>
        <h2>Make every guest part<br />of the gallery.</h2>
        <Link className="button button-accent" to="/sign-up">Create your event <ArrowUpRight size={17} /></Link>
      </section>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div><Brand light /><p>Private photo discovery for memorable events.</p></div>
          <div><span>Product</span><a href="#how-it-works">How it works</a><Link to="/sign-in">Organizer sign in</Link></div>
          <div><span>Guests</span><a href="#privacy">Privacy</a><a href="mailto:hello@photodey.com">Support</a></div>
          <p className="footer-note">© {new Date().getFullYear()} PhotoDey</p>
        </div>
      </footer>
    </main>
  );
}
