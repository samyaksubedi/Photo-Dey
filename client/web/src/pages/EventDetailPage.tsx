import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  ExternalLink,
  ImageOff,
  ImagePlus,
  LoaderCircle,
  Maximize2,
  Power,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '../components/PageState';
import { StatusBadge } from '../components/StatusBadge';
import { apiRequest } from '../lib/api';
import {
  buildPhotoBatches,
  uploadPhotoBatches,
  type PhotoBatch,
  type PhotoUploadProgress,
} from '../lib/photo-upload';
import type { EventDetail, EventProcessingStatus, Photo } from '../types';

export function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const qrRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const addSessionRef = useRef<{
    batches: PhotoBatch[];
    completedBatchIds: Set<string>;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<Photo | null>(null);
  const [confirmPhotoDelete, setConfirmPhotoDelete] = useState<Photo | null>(null);
  const [addingPhotos, setAddingPhotos] = useState(false);
  const [addProgress, setAddProgress] = useState<PhotoUploadProgress | null>(null);
  const [addError, setAddError] = useState('');

  const eventQuery = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => (await apiRequest<{ event: EventDetail }>(`/events/${eventId}`, { authenticated: true })).data.event,
    enabled: Boolean(eventId),
  });
  const statusQuery = useQuery({
    queryKey: ['event-status', eventId],
    queryFn: async () => (await apiRequest<{ status: EventProcessingStatus }>(`/events/${eventId}/status`, { authenticated: true })).data.status,
    enabled: Boolean(eventId),
    refetchInterval: (query) => query.state.data?.status === 'PROCESSING' ? 2500 : false,
  });
  const photosQuery = useQuery({
    queryKey: ['event-photos', eventId],
    queryFn: async () => (await apiRequest<{ photos: Photo[] }>(`/photos/event/${eventId}`, { authenticated: true })).data.photos,
    enabled: Boolean(eventId),
    refetchInterval: statusQuery.data?.status === 'PROCESSING' ? 5000 : false,
  });

  const event = eventQuery.data;
  const status = statusQuery.data;
  const publicUrl = useMemo(() => event ? `${window.location.origin}/e/${event.publicCode}` : '', [event]);

  const toggleMutation = useMutation({
    mutationFn: async (publicEnabled: boolean) => apiRequest(`/events/${eventId}/public-access`, { method: 'PATCH', authenticated: true, body: JSON.stringify({ publicEnabled }) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => apiRequest(`/events/${eventId}`, { method: 'DELETE', authenticated: true }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/dashboard/events');
    },
  });
  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) =>
      apiRequest(`/photos/${photoId}`, {
        method: 'DELETE',
        authenticated: true,
      }),
    onSuccess: () => {
      setViewingPhoto(null);
      setConfirmPhotoDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['event-status', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['event-photos', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const runAddPhotoUpload = async () => {
    const session = addSessionRef.current;
    if (!session || !eventId) return;
    setAddingPhotos(true);
    setAddError('');
    try {
      await uploadPhotoBatches({
        eventId,
        batches: session.batches,
        completedBatchIds: session.completedBatchIds,
        onProgress: setAddProgress,
      });
      addSessionRef.current = null;
      setAddingPhotos(false);
      setAddProgress(null);
      void queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['event-status', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['event-photos', eventId] });
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (caught) {
      setAddingPhotos(false);
      setAddError(
        caught instanceof Error
          ? `${caught.message} Retry to continue without duplicates.`
          : 'Could not add the photographs',
      );
    }
  };

  const addPhotos = (incoming: File[]) => {
    const valid = incoming
      .filter(
        (file) =>
          ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type) &&
          file.size <= 20 * 1024 * 1024,
      )
      .slice(0, 1000);
    if (!valid.length) {
      setAddError('Choose JPG, PNG, or WEBP images under 20 MB.');
      return;
    }
    if (valid.length !== incoming.length) {
      setAddError('Some unsupported or oversized files were skipped.');
    }
    addSessionRef.current = {
      batches: buildPhotoBatches(valid),
      completedBatchIds: new Set<string>(),
    };
    void runAddPhotoUpload();
  };

  if (eventQuery.isLoading || statusQuery.isLoading) return <PageLoader label="Opening event" />;
  if (!event || !status) return <div className="empty-state"><h2>Event not found.</h2><Link to="/dashboard/events">Return to events</Link></div>;

  const terminalCount = status.completedPhotos + status.failedPhotos;
  const progress = status.totalPhotos ? Math.round((terminalCount / status.totalPhotos) * 100) : 0;
  const ready = status.status === 'COMPLETED' || status.status === 'PARTIAL_FAILURE';

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  const downloadQr = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const serialized = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([serialized], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${event.name.replace(/\s+/g, '-').toLowerCase()}-qr.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Link className="back-link" to="/dashboard/events"><ArrowLeft size={15} />All events</Link>
      <div className="event-detail-head"><div><div className="event-title-line"><StatusBadge status={status.status} /><span>{new Date(event.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span></div><h1>{event.name}</h1><p>{status.receivedPhotos} of {status.totalPhotos} photographs received</p></div><div className="head-actions"><input ref={photoInputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(inputEvent) => { const incoming = Array.from(inputEvent.target.files ?? []); inputEvent.target.value = ''; addPhotos(incoming); }} /><button className="button button-accent" onClick={() => addSessionRef.current ? void runAddPhotoUpload() : photoInputRef.current?.click()} disabled={addingPhotos}>{addingPhotos ? <LoaderCircle className="spin" size={15} /> : addSessionRef.current ? <UploadCloud size={15} /> : <ImagePlus size={15} />}{addingPhotos ? 'Sending photos' : addSessionRef.current ? 'Retry photos' : 'Add photographs'}</button><button className="button button-quiet" onClick={() => toggleMutation.mutate(!event.publicEnabled)} disabled={toggleMutation.isPending}><Power size={15} />Public access {event.publicEnabled ? 'on' : 'off'}</button><button className="icon-button danger-button" onClick={() => setConfirmDelete(true)} aria-label="Delete event"><Trash2 size={17} /></button></div></div>

      {(addProgress || addError) && <div className="upload-progress event-add-progress">{addProgress && <><div><span>Sending additional photographs</span><strong>{addProgress.percent}%</strong></div><i><span style={{ width: `${addProgress.percent}%` }} /></i><div className="upload-count-progress"><strong>{addProgress.sentPhotos} of {addProgress.totalPhotos} photos sent</strong><span>{addProgress.remainingPhotos} remaining</span></div><p>{addProgress.completedBatches} completed · {addProgress.activeBatches} uploading · {addProgress.waitingBatches} waiting</p></>}{addError && <p className="form-error">{addError}</p>}</div>}

      <section className="processing-panel"><div className="processing-copy"><p className="section-kicker">Processing progress</p><h2>{ready ? 'Your event is ready to share.' : 'Preparing every photograph.'}</h2><p>{ready ? 'Guests can now use the public event link to find their moments.' : 'Face matching runs one photograph at a time. This page updates automatically.'}</p></div><div className="progress-ring" style={{ '--progress': `${progress * 3.6}deg` } as CSSProperties}><span><strong>{progress}%</strong><small>complete</small></span></div><div className="processing-stats"><div><strong>{status.uploadedPhotos}</strong><span>Uploaded</span></div><div><strong>{status.processingPhotos}</strong><span>Processing</span></div><div><strong>{status.completedPhotos}</strong><span>Completed</span></div><div><strong>{status.failedPhotos}</strong><span>Failed</span></div></div></section>

      <div className="event-detail-grid">
        <section className="event-photos-panel"><div className="panel-head"><div><p className="section-kicker">Complete event library</p><h2>Every photograph</h2></div><span>{photosQuery.data?.length ?? 0} files</span></div>{photosQuery.isLoading ? <PageLoader label="Loading photographs" /> : photosQuery.data?.length ? <div className="photo-thumb-grid event-full-photo-grid">{photosQuery.data.map((photo, index) => photo.secureUrl ? <button className="organizer-photo-item" key={photo.id} onClick={() => setViewingPhoto(photo)} aria-label={`Open event photograph ${index + 1}`}><img src={photo.secureUrl} alt={`Event photograph ${index + 1}`} loading="lazy" /><span className={`photo-state photo-${photo.status.toLowerCase()}`}>{photo.status.replace('_', ' ')}</span><span className="photo-open-icon"><Maximize2 size={14} /></span></button> : <div className="photo-placeholder" key={photo.id}><ImageOff size={19} /><span>{photo.status.replace('_', ' ')}</span></div>)}</div> : <div className="photo-empty"><ImageOff size={22} /><p>Uploaded photographs will appear here.</p></div>}</section>

        <aside className="qr-panel"><div className="panel-head"><div><p className="section-kicker">Guest access</p><h2>Event QR</h2></div><span className={`access-dot${event.publicEnabled ? ' is-on' : ''}`}>{event.publicEnabled ? 'Live' : 'Off'}</span></div><div className={`qr-card${!ready || !event.publicEnabled ? ' is-disabled' : ''}`} ref={qrRef}><QRCodeSVG value={publicUrl} size={180} level="H" marginSize={2} bgColor="#fffdf8" fgColor="#17161d" /><span className="qr-brand">PhotoDey</span></div><p>{!ready ? 'The QR becomes shareable when processing finishes.' : event.publicEnabled ? 'Guests scan this to open the event page and continue to Telegram.' : 'Turn on public access before sharing this QR.'}</p><div className="qr-actions"><button onClick={copyLink} className="button button-quiet" disabled={!ready || !event.publicEnabled}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy link'}</button><button onClick={downloadQr} className="button button-dark" disabled={!ready || !event.publicEnabled}><Download size={15} />Download</button></div>{ready && event.publicEnabled && <a className="public-preview-link" href={publicUrl} target="_blank" rel="noreferrer">Preview guest page <ExternalLink size={14} /></a>}</aside>
      </div>

      {confirmDelete && <div className="modal-backdrop"><div className="confirm-modal"><span className="danger-icon"><Trash2 size={20} /></span><p className="section-kicker">Permanent action</p><h2>Delete {event.name}?</h2><p>This removes the event, Cloudinary photographs, guest sessions, and Qdrant embeddings. It cannot be undone.</p>{deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}<div><button className="button button-quiet" onClick={() => setConfirmDelete(false)}>Keep event</button><button className="button button-danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={15} />}Delete event</button></div></div></div>}
      {viewingPhoto?.secureUrl && <div className="lightbox organizer-lightbox" role="dialog" aria-modal="true" aria-label="Event photograph viewer"><button className="lightbox-close" onClick={() => setViewingPhoto(null)} aria-label="Close photograph"><X size={20} /></button><img src={viewingPhoto.secureUrl} alt="Selected event photograph" /><div className="organizer-lightbox-actions"><span>{viewingPhoto.status.replace('_', ' ')}</span><button className="button button-danger" onClick={() => setConfirmPhotoDelete(viewingPhoto)}><Trash2 size={16} />Delete photo</button><a className="button button-light" href={viewingPhoto.secureUrl} target="_blank" rel="noreferrer"><Download size={16} />Open original</a></div></div>}
      {confirmPhotoDelete && <div className="modal-backdrop photo-delete-modal"><div className="confirm-modal"><span className="danger-icon"><Trash2 size={20} /></span><p className="section-kicker">Permanent action</p><h2>Delete this photograph?</h2><p>This removes the image from the event, Cloudinary, guest matches, and face-search index.</p>{deletePhotoMutation.error && <p className="form-error">{deletePhotoMutation.error.message}</p>}<div><button className="button button-quiet" onClick={() => setConfirmPhotoDelete(null)} disabled={deletePhotoMutation.isPending}>Keep photo</button><button className="button button-danger" onClick={() => deletePhotoMutation.mutate(confirmPhotoDelete.id)} disabled={deletePhotoMutation.isPending}>{deletePhotoMutation.isPending ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={15} />}Delete photo</button></div></div></div>}
    </>
  );
}
