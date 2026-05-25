'use client';
import { useState } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Plus, ChevronRight, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { mockIncidents, mockIncidentDetail } from '../../lib/mock-data';
import type { Incident, IncidentPriority, IncidentStatus, IncidentDetail } from '../../types';

const PRIORITY_ORDER: Record<IncidentPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

function IncidentRow({ incident, onClick }: { incident: Incident; onClick: () => void }) {
  return (
    <tr
      className="group cursor-pointer border-b border-slate-100 hover:bg-slate-50"
      onClick={onClick}
    >
      <td className="py-3 pl-4 pr-2">
        <Badge variant={incident.priority} />
      </td>
      <td className="px-3 py-3">
        <p className="font-medium text-slate-900">{incident.title}</p>
        {incident.nuc_identifier && (
          <p className="mt-0.5 font-mono text-xs text-slate-400">{incident.nuc_identifier}</p>
        )}
      </td>
      <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell">
        {incident.project_name ?? '—'}
      </td>
      <td className="px-3 py-3">
        <Badge variant={incident.status} />
      </td>
      <td className="hidden px-3 py-3 text-xs text-slate-400 sm:table-cell">
        {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
      </td>
      <td className="px-3 py-3">
        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
      </td>
    </tr>
  );
}

function IncidentDetailModal({ incident, onClose }: { incident: IncidentDetail; onClose: () => void }) {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<IncidentStatus>(incident.status);

  return (
    <Modal open title={incident.title} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Priority', value: <Badge variant={incident.priority} /> },
            { label: 'Status', value: <Badge variant={status} /> },
            { label: 'Project', value: incident.project_name ?? '—' },
            { label: 'NUC', value: incident.nuc_identifier ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3">
              <p className="mb-1 text-xs text-slate-500">{label}</p>
              <div className="text-sm font-medium text-slate-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        {incident.description && (
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="mb-1 text-xs font-medium text-slate-500">Description</p>
            <p className="text-sm text-slate-700">{incident.description}</p>
          </div>
        )}

        {/* Status updater */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">Update Status</label>
          <div className="flex flex-wrap gap-2">
            {(['open', 'in_progress', 'resolved', 'closed'] as IncidentStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  status === s
                    ? 'border-[#1a2744] bg-[#1a2744] text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <MessageSquare size={14} />
            Comments ({incident.comments.length})
          </h3>
          <div className="space-y-3">
            {incident.comments.map(c => (
              <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-1.5 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-[#1a2744] text-[10px] font-bold text-white">
                    {(c.author_name ?? 'U')[0]}
                  </div>
                  <span className="text-xs font-medium text-slate-700">{c.author_name}</span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{c.body}</p>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="mt-3">
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a2744] focus:outline-none focus:ring-1 focus:ring-[#1a2744]"
            />
            <div className="mt-2 flex justify-end">
              <button
                disabled={!comment.trim()}
                className="rounded-lg bg-[#1a2744] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#243860] disabled:opacity-50"
              >
                Post Comment
              </button>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            Opened {format(new Date(incident.created_at), 'd MMM yyyy, HH:mm')}
          </span>
          {incident.resolved_at && (
            <span>Resolved {format(new Date(incident.resolved_at), 'd MMM yyyy, HH:mm')}</span>
          )}
        </div>
      </div>
    </Modal>
  );
}

function CreateIncidentModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', project_id: '', nuc_id: '' });
  return (
    <Modal open title="New Incident" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Title *</label>
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Describe the incident"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1a2744] focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Priority *</label>
          <select
            value={form.priority}
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1a2744] focus:outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            rows={4}
            placeholder="Additional context..."
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1a2744] focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button
            disabled={!form.title}
            className="rounded-lg bg-[#1a2744] px-4 py-2 text-sm font-medium text-white hover:bg-[#243860] disabled:opacity-50"
          >
            Create Incident
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default function IncidentLog() {
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const sorted = [...mockIncidents]
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .filter(i => {
      if (statusFilter !== 'all' && i.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && i.priority !== priorityFilter) return false;
      return true;
    });

  const openCount = mockIncidents.filter(i => ['open', 'in_progress'].includes(i.status)).length;

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5">
          <AlertCircle size={14} className="text-red-500" />
          <span className="text-sm font-semibold text-red-700">{openCount} open</span>
        </div>
        <div className="flex flex-1 flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as IncidentStatus | 'all')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as IncidentPriority | 'all')}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#243860]"
        >
          <Plus size={15} />
          New Incident
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
              <th className="py-2.5 pl-4 pr-2">Priority</th>
              <th className="px-3 py-2.5">Title</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Project</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Created</th>
              <th className="w-6 px-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map(inc => (
              <IncidentRow key={inc.id} incident={inc} onClick={() => setSelectedId(inc.id)} />
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No incidents match the selected filters</p>
        )}
      </div>

      {selectedId && (
        <IncidentDetailModal incident={mockIncidentDetail} onClose={() => setSelectedId(null)} />
      )}
      {creating && <CreateIncidentModal onClose={() => setCreating(false)} />}
    </div>
  );
}
