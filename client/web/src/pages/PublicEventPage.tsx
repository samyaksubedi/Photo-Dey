import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Clock3, LockKeyhole, MessageCircle, ScanFace, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { EmptyState, PageLoader } from '../components/PageState';
import { ApiClientError, apiRequest } from '../lib/api';
import type { PublicEvent } from '../types';

export function PublicEventPage() {
  const { publicCode } = useParams();
  const query = useQuery({
    queryKey: ['public-event', publicCode],
    queryFn: async () => (await apiRequest<{ event: PublicEvent }>(`/public/events/${publicCode}`)).data.event,
    enabled: Boolean(publicCode),
    retry: (count, error) => !(error instanceof ApiClientError && error.status === 404) && count < 2,
    refetchInterval: (query) => query.state.data?.availability === 'PROCESSING' ? 8000 : false,
  });

  if (query.isLoading) return <main className="public-event-shell"><PageLoader label="Opening event" /></main>;
  if (query.error || !query.data) return <main className="public-event-shell"><div className="public-event-top"><Brand /></div><EmptyState eyebrow="Event unavailable" title="This invitation can’t be opened." body="The link may be invalid, expired, or disabled by the organizer." action={<Link className="button button-dark" to="/">About PhotoDey</Link>} /></main>;

  const event = query.data;
  const ready = event.availability === 'READY';
  return (
    <main className="public-event-shell">
      <div className="public-event-top"><Brand /><span>Private event access</span></div>
      <section className="public-event-card">
        <div className="public-event-visual"><div className="public-event-photo" /><div className="public-photo-stamp"><ScanFace size={17} />Photo discovery enabled</div></div>
        <div className="public-event-copy">
          <p className="section-kicker">You’re invited to</p>
          <h1>{event.name}</h1>
          {ready ? <><p className="public-lede">Find the photographs you’re in with one clear selfie. Your results stay personal to this event.</p>{event.telegramDeepLink ? <a className="button button-telegram" href={event.telegramDeepLink}><MessageCircle size={18} />Find my photos on Telegram <ArrowUpRight size={16} /></a> : <div className="public-notice"><Clock3 size={18} /><p><strong>Telegram link is being configured.</strong>Please check again shortly.</p></div>}</> : <><div className="public-notice"><Clock3 size={18} /><p><strong>The photographs are still being prepared.</strong>This page will update automatically when the event is ready.</p></div></>}
          <div className="public-trust"><span><ShieldCheck size={16} />Scoped to this event</span><span><LockKeyhole size={16} />Private matching</span></div>
        </div>
      </section>
      <p className="public-event-foot">Powered thoughtfully by <strong>PhotoDey</strong></p>
    </main>
  );
}
