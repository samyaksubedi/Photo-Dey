import { useState, type CSSProperties } from 'react';
import { photoSrc } from '../lib/photos';

export function Photo({
  id,
  width = 800,
  position = 'center',
  eager = false,
  alt = '',
  className = '',
}: {
  id: string;
  width?: number;
  position?: string;
  eager?: boolean;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className={`photo photo-fail ${className}`} aria-hidden="true" />;
  return (
    <img
      className={`photo ${className}`}
      src={photoSrc(id, width)}
      srcSet={`${photoSrc(id, width)} 1x, ${photoSrc(id, width * 2)} 2x`}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ objectPosition: position }}
      onError={() => setFailed(true)}
    />
  );
}

export function MatchBox({
  left,
  top,
  width,
  height,
  label,
  hot = false,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  label?: string;
  hot?: boolean;
}) {
  const style: CSSProperties = { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` };
  return (
    <div className={`mbox${hot ? ' is-hot' : ''}`} style={style} aria-hidden="true">
      {label && <span>{label}</span>}
    </div>
  );
}
