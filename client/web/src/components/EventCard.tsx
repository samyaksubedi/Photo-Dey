import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { EventSummary } from '../types';
import { coverKind, coverPhoto } from '../lib/photos';
import { Photo } from './Photo';
import { StatusBadge } from './StatusBadge';

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export function EventCard({ event }: { event: EventSummary }) {
  const ready = event.status === 'COMPLETED' || event.status === 'PARTIAL_FAILURE';
  const pct = event.totalPhotos ? Math.min(100, Math.round((event.uploadedPhotos / event.totalPhotos) * 100)) : 0;
  return (
    <Link className="ev-card" to={`/dashboard/events/${event.id}`}>
      <div className="ev-cover">
        <Photo id={coverPhoto(coverKind(event.name, event.id))} width={640} />
        <StatusBadge status={event.status} />
      </div>
      <div className="ev-body">
        <h3>{event.name}</h3>
        <p>{formatDate(event.createdAt)} · {event.totalPhotos.toLocaleString()} photos</p>
        {!ready && event.status !== 'FAILED' && (
          <div className="ev-progress" aria-label={`${pct}% processed`}>
            <i><u style={{ width: `${pct}%` }} /></i>
            <span>{pct}%</span>
          </div>
        )}
        <span className={`ev-access${event.publicEnabled ? ' is-on' : ''}`}>
          {event.publicEnabled ? <Eye size={14} /> : <EyeOff size={14} />}
          {event.publicEnabled ? 'Guests can search' : 'Guest search off'}
        </span>
      </div>
    </Link>
  );
}
