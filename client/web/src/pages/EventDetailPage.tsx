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
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageLoader } from '../components/PageState';
import { Scene, coverKind } from '../components/Scene';
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
          file.size <= 50 * 1024 * 1024,
      )
      .slice(0, 5000);
    if (!valid.length) {
      setAddError('Choose JPG, PNG, or WEBP images under 50 MB.');
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

  const dateLabel = new Date(event.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
      <Link className="back-link" to="/dashboard/events"><ArrowLeft size={15} />All events</Link>

      <header className="ed-head">
        <div className="ed-cover"><Scene kind={coverKind(event.name, event.id)} /></div>
        <div className="ed-title">
          <div className="ed-meta"><StatusBadge status={status.status} /><span>{dateLabel}</span></div>
          <h1>{event.name}</h1>
          <p>{status.receivedPhotos.toLocaleString()} of {status.totalPhotos.toLocaleString()} photos received</p>
        </div>
        <div className="ed-actions">
          <input ref={photoInputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(inputEvent) => { const incoming = Array.from(inputEvent.target.files ?? []); inputEvent.target.value = ''; addPhotos(incoming); }} />
          <button className="btn btn-primary" onClick={() => addSessionRef.current ? void runAddPhotoUpload() : photoInputRef.current?.click()} disabled={addingPhotos}>
            {addingPhotos ? <LoaderCircle className="spin" size={16} /> : addSessionRef.current ? <UploadCloud size={16} /> : <ImagePlus size={16} />}
            {addingPhotos ? 'Sending photos' : addSessionRef.current ? 'Retry upload' : 'Add photos'}
          </button>
          <button className="btn btn-ghost" onClick={() => toggleMutation.mutate(!event.publicEnabled)} disabled={toggleMutation.isPending} aria-pressed={event.publicEnabled}>
            <Power size={16} />Guest search {event.publicEnabled ? 'on' : 'off'}
          </button>
          <button className="app-icon-btn is-danger" onClick={() => setConfirmDelete(true)} aria-label="Delete event"><Trash2 size={18} /></button>
        </div>
      </header>

      {(addProgress || addError) && (
        <div className="upload-progress">
          {addProgress && (
            <>
              <div><span>Sending additional photos</span><strong>{addProgress.percent}%</strong></div>
              <i><span style={{ width: `${addProgress.percent}%` }} /></i>
              <div className="upload-count-progress"><strong>{addProgress.sentPhotos} of {addProgress.totalPhotos} photos sent</strong><span>{addProgress.remainingPhotos} remaining</span></div>
              <p>{addProgress.completedBatches} done · {addProgress.activeBatches} uploading · {addProgress.waitingBatches} waiting</p>
            </>
          )}
          {addError && <p className="form-error">{addError}</p>}
        </div>
      )}

      <section className="ed-pipeline">
        <div className="ed-pipeline-top">
          <div>
            <h2>{ready ? 'Ready to share' : 'Preparing your photos'}</h2>
            <p>{ready ? 'Guests can scan the QR code and find their photos now.' : 'Faces are being matched in the background. This page updates by itself.'}</p>
          </div>
          <strong className="ed-pct">{progress}%</strong>
        </div>
        <div className="bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Processing progress"><u style={{ width: `${progress}%` }} /></div>
        <dl className="ed-stats">
          <div><dd>{status.uploadedPhotos.toLocaleString()}</dd><dt>Uploaded</dt></div>
          <div><dd>{status.processingPhotos.toLocaleString()}</dd><dt>Processing</dt></div>
          <div><dd>{status.completedPhotos.toLocaleString()}</dd><dt>Matched and ready</dt></div>
          <div className={status.failedPhotos ? 'has-fail' : ''}><dd>{status.failedPhotos.toLocaleString()}</dd><dt>Failed</dt></div>
        </dl>
      </section>

      <div className="ed-grid">
        <section className="ed-library">
          <div className="block-head"><h2>All photos</h2><span className="muted">{(photosQuery.data?.length ?? 0).toLocaleString()} files</span></div>
          {photosQuery.isLoading ? (
            <PageLoader label="Loading photos" />
          ) : photosQuery.data?.length ? (
            <div className="photo-grid">
              {photosQuery.data.map((photo, index) => photo.secureUrl ? (
                <button className="photo-tile" key={photo.id} onClick={() => setViewingPhoto(photo)} aria-label={`Open photo ${index + 1}`}>
                  <img src={photo.secureUrl} alt={`Event photo ${index + 1}`} loading="lazy" />
                  <span className={`photo-state photo-${photo.status.toLowerCase()}`}>{photo.status.replace('_', ' ').toLowerCase()}</span>
                  <span className="photo-open"><Maximize2 size={14} /></span>
                </button>
              ) : (
                <div className="photo-tile photo-missing" key={photo.id}><ImageOff size={19} /><span>{photo.status.replace('_', ' ').toLowerCase()}</span></div>
              ))}
            </div>
          ) : (
            <div className="photo-empty"><ImageOff size={22} /><p>Photos you upload will appear here.</p></div>
          )}
        </section>

        <aside className="ed-share">
          <div className="block-head"><h2>Guest QR code</h2><span className={`access-dot${event.publicEnabled ? ' is-on' : ''}`}>{event.publicEnabled ? 'Live' : 'Off'}</span></div>
          <div className={`qr-card${!ready || !event.publicEnabled ? ' is-disabled' : ''}`} ref={qrRef}>
            <QRCodeSVG value={publicUrl} size={180} level="H" marginSize={2} bgColor="#ffffff" fgColor="#2B0E18" />
            <span className="qr-brand">Scan to find your photos</span>
          </div>
          <p className="muted">{!ready ? 'The QR code is ready to share once processing finishes.' : event.publicEnabled ? 'Guests scan this, open Telegram, and send one selfie.' : 'Turn guest search on before sharing this QR code.'}</p>
          <div className="qr-actions">
            <button onClick={copyLink} className="btn btn-ghost" disabled={!ready || !event.publicEnabled}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : 'Copy link'}</button>
            <button onClick={downloadQr} className="btn btn-primary" disabled={!ready || !event.publicEnabled}><Download size={16} />Download QR</button>
          </div>
          {ready && event.publicEnabled && <a className="link-arrow" href={publicUrl} target="_blank" rel="noreferrer">Preview guest page <ExternalLink size={14} /></a>}
        </aside>
      </div>

      {confirmDelete && (
        <div className="modal-backdrop">
          <div className="modal" role="alertdialog" aria-modal="true">
            <span className="modal-icon"><Trash2 size={20} /></span>
            <h2>Delete {event.name}?</h2>
            <p>This permanently removes the event, its photos, guest sessions and face data. It cannot be undone.</p>
            {deleteMutation.error && <p className="form-error">{deleteMutation.error.message}</p>}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>Keep event</button>
              <button className="btn btn-danger" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>{deleteMutation.isPending ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={15} />}Delete event</button>
            </div>
          </div>
        </div>
      )}
      {viewingPhoto?.secureUrl && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button className="lightbox-close" onClick={() => setViewingPhoto(null)} aria-label="Close photo"><X size={20} /></button>
          <img src={viewingPhoto.secureUrl} alt="Selected event photo" />
          <div className="lightbox-actions">
            <span>{viewingPhoto.status.replace('_', ' ').toLowerCase()}</span>
            <button className="btn btn-danger" onClick={() => setConfirmPhotoDelete(viewingPhoto)}><Trash2 size={16} />Delete photo</button>
            <a className="btn btn-light" href={viewingPhoto.secureUrl} target="_blank" rel="noreferrer"><Download size={16} />Open original</a>
          </div>
        </div>
      )}
      {confirmPhotoDelete && (
        <div className="modal-backdrop modal-top">
          <div className="modal" role="alertdialog" aria-modal="true">
            <span className="modal-icon"><Trash2 size={20} /></span>
            <h2>Delete this photo?</h2>
            <p>This removes it from the event, from guest matches and from the face-search index.</p>
            {deletePhotoMutation.error && <p className="form-error">{deletePhotoMutation.error.message}</p>}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmPhotoDelete(null)} disabled={deletePhotoMutation.isPending}>Keep photo</button>
              <button className="btn btn-danger" onClick={() => deletePhotoMutation.mutate(confirmPhotoDelete.id)} disabled={deletePhotoMutation.isPending}>{deletePhotoMutation.isPending ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={15} />}Delete photo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
