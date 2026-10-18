import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Clock3, Lock, MessageCircle, ScanFace } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { EmptyState, PageLoader } from '../components/PageState';
import { Photo } from '../components/Photo';
import { coverKind, coverPhoto } from '../lib/photos';
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

  if (query.isLoading) return <main className="guest"><PageLoader label="Opening event" /></main>;
  if (query.error || !query.data) {
    return (
      <main className="guest">
        <header className="guest-top"><Brand /></header>
        <div className="guest-card">
          <EmptyState title="This link can’t be opened." body="The link may be wrong, expired, or switched off by the organizer." action={<Link className="btn btn-primary" to="/">About PhotoDey</Link>} />
        </div>
      </main>
    );
  }

  const event = query.data;
  const ready = event.availability === 'READY';
  const kind = coverKind(event.name, publicCode);

  return (
    <main className="guest">
      <header className="guest-top"><Brand /></header>
      <section className="guest-card">
        <div className="guest-cover">
          <Photo id={coverPhoto(kind)} width={900} eager />
          <div className="guest-cover-text">
            <span className="guest-badge"><ScanFace size={15} />Photo search is on</span>
            <h1>{event.name}</h1>
          </div>
        </div>
        <div className="guest-body">
          {ready ? (
            <>
              <p className="guest-lede">Find the photos you are in. It takes about a minute.</p>
              <ol className="guest-steps">
                <li><span>1</span>Tap the button to open Telegram.</li>
                <li><span>2</span>Send one clear selfie to the PhotoDey bot.</li>
                <li><span>3</span>Open the gallery link it sends back.</li>
              </ol>
              {event.telegramDeepLink ? (
                <div className="guest-cta">
                  <a className="btn btn-telegram btn-lg btn-block" href={event.telegramDeepLink}><MessageCircle size={19} />Find my photos on Telegram <ArrowUpRight size={17} /></a>
                </div>
              ) : (
                <div className="notice"><Clock3 size={18} /><p><strong>The Telegram link isn’t ready yet.</strong>Please check again in a few minutes.</p></div>
              )}
            </>
          ) : (
            <div className="notice"><Clock3 size={18} /><p><strong>The photos are still being prepared.</strong>This page updates by itself when the event is ready.</p></div>
          )}
          <p className="guest-privacy"><Lock size={15} />Your selfie is only compared with photos from this event.</p>
        </div>
      </section>
      <p className="guest-foot">Photo search by <strong>PhotoDey</strong></p>
    </main>
  );
}
