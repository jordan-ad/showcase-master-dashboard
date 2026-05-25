'use client';
import { useState } from 'react';
import { Search, Plus, ChevronRight, AlertTriangle, CheckSquare, FileText, Layers } from 'lucide-react';
import { format } from 'date-fns';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';
import { mockProjects, mockProjectDetail } from '../../lib/mock-data';
import { LIFECYCLE_STAGES, getLifecyclePhase } from '../../types';
import type { Project, AustralianState, ProjectDetail } from '../../types';

const PHASE_VARIANT = {
  'Pre Sign Off': 'pre_sign_off' as const,
  'In Progress': 'in_progress_phase' as const,
  'Live': 'live' as const,
  'End of Life': 'end_of_life' as const,
};

// ─── Lifecycle Pipeline ────────────────────────────────────────────────────────
function LifecyclePipeline({ currentStage }: { currentStage: number }) {
  return (
    <div className="space-y-3">
      {(['Pre Sign Off', 'In Progress', 'Live', 'End of Life'] as const).map(phase => {
        const stages = LIFECYCLE_STAGES.filter(s => s.phase === phase);
        return (
          <div key={phase}>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">{phase}</p>
            <div className="flex flex-wrap gap-1.5">
              {stages.map(s => (
                <div
                  key={s.stage}
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    s.stage === currentStage
                      ? 'bg-[#1a2744] text-white shadow-md'
                      : s.stage < currentStage
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <span className="opacity-60">{s.stage}</span>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Active Parallels ─────────────────────────────────────────────────────────
function ActiveParallels({ project }: { project: Pick<Project, 'parallel_buyers_portal' | 'parallel_analytics_dashboard' | 'parallel_showcase_builder' | 'parallel_showcase_space' | 'parallel_creative_services'> }) {
  const items = [
    { key: 'parallel_buyers_portal', label: 'Buyers Portal' },
    { key: 'parallel_analytics_dashboard', label: 'Analytics Dashboard' },
    { key: 'parallel_showcase_builder', label: 'Showcase Builder' },
    { key: 'parallel_showcase_space', label: 'showcase.space' },
    { key: 'parallel_creative_services', label: 'Creative Services' },
  ] as const;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(item => (
        <span
          key={item.key}
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            project[item.key] ? 'bg-[#1a2744]/10 text-[#1a2744]' : 'bg-slate-100 text-slate-400 line-through'
          }`}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

// ─── Onboarding Checklist ─────────────────────────────────────────────────────
function OnboardingChecklist({ detail }: { detail: ProjectDetail }) {
  const completed = detail.checklist.filter(i => i.completed).length;
  const total = detail.checklist.length;
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{completed}/{total} complete</span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </div>
      {detail.checklist.map(item => (
        <div key={item.id} className="flex items-center gap-2.5 text-sm">
          <div className={`flex size-5 shrink-0 items-center justify-center rounded-md border-2 ${item.completed ? 'border-emerald-500 bg-emerald-500' : 'border-slate-200'}`}>
            {item.completed && <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className={item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Project Detail Modal ─────────────────────────────────────────────────────
function ProjectDetailModal({ project, onClose }: { project: ProjectDetail; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'checklist' | 'incidents' | 'files' | 'activity'>('overview');

  return (
    <Modal open title={project.name} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Tab nav */}
        <div className="flex gap-1 border-b border-slate-100 pb-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'checklist', label: `Checklist (${project.checklist.filter(i => i.completed).length}/${project.checklist.length})` },
            { id: 'incidents', label: `Incidents (${project.incidents.length})` },
            { id: 'files', label: `Files (${project.files.length})` },
            { id: 'activity', label: 'Activity' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`-mb-px rounded-t-lg px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border border-b-white border-slate-200 bg-white text-[#1a2744]'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Client', value: project.client_name },
                { label: 'State', value: project.state },
                { label: 'Contract', value: project.contract_status ? <Badge variant={project.contract_status} /> : '—' },
                { label: 'Payment', value: project.payment_status ? <Badge variant={project.payment_status as 'paid' | 'invoiced' | 'overdue' | 'pending'} /> : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs text-slate-500">{label}</p>
                  <div className="text-sm font-medium text-slate-900">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Lifecycle Pipeline</h3>
              <LifecyclePipeline currentStage={project.lifecycle_stage} />
            </div>
            {project.next_action && (
              <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <span className="font-semibold">Next action: </span>{project.next_action}
              </div>
            )}
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Active Showcases</h3>
              <ActiveParallels project={project} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">NUC Assignments ({project.nucs.length})</h3>
              <div className="flex flex-wrap gap-2">
                {project.nucs.map(n => (
                  <div key={n.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
                    <Badge variant={n.status} dot />
                    <span className="font-mono text-sm">{n.nuc_id}</span>
                  </div>
                ))}
                {project.nucs.length === 0 && <p className="text-sm text-slate-400">No NUCs assigned</p>}
              </div>
            </div>
          </div>
        )}

        {/* Checklist */}
        {tab === 'checklist' && <OnboardingChecklist detail={project} />}

        {/* Incidents */}
        {tab === 'incidents' && (
          <div className="space-y-2">
            {project.incidents.length === 0 && <p className="text-sm text-slate-400">No incidents</p>}
            {project.incidents.map(inc => (
              <div key={inc.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                <Badge variant={inc.priority} />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{inc.title}</p>
                </div>
                <Badge variant={inc.status} />
              </div>
            ))}
          </div>
        )}

        {/* Files */}
        {tab === 'files' && (
          <div className="space-y-2">
            {project.files.map(f => (
              <a key={f.id} href={f.file_url} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                <FileText size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1 text-sm text-slate-900">{f.file_name}</span>
                <span className="text-xs text-slate-400">{format(new Date(f.created_at), 'd MMM yyyy')}</span>
              </a>
            ))}
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-3 text-sm text-slate-400 hover:border-slate-300 hover:text-slate-600">
              <Plus size={15} /> Upload File
            </button>
          </div>
        )}

        {/* Activity */}
        {tab === 'activity' && (
          <div className="space-y-3">
            {project.activity.map(a => (
              <div key={a.id} className="flex gap-3 text-sm">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                  {(a.actor_name ?? 'S')[0]}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-slate-700">{a.actor_name}</span>
                  <span className="ml-1 text-slate-500">{a.action.replace(/_/g, ' ')}</span>
                  <span className="ml-2 text-xs text-slate-400">
                    {format(new Date(a.created_at), 'd MMM, HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Create Project Modal ─────────────────────────────────────────────────────
function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', client_name: '', state: 'NSW', lifecycle_stage: 1 });
  return (
    <Modal open title="New Project" onClose={onClose} size="md">
      <div className="space-y-4">
        {[
          { label: 'Project Name *', field: 'name', placeholder: 'e.g. The Daintree Residences' },
          { label: 'Client Name *', field: 'client_name', placeholder: 'e.g. Mirvac' },
        ].map(({ label, field, placeholder }) => (
          <div key={field}>
            <label className="mb-1 block text-xs font-medium text-slate-700">{label}</label>
            <input
              value={form[field as 'name' | 'client_name']}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1a2744] focus:outline-none"
            />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">State *</label>
            <select
              value={form.state}
              onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1a2744] focus:outline-none"
            >
              {['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Starting Stage</label>
            <select
              value={form.lifecycle_stage}
              onChange={e => setForm(f => ({ ...f, lifecycle_stage: Number(e.target.value) }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#1a2744] focus:outline-none"
            >
              {LIFECYCLE_STAGES.map(s => <option key={s.stage} value={s.stage}>{s.stage}. {s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          <button
            disabled={!form.name || !form.client_name}
            className="rounded-lg bg-[#1a2744] px-4 py-2 text-sm font-medium text-white hover:bg-[#243860] disabled:opacity-50"
          >
            Create Project
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, onClick }: { project: Project; onClick: () => void }) {
  const phase = getLifecyclePhase(project.lifecycle_stage);
  const phaseVariant = PHASE_VARIANT[phase as keyof typeof PHASE_VARIANT] ?? 'default';
  const stage = LIFECYCLE_STAGES.find(s => s.stage === project.lifecycle_stage);

  return (
    <tr className="group cursor-pointer border-b border-slate-100 hover:bg-slate-50" onClick={onClick}>
      <td className="py-3 pl-4 pr-2">
        <p className="font-medium text-slate-900">{project.name}</p>
        <p className="text-xs text-slate-400">{project.client_name}</p>
      </td>
      <td className="hidden px-3 py-3 text-sm text-slate-600 sm:table-cell">{project.state}</td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1">
          <Badge variant={phaseVariant} />
          <span className="text-xs text-slate-500">{stage?.label}</span>
        </div>
      </td>
      <td className="hidden px-3 py-3 sm:table-cell">
        <div className="flex gap-1">
          {project.nuc_count !== undefined && project.nuc_count > 0 && (
            <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
              <Layers size={10} />{project.nuc_count}
            </span>
          )}
          {(project.open_incidents ?? 0) > 0 && (
            <span className="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-600">
              <AlertTriangle size={10} />{project.open_incidents}
            </span>
          )}
        </div>
      </td>
      <td className="pr-4">
        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectList() {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<AustralianState | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = mockProjects.filter(p => {
    if (stateFilter !== 'all' && p.state !== stateFilter) return false;
    if (stageFilter === 'pre' && p.lifecycle_stage > 3) return false;
    if (stageFilter === 'inprogress' && (p.lifecycle_stage <= 3 || p.lifecycle_stage > 10)) return false;
    if (stageFilter === 'live' && (p.lifecycle_stage < 11 || p.lifecycle_stage > 14)) return false;
    if (stageFilter === 'eol' && p.lifecycle_stage !== 15) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.client_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[#1a2744] focus:outline-none"
          />
        </div>
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value as AustralianState | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none"
        >
          <option value="all">All States</option>
          {['NSW', 'VIC', 'QLD', 'SA', 'WA'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={stageFilter}
          onChange={e => setStageFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#1a2744] focus:outline-none"
        >
          <option value="all">All Phases</option>
          <option value="pre">Pre Sign Off</option>
          <option value="inprogress">In Progress</option>
          <option value="live">Live</option>
          <option value="eol">End of Life</option>
        </select>
        <button
          onClick={() => setCreating(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-[#1a2744] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#243860]"
        >
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500">
              <th className="py-2.5 pl-4 pr-2">Project</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">State</th>
              <th className="px-3 py-2.5">Stage</th>
              <th className="hidden px-3 py-2.5 sm:table-cell">Flags</th>
              <th className="w-6 pr-4" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <ProjectRow key={p.id} project={p} onClick={() => setSelectedId(p.id)} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">No projects match the selected filters</p>
        )}
      </div>
      <p className="text-xs text-slate-400">{filtered.length} projects</p>

      {selectedId && (
        <ProjectDetailModal project={mockProjectDetail} onClose={() => setSelectedId(null)} />
      )}
      {creating && <CreateProjectModal onClose={() => setCreating(false)} />}
    </div>
  );
}
