'use client';
import { useState, useMemo } from 'react';
import { Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { UpdateTicket, AssetBoardItem } from '../../types';
import { BALI_TEAM, STAGE_LABELS } from './asset-constants';

const STATUS_STYLES = {
  open:        'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-emerald-100 text-emerald-700',
} as const;

const STATUS_LABELS = {
  open:        'Open',
  in_progress: 'In Progress',
  done:        'Done',
} as const;

const PRIORITY_STYLES = {
  urgent:   'bg-red-100 text-red-700',
  standard: 'bg-blue-100 text-blue-700',
  no_rush:  'bg-slate-100 text-slate-500',
} as const;

const PRIORITY_LABELS = {
  urgent:   'Urgent',
  standard: 'Standard',
  no_rush:  'No Rush',
} as const;

interface Props {
  tickets: UpdateTicket[];
  items: AssetBoardItem[];
}

export default function AllUpdatesView({ tickets, items }: Props) {
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const itemMap = useMemo(
    () => Object.fromEntries(items.map(i => [i.id, i])),
    [items],
  );

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter   !== 'all' && t.status        !== statusFilter)   return false;
      if (priorityFilter !== 'all' && t.priority      !== priorityFilter) return false;
      if (assigneeFilter !== 'all' && t.assignee_name !== assigneeFilter) return false;
      if (search) {
        const q    = search.toLowerCase();
        const proj = itemMap[t.asset_item_id]?.project_name ?? '';
        return (
          t.title.toLowerCase().includes(q) ||
          proj.toLowerCase().includes(q) ||
          (t.assignee_name ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, statusFilter, priorityFilter, assigneeFilter, search, itemMap]);

  const selectClass = 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none';

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search updates or project..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a2744] focus:outline-none"
          />
        </div>
        <select value={statusFilter}   onChange={e => setStatusFilter(e.target.value)}   className={selectClass}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={selectClass}>
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="standard">Standard</option>
          <option value="no_rush">No Rush</option>
        </select>
        <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className={selectClass}>
          <option value="all">All Assignees</option>
          {BALI_TEAM.map(m => <option key={m}>{m}</option>)}
        </select>
        <span className="ml-auto text-xs text-slate-400">{filtered.length} updates</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2.5">Update</th>
                <th className="px-4 py-2.5">Project</th>
                <th className="px-4 py-2.5 w-24">Priority</th>
                <th className="px-4 py-2.5 w-28">Status</th>
                <th className="hidden px-4 py-2.5 sm:table-cell">Assignee</th>
                <th className="hidden px-4 py-2.5 sm:table-cell w-24">Deadline</th>
                <th className="w-8 px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => {
                const item = itemMap[ticket.asset_item_id];
                return (
                  <tr key={ticket.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className={`text-sm font-medium ${ticket.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {ticket.title}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{item?.project_name ?? '—'}</p>
                      {item && (
                        <p className="text-xs text-slate-400">{STAGE_LABELS[item.stage]}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[ticket.priority]}`}>
                        {PRIORITY_LABELS[ticket.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[ticket.status]}`}>
                        {STATUS_LABELS[ticket.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-slate-600 sm:table-cell">
                      {ticket.assignee_name ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="hidden px-4 py-3 text-sm text-slate-500 sm:table-cell">
                      {ticket.deadline
                        ? format(new Date(ticket.deadline), 'd MMM')
                        : <span className="text-slate-300">—</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {ticket.asset_link && (
                        <a
                          href={ticket.asset_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-[#1a2744]"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">No updates match the selected filters</p>
        )}
      </div>
    </div>
  );
}
