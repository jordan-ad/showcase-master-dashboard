'use client';
import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { MOCK_INCIDENTS, CATEGORIES, type Incident, type Severity, type IncidentStatus } from './incidents-data';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<Severity, string> = {
  Low:    'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-100 text-amber-700',
  High:   'bg-red-100 text-red-700',
};

const STATUS_STYLES: Record<IncidentStatus, string> = {
  Resolved:    'bg-emerald-100 text-emerald-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Unresolved:  'bg-red-100 text-red-700',
};

const STATE_STYLES: Record<string, string> = {
  NSW: 'bg-[#1a2744]/10 text-[#1a2744]',
  VIC: 'bg-purple-50 text-purple-700',
  QLD: 'bg-orange-50 text-orange-700',
};

function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function StatsRow({ incidents }: { incidents: Incident[] }) {
  const total      = incidents.length;
  const open       = incidents.filter(i => i.status !== 'Resolved').length;
  const high       = incidents.filter(i => i.severity === 'High').length;
  const medium     = incidents.filter(i => i.severity === 'Medium').length;

  // top category
  const catCounts = incidents.reduce<Record<string, number>>((acc, i) => {
    acc[i.category] = (acc[i.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">Total</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
      </div>
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="text-xs text-red-500">Open / In Progress</p>
        <p className="mt-1 text-2xl font-bold text-red-600">{open}</p>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs text-amber-600">High · Medium</p>
        <p className="mt-1 text-2xl font-bold text-amber-700">
          {high} <span className="text-base font-normal text-amber-500">· {medium}</span>
        </p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">Top Category</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-900">
          {topCat ? topCat[0] : '—'}
        </p>
        {topCat && <p className="text-xs text-slate-400">{topCat[1]} incidents</p>}
      </div>
    </div>
  );
}

// ─── Expanded Row Detail ──────────────────────────────────────────────────────

function IncidentDetail({ incident }: { incident: Incident }) {
  return (
    <div className="grid grid-cols-1 gap-4 bg-slate-50 px-4 pb-4 pt-3 sm:grid-cols-2">
      <div className="space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Process &amp; Fix</p>
          <p className="text-sm leading-relaxed text-slate-700">{incident.process_and_fix || '—'}</p>
        </div>
        {incident.notes && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Notes</p>
            <p className="text-sm leading-relaxed text-slate-600">{incident.notes}</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
        {[
          { label: 'Project',           value: incident.project },
          { label: 'Developer',         value: incident.developer || '—' },
          { label: 'Project Marketer',  value: incident.project_marketer || '—' },
          { label: 'Contact',           value: incident.contact },
          { label: 'Assignee',          value: incident.assignee },
          { label: 'State',             value: incident.state },
        ].map(({ label, value }) => (
          <div key={label} className="min-w-[120px]">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-0.5 text-slate-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function IncidentRow({ incident, expanded, onToggle }: {
  incident: Incident;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${expanded ? 'bg-slate-50' : ''}`}
        onClick={onToggle}
      >
        <td className="py-3 pl-4 pr-2">
          <div className="flex items-center gap-1.5">
            {expanded
              ? <ChevronDown size={14} className="shrink-0 text-slate-400" />
              : <ChevronRight size={14} className="shrink-0 text-slate-300" />}
            <span className="font-mono text-xs text-slate-400">#{incident.ir_id}</span>
          </div>
        </td>
        <td className="px-3 py-3 text-xs text-slate-500">
          {format(new Date(incident.date), 'd MMM yyyy')}
        </td>
        <td className="px-3 py-3">
          <p className="line-clamp-2 max-w-xs text-sm font-medium text-slate-900">{incident.issue}</p>
        </td>
        <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell">{incident.project}</td>
        <td className="hidden px-3 py-3 sm:table-cell">
          <Pill label={incident.state} className={STATE_STYLES[incident.state] ?? 'bg-slate-100 text-slate-600'} />
        </td>
        <td className="hidden px-3 py-3 text-xs text-slate-500 md:table-cell">{incident.category}</td>
        <td className="px-3 py-3">
          <Pill label={incident.severity} className={SEVERITY_STYLES[incident.severity]} />
        </td>
        <td className="px-3 py-3">
          <Pill label={incident.status} className={STATUS_STYLES[incident.status]} />
        </td>
        <td className="hidden px-3 py-3 text-sm text-slate-500 sm:table-cell">{incident.assignee}</td>
      </tr>
      {expanded && (
        <tr className="border-b border-slate-100">
          <td colSpan={9} className="p-0">
            <IncidentDetail incident={incident} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IncidentsTab() {
  const [search, setSearch]           = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [sevFilter, setSevFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter]     = useState('all');
  const [expandedId, setExpandedId]   = useState<number | null>(null);

  const filtered = useMemo(() => {
    return MOCK_INCIDENTS.filter(i => {
      if (stateFilter !== 'all'  && i.state    !== stateFilter)  return false;
      if (sevFilter   !== 'all'  && i.severity !== sevFilter)    return false;
      if (statusFilter !== 'all' && i.status   !== statusFilter) return false;
      if (catFilter   !== 'all'  && i.category !== catFilter)    return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          i.issue.toLowerCase().includes(q) ||
          i.project.toLowerCase().includes(q) ||
          i.process_and_fix.toLowerCase().includes(q) ||
          i.contact.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, stateFilter, sevFilter, statusFilter, catFilter]);

  const selectClass = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none';

  return (
    <div className="space-y-4">
      <StatsRow incidents={MOCK_INCIDENTS} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search issue, project, fix..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a2744] focus:outline-none"
          />
        </div>
        <select value={stateFilter}  onChange={e => setStateFilter(e.target.value)}  className={selectClass}>
          <option value="all">All States</option>
          {['NSW', 'VIC', 'QLD'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sevFilter}    onChange={e => setSevFilter(e.target.value)}    className={selectClass}>
          <option value="all">All Severities</option>
          {['Low', 'Medium', 'High'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="all">All Statuses</option>
          {['Resolved', 'In Progress', 'Unresolved'].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={catFilter}    onChange={e => setCatFilter(e.target.value)}    className={selectClass}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} incidents</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-2.5 pl-4 pr-2 w-16">IR #</th>
                <th className="px-3 py-2.5 w-24">Date</th>
                <th className="px-3 py-2.5">Issue</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Project</th>
                <th className="hidden px-3 py-2.5 sm:table-cell w-16">State</th>
                <th className="hidden px-3 py-2.5 md:table-cell">Category</th>
                <th className="px-3 py-2.5 w-24">Severity</th>
                <th className="px-3 py-2.5 w-28">Status</th>
                <th className="hidden px-3 py-2.5 sm:table-cell">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <IncidentRow
                  key={inc.ir_id}
                  incident={inc}
                  expanded={expandedId === inc.ir_id}
                  onToggle={() => setExpandedId(expandedId === inc.ir_id ? null : inc.ir_id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No incidents match the selected filters</p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Dummy data — will sync from live Google Sheet once service account is configured.{' '}
        <a href="#" className="inline-flex items-center gap-1 text-[#1a2744] underline-offset-2 hover:underline">
          Open sheet <ExternalLink size={11} />
        </a>
      </p>
    </div>
  );
}
