'use client';
import { clsx } from 'clsx';

type Variant = 'healthy' | 'stale' | 'offline'
  | 'open' | 'in_progress' | 'resolved' | 'closed'
  | 'critical' | 'high' | 'medium' | 'low'
  | 'urgent' | 'standard' | 'no_rush'
  | 'under_review' | 'accepted' | 'declined' | 'shipped'
  | 'live' | 'pre_sign_off' | 'in_progress_phase' | 'end_of_life'
  | 'pending' | 'signed' | 'active' | 'expired' | 'terminated'
  | 'paid' | 'invoiced' | 'overdue'
  | 'default';

const VARIANT_CLASSES: Record<Variant, string> = {
  healthy:        'bg-emerald-100 text-emerald-800',
  stale:          'bg-amber-100 text-amber-800',
  offline:        'bg-red-100 text-red-800',
  open:           'bg-red-100 text-red-800',
  in_progress:    'bg-blue-100 text-blue-800',
  resolved:       'bg-emerald-100 text-emerald-800',
  closed:         'bg-slate-100 text-slate-600',
  critical:       'bg-red-600 text-white',
  high:           'bg-orange-100 text-orange-800',
  medium:         'bg-amber-100 text-amber-800',
  low:            'bg-slate-100 text-slate-600',
  urgent:         'bg-red-100 text-red-800',
  standard:       'bg-blue-100 text-blue-800',
  no_rush:        'bg-slate-100 text-slate-600',
  under_review:   'bg-amber-100 text-amber-800',
  accepted:       'bg-blue-100 text-blue-800',
  declined:       'bg-red-100 text-red-800',
  shipped:        'bg-emerald-100 text-emerald-800',
  live:           'bg-emerald-100 text-emerald-800',
  pre_sign_off:   'bg-slate-100 text-slate-600',
  in_progress_phase: 'bg-blue-100 text-blue-800',
  end_of_life:    'bg-slate-200 text-slate-500',
  pending:        'bg-slate-100 text-slate-600',
  signed:         'bg-blue-100 text-blue-800',
  active:         'bg-emerald-100 text-emerald-800',
  expired:        'bg-red-100 text-red-800',
  terminated:     'bg-red-100 text-red-800',
  paid:           'bg-emerald-100 text-emerald-800',
  invoiced:       'bg-amber-100 text-amber-800',
  overdue:        'bg-red-100 text-red-800',
  default:        'bg-slate-100 text-slate-600',
};

const LABELS: Partial<Record<Variant, string>> = {
  in_progress: 'In Progress',
  in_progress_phase: 'In Progress',
  pre_sign_off: 'Pre Sign Off',
  end_of_life: 'End of Life',
  under_review: 'Under Review',
  no_rush: 'No Rush',
};

interface BadgeProps {
  variant: Variant;
  label?: string;
  dot?: boolean;
  className?: string;
}

export default function Badge({ variant, label, dot = false, className }: BadgeProps) {
  const displayLabel = label ?? LABELS[variant] ?? variant.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.default, className)}>
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {displayLabel}
    </span>
  );
}
