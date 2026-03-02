import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Users, 
  Calendar,
  ChevronRight,
  Download,
  X,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAppStore, type MeetingMinute } from '../lib/store';

export function MeetingMinutes() {
  const [searchTerm, setSearchTerm] = useState('');
  const meetingMinutes = useAppStore(state => state.meetingMinutes);
  const addMeetingMinute = useAppStore(state => state.addMeetingMinute);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState<MeetingMinute | null>(null);

  const [newMinute, setNewMinute] = useState({
    title: '',
    company: '',
    date: '',
    attendees: '',
    status: 'Finalized' as 'Draft' | 'Finalized'
  });
  const [minutesType, setMinutesType] = useState<'text' | 'file'>('text');
  const [minutesContent, setMinutesContent] = useState('');
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMinutes = meetingMinutes.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    
    addMeetingMinute({
      id: Date.now(),
      title: newMinute.title,
      company: newMinute.company,
      date: newMinute.date,
      attendees: newMinute.attendees.split(',').map(a => a.trim()).filter(Boolean),
      summary: minutesType === 'text' ? minutesContent : 'File uploaded',
      status: newMinute.status,
      type: minutesType,
      content: minutesType === 'text' ? minutesContent : undefined,
      fileName: minutesType === 'file' && minutesFile ? minutesFile.name : undefined,
      fileSize: minutesType === 'file' && minutesFile ? `${(minutesFile.size / 1024 / 1024).toFixed(2)} MB` : undefined
    });

    setIsNewModalOpen(false);
    setNewMinute({ title: '', company: '', date: '', attendees: '', status: 'Finalized' });
    setMinutesContent('');
    setMinutesFile(null);
  };

  const handleDownload = (meeting: MeetingMinute) => {
    // Simulate download
    const content = meeting.type === 'text' ? meeting.content || meeting.summary : `File: ${meeting.fileName}`;
    const blob = new Blob([`Title: ${meeting.title}\nCompany: ${meeting.company}\nDate: ${meeting.date}\nAttendees: ${meeting.attendees.join(', ')}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/\s+/g, '_')}_Minutes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (meeting: MeetingMinute) => {
    setSelectedMinute(meeting);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meeting Minutes</h1>
          <p className="text-sm text-slate-500 mt-1">Log and review meeting notes and decisions.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Minutes
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search meetings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredMinutes.map((meeting) => (
            <div key={meeting.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors group flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-semibold text-slate-900 truncate">{meeting.title}</h3>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                    meeting.status === 'Finalized' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {meeting.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{meeting.summary}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {meeting.company}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {meeting.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-slate-400" />
                    {meeting.attendees.join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
                <button 
                  onClick={() => handleDownload(meeting)}
                  className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleViewDetails(meeting)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Minutes Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Meeting Minutes</h2>
              <button 
                onClick={() => {
                  setIsNewModalOpen(false);
                  setNewMinute({ title: '', company: '', date: '', attendees: '', status: 'Finalized' });
                  setMinutesContent('');
                  setMinutesFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMinutes} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Meeting Title</label>
                  <input 
                    required
                    type="text" 
                    value={newMinute.title}
                    onChange={e => setNewMinute({...newMinute, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Q3 Supply Alignment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                  <input 
                    required
                    type="text" 
                    value={newMinute.company}
                    onChange={e => setNewMinute({...newMinute, company: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Volvo Cars"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    required
                    type="date" 
                    value={newMinute.date}
                    onChange={e => setNewMinute({...newMinute, date: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Attendees (comma separated)</label>
                  <input 
                    required
                    type="text" 
                    value={newMinute.attendees}
                    onChange={e => setNewMinute({...newMinute, attendees: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. John Doe, Jane Smith"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={newMinute.status}
                    onChange={e => setNewMinute({...newMinute, status: e.target.value as 'Draft' | 'Finalized'})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Finalized">Finalized</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setMinutesType('text')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      minutesType === 'text' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Write Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setMinutesType('file')}
                    className={cn(
                      "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                      minutesType === 'file' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    Upload File
                  </button>
                </div>

                {minutesType === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Meeting Summary & Notes</label>
                    <textarea 
                      required
                      value={minutesContent}
                      onChange={e => setMinutesContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                      placeholder="Enter meeting minutes, decisions, and action items..."
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMinutesFile(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-slate-900 mb-1">
                        {minutesFile ? minutesFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-slate-500 mb-4">
                        {minutesFile ? `${(minutesFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOCX, or TXT (max. 10MB)'}
                      </p>
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Select File
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setIsNewModalOpen(false);
                    setNewMinute({ title: '', company: '', date: '', attendees: '', status: 'Finalized' });
                    setMinutesContent('');
                    setMinutesFile(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={minutesType === 'text' ? !minutesContent : !minutesFile}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Minutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isDetailsModalOpen && selectedMinute && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Meeting Details</h2>
              <button 
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setSelectedMinute(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{selectedMinute.title}</h3>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                    selectedMinute.status === 'Finalized' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {selectedMinute.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {selectedMinute.company}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {selectedMinute.date}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {selectedMinute.attendees.join(', ')}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-2">Summary & Notes</h4>
                {selectedMinute.type === 'file' ? (
                  <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{selectedMinute.fileName}</p>
                        <p className="text-xs text-slate-500">{selectedMinute.fileSize}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(selectedMinute)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 whitespace-pre-wrap">
                    {selectedMinute.content || selectedMinute.summary}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  onClick={() => handleDownload(selectedMinute)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button 
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedMinute(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
