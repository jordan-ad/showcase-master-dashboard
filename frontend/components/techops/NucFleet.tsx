'use client';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Monitor, X, Clock, MapPin } from 'lucide-react';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { mockNucs, mockNucSummary, mockNucDetail } from '../../lib/mock-data';
import type { Nuc, NucStatus, AustralianState } from '../../types';

const STATUS_DOT = {
  healthy: 'bg-emerald-400',
  stale: 'bg-amber-400',
  offline: 'bg-red-400',
};

function NucCard({ nuc, onClick }: { nuc: Nuc; onClick: () => void }) {
  const lastSeen = nuc.last_seen_at
    ? formatDistanceToNow(new Date(nuc.last_seen_at), { addSuffix: true })
    : 'Never';

  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl border border-slate-200 bg-white p-0 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20"
    >
      {/* Screenshot thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl bg-slate-100">
        {nuc.last_screenshot_url ? (
          <img src={nuc.last_screenshot_url} alt={nuc.nuc_id} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Monitor size={32} className="text-slate-300" />
          </div>
        )}
        {/* Status indicator */}
        <span className={`absolute right-2 top-2 size-2.5 rounded-full ${STATUS_DOT[nuc.status]} ring-2 ring-white`} />
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-sm font-semibold text-slate-900">{nuc.nuc_id}</p>
            <p className="truncate text-xs text-slate-500">{nuc.project_name ?? '—'}</p>
          </div>
          <Badge variant={nuc.status} />
        </div>
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {lastSeen}
          </span>
          {nuc.state && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {nuc.state}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function NucDetailModal({ nucId, onClose }: { nucId: string; onClose: () => void }) {
  // In production this would be fetched from the API
  const detail = mockNucDetail;
  return (
    <Modal open title={`NUC Detail — ${detail.nuc_id}`} onClose={onClose} size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Status', value: <Badge variant={detail.status} /> },
            { label: 'Project', value: detail.project_name ?? '—' },
            { label: 'State', value: detail.state ?? '—' },
            { label: 'Last Seen', value: detail.last_seen_at ? formatDistanceToNow(new Date(detail.last_seen_at), { addSuffix: true }) : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <p className="mb-1 text-xs text-slate-500">{label}</p>
              <p className="text-sm font-medium text-slate-900">{value}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">7-Day Screenshot History</h3>
          <div className="grid grid-cols-7 gap-2">
            {detail.screenshots.map((ss, i) => (
              <div key={ss.id} className="space-y-1">
                <div className="aspect-video overflow-hidden rounded-lg bg-slate-100">
                  <img src={ss.screenshot_url} alt={`Day ${i + 1}`} className="h-full w-full object-cover" />
                </div>
                <p className="text-center text-[10px] text-slate-400">
                  {new Date(ss.captured_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function NucFleet() {
  const [stateFilter, setStateFilter] = useState<AustralianState | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<NucStatus | 'all'>('all');
  const [selectedNucId, setSelectedNucId] = useState<string | null>(null);

  const filtered = mockNucs.filter(n => {
    if (stateFilter !== 'all' && n.state !== stateFilter) return false;
    if (statusFilter !== 'all' && n.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Healthy', count: mockNucSummary.healthy, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Stale',   count: mockNucSummary.stale,   color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
          { label: 'Offline', count: mockNucSummary.offline, color: 'text-red-600',      bg: 'bg-red-50 border-red-100' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 ${bg}`}>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value as AustralianState | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none"
        >
          <option value="all">All States</option>
          {['NSW', 'VIC', 'QLD', 'SA', 'WA'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as NucStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="healthy">Healthy</option>
          <option value="stale">Stale</option>
          <option value="offline">Offline</option>
        </select>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} NUCs</span>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filtered.map(nuc => (
          <NucCard key={nuc.id} nuc={nuc} onClick={() => setSelectedNucId(nuc.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
          No NUCs match the selected filters
        </div>
      )}

      {selectedNucId && (
        <NucDetailModal nucId={selectedNucId} onClose={() => setSelectedNucId(null)} />
      )}
    </div>
  );
}
