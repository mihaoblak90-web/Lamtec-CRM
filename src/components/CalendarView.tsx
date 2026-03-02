import React, { useState, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  List,
  Map as MapIcon,
  X,
  FileText,
  Upload
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppStore } from '../lib/store';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const upcomingVisits = [
  { id: 1, title: 'Annual Supplier Audit', company: 'Volvo Cars', location: 'Torslanda, Sweden', date: '2023-11-15', time: '09:00 - 16:00', attendees: ['Michael Bader', 'Jane Doe'], type: 'Audit', coordinates: [57.7210, 11.7780] as [number, number] },
  { id: 2, title: 'Technical Workshop', company: 'Bosch', location: 'Stuttgart, Germany', date: '2023-11-20', time: '10:00 - 14:00', attendees: ['Maria Garcia', 'Mike Ross'], type: 'Workshop', coordinates: [48.7758, 9.1829] as [number, number] },
  { id: 3, title: 'Q4 Business Review', company: 'Siemens AG', location: 'Munich, Germany', date: '2023-12-05', time: '13:00 - 15:00', attendees: ['Klaus Müller', 'Jane Doe'], type: 'Review', coordinates: [48.1351, 11.5820] as [number, number] },
];

const pastVisits = [
  { id: 4, title: 'Prototype Handover', company: 'Valeo', location: 'Paris, France', date: '2023-10-02', time: '11:00 - 12:30', attendees: ['Sophie Martin', 'Jane Doe'], type: 'Meeting', coordinates: [48.8566, 2.3522] as [number, number] },
  { id: 5, title: 'Initial Plant Tour', company: 'Denso', location: 'Hidria HQ, Slovenia', date: '2023-09-28', time: '09:00 - 15:00', attendees: ['Taro Tanaka', 'Mike Ross'], type: 'Tour', coordinates: [46.0289, 14.0222] as [number, number] },
];

export function CalendarView() {
  const [view, setView] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [displayMode, setDisplayMode] = useState<'list' | 'map'>('list');
  
  const [localUpcomingVisits, setLocalUpcomingVisits] = useState(upcomingVisits);
  const [localPastVisits, setLocalPastVisits] = useState(pastVisits);
  
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    title: '',
    company: '',
    location: '',
    date: '',
    time: '',
    type: 'Meeting',
    attendees: ''
  });

  const visits = view === 'Upcoming' ? localUpcomingVisits : localPastVisits;

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple geocoding mock based on some known cities, otherwise default to center of Europe
    let coordinates: [number, number] = [48.1351, 11.5820]; // Default Munich
    const locLower = newVisit.location.toLowerCase();
    if (locLower.includes('paris')) coordinates = [48.8566, 2.3522];
    else if (locLower.includes('london')) coordinates = [51.5074, -0.1278];
    else if (locLower.includes('berlin')) coordinates = [52.5200, 13.4050];
    else if (locLower.includes('rome')) coordinates = [41.9028, 12.4964];
    else if (locLower.includes('madrid')) coordinates = [40.4168, -3.7038];
    else if (locLower.includes('ljubljana') || locLower.includes('slovenia')) coordinates = [46.0569, 14.5058];

    const visitToAdd = {
      id: Date.now(),
      title: newVisit.title,
      company: newVisit.company,
      location: newVisit.location,
      date: newVisit.date,
      time: newVisit.time,
      type: newVisit.type,
      attendees: newVisit.attendees.split(',').map(a => a.trim()).filter(Boolean),
      coordinates
    };

    setLocalUpcomingVisits(prev => [...prev, visitToAdd].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setIsScheduleModalOpen(false);
    setNewVisit({ title: '', company: '', location: '', date: '', time: '', type: 'Meeting', attendees: '' });
  };

  const addMeetingMinute = useAppStore(state => state.addMeetingMinute);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isMinutesModalOpen, setIsMinutesModalOpen] = useState(false);
  const [minutesType, setMinutesType] = useState<'text' | 'file'>('text');
  const [minutesContent, setMinutesContent] = useState('');
  const [minutesFile, setMinutesFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMinutes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;

    addMeetingMinute({
      id: Date.now(),
      title: selectedVisit.title,
      company: selectedVisit.company,
      date: selectedVisit.date,
      attendees: selectedVisit.attendees,
      summary: minutesType === 'text' ? minutesContent : 'File uploaded',
      status: 'Finalized',
      type: minutesType,
      content: minutesType === 'text' ? minutesContent : undefined,
      fileName: minutesType === 'file' && minutesFile ? minutesFile.name : undefined,
      fileSize: minutesType === 'file' && minutesFile ? `${(minutesFile.size / 1024 / 1024).toFixed(2)} MB` : undefined
    });

    setIsMinutesModalOpen(false);
    setSelectedVisit(null);
    setMinutesContent('');
    setMinutesFile(null);
  };

  const handleDetailsClick = (visit: any) => {
    setSelectedVisit(visit);
    setIsMinutesModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visits Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and manage potential customer visits.</p>
        </div>
        <button 
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Schedule Visit
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Left Sidebar - Mini Calendar & Filters */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50 p-6 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-slate-900">November 2023</h2>
            <div className="flex gap-1">
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"><ChevronLeft className="w-5 h-5" /></button>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
          
          {/* Simple Mock Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-8">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
              <div key={day} className="font-medium text-slate-500 py-1">{day}</div>
            ))}
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "py-1.5 rounded-full",
                  i + 1 === 15 ? "bg-blue-600 text-white font-bold" : 
                  i + 1 === 20 ? "bg-blue-100 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-200 cursor-pointer"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Filters</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                Audits
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                Workshops
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                Reviews
              </label>
            </div>
          </div>
        </div>

        {/* Right Content - Visit List */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setView('Upcoming')}
                className={cn("text-sm font-medium pb-4 -mb-4 px-2 border-b-2 transition-colors", view === 'Upcoming' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900")}
              >
                Upcoming Visits
              </button>
              <button 
                onClick={() => setView('Past')}
                className={cn("text-sm font-medium pb-4 -mb-4 px-2 border-b-2 transition-colors", view === 'Past' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900")}
              >
                Past Visits
              </button>
            </div>
            
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setDisplayMode('list')}
                className={cn(
                  "p-1.5 rounded-md flex items-center justify-center transition-colors",
                  displayMode === 'list' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDisplayMode('map')}
                className={cn(
                  "p-1.5 rounded-md flex items-center justify-center transition-colors",
                  displayMode === 'map' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {displayMode === 'list' ? (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                    <span className="text-xs font-semibold text-slate-500 uppercase">{new Date(visit.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-xl font-bold text-slate-900">{new Date(visit.date).getDate()}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{visit.title}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600">
                        {visit.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 font-medium text-slate-700 text-sm mb-3">
                      <Users className="w-4 h-4 text-slate-400" />
                      {visit.company}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {visit.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {visit.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        {visit.attendees.length} Attendees
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center sm:items-start shrink-0">
                    <button 
                      onClick={() => handleDetailsClick(visit)}
                      className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}
              {visits.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No visits found for this view.
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-200 relative z-0">
              <MapContainer 
                center={[48.1351, 11.5820]} 
                zoom={4} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {visits.map((visit) => (
                  <Marker key={visit.id} position={visit.coordinates}>
                    <Popup>
                      <div className="p-1">
                        <h3 className="font-semibold text-sm mb-1">{visit.title}</h3>
                        <p className="text-xs font-medium text-slate-700 mb-2">{visit.company}</p>
                        <div className="text-xs text-slate-500 space-y-1">
                          <p className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {visit.date}</p>
                          <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {visit.location}</p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Visit Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Schedule Visit</h2>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleScheduleVisit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visit Title</label>
                <input 
                  required
                  type="text" 
                  value={newVisit.title}
                  onChange={e => setNewVisit({...newVisit, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Q1 Business Review"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input 
                  required
                  type="text" 
                  value={newVisit.company}
                  onChange={e => setNewVisit({...newVisit, company: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  required
                  type="text" 
                  value={newVisit.location}
                  onChange={e => setNewVisit({...newVisit, location: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. London, UK"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input 
                    required
                    type="date" 
                    value={newVisit.date}
                    onChange={e => setNewVisit({...newVisit, date: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input 
                    required
                    type="text" 
                    value={newVisit.time}
                    onChange={e => setNewVisit({...newVisit, time: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 10:00 - 12:00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  value={newVisit.type}
                  onChange={e => setNewVisit({...newVisit, type: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Meeting">Meeting</option>
                  <option value="Audit">Audit</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Review">Review</option>
                  <option value="Tour">Tour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attendees (comma separated)</label>
                <input 
                  required
                  type="text" 
                  value={newVisit.attendees}
                  onChange={e => setNewVisit({...newVisit, attendees: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. John Doe, Jane Smith"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Meeting Minutes Modal */}
      {isMinutesModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Add Meeting Minutes</h2>
              <button 
                onClick={() => {
                  setIsMinutesModalOpen(false);
                  setSelectedVisit(null);
                  setMinutesContent('');
                  setMinutesFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddMinutes} className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedVisit.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {selectedVisit.company}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    {selectedVisit.date}
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {selectedVisit.attendees.join(', ')}
                  </div>
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
                    setIsMinutesModalOpen(false);
                    setSelectedVisit(null);
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
    </div>
  );
}
