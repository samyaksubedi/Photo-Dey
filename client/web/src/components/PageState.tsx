import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return <div className="page-loader"><LoaderCircle className="spin" size={22} /><span>{label}</span></div>;
}

export function EmptyState({
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <img src="/logo-mark.png" alt="" width="64" height="64" />
      <h2>{title}</h2>
      <p>{body}</p>
      {action}
    </div>
  );
}
