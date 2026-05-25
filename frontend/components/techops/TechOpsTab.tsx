'use client';
import { useState } from 'react';
import { Monitor, AlertCircle, Layers } from 'lucide-react';
import NucFleet from './NucFleet';
import IncidentLog from './IncidentLog';
import ProjectList from './ProjectList';

const SECTIONS = [
  { id: 'fleet', label: 'NUC Fleet Monitor', icon: Monitor },
  { id: 'incidents', label: 'Incident Log', icon: AlertCircle },
  { id: 'projects', label: 'Master Project List', icon: Layers },
];

export default function TechOpsTab() {
  const [activeSection, setActiveSection] = useState('fleet');

  return (
    <div className="space-y-4">
      {/* Section nav */}
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
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section content */}
      {activeSection === 'fleet' && <NucFleet />}
      {activeSection === 'incidents' && <IncidentLog />}
      {activeSection === 'projects' && <ProjectList />}
    </div>
  );
}
