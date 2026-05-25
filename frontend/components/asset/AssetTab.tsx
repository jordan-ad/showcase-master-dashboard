'use client';
import { useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import AssetBoard from './AssetBoard';
import AllUpdatesView from './AllUpdatesView';
import { mockAssetBoardItems, mockUpdateTickets } from '../../lib/mock-data';
import type { AssetBoardItem, UpdateTicket, AssetBoardStage, UpdateTicketStatus } from '../../types';

type SubTab = 'board' | 'all_updates';

const SUBTABS = [
  { id: 'board'       as SubTab, label: 'Board',       icon: LayoutGrid },
  { id: 'all_updates' as SubTab, label: 'All Updates',  icon: List       },
];

export default function AssetTab() {
  const [subTab, setSubTab]       = useState<SubTab>('board');
  const [items, setItems]         = useState<AssetBoardItem[]>(mockAssetBoardItems);
  const [tickets, setTickets]     = useState<UpdateTicket[]>(mockUpdateTickets);

  function moveProject(itemId: string, stage: AssetBoardStage) {
    setItems(prev => prev.map(i =>
      i.id === itemId ? { ...i, stage, updated_at: new Date().toISOString() } : i,
    ));
  }

  function raiseTicket(ticket: Omit<UpdateTicket, 'id' | 'created_at' | 'updated_at'>) {
    const now = new Date().toISOString();
    setTickets(prev => [...prev, { ...ticket, id: `ut-${Date.now()}`, created_at: now, updated_at: now }]);
  }

  function advanceTicket(ticketId: string, status: UpdateTicketStatus) {
    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, status, updated_at: new Date().toISOString() } : t,
    ));
  }

  return (
    <div className="space-y-4">
      {/* Sub-tab nav */}
      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 w-fit">
        {SUBTABS.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setSubTab(s.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                subTab === s.id
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

      {subTab === 'board' && (
        <AssetBoard
          items={items}
          tickets={tickets}
          onMove={moveProject}
          onRaise={raiseTicket}
          onAdvanceTicket={advanceTicket}
        />
      )}
      {subTab === 'all_updates' && (
        <AllUpdatesView tickets={tickets} items={items} />
      )}
    </div>
  );
}
