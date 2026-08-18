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
    <div className="account-page">
      <div className="simple-page-head account-page-head">
        <div><p className="section-kicker">Account & security</p><h1>Your workspace.</h1><p>Review your organizer profile and every device currently signed in.</p></div>
        <span className="account-shield"><ShieldCheck size={22} />Protected by short-lived access tokens</span>
      </div>

      <section className="account-profile-card">
        <span>{user?.name.charAt(0).toUpperCase()}</span>
        <div><p className="section-kicker">Organizer profile</p><h2>{user?.name}</h2><p>{user?.email}</p></div>
        <span className="verified-pill"><ShieldCheck size={14} />Verified account</span>
      </section>

      <section className="sessions-section">
        <div className="dashboard-section-head"><div><p className="section-kicker">Authentication</p><h2>Signed-in devices</h2></div><p>Refreshing an access token updates the device’s last activity.</p></div>
        {sessionsQuery.isLoading ? <PageLoader label="Loading your sessions" /> : sessionsQuery.error ? <EmptyState eyebrow="Could not load" title="Your sessions are unavailable." body={sessionsQuery.error.message} /> : (
          <div className="session-list">
            {sessionsQuery.data?.map((session) => (
              <article className="session-row" key={session.id}>
                <span className="session-device"><DeviceIcon type={session.deviceInfo.deviceType} /></span>
                <div className="session-main"><strong>{session.deviceInfo.browser} on {session.deviceInfo.os}</strong><span>{session.deviceInfo.deviceType || 'desktop'} · {session.ipAddress}</span></div>
                <div className="session-time"><Clock3 size={13} /><span>Last active {new Date(session.lastUsedAt).toLocaleString()}</span></div>
                {session.isCurrent ? <span className="current-session">This device</span> : <span className="other-session"><Globe2 size={12} />Active</span>}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="account-danger-zone">
        <div><p className="section-kicker">Security action</p><h2>Sign out everywhere</h2><p>This revokes every refresh session, including the device you are using now.</p></div>
        <button className="button button-danger" onClick={endEverySession} disabled={endingSessions}>{endingSessions ? <LoaderCircle className="spin" size={16} /> : <LogOut size={16} />}Sign out all devices</button>
        {actionError && <p className="form-error">{actionError}</p>}
      </section>
    </div>
  );
}
