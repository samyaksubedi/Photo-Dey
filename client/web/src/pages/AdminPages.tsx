import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Images,
  LoaderCircle,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { PageLoader } from '../components/PageState';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

type AdminOverview = {
  totals: {
    totalUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    totalEvents: number;
    totalPhotos: number;
  };
  eventsByStatus: Record<'CREATED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_FAILURE' | 'FAILED', number>;
  photosByStatus: Record<'PENDING_UPLOAD' | 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'FAILED', number>;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  createdAt: string;
  eventCount: number;
};

type AdminEvent = {
  id: string;
  name: string;
  status: 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_FAILURE' | 'FAILED';
  publicEnabled: boolean;
  totalPhotos: number;
  receivedPhotos: number;
  uploadedPhotos: number;
  processingPhotos: number;
  completedPhotos: number;
  failedPhotos: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

type AdminPage<T> = { items: T[]; nextCursor: string | null };

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const friendlyStatus = (status: string) => status.replaceAll('_', ' ').toLowerCase();

export function AdminLoginPage() {
  const { user, loading, adminSignIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <PageLoader label="Checking your session" />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await adminSignIn(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card">
        <Brand />
        <div className="admin-login-icon"><ShieldCheck size={24} /></div>
        <p className="section-kicker">Restricted area</p>
        <h1>Admin console</h1>
        <p>Sign in with an authorized PhotoDey administrator account.</p>
        <form className="form-stack" onSubmit={submit}>
          <label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" /></label>
          <label>Password<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-dark button-wide" disabled={submitting}>{submitting ? <LoaderCircle className="spin" size={17} /> : <>Enter console <ArrowRight size={17} /></>}</button>
        </form>
      </section>
    </main>
  );
}

export function AdminDashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [eventStatus, setEventStatus] = useState<AdminEvent['status'] | ''>('');
  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => (await apiRequest<{ overview: AdminOverview }>('/admin/overview', { authenticated: true })).data.overview,
  });
  const usersQuery = useInfiniteQuery({
    queryKey: ['admin-users'],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const query = new URLSearchParams({ limit: '50' });
      if (pageParam) query.set('cursor', pageParam);
      return (await apiRequest<AdminPage<AdminUser>>(`/admin/users?${query.toString()}`, { authenticated: true })).data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
  const eventsQuery = useInfiniteQuery({
    queryKey: ['admin-events', eventStatus],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const query = new URLSearchParams({ limit: '50' });
      if (eventStatus) query.set('status', eventStatus);
      if (pageParam) query.set('cursor', pageParam);
      return (await apiRequest<AdminPage<AdminEvent>>(`/admin/events?${query.toString()}`, { authenticated: true })).data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const users = usersQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const events = eventsQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const overview = overviewQuery.data;

  const logout = async () => {
    await signOut();
    navigate('/admin', { replace: true });
  };

  if (overviewQuery.isLoading) return <PageLoader label="Loading administration data" />;
  if (overviewQuery.error) return <main className="admin-error-state"><Brand /><h1>Console unavailable.</h1><p>{overviewQuery.error.message}</p></main>;
  if (!overview) return null;

  const statCards = [
    { label: 'All users', value: overview.totals.totalUsers, icon: Users, note: `${overview.totals.verifiedUsers} verified` },
    { label: 'Events created', value: overview.totals.totalEvents, icon: CalendarDays, note: `${overview.eventsByStatus.COMPLETED} completed` },
    { label: 'Photographs', value: overview.totals.totalPhotos, icon: Images, note: `${overview.photosByStatus.COMPLETED} processed` },
    { label: 'Administrators', value: overview.totals.adminUsers, icon: ShieldCheck, note: 'Role-protected access' },
  ];

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <Brand />
        <div><span>Administrator console</span><strong>{user?.name}</strong><button className="admin-logout" onClick={logout}><LogOut size={15} />Sign out</button></div>
      </header>
      <section className="admin-content">
        <header className="admin-page-head"><div><p className="section-kicker">Platform operations</p><h1>PhotoDey at a glance.</h1><p>Live account, event, and photograph processing data.</p></div><div className="admin-live-indicator"><Activity size={15} />Live database view</div></header>

        <section className="admin-stat-grid">{statCards.map(({ label, value, icon: Icon, note }) => <article className="admin-stat-card" key={label}><span><Icon size={18} /></span><strong>{value.toLocaleString()}</strong><p>{label}</p><small>{note}</small></article>)}</section>

        <section className="admin-breakdown-grid">
          <article className="admin-breakdown-card"><div><p className="section-kicker">Event pipeline</p><h2>Event status</h2></div>{Object.entries(overview.eventsByStatus).map(([status, count]) => <div className="admin-status-row" key={status}><span className={`admin-status-dot status-${status.toLowerCase()}`} /><p>{friendlyStatus(status)}</p><strong>{count}</strong></div>)}</article>
          <article className="admin-breakdown-card"><div><p className="section-kicker">Photo pipeline</p><h2>Photograph status</h2></div>{Object.entries(overview.photosByStatus).map(([status, count]) => <div className="admin-status-row" key={status}><span className={`admin-status-dot status-${status.toLowerCase()}`} /><p>{friendlyStatus(status)}</p><strong>{count}</strong></div>)}</article>
        </section>

        <section className="admin-table-section">
          <div className="admin-section-head"><div><p className="section-kicker">Accounts</p><h2>Users</h2><span>{users.length} loaded</span></div></div>
          {usersQuery.isLoading ? <PageLoader label="Loading users" /> : <div className="admin-table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Verification</th><th>Events</th><th>Joined</th></tr></thead><tbody>{users.map((entry) => <tr key={entry.id}><td><strong>{entry.name}</strong><span>{entry.email}</span></td><td><em className={`admin-role admin-role-${entry.role}`}>{entry.role}</em></td><td>{entry.isVerified ? <span className="admin-verified"><CheckCircle2 size={14} />Verified</span> : <span className="admin-pending">Pending</span>}</td><td>{entry.eventCount}</td><td>{formatDate(entry.createdAt)}</td></tr>)}</tbody></table></div>}
          {usersQuery.hasNextPage && <button className="admin-load-more" onClick={() => void usersQuery.fetchNextPage()} disabled={usersQuery.isFetchingNextPage}>{usersQuery.isFetchingNextPage ? <LoaderCircle className="spin" size={15} /> : null}Load more users</button>}
        </section>

        <section className="admin-table-section">
          <div className="admin-section-head"><div><p className="section-kicker">Event ownership</p><h2>Events</h2><span>{events.length} loaded</span></div><label className="admin-filter">Status<select value={eventStatus} onChange={(event) => setEventStatus(event.target.value as AdminEvent['status'] | '')}><option value="">All statuses</option><option value="CREATED">Created</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="PARTIAL_FAILURE">Partial failure</option><option value="FAILED">Failed</option></select></label></div>
          {eventsQuery.isLoading ? <PageLoader label="Loading events" /> : <div className="admin-table-wrap"><table className="admin-events-table"><thead><tr><th>Event</th><th>Created by</th><th>Status</th><th>Photos</th><th>Pipeline</th><th>Created</th></tr></thead><tbody>{events.map((entry) => <tr key={entry.id}><td><strong>{entry.name}</strong><span>{entry.publicEnabled ? 'Public access on' : 'Public access off'}</span></td><td><strong>{entry.user.name}</strong><span>{entry.user.email}</span></td><td><em className={`admin-status-badge status-${entry.status.toLowerCase()}`}>{friendlyStatus(entry.status)}</em></td><td>{entry.receivedPhotos} / {entry.totalPhotos}</td><td><span className="admin-pipeline-copy">{entry.uploadedPhotos} uploaded · {entry.processingPhotos} processing · {entry.completedPhotos} complete · {entry.failedPhotos} failed</span></td><td>{formatDate(entry.createdAt)}</td></tr>)}</tbody></table></div>}
          {eventsQuery.hasNextPage && <button className="admin-load-more" onClick={() => void eventsQuery.fetchNextPage()} disabled={eventsQuery.isFetchingNextPage}>{eventsQuery.isFetchingNextPage ? <LoaderCircle className="spin" size={15} /> : null}Load more events</button>}
        </section>
      </section>
    </main>
  );
}
