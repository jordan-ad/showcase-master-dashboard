'use client';
import { useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../ui/Modal';
import type { AssetBoardItem, UpdateTicket, AssetBoardStage, UpdateTicketStatus, TicketPriority } from '../../types';
import { BALI_TEAM, STAGES, STAGE_LABELS } from './asset-constants';

const STATUS_NEXT: Record<UpdateTicketStatus, UpdateTicketStatus | null> = {
  open: 'in_progress',
  in_progress: 'done',
  done: null,
};

const STATUS_STYLES: Record<UpdateTicketStatus, string> = {
  open:        'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  done:        'bg-emerald-100 text-emerald-700',
};

const STATUS_LABELS: Record<UpdateTicketStatus, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  done:        'Done',
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  urgent:   'bg-red-100 text-red-700',
  standard: 'bg-blue-100 text-blue-700',
  no_rush:  'bg-slate-100 text-slate-500',
};

const PRIORITY_LABELS: Record<TicketPriority, string> = {
  urgent:   'Urgent',
  standard: 'Standard',
  no_rush:  'No Rush',
};

interface RaiseForm {
  title: string;
  description: string;
  priority: TicketPriority;
  assignee_name: string;
  deadline: string;
  asset_link: string;
}

const EMPTY_FORM: RaiseForm = {
  title: '', description: '', priority: 'standard',
  assignee_name: '', deadline: '', asset_link: '',
};

interface Props {
  item: AssetBoardItem;
  tickets: UpdateTicket[];
  onClose: () => void;
  onMove: (stage: AssetBoardStage) => void;
  onRaise: (ticket: Omit<UpdateTicket, 'id' | 'created_at' | 'updated_at'>) => void;
  onAdvanceTicket: (ticketId: string, status: UpdateTicketStatus) => void;
}

export default function ProjectDetailModal({ item, tickets, onClose, onMove, onRaise, onAdvanceTicket }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RaiseForm>(EMPTY_FORM);

  const currentIdx = STAGES.indexOf(item.stage);
  const prevStage  = currentIdx > 0 ? STAGES[currentIdx - 1] : undefined;
  const nextStage  = currentIdx < STAGES.length - 1 ? STAGES[currentIdx + 1] : undefined;

  const openCount = tickets.filter(t => t.status !== 'done').length;
  const doneCount = tickets.filter(t => t.status === 'done').length;

  function handleRaise(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onRaise({
      asset_item_id: item.id,
      project_id:    item.project_id,
      title:         form.title.trim(),
      description:   form.description || undefined,
      priority:      form.priority,
      status:        'open',
      assignee_name: form.assignee_name || undefined,
      deadline:      form.deadline || undefined,
      asset_link:    form.asset_link || undefined,
      raised_by:     'Jordan',
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  const inputClass = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a2744] focus:outline-none';

  return (
    <Modal open onClose={onClose} title={item.project_name} size="lg">
      <div className="space-y-5">

        {/* Stage bar */}
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <div className="text-sm text-slate-600">
            Stage: <span className="font-semibold text-slate-900">{STAGE_LABELS[item.stage]}</span>
          </div>
          <div className="flex items-center gap-2">
            {prevStage && (
              <button
                onClick={() => onMove(prevStage)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                ← {STAGE_LABELS[prevStage]}
              </button>
            )}
            {nextStage && (
              <button
                onClick={() => onMove(nextStage)}
                className="rounded-lg bg-[#1a2744] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#243460]"
              >
                Move to {STAGE_LABELS[nextStage]} →
              </button>
            )}
          </div>
        </div>

        {/* Updates section */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Updates
              {tickets.length > 0 && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {openCount} open · {doneCount} done
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#243460]"
            >
              <Plus size={13} />
              Raise Update
            </button>
          </div>

          {/* Raise form */}
          {showForm && (
            <form onSubmit={handleRaise} className="mb-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <input
                type="text"
                placeholder="What needs to be updated? (required)"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                className={`w-full ${inputClass}`}
              />
              <textarea
                placeholder="Description / details (optional)"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                className={`w-full resize-none ${inputClass}`}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <select
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}
                  className={inputClass}
                >
                  <option value="urgent">Urgent</option>
                  <option value="standard">Standard</option>
                  <option value="no_rush">No Rush</option>
                </select>
                <select
                  value={form.assignee_name}
                  onChange={e => setForm(f => ({ ...f, assignee_name: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Unassigned</option>
                  {BALI_TEAM.map(m => <option key={m}>{m}</option>)}
                </select>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className={inputClass}
                />
                <input
                  type="url"
                  placeholder="Asset link (optional)"
                  value={form.asset_link}
                  onChange={e => setForm(f => ({ ...f, asset_link: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#1a2744] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#243460]"
                >
                  Raise
                </button>
              </div>
            </form>
          )}

          {/* Ticket list */}
          {tickets.length === 0 && !showForm && (
            <p className="py-8 text-center text-sm text-slate-400">No updates raised yet</p>
          )}

          {tickets.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
              {tickets.map(ticket => {
                const next = STATUS_NEXT[ticket.status];
                return (
                  <div key={ticket.id} className="flex items-start gap-3 px-4 py-3">
                    <button
                      onClick={() => next && onAdvanceTicket(ticket.id, next)}
                      disabled={!next}
                      title={next ? `Mark as ${STATUS_LABELS[next]}` : undefined}
                      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-opacity ${STATUS_STYLES[ticket.status]} ${next ? 'cursor-pointer hover:opacity-75' : 'cursor-default'}`}
                    >
                      {STATUS_LABELS[ticket.status]}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${ticket.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {ticket.title}
                      </p>
                      {ticket.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{ticket.description}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_STYLES[ticket.priority]}`}>
                          {PRIORITY_LABELS[ticket.priority]}
                        </span>
                        {ticket.assignee_name && (
                          <span className="text-[11px] text-slate-500">{ticket.assignee_name}</span>
                        )}
                        {ticket.deadline && (
                          <span className="text-[11px] text-slate-400">
                            Due {format(new Date(ticket.deadline), 'd MMM')}
                          </span>
                        )}
                      </div>
                    </div>
                    {ticket.asset_link && (
                      <a
                        href={ticket.asset_link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-0.5 shrink-0 text-slate-400 hover:text-[#1a2744]"
                        title="Open asset"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
