'use client';
import { useState } from 'react';
import { Monitor, AlertCircle } from 'lucide-react';
import IncidentsTab from './IncidentsTab';

const SECTIONS = [
  { id: 'nuc-monitor', label: 'NUC Monitor', icon: Monitor },
  { id: 'incidents',   label: 'Incidents',   icon: AlertCircle },
];

export default function OperationsTab() {
  const [activeSection, setActiveSection] = useState('nuc-monitor');

  return (
    <div className="space-y-4">
      {/* Sub-tab nav */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 w-fit">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeSection === s.id
                  ? 'bg-[#1a2744] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={15} />
              {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'nuc-monitor' && (
        <iframe
          src="/nuc-monitor.html"
          title="Showcase NUC Monitor"
          className="w-full rounded-xl border-0"
          style={{ height: 'calc(100vh - 7.5rem)' }}
        />
      )}

      {activeSection === 'incidents' && <IncidentsTab />}
    </div>
  );
}
