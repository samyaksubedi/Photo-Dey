import { Link } from 'react-router-dom';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link className={`wordmark${light ? ' wordmark-light' : ''}`} to="/" aria-label="PhotoDey home">
      <span className="wordmark-mark"><img src="/logo.png" alt="" /></span>
      <span>PhotoDey</span>
    </Link>
  );
}
