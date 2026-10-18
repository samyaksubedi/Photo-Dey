import { useState } from 'react';

// Cloudinary delivery URL -> small, cropped thumbnail. Other URLs pass through.
const thumb = (url: string, width: number) =>
  url.includes('/upload/') ? url.replace('/upload/', `/upload/c_fill,g_auto,w_${width},h_${Math.round(width * 0.625)},q_auto,f_auto/`) : url;

export function EventCover({ url, width = 640 }: { url?: string | null; width?: number }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return (
      <div className="cover-empty" aria-hidden="true">
        <img src="/logo-mark.png" alt="" />
      </div>
    );
  }
  return (
    <img
      className="photo"
      src={thumb(url, width)}
      srcSet={`${thumb(url, width)} 1x, ${thumb(url, width * 2)} 2x`}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
