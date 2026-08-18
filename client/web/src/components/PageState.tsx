import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return <div className="page-loader"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function EmptyState({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="mini-label">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}
