'use client';
import { useState } from 'react';
import { format } from 'date-fns';
import ProjectDetailModal from './ProjectDetailModal';
import type { AssetBoardItem, UpdateTicket, AssetBoardStage, UpdateTicketStatus } from '../../types';
import { STAGES, STAGE_LABELS, STAGE_COLUMN_STYLE } from './asset-constants';

interface Props {
  items: AssetBoardItem[];
  tickets: UpdateTicket[];
  onMove: (itemId: string, stage: AssetBoardStage) => void;
  onRaise: (ticket: Omit<UpdateTicket, 'id' | 'created_at' | 'updated_at'>) => void;
  onAdvanceTicket: (ticketId: string, status: UpdateTicketStatus) => void;
}

export default function AssetBoard({ items, tickets, onMove, onRaise, onAdvanceTicket }: Props) {
  const [selectedItem, setSelectedItem] = useState<AssetBoardItem | null>(null);

  function handleMove(stage: AssetBoardStage) {
    if (!selectedItem) return;
    onMove(selectedItem.id, stage);
    setSelectedItem(prev => prev ? { ...prev, stage } : null);
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map(stageId => {
          const style    = STAGE_COLUMN_STYLE[stageId];
          const colItems = items.filter(i => i.stage === stageId);

          return (
            <div
              key={stageId}
              className="flex w-60 flex-none flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              {/* Column header */}
              <div className={`flex items-center justify-between border-b px-3 py-2.5 ${style.header}`}>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${style.dot}`} />
                  <span className="text-xs font-semibold text-slate-700">{STAGE_LABELS[stageId]}</span>
                </div>
                <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  {colItems.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 p-2 min-h-[100px]">
                {colItems.map(item => {
                  const itemTickets = tickets.filter(t => t.asset_item_id === item.id);
                  const openCount   = itemTickets.filter(t => t.status !== 'done').length;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
                    >
                      <p className="text-sm font-semibold leading-snug text-slate-900">
                        {item.project_name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                        {openCount > 0 && (
                          <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            {openCount} open
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[10px] text-slate-400">
                        Updated {format(new Date(item.updated_at), 'd MMM')}
                      </p>
                    </button>
                  );
                })}
                {colItems.length === 0 && (
                  <p className="py-6 text-center text-xs text-slate-300">No projects</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <ProjectDetailModal
          item={selectedItem}
          tickets={tickets.filter(t => t.asset_item_id === selectedItem.id)}
          onClose={() => setSelectedItem(null)}
          onMove={handleMove}
          onRaise={onRaise}
          onAdvanceTicket={onAdvanceTicket}
        />
      )}
    </>
  );
}
