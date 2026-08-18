import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, Trash2, UploadCloud } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { uploadEvent } from '../lib/api';

const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export function CreateEventPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const previews = useMemo(() => files.slice(0, 8).map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);

  const addFiles = (incoming: File[]) => {
    const valid = incoming.filter((file) => acceptedTypes.includes(file.type) && file.size <= 20 * 1024 * 1024);
    setFiles((current) => [...current, ...valid].slice(0, 1000));
    if (valid.length !== incoming.length) setError('Some files were skipped. Use JPG, PNG, or WEBP images under 20 MB.');
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
    const formData = new FormData();
    formData.append('name', name.trim());
    files.forEach((file) => formData.append('photos', file));
    try {
      const response = await uploadEvent(formData, setProgress);
      navigate(`/dashboard/events/${response.data.event.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create event');
      setSubmitting(false);
    }
  };

  return (
    <div className="create-event-page">
      <Link className="back-link" to="/dashboard/events"><ArrowLeft size={15} />Back to events</Link>
      <div className="create-event-head"><p className="section-kicker">New event</p><h1>Create the space<br />for every <em>moment.</em></h1><p>Give the event a name, add its photographs, and PhotoDey will handle the rest in the background.</p></div>
      <form className="create-event-form" onSubmit={submit}>
        <section className="form-section"><div className="form-section-number">01</div><div className="form-section-body"><label className="large-field">Event name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Maya & Aarav’s Wedding" /></label><p>This is visible to guests when they scan the event QR.</p></div></section>
        <section className="form-section"><div className="form-section-number">02</div><div className="form-section-body"><div className="form-label">Event photographs <span>{files.length ? `${files.length} selected` : 'JPG, PNG or WEBP · max 20 MB each'}</span></div><div className={`dropzone${dragging ? ' is-dragging' : ''}`} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop} onClick={() => inputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}><input ref={inputRef} hidden multiple type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => addFiles(Array.from(e.target.files ?? []))} /><span><UploadCloud size={24} /></span><strong>Drop your photographs here</strong><p>or choose files from your computer</p></div>{previews.length > 0 && <div className="upload-preview-grid">{previews.map(({ file, url }, index) => <div key={`${file.name}-${index}`}><img src={url} alt="" /><button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove ${file.name}`}><Trash2 size={13} /></button></div>)}{files.length > previews.length && <span className="more-files">+{files.length - previews.length}<small>more</small></span>}</div>}</div></section>
        {error && <p className="form-error form-error-wide">{error}</p>}
        {submitting && <div className="upload-progress"><div><span>Uploading event</span><strong>{progress}%</strong></div><i><span style={{ width: `${progress}%` }} /></i><p>Keep this page open while the photographs reach PhotoDey.</p></div>}
        <div className="form-actions"><Link className="button button-quiet" to="/dashboard/events">Cancel</Link><button className="button button-accent" disabled={submitting || !name.trim() || !files.length}>{submitting ? <><LoaderCircle className="spin" size={17} />Creating event</> : <>Create event <ArrowRight size={17} /></>}</button></div>
      </form>
      <aside className="upload-note"><ImagePlus size={18} /><p><strong>What happens next?</strong>Your photos upload securely, then face matching runs one photograph at a time. You can leave the dashboard once uploading finishes.</p></aside>
    </div>
  );
}
