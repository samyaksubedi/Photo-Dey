import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEvent } from '../lib/api';
import {
  buildPhotoBatches,
  uploadPhotoBatches,
  type PhotoBatch,
  type PhotoUploadProgress,
} from '../lib/photo-upload';

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxFileBytes = 50 * 1024 * 1024;
const maxEventPhotos = 5000;

type UploadSession = {
  eventId: string;
  batches: PhotoBatch[];
  completedBatchIds: Set<string>;
};

export function CreateEventPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadSessionRef = useRef<UploadSession | null>(null);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<PhotoUploadProgress | null>(null);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const previews = useMemo(
    () =>
      files.slice(0, 8).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [files],
  );
  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  const uploadLocked = createdEventId !== null;

  const addFiles = (incoming: File[]) => {
    if (uploadLocked) return;
    const valid = incoming.filter(
      (file) => acceptedTypes.includes(file.type) && file.size <= maxFileBytes,
    );
    setFiles((current) => [...current, ...valid].slice(0, maxEventPhotos));
    if (valid.length !== incoming.length) {
      setError(
        'Some files were skipped. Use JPG, PNG, or WEBP images under 50 MB.',
      );
    }
  };

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !files.length) return;
    setError('');
    setSubmitting(true);

    try {
      let session = uploadSessionRef.current;
      if (!session) {
        const batches = buildPhotoBatches(files);
        const response = await createEvent({
          name: name.trim(),
          expectedTotalPhotos: files.length,
        });
        session = {
          eventId: response.data.eventId,
          batches,
          completedBatchIds: new Set<string>(),
        };
        uploadSessionRef.current = session;
        setCreatedEventId(session.eventId);
      }

      await uploadPhotoBatches({
        eventId: session.eventId,
        batches: session.batches,
        completedBatchIds: session.completedBatchIds,
        onProgress: setProgress,
      });
      navigate(`/dashboard/events/${session.eventId}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? `${caught.message} You can safely retry; completed batches will not be duplicated.`
          : 'Could not upload the event photographs',
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="ce">
      <Link className="back-link" to="/dashboard/events">
        <ArrowLeft size={15} />Back to events
      </Link>
      <header className="page-head">
        <div>
          <h1>New event</h1>
          <p>Name it, add the photos, and PhotoDey does the rest.</p>
        </div>
      </header>

      <div className="ce-grid">
        <form className="ce-form" onSubmit={submit}>
          <label className="field">
            <span>Event name</span>
            <input
              required
              disabled={uploadLocked}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Maya and Aarav’s wedding"
            />
            <small>Guests see this name when they scan the QR code.</small>
          </label>

          <div className="field">
            <div className="field-row">
              <span>Photos</span>
              <small>{files.length ? `${files.length.toLocaleString()} selected` : 'JPG, PNG or WEBP, up to 50 MB each'}</small>
            </div>
            <div
              className={`dropzone${dragging ? ' is-dragging' : ''}${uploadLocked ? ' is-disabled' : ''}`}
              onDragOver={(event) => {
                event.preventDefault();
                if (!uploadLocked) setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={drop}
              onClick={() => !uploadLocked && inputRef.current?.click()}
              role="button"
              tabIndex={uploadLocked ? -1 : 0}
              onKeyDown={(event) => event.key === 'Enter' && !uploadLocked && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                hidden
                multiple
                disabled={uploadLocked}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => addFiles(Array.from(event.target.files ?? []))}
              />
              <span><UploadCloud size={26} /></span>
              <strong>Drop your photos here</strong>
              <p>or click to choose them from your computer</p>
            </div>
            {previews.length > 0 && (
              <div className="upload-preview-grid">
                {previews.map(({ file, url }, index) => (
                  <div key={`${file.name}-${index}`}>
                    <img src={url} alt="" />
                    {!uploadLocked && (
                      <button
                        type="button"
                        onClick={() =>
                          setFiles((current) =>
                            current.filter((_, fileIndex) => fileIndex !== index),
                          )
                        }
                        aria-label={`Remove ${file.name}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {files.length > previews.length && (
                  <span className="more-files">
                    +{files.length - previews.length}<small>more</small>
                  </span>
                )}
              </div>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}
          {progress && (
            <div className="upload-progress">
              <div>
                <span>Sending photos</span>
                <strong>{progress.percent}%</strong>
              </div>
              <i><span style={{ width: `${progress.percent}%` }} /></i>
              <div className="upload-count-progress">
                <strong>{progress.sentPhotos} of {progress.totalPhotos} photos sent</strong>
                <span>{progress.remainingPhotos} remaining</span>
              </div>
              <p>
                {progress.completedBatches} done · {progress.activeBatches} uploading · {progress.waitingBatches} waiting
              </p>
            </div>
          )}

          <div className="form-actions">
            <Link className="btn btn-ghost" to="/dashboard/events">Cancel</Link>
            <button
              className="btn btn-primary btn-lg"
              disabled={submitting || !name.trim() || !files.length}
            >
              {submitting ? (
                <><LoaderCircle className="spin" size={17} />Sending photos</>
              ) : createdEventId ? (
                <><UploadCloud size={17} />Retry upload</>
              ) : (
                <>Create event <ArrowRight size={17} /></>
              )}
            </button>
          </div>
        </form>

        <aside className="ce-aside">
          <h2>What happens next</h2>
          <ol>
            <li><b>Your photos upload</b><span>In safe batches, three at a time. Keep this tab open until it finishes.</span></li>
            <li><b>Faces are matched</b><span>This runs in the background, and you can watch the progress on the event page.</span></li>
            <li><b>You get a QR code</b><span>Print it or share the link. Guests do the rest on Telegram.</span></li>
          </ol>
          <p className="ce-limit"><ImagePlus size={16} />Up to 5,000 photos per event.</p>
        </aside>
      </div>
    </div>
  );
}
