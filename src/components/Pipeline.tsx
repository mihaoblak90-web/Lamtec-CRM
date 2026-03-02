import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Plus, 
  Euro, 
  Building2, 
  Calendar as CalendarIcon,
  GripVertical
} from 'lucide-react';
import { cn } from '../lib/utils';
import { initialDealsData } from '../lib/mockData';

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-slate-200 text-slate-700 border-slate-300' },
  { id: 'contacted', name: 'Contacted', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'meeting', name: 'Meeting Scheduled', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'proposal', name: 'Proposal Sent', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'won', name: 'Closed Won', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
];

// BUG FIX: Use a stable unique id string per deal for drag-and-drop,
// and map using correct Deal fields (title, company) — not the
// non-existent 'project' / 'customer' fields that caused runtime errors.
const initialPipelineDeals = initialDealsData.map((deal, index) => ({
  ...deal,
  pipelineStage: STAGES[index % STAGES.length].id,
  pipelineId: `pipeline-deal-${deal.id}`,
}));

export function Pipeline() {
  const [deals, setDeals] = useState(initialPipelineDeals);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, pipelineId: string) => {
    setDraggedDeal(pipelineId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedDeal(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedDeal) return;
    setDeals(prev =>
      prev.map(deal =>
        deal.pipelineId === draggedDeal ? { ...deal, pipelineStage: stageId } : deal
      )
    );
    setDraggedDeal(null);
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}k`;
    return `€${value}`;
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Drag and drop deals to update their status.</p>
        </div>
        <button
          onClick={() => alert('New Deal modal coming soon!')}
          className="flex items-center gap-2 px-4 py-2 bg-[#0097b2] text-white rounded-lg text-sm font-medium hover:bg-[#005b7f] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.pipelineStage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + d.totalProjectValue, 0);

            return (
              <div
                key={stage.id}
                className="w-80 flex flex-col bg-slate-50/50 rounded-xl border border-slate-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-slate-200 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn('px-2.5 py-1 rounded-md text-xs font-semibold border', stage.color)}>
                      {stage.name}
                    </div>
                    <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {formatCurrency(stageTotal)}
                  </div>
                </div>

                {/* Column Content */}
                <div className="p-3 flex-1 overflow-y-auto space-y-3">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.pipelineId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, deal.pipelineId)}
                      onDragEnd={handleDragEnd}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-[#0097b2]/50 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        {/* BUG FIX: was deal.customer — correct field is deal.company */}
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {deal.company}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); alert('More options'); }}
                          className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* BUG FIX: was deal.project — correct field is deal.title */}
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 leading-tight">
                        {deal.title}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Euro className="w-3.5 h-3.5" /> Value
                          </span>
                          <span className="font-medium text-slate-900">{formatCurrency(deal.totalProjectValue)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5" /> Due
                          </span>
                          <span className="font-medium text-slate-900">{deal.offerDueDate || '—'}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-blue-700">
                            {deal.responsibleSales?.split(' ').map(n => n[0]).join('') || 'JD'}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-emerald-700">
                            {deal.responsibleRnD?.split(' ').map(n => n[0]).join('') || 'MR'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-sm text-slate-400">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
