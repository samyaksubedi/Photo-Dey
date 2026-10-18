import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EventCard } from '../components/EventCard';
import { EmptyState, PageLoader } from '../components/PageState';
import { MatchBox, Photo } from '../components/Photo';
import { PHOTO } from '../lib/photos';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';
import type { EventSummary } from '../types';

const fetchEvents = async () => {
  const response = await apiRequest<{ events: EventSummary[] }>('/events', { authenticated: true });
  return response.data.events;
};

const isReady = (event: EventSummary) => event.status === 'COMPLETED' || event.status === 'PARTIAL_FAILURE';

function FirstEvent() {
  return (
    <div className="first-event">
      <div className="first-event-art"><Photo id={PHOTO.couple2} width={700} position="50% 38%" /><MatchBox left={33} top={35} width={19} height={17} label="You" hot /></div>
      <div>
        <h2>Create your first event</h2>
        <p>Name it, add the photos, and PhotoDey prepares a QR code your guests can scan to find their own pictures.</p>
        <Link className="btn btn-primary btn-lg" to="/dashboard/events/new"><Plus size={18} />Create an event</Link>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: events, isLoading, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });

  if (isLoading) return <PageLoader label="Loading your events" />;
  if (error) return <EmptyState title="Your events could not be loaded." body={error.message} />;

  const list = events ?? [];
  const ready = list.filter(isReady).length;
  const processing = list.filter((event) => event.status === 'PROCESSING').length;
  const totalPhotos = list.reduce((sum, event) => sum + event.totalPhotos, 0);

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Namaste, {user?.name?.split(' ')[0]}</h1>
          <p>Here is where your events stand today.</p>
        </div>
        <Link className="btn btn-primary" to="/dashboard/events/new"><Plus size={17} />New event</Link>
      </header>

      <section className="summary" aria-label="Summary">
        <div><strong>{list.length}</strong><span>Events</span></div>
        <div><strong>{ready}</strong><span>Ready to share</span></div>
        <div><strong>{processing}</strong><span>Processing now</span></div>
        <div><strong>{totalPhotos.toLocaleString()}</strong><span>Photos in total</span></div>
      </section>

      {!list.length ? (
        <FirstEvent />
      ) : (
        <section className="block">
          <div className="block-head">
            <h2>Recent events</h2>
            <Link className="link-arrow" to="/dashboard/events">All events <ArrowRight size={16} /></Link>
          </div>
          <div className="ev-grid">{list.slice(0, 6).map((event) => <EventCard key={event.id} event={event} />)}</div>
        </section>
      )}
    </>
  );
}

type Filter = 'all' | 'ready' | 'processing' | 'attention';

export function EventsPage() {
  const { data: events, isLoading, error } = useQuery({ queryKey: ['events'], queryFn: fetchEvents });
  const [filter, setFilter] = useState<Filter>('all');
  if (isLoading) return <PageLoader label="Loading events" />;
  if (error) return <EmptyState title="Your events could not be loaded." body={error.message} />;

  const list = events ?? [];
  const groups: Record<Filter, EventSummary[]> = {
    all: list,
    ready: list.filter(isReady),
    processing: list.filter((event) => event.status === 'PROCESSING' || event.status === 'CREATED'),
    attention: list.filter((event) => event.status === 'FAILED' || event.failedPhotos > 0),
  };
  const tabs: Array<[Filter, string]> = [['all', 'All'], ['ready', 'Ready'], ['processing', 'In progress'], ['attention', 'Needs attention']];
  const shown = groups[filter];

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Events</h1>
          <p>Open an event to add photos, share its QR code, or change guest access.</p>
        </div>
        <Link className="btn btn-primary" to="/dashboard/events/new"><Plus size={17} />New event</Link>
      </header>
      {!list.length ? (
        <FirstEvent />
      ) : (
        <>
          <div className="chips" role="tablist" aria-label="Filter events">
            {tabs.map(([key, label]) => (
              <button key={key} role="tab" aria-selected={filter === key} className={`chip${filter === key ? ' is-on' : ''}`} onClick={() => setFilter(key)}>
                {label}<span>{groups[key].length}</span>
              </button>
            ))}
          </div>
          {shown.length ? (
            <div className="ev-grid">{shown.map((event) => <EventCard key={event.id} event={event} />)}</div>
          ) : (
            <EmptyState title="Nothing here." body="No events match this filter right now." />
          )}
        </>
      )}
    </>
  );
}
