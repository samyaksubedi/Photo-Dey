import { useQuery } from '@tanstack/react-query';
import {
  Clock3,
  Globe2,
  LoaderCircle,
  LogOut,
  Monitor,
  ShieldCheck,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, PageLoader } from '../components/PageState';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { UserSession } from '../types';

const DeviceIcon = ({ type }: { type: string }) => {
  if (type === 'mobile') return <Smartphone size={19} />;
  if (type === 'tablet') return <Tablet size={19} />;
  return <Monitor size={19} />;
};

export function AccountPage() {
  const { user, signOutEverywhere } = useAuth();
  const navigate = useNavigate();
  const [endingSessions, setEndingSessions] = useState(false);
  const [actionError, setActionError] = useState('');
  const sessionsQuery = useQuery({
    queryKey: ['auth-sessions'],
    queryFn: async () => (
      await apiRequest<{ sessions: UserSession[] }>('/auth/info-loggedIn-devices', {
        authenticated: true,
      })
    ).data.sessions,
  });

  const endEverySession = async () => {
    setEndingSessions(true);
    setActionError('');
    try {
      await signOutEverywhere();
      navigate('/sign-in', { replace: true });
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'Could not end your sessions');
      setEndingSessions(false);
    }
  };

  return (
    <div className="acct">
      <header className="page-head">
        <div>
          <h1>Account</h1>
          <p>Your profile and every device that is signed in.</p>
        </div>
      </header>

      <section className="acct-profile">
        <span className="acct-avatar">{user?.name.charAt(0).toUpperCase()}</span>
        <div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
        </div>
        <span className="verified-pill"><ShieldCheck size={15} />Email verified</span>
      </section>

      <section className="block">
        <div className="block-head"><h2>Signed-in devices</h2></div>
        {sessionsQuery.isLoading ? <PageLoader label="Loading your devices" /> : sessionsQuery.error ? <EmptyState title="Your devices could not be loaded." body={sessionsQuery.error.message} /> : (
          <div className="session-list">
            {sessionsQuery.data?.map((session) => (
              <article className="session-row" key={session.id}>
                <span className="session-device"><DeviceIcon type={session.deviceInfo.deviceType} /></span>
                <div className="session-main"><strong>{session.deviceInfo.browser} on {session.deviceInfo.os}</strong><span>{session.deviceInfo.deviceType || 'desktop'} · {session.ipAddress}</span></div>
                <div className="session-time"><Clock3 size={14} /><span>Last active {new Date(session.lastUsedAt).toLocaleString()}</span></div>
                {session.isCurrent ? <span className="current-session">This device</span> : <span className="other-session"><Globe2 size={13} />Signed in</span>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="acct-danger">
        <div>
          <h2>Sign out everywhere</h2>
          <p>This ends every session, including the one you are using now. You will need to sign in again.</p>
        </div>
        <button className="btn btn-danger" onClick={endEverySession} disabled={endingSessions}>{endingSessions ? <LoaderCircle className="spin" size={16} /> : <LogOut size={16} />}Sign out all devices</button>
        {actionError && <p className="form-error">{actionError}</p>}
      </section>
    </div>
  );
}
