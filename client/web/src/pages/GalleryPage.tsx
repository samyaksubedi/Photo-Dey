import { useQuery } from '@tanstack/react-query';
import JSZip from 'jszip';
import {
  Check,
  CheckSquare2,
  Download,
  Images,
  LoaderCircle,
  Share2,
  Square,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Brand } from '../components/Brand';
import { ApiClientError, apiRequest } from '../lib/api';
import type { GalleryPhoto } from '../types';

const extensionFor = (contentType: string, url: string) => {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';
  const urlExtension = url.split('?')[0]?.split('.').pop()?.toLowerCase();
  return urlExtension && /^[a-z0-9]{2,5}$/.test(urlExtension) ? urlExtension : 'jpg';
};

export function GalleryPage() {
  const { searchRequestId } = useParams();
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState('');
  const [preparedFiles, setPreparedFiles] = useState<File[] | null>(null);
  const query = useQuery({
    queryKey: ['gallery', searchRequestId],
    queryFn: async () => (await apiRequest<{ photos: GalleryPhoto[] }>(`/galleries/${searchRequestId}`)).data.photos,
    enabled: Boolean(searchRequestId),
    retry: (count, error) => error instanceof ApiClientError && error.status === 202 && count < 8,
    retryDelay: 2500,
  });

  const downloadablePhotos = useMemo(
    () => query.data?.filter((match) => Boolean(match.photo.secureUrl)) ?? [],
    [query.data],
  );
  const selectedPhotos = useMemo(
    () => downloadablePhotos.filter((match) => selectedIds.has(match.photo.id)),
    [downloadablePhotos, selectedIds],
  );

  const togglePhoto = (photoId: string) => {
    setPreparedFiles(null);
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const toggleSelectionMode = () => {
    setSelectionMode((current) => !current);
    setSelectedIds(new Set());
    setDownloadError('');
    setPreparedFiles(null);
  };

  const toggleAll = () => {
    setPreparedFiles(null);
    setSelectedIds((current) => current.size === downloadablePhotos.length
      ? new Set()
      : new Set(downloadablePhotos.map((match) => match.photo.id)));
  };

  const fetchSelectedFiles = async () => Promise.all(selectedPhotos.map(async (match, index) => {
    const url = match.photo.secureUrl;
    if (!url) throw new Error('One of the selected photographs is unavailable');
    const response = await fetch(url);
    if (!response.ok) throw new Error('One of the selected originals could not be downloaded');
    const blob = await response.blob();
    const extension = extensionFor(blob.type, url);
    return new File(
      [blob],
      `photodey-moment-${String(index + 1).padStart(2, '0')}.${extension}`,
      { type: blob.type || `image/${extension}` },
    );
  }));

  const downloadZip = async (files: File[]) => {
      const zip = new JSZip();
      files.forEach((file) => zip.file(file.name, file));
      const archive = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => setDownloadProgress(Math.round(metadata.percent)),
      );
      const archiveUrl = URL.createObjectURL(archive);
      const anchor = document.createElement('a');
      anchor.href = archiveUrl;
      anchor.download = `photodey-gallery-${searchRequestId?.slice(0, 8) ?? 'photos'}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(archiveUrl), 1_000);
  };

  const prepareSelected = async () => {
    if (!selectedPhotos.length || downloading) return;
    setDownloading(true);
    setDownloadProgress(0);
    setDownloadError('');
    try {
      const files = await fetchSelectedFiles();
      const prefersNativeShare = window.matchMedia('(max-width: 900px) and (pointer: coarse)').matches;
      const canShareFiles = prefersNativeShare
        && typeof navigator.share === 'function'
        && typeof navigator.canShare === 'function'
        && navigator.canShare({ files });

      if (canShareFiles) {
        setPreparedFiles(files);
      } else {
        await downloadZip(files);
      }
    } catch (caught) {
      setDownloadError(caught instanceof Error ? caught.message : 'Could not prepare the selected photographs');
    } finally {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const sharePrepared = async () => {
    if (!preparedFiles?.length || downloading) return;
    try {
      await navigator.share({
        files: preparedFiles,
        title: 'My PhotoDey moments',
        text: 'Selected photographs from my private PhotoDey gallery.',
      });
      setSelectionMode(false);
      setSelectedIds(new Set());
      setPreparedFiles(null);
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      setDownloading(true);
      setDownloadError('Native sharing was unavailable, so we downloaded a ZIP instead.');
      try {
        await downloadZip(preparedFiles);
      } catch {
        setDownloadError('The photos could not be shared or downloaded. Please try again.');
      } finally {
        setDownloading(false);
        setDownloadProgress(0);
      }
    }
  };

  return (
    <main className="gallery-shell">
      <nav className="gallery-nav"><Brand /><span>Your private event gallery</span></nav>
      {query.isLoading ? <div className="gallery-state"><LoaderCircle className="spin" size={24} /><h1>Preparing your gallery.</h1><p>We’re collecting your matching moments.</p></div> : query.error ? <div className="gallery-state"><Images size={26} /><h1>This gallery isn’t available.</h1><p>{query.error.message}</p><Link to="/" className="button button-dark">Visit PhotoDey</Link></div> : !query.data?.length ? <div className="gallery-state"><Images size={26} /><h1>No matching moments yet.</h1><p>Try another clear, front-facing selfie through the event’s Telegram link.</p></div> : <>
        <header className="gallery-head"><div><p className="section-kicker">Your moments</p><h1>We found <em>{query.data.length}</em><br />photograph{query.data.length === 1 ? '' : 's'} of you.</h1></div><div className="gallery-head-actions"><p>{selectionMode ? 'Choose the moments you want to keep.' : 'Open a photograph, or choose several to save together.'}</p><button className="gallery-select-toggle" onClick={toggleSelectionMode}>{selectionMode ? <X size={16} /> : <CheckSquare2 size={16} />}{selectionMode ? 'Done' : 'Select'}</button></div></header>
        {selectionMode && <div className="selection-toolbar"><button className="selection-all" onClick={toggleAll}>{selectedIds.size === downloadablePhotos.length ? <CheckSquare2 size={17} /> : <Square size={17} />}{selectedIds.size === downloadablePhotos.length ? 'Clear all' : 'Select all'}</button><span>{preparedFiles ? 'Ready on your device' : `${selectedIds.size} selected`}</span><button className="selection-primary" onClick={preparedFiles ? sharePrepared : prepareSelected} disabled={!selectedIds.size || downloading}>{downloading ? <LoaderCircle className="spin" size={15} /> : preparedFiles ? <Share2 size={15} /> : <Download size={15} />}{downloading ? (downloadProgress ? `Packing ${downloadProgress}%` : 'Preparing…') : preparedFiles ? 'Share or save' : `Save ${selectedIds.size || ''}`}</button></div>}
        {downloadError && <p className="gallery-download-error">{downloadError}</p>}
        <section className={`masonry-gallery${selectionMode ? ' is-selecting' : ''}`}>{downloadablePhotos.map((match, index) => {
          const isSelected = selectedIds.has(match.photo.id);
          return <button key={match.photo.id} onClick={() => selectionMode ? togglePhoto(match.photo.id) : setLightboxPhoto(match)} className={`gallery-item gallery-item-${(index % 5) + 1}${isSelected ? ' is-selected' : ''}`} aria-label={selectionMode ? `${isSelected ? 'Deselect' : 'Select'} photograph ${index + 1}` : `Open photograph ${index + 1}`} aria-pressed={selectionMode ? isSelected : undefined}><img src={match.photo.secureUrl ?? ''} alt={`Matched event photograph ${index + 1}`} loading="lazy" />{selectionMode ? <span className="gallery-select-indicator">{isSelected ? <Check size={16} /> : null}</span> : null}</button>;
        })}</section>
      </>}
      <footer className="gallery-footer"><Brand /><p>Your moments, our focus.</p></footer>
      {lightboxPhoto?.photo.secureUrl && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photograph viewer"><button className="lightbox-close" onClick={() => setLightboxPhoto(null)} aria-label="Close photo"><X size={20} /></button><img src={lightboxPhoto.photo.secureUrl} alt="Selected matched event photograph" /><a className="button button-light" href={lightboxPhoto.photo.secureUrl} download target="_blank" rel="noreferrer"><Download size={16} />Open original</a></div>}
    </main>
  );
}
