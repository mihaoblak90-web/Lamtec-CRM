import React, { useState } from 'react';
import { 
  FileBarChart, 
  Download, 
  FileSpreadsheet, 
  FileText,
  Calendar,
  ClipboardList,
  Briefcase,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const reportTypes = [
  { id: 'action-plan', title: 'Action Plan Status', description: 'Export all open and completed actions with their current status and assignees.', icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'meeting-minutes', title: 'Meeting Minutes Summary', description: 'Generate a consolidated report of all meeting minutes within a specific date range.', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'visits', title: 'Visits & Audits Calendar', description: 'Export upcoming and past visits, including locations, attendees, and types.', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'deals', title: 'Pipeline & Deals', description: 'Detailed report of all active deals, probabilities, and expected close dates.', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100' },
];

export function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);

  const handleGenerate = (id: string, type: 'pdf' | 'excel' = 'pdf') => {
    setGenerating(id);
    setTimeout(() => {
      setGenerating(null);
      alert(`${type.toUpperCase()} report generated successfully!`);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Exports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and download reports for your CRM data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          const isGenerating = generating === report.id;

          return (
            <div key={report.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn("p-3 rounded-lg shrink-0", report.bg)}>
                  <Icon className={cn("w-6 h-6", report.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{report.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => handleGenerate(report.id, 'pdf')}
                  disabled={isGenerating}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isGenerating 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-not-allowed" 
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 animate-pulse" />
                      Generated
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Export PDF
                    </>
                  )}
                </button>
                <button 
                  onClick={() => handleGenerate(report.id, 'excel')}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Export Excel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
