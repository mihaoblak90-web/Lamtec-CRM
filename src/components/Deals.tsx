import React, { useState, useRef } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  Building2,
  Euro,
  X,
  FileText,
  List,
  LayoutGrid,
  Download,
  Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { initialDealsData, Deal } from '../lib/mockData';

const initialColumns = [
  { id: 'lead', title: 'Lead', color: 'bg-slate-200 text-slate-700' },
  { id: 'qualified', title: 'Qualified', color: 'bg-blue-100 text-blue-700' },
  { id: 'proposal', title: 'Proposal', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'negotiation', title: 'Negotiation', color: 'bg-amber-100 text-amber-700' },
  { id: 'won', title: 'Closed Won', color: 'bg-emerald-100 text-emerald-700' },
];

export function Deals() {
  const [deals, setDeals] = useState<Deal[]>(initialDealsData);
  const [draggedDealId, setDraggedDealId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeal, setNewDeal] = useState<Partial<Deal>>({
    title: '',
    company: '',
    segment: 'Automotive',
    stage: 'lead',
    probability: 20,
    rfqNumber: '',
    rfqDate: '',
    responsibleSales: '',
    responsibleRnD: '',
    peakYearQuantity: 0,
    peakYearSales: 0,
    hidriaInvestment: 0,
    customerOrderEquip: 0,
    totalProjectValue: 0,
    offerDueDate: '',
    offerNumber: '',
    offerDate: ''
  });

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedDealId(id);
    e.dataTransfer.setData('text/plain', id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDealId === null) return;

    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === draggedDealId ? { ...deal, stage: stageId } : deal
      )
    );
    setDraggedDealId(null);
  };

  // Add Deal Handler
  const handleAddDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const dealToAdd: Deal = {
      id: Date.now(),
      title: newDeal.title || '',
      company: newDeal.company || '',
      segment: newDeal.segment || 'Automotive',
      stage: newDeal.stage || 'lead',
      probability: Number(newDeal.probability) || 0,
      rfqNumber: newDeal.rfqNumber || '',
      rfqDate: newDeal.rfqDate || '',
      responsibleSales: newDeal.responsibleSales || '',
      responsibleRnD: newDeal.responsibleRnD || '',
      peakYearQuantity: Number(newDeal.peakYearQuantity) || 0,
      peakYearSales: Number(newDeal.peakYearSales) || 0,
      hidriaInvestment: Number(newDeal.hidriaInvestment) || 0,
      customerOrderEquip: Number(newDeal.customerOrderEquip) || 0,
      totalProjectValue: Number(newDeal.totalProjectValue) || 0,
      offerDueDate: newDeal.offerDueDate || '',
      offerNumber: newDeal.offerNumber || '',
      offerDate: newDeal.offerDate || ''
    };

    setDeals([...deals, dealToAdd]);
    setIsAddModalOpen(false);
    // Reset form
    setNewDeal({
      title: '', company: '', segment: 'Automotive', stage: 'lead', probability: 20,
      rfqNumber: '', rfqDate: '', responsibleSales: '', responsibleRnD: '',
      peakYearQuantity: 0, peakYearSales: 0, hidriaInvestment: 0, customerOrderEquip: 0, totalProjectValue: 0,
      offerDueDate: '', offerNumber: '', offerDate: ''
    });
  };

  const openModalWithStage = (stageId: string = 'lead') => {
    setNewDeal(prev => ({ ...prev, stage: stageId }));
    setIsAddModalOpen(true);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(deals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Deals");
    XLSX.writeFile(workbook, "Deals_Pipeline.xlsx");
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        const importedDeals: Deal[] = data.map((row, index) => ({
          id: Number(row.id) || Date.now() + index,
          title: row.title || 'Unknown Deal',
          company: row.company || 'Unknown Company',
          segment: row.segment || 'Automotive',
          stage: row.stage || 'lead',
          probability: Number(row.probability) || 0,
          rfqNumber: row.rfqNumber || '',
          rfqDate: row.rfqDate || '',
          responsibleSales: row.responsibleSales || '',
          responsibleRnD: row.responsibleRnD || '',
          peakYearQuantity: Number(row.peakYearQuantity) || 0,
          peakYearSales: Number(row.peakYearSales) || 0,
          hidriaInvestment: Number(row.hidriaInvestment) || 0,
          customerOrderEquip: Number(row.customerOrderEquip) || 0,
          totalProjectValue: Number(row.totalProjectValue) || 0,
          offerDueDate: row.offerDueDate || '',
          offerNumber: row.offerNumber || '',
          offerDate: row.offerDate || ''
        }));

        setDeals(prevDeals => {
          const newDeals = [...prevDeals];
          importedDeals.forEach(imported => {
            const existingIndex = newDeals.findIndex(d => d.id === imported.id);
            if (existingIndex >= 0) {
              newDeals[existingIndex] = imported;
            } else {
              newDeals.push(imported);
            }
          });
          return newDeals;
        });
        alert('Excel file imported successfully!');
      } catch (error) {
        console.error('Error importing Excel file:', error);
        alert('Failed to import Excel file. Please ensure it is a valid format.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deals Pipeline</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage your sales opportunities.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-1.5 rounded-md flex items-center justify-center transition-colors",
                viewMode === 'kanban' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
              title="Kanban View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-md flex items-center justify-center transition-colors",
                viewMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          
          <input 
            type="file" 
            accept=".xlsx, .xls" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImportExcel}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            title="Import from Excel"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            title="Export to Excel"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button 
            onClick={() => openModalWithStage('lead')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Deal</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-max">
            {initialColumns.map((column) => {
              const columnDeals = deals.filter(deal => deal.stage === column.id);
              const totalAmount = columnDeals.reduce((sum, deal) => sum + deal.totalProjectValue, 0);

              return (
                <div 
                  key={column.id} 
                  className="w-80 flex flex-col bg-slate-100/50 rounded-xl border border-slate-200/60 p-3"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, column.id)}
                >
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider", column.color)}>
                        {column.title}
                      </span>
                      <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {columnDeals.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => alert('Column options coming soon!')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-sm font-medium text-slate-600 mb-4 px-1 flex items-center gap-1">
                    <Euro className="w-4 h-4 text-slate-400" />
                    {totalAmount.toLocaleString()}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                    {columnDeals.map((deal) => (
                      <div 
                        key={deal.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        className={cn(
                          "bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing group",
                          draggedDealId === deal.id ? "opacity-50" : ""
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {deal.title}
                          </h3>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Deal options coming soon!');
                            }}
                            className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                          <Building2 className="w-3.5 h-3.5" />
                          {deal.company}
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                          <FileText className="w-3.5 h-3.5" />
                          RFQ: {deal.rfqNumber || 'N/A'}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-1 font-medium text-slate-900 text-sm">
                            <Euro className="w-3.5 h-3.5 text-slate-400" />
                            {deal.totalProjectValue.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                            <Clock className="w-3.5 h-3.5" />
                            {deal.offerDueDate || 'No Date'}
                          </div>
                        </div>

                        {/* Probability Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-[10px] font-medium text-slate-500 mb-1 uppercase tracking-wider">
                            <span>Probability</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                deal.probability >= 80 ? "bg-emerald-500" :
                                deal.probability >= 50 ? "bg-blue-500" :
                                deal.probability >= 30 ? "bg-amber-500" : "bg-slate-400"
                              )}
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Add Deal Button in Column */}
                    <button 
                      onClick={() => openModalWithStage(column.id)}
                      className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Deal
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Deal Name</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Probability</th>
                  <th className="px-6 py-4">Expected Close</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {deals.map((deal) => {
                  const stage = initialColumns.find(c => c.id === deal.stage);
                  return (
                    <tr key={deal.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{deal.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">RFQ: {deal.rfqNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {deal.company}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider", stage?.color)}>
                          {stage?.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 font-medium text-slate-900">
                          <Euro className="w-4 h-4 text-slate-400" />
                          {deal.totalProjectValue.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                deal.probability >= 80 ? "bg-emerald-500" :
                                deal.probability >= 50 ? "bg-blue-500" :
                                deal.probability >= 30 ? "bg-amber-500" : "bg-slate-400"
                              )}
                              style={{ width: `${deal.probability}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600">{deal.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {deal.offerDueDate || 'No Date'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => alert('Deal options coming soon!')}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {deals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      No deals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 shrink-0">
              <h2 className="text-lg font-semibold text-slate-900">Add New Deal</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddDeal} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* General & Project Status */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">General & Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                    <input required type="text" value={newDeal.title} onChange={e => setNewDeal({...newDeal, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Q4 Supply Contract" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                    <input required type="text" value={newDeal.company} onChange={e => setNewDeal({...newDeal, company: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Acme Corp" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Segment</label>
                    <select value={newDeal.segment} onChange={e => setNewDeal({...newDeal, segment: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      <option value="Automotive">Automotive</option>
                      <option value="Industrial">Industrial</option>
                      <option value="E-Mobility">E-Mobility</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Project Status</label>
                    <select value={newDeal.stage} onChange={e => setNewDeal({...newDeal, stage: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {initialColumns.map(col => <option key={col.id} value={col.id}>{col.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Probability (%)</label>
                    <input required type="number" min="0" max="100" value={newDeal.probability} onChange={e => setNewDeal({...newDeal, probability: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </section>

              {/* RFQ Data */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">RFQ Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RFQ Number</label>
                    <input type="text" value={newDeal.rfqNumber} onChange={e => setNewDeal({...newDeal, rfqNumber: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RFQ Date</label>
                    <input type="date" value={newDeal.rfqDate} onChange={e => setNewDeal({...newDeal, rfqDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsible Sales</label>
                    <input type="text" value={newDeal.responsibleSales} onChange={e => setNewDeal({...newDeal, responsibleSales: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsible R&D</label>
                    <input type="text" value={newDeal.responsibleRnD} onChange={e => setNewDeal({...newDeal, responsibleRnD: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </section>

              {/* Project Data */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Project Data (Financials)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Peak Year Quantity</label>
                    <input type="number" value={newDeal.peakYearQuantity} onChange={e => setNewDeal({...newDeal, peakYearQuantity: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Peak Year Sales (€)</label>
                    <input type="number" value={newDeal.peakYearSales} onChange={e => setNewDeal({...newDeal, peakYearSales: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Total Project Value (€)</label>
                    <input required type="number" value={newDeal.totalProjectValue} onChange={e => setNewDeal({...newDeal, totalProjectValue: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hidria Investment (€)</label>
                    <input type="number" value={newDeal.hidriaInvestment} onChange={e => setNewDeal({...newDeal, hidriaInvestment: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Order Equip (€)</label>
                    <input type="number" value={newDeal.customerOrderEquip} onChange={e => setNewDeal({...newDeal, customerOrderEquip: Number(e.target.value)})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </section>

              {/* Offer Data */}
              <section>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">Offer Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Offer Due Date</label>
                    <input type="date" value={newDeal.offerDueDate} onChange={e => setNewDeal({...newDeal, offerDueDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Offer Number</label>
                    <input type="text" value={newDeal.offerNumber} onChange={e => setNewDeal({...newDeal, offerNumber: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Offer Date</label>
                    <input type="date" value={newDeal.offerDate} onChange={e => setNewDeal({...newDeal, offerDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </section>

              <div className="pt-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
