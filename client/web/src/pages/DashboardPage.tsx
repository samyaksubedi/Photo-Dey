import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Camera, CheckCircle2, Clock3, Images, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState, PageLoader } from '../components/PageState';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { EventSummary } from '../types';

const fetchEvents = async () => {
  const response = await apiRequest<{ events: EventSummary[] }>('/events', { authenticated: true });
  return response.data.events;
};

export function DashboardPage() {
  const { user } = useAuth();
  const { data: events, isLoading, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  if (isLoading) return <PageLoader label="Loading your events" />;
  if (error) return <EmptyState eyebrow="Could not load" title="Your events are out of reach." body={error.message} />;

  const ready = events?.filter((event) => event.status === 'COMPLETED' || event.status === 'PARTIAL_FAILURE').length ?? 0;
  const processing = events?.filter((event) => event.status === 'PROCESSING').length ?? 0;
  const totalPhotos = events?.reduce((sum, event) => sum + event.totalPhotos, 0) ?? 0;

  return (
    <>
      <div className="dashboard-heading">
        <div><p className="section-kicker">Good to see you, {user?.name?.split(' ')[0]}</p><h1>Your events,<br /><em>at a glance.</em></h1></div>
        <p>See what is ready, what is still processing, and what your guests can access.</p>
      </div>

      <div className="stat-grid">
        <article><span><Images size={18} /></span><p>All events</p><strong>{events?.length ?? 0}</strong><small>Your complete workspace</small></article>
        <article><span><CheckCircle2 size={18} /></span><p>Ready to share</p><strong>{ready}</strong><small>Completed or partially ready</small></article>
        <article><span><Clock3 size={18} /></span><p>Processing now</p><strong>{processing}</strong><small>Preparing face matches</small></article>
        <article><span><Camera size={18} /></span><p>Photographs</p><strong>{totalPhotos}</strong><small>Across all events</small></article>
      </div>

      <section className="dashboard-section">
        <div className="dashboard-section-head"><div><p className="section-kicker">Recent work</p><h2>Latest events</h2></div>{events?.length ? <Link className="inline-action" to="/dashboard/events">View every event <ArrowRight size={16} /></Link> : null}</div>
        {!events?.length ? (
          <EmptyState eyebrow="Your first event" title="A beautifully empty workspace." body="Add an event, upload its photographs, and PhotoDey will prepare a private discovery experience for every guest." action={<Link className="button button-accent" to="/dashboard/events/new"><Plus size={16} />Create an event</Link>} />
        ) : (
          <div className="event-list">
            {events.slice(0, 5).map((event) => (
              <Link className="event-row" to={`/dashboard/events/${event.id}`} key={event.id}>
                <span className="event-monogram">{event.name.slice(0, 2).toUpperCase()}</span>
                <div className="event-main"><strong>{event.name}</strong><small>{new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</small></div>
                <div className="event-count"><strong>{event.totalPhotos}</strong><small>photos</small></div>
                <StatusBadge status={event.status} />
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function EventsPage() {
  const { data: events, isLoading, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  if (isLoading) return <PageLoader label="Loading events" />;
  if (error) return <EmptyState eyebrow="Could not load" title="Your events are out of reach." body={error.message} />;
  return (
    <>
      <div className="simple-page-head"><div><p className="section-kicker">Event library</p><h1>Every event.</h1><p>Manage processing, guest access, photographs, and QR sharing.</p></div><Link className="button button-accent" to="/dashboard/events/new"><Plus size={16} />New event</Link></div>
      {!events?.length ? <EmptyState eyebrow="Nothing here yet" title="Create your first event." body="Your event library will live here." /> : <div className="event-card-grid">{events.map((event) => <Link className="event-card" to={`/dashboard/events/${event.id}`} key={event.id}><div className="event-card-top"><span className="event-monogram">{event.name.slice(0, 2).toUpperCase()}</span><StatusBadge status={event.status} /></div><h2>{event.name}</h2><p>{new Date(event.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p><div className="event-card-meta"><span><strong>{event.totalPhotos}</strong>photos</span><span><strong>{event.uploadedPhotos}</strong>uploaded</span><ArrowRight size={17} /></div></Link>)}</div>}
    </>
  );
}
