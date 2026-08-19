import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, Mail, Send } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { useAuth } from '../context/AuthContext';
import { ApiClientError, apiRequest } from '../lib/api';

function AuthShell({ children, asideTitle, asideCopy }: { children: ReactNode; asideTitle: string; asideCopy: string }) {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <Brand />
        {children}
        <Link className="back-home" to="/"><ArrowLeft size={15} /> Back to PhotoDey</Link>
      </section>
      <aside className="auth-aside">
        <div className="auth-aside-photo" />
        <div className="auth-quote">
          <span>For moments worth finding</span>
          <h2>{asideTitle}</h2>
          <p>{asideCopy}</p>
        </div>
      </aside>
    </main>
  );
}

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      const destination = (location.state as { from?: string } | null)?.from || '/dashboard';
      navigate(destination, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell asideTitle="The whole event, organized around people." asideCopy="Upload once, track every photograph, and give guests a calmer way to find their moments.">
      <div className="auth-form-wrap">
        <p className="section-kicker">Organizer workspace</p>
        <h1>Welcome back.</h1>
        <p className="auth-intro">Sign in to manage your events and guest access.</p>
        <form className="form-stack" onSubmit={submit}>
          <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark button-wide" disabled={submitting}>
            {submitting ? <LoaderCircle className="spin" size={17} /> : <>Sign in <ArrowRight size={17} /></>}
          </button>
        </form>
        <p className="auth-switch">New to PhotoDey? <Link to="/sign-up">Create an account</Link></p>
        <p className="auth-switch auth-switch-secondary">Still waiting for verification? <Link to="/resend-verification">Resend the email</Link></p>
      </div>
    </AuthShell>
  );
}

export function SignUpPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signUp(name, email, password);
      setComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create your account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell asideTitle="A beautiful handoff after a beautiful event." asideCopy="PhotoDey turns one event link into a personal delivery experience for every guest.">
      <div className="auth-form-wrap">
        {complete ? (
          <div className="auth-success"><span><Mail size={24} /></span><p className="section-kicker">One final step</p><h1>Check your inbox.</h1><p>We sent a verification link to <strong>{email}</strong>. Verify your email, then return to sign in.</p><div className="auth-success-actions"><Link className="button button-dark" to="/sign-in">Go to sign in <ArrowRight size={16} /></Link><Link className="button button-quiet" to={`/resend-verification?email=${encodeURIComponent(email)}`}>Resend email</Link></div></div>
        ) : (
          <>
            <p className="section-kicker">Create your workspace</p>
            <h1>Start sharing better.</h1>
            <p className="auth-intro">Your first event is only a few minutes away.</p>
            <form className="form-stack" onSubmit={submit}>
              <label>Your name<input required minLength={3} value={name} onChange={(e) => setName(e.target.value)} placeholder="Samyak Subedi" /></label>
              <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
              <label>Password<input required minLength={6} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
              {error && <p className="form-error">{error}</p>}
              <button className="button button-dark button-wide" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={17} /> : <>Create account <ArrowRight size={17} /></>}</button>
            </form>
            <p className="auth-switch">Already have an account? <Link to="/sign-in">Sign in</Link></p>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export function ResendVerificationPage() {
  const location = useLocation();
  const [email, setEmail] = useState(() => new URLSearchParams(location.search).get('email') ?? '');
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setState('loading');
    setMessage('');
    try {
      const response = await apiRequest<null>('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
      setState('success');
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Could not resend verification email');
      setState('idle');
    }
  };

  return (
    <AuthShell asideTitle="A fresh invitation to your workspace." asideCopy="Verification links are intentionally short-lived. Request another without creating a second account.">
      <div className="auth-form-wrap">
        {state === 'success' ? (
          <div className="auth-success"><span><Send size={24} /></span><p className="section-kicker">Email sent</p><h1>Check your inbox.</h1><p>{message}</p><Link className="button button-dark" to="/sign-in">Return to sign in <ArrowRight size={16} /></Link></div>
        ) : (
          <>
            <p className="section-kicker">Email verification</p>
            <h1>Send a new link.</h1>
            <p className="auth-intro">Enter the email used to create your PhotoDey account.</p>
            <form className="form-stack" onSubmit={submit}>
              <label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
              {message && <p className="form-error">{message}</p>}
              <button className="button button-dark button-wide" disabled={state === 'loading'}>{state === 'loading' ? <LoaderCircle className="spin" size={17} /> : <>Send verification email <ArrowRight size={17} /></>}</button>
            </form>
            <p className="auth-switch">Already verified? <Link to="/sign-in">Sign in</Link></p>
          </>
        )}
      </div>
    </AuthShell>
  );
}

export function VerifyEmailPage() {
  const { token } = useParams();
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const verify = async () => {
    if (!token) return;
    setState('loading');
    try {
      const response = await apiRequest<null>(`/auth/verify/${token}`);
      setMessage(response.message);
      setState('success');
    } catch (caught) {
      setMessage(caught instanceof ApiClientError ? caught.message : 'Verification failed');
      setState('error');
    }
  };

  return (
    <main className="centered-page">
      <Brand />
      <div className="verification-card">
        <span className={`verification-icon ${state}`}><CheckCircle2 size={27} /></span>
        <p className="section-kicker">Email verification</p>
        <h1>{state === 'success' ? 'You’re verified.' : 'Confirm your account.'}</h1>
        <p>{message || 'Verify your email to unlock your organizer workspace.'}</p>
        {state === 'success' ? <Link className="button button-dark" to="/sign-in">Continue to sign in</Link> : <button className="button button-accent" onClick={verify} disabled={state === 'loading'}>{state === 'loading' ? <LoaderCircle className="spin" size={17} /> : 'Verify email'}</button>}
      </div>
    </main>
  );
}
