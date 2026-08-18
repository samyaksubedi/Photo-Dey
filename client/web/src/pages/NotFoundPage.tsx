import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Brand } from '../components/Brand';

export function NotFoundPage() {
  return <main className="centered-page"><Brand /><div className="verification-card"><p className="section-kicker">404</p><h1>That moment is gone.</h1><p>The page you’re looking for doesn’t exist or has moved.</p><Link className="button button-dark" to="/"><ArrowLeft size={15} />Return home</Link></div></main>;
}
