import type { EventStatus } from '../types';

const labels: Record<EventStatus, string> = {
  CREATED: 'Created',
  PROCESSING: 'Processing',
  COMPLETED: 'Ready',
  PARTIAL_FAILURE: 'Ready · partial',
  FAILED: 'Failed',
};

export function StatusBadge({ status }: { status: EventStatus }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}>{labels[status]}</span>;
}
