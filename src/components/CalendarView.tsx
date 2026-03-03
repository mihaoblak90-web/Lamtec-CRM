import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Upload,
  Download,
  ExternalLink,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppStore } from '../lib/store';

type Visit = {
  id: number;
  title: string;
  company: string;
  location: string;
  date: string;
  time: string;
  attendees: string[];
  type: string;
  coordinates: [number, number];
};

const STORAGE_KEY = 'lamtec-visits-calendar-v1';
const currentYear = new Date().getFullYear();

const initialVisits: Visit[] = [
  { id: 1, title: 'Annual Supplier Audit', company: 'Volvo Cars', location: 'Torslanda, Sweden', date: `${currentYear}-11-15`, time: '09:00 - 16:00', attendees: ['Michael Bader', 'Jane Doe'], type: 'Audit', coordinates: [57.721, 11.778] },
  { id: 2, title: 'Technical Workshop', company: 'Bosch', location: 'Stuttgart, Germany', date: `${currentYear}-11-20`, time: '10:00 - 14:00', attendees: ['Maria Garcia', 'Mike Ross'], type: 'Workshop', coordinates: [48.7758, 9.1829] },
  { id: 3, title: 'Q4 Business Review', company: 'Siemens AG', location: 'Munich, Germany', date: `${currentYear - 1}-12-05`, time: '13:00 - 15:00', attendees: ['Klaus Müller', 'Jane Doe'], type: 'Review', coordinates: [48.1351, 11.582] },
  { id: 4, title: 'Prototype Handover', company: 'Valeo', location: 'Paris, France', date: `${currentYear - 1}-10-02`, time: '11:00 - 12:30', attendees: ['Sophie Martin', 'Jane Doe'], type: 'Meeting', coordinates: [48.8566, 2.3522] },
  { id: 5, title: 'Initial Plant Tour', company: 'Denso', location: 'Hidria HQ, Slovenia', date: `${currentYear - 1}-09-28`, time: '09:00 - 15:00', attendees: ['Taro Tanaka', 'Mike Ross'], type: 'Tour', coordinates: [46.0289, 14.0222] },
];

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const formatIcsDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const parseVisitDateTime = (visit: Visit) => {
  const [startRaw, endRaw] = visit.time.split('-').map((part) => part.trim());
  const start = new Date(`${visit.date}T${(startRaw || '09:00').slice(0, 5)}:00`);
  const end = new Date(`${visit.date}T${(endRaw || '10:00').slice(0, 5)}:00`);

  if (Number.isNaN(start.getTime())) {
    const fallback = new Date(`${visit.date}T09:00:00`);
    return { start: fallback, end: new Date(fallback.getTime() + 60 * 60 * 1000) };
  }

  if (Number.isNaN(end.getTime()) || end <= start) {
    return { start, end: new Date(start.getTime() + 60 * 60 * 1000) };
  }

  return { start, end };
};

const buildOutlookLink = (visit: Visit) => {
  const { start, end } = parseVisitDateTime(visit);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `${visit.title} (${visit.company})`,
    location: visit.location,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: `Visit type: ${visit.type}\nAttendees: ${visit.attendees.join(', ')}`,
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
};

const buildIcsFile = (visits: Visit[]) => {
  const eventBlocks = visits
    .map((visit) => {
      const { start, end } = parseVisitDateTime(visit);
      return [
        'BEGIN:VEVENT',
        `UID:${visit.id}@lamtec-crm`,
        `DTSTAMP:${formatIcsDate(new Date())}`,
        `DTSTART:${formatIcsDate(start)}`,
        `DTEND:${formatIcsDate(end)}`,
        `SUMMARY:${visit.title} (${visit.company})`,
        `LOCATION:${visit.location}`,
        `DESCRIPTION:Type: ${visit.type}\\nAttendees: ${visit.attendees.join(', ')}`,
        'END:VEVENT',
      ].join('\r\n');
    })
    .join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lamtec CRM//Visits Calendar//EN', eventBlocks, 'END:VCALENDAR'].join('\r\n');
};

const isPastVisit = (visitDate: string) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(`${visitDate}T00:00:00`).getTime() < startOfToday.getTime();
};

const downloadIcs = (fileName: string, visits: Visit[]) => {
  if (!visits.length) return;
  const ics = buildIcsFile(visits);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export function CalendarView() {
  const [view, setView] = useState<'Upcoming' | 'Past'>('Upcoming');
  const [displayMode, setDisplayMode] = useState<'list' | 'map'>('list');
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const [allVisits, setAllVisits] = useState<Visit[]>(initialVisits);
  const [activeTypes, setActiveTypes] = useState<Record<string, boolean>>({
    Audit: true,
    Workshop: true,
    Review: true,
    Meeting: true,
    Tour: true,
  });

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newVisit, setNewVisit] = useState({
    title: '',
    company: '',
    location: '',
    date: '',
    time: '',
    type: 'Meeting',
    attendees: '',
  });

  useEffect(() => {
    const storedVisits = localStorage.getItem(STORAGE_KEY);
    if (storedVisits) {
      try {
        const parsed = JSON.parse(storedVisits) as Visit[];
        if (Array.isArray(parsed) && parsed.length) {
          setAllVisits(parsed);
        }
      } catch {
        setAllVisits(initialVisits);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allVisits));
  }, [allVisits]);

  const upcomingVisits = useMemo(
    () => allVisits.filter((visit) => !isPastVisit(visit.date)).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [allVisits],
  );

  const pastVisits = useMemo(
    () => allVisits.filter((visit) => isPastVisit(visit.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [allVisits],
  );

  const visits = useMemo(() => {
    const source = view === 'Upcoming' ? upcomingVisits : pastVisits;
    return source.filter((visit) => {
      const datePass = selectedDate ? new Date(visit.date).getDate() === selectedDate : true;
      const typePass = activeTypes[visit.type] ?? true;
      return datePass && typePass;
    });
  }, [view, upcomingVisits, pastVisits, selectedDate, activeTypes]);

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();

    let coordinates: [number, number] = [48.1351, 11.582];
    const locLower = newVisit.location.toLowerCase();
    if (locLower.includes('paris')) coordinates = [48.8566, 2.3522];
    else if (locLower.includes('london')) coordinates = [51.5074, -0.1278];
    else if (locLower.includes('berlin')) coordinates = [52.52, 13.405];
    else if (locLower.includes('rome')) coordinates = [41.9028, 12.4964];
    else if (locLower.includes('madrid')) coordinates = [40.4168, -3.7038];
    else if (locLower.includes('ljubljana') || locLower.includes('slovenia')) coordinates = [46.0569, 14.5058];

    const visitToAdd: Visit = {
      id: Date.now(),
      title: newVisit.title,
      company: newVisit.company,
      location: newVisit.location,
      date: newVisit.date,
      time: newVisit.time,
      type: newVisit.type,
      attendees: newVisit.attendees.split(',').map((a) => a.trim()).filter(Boolean),
      coordinates,
    };

    setAllVisits((prev) => [...prev, visitToAdd]);
    setIsScheduleModalOpen(false);
    setNewVisit({ title: '', company: '', location: '', date: '', time: '', type: 'Meeting', attendees: '' });
  };

  const addMeetingMinute = useAppStore((state) => state.addMeetingMinute);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
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
      fileSize: minutesType === 'file' && minutesFile ? `${(minutesFile.size / 1024 / 1024).toFixed(2)} MB` : undefined,
    });

    setIsMinutesModalOpen(false);
    setSelectedVisit(null);
    setMinutesContent('');
    setMinutesFile(null);
  };

  const handleDetailsClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setIsMinutesModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visits Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Schedule and manage customer visits, then sync them with Outlook.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => downloadIcs('lamtec-upcoming-visits.ics', upcomingVisits)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Download className="w-4 h-4" /> Export Upcoming (.ics)
          </button>
          <button onClick={() => setIsScheduleModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Schedule Visit
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row overflow-hidden min-h-[700px]">
        <div className="w-full lg:w-80 border-r border-slate-200 p-6 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{new Date().toLocaleString('default', { month: 'long' })}</h2>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs mb-8">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
              <div key={day} className="font-medium text-slate-500 py-1">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedDate((prev) => (prev === i + 1 ? null : i + 1))}
                className={cn(
                  'py-1.5 rounded-full transition-colors',
                  selectedDate === i + 1 ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-200',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Filters</h3>
            <div className="flex flex-col gap-2">
              {Object.keys(activeTypes).map((type) => (
                <label key={type} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    checked={activeTypes[type]}
                    onChange={(e) => setActiveTypes((prev) => ({ ...prev, [type]: e.target.checked }))}
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setView('Upcoming')} className={cn('text-sm font-medium pb-4 -mb-4 px-2 border-b-2 transition-colors', view === 'Upcoming' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900')}>Upcoming Visits</button>
              <button onClick={() => setView('Past')} className={cn('text-sm font-medium pb-4 -mb-4 px-2 border-b-2 transition-colors', view === 'Past' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900')}>Past Visits</button>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setDisplayMode('list')} className={cn('p-1.5 rounded-md flex items-center justify-center transition-colors', displayMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')} title="List View"><List className="w-4 h-4" /></button>
              <button onClick={() => setDisplayMode('map')} className={cn('p-1.5 rounded-md flex items-center justify-center transition-colors', displayMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')} title="Map View"><MapIcon className="w-4 h-4" /></button>
            </div>
          </div>

          {displayMode === 'list' ? (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div key={visit.id} className="flex flex-col gap-4 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all bg-white group">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{new Date(visit.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold text-slate-900">{new Date(visit.date).getDate()}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{visit.title}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-600">{visit.type}</span>
                      </div>

                      <div className="flex items-center gap-1.5 font-medium text-slate-700 text-sm mb-3">
                        <Users className="w-4 h-4 text-slate-400" />
                        {visit.company}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" />{visit.time}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" />{visit.location}</div>
                        <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-400" />{visit.attendees.length} Attendees</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <button onClick={() => handleDetailsClick(visit)} className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">Details / Minutes</button>
                    <a href={buildOutlookLink(visit)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" /> Add to Outlook
                    </a>
                    <button onClick={() => downloadIcs(`visit-${visit.id}.ics`, [visit])} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors">
                      <Download className="w-4 h-4" /> ICS
                    </button>
                  </div>
                </div>
              ))}
              {visits.length === 0 && <div className="text-center py-12 text-slate-500">No visits found for this view/filter.</div>}
            </div>
          ) : (
            <div className="flex-1 min-h-[500px] rounded-xl overflow-hidden border border-slate-200 relative z-0">
              <MapContainer center={[48.1351, 11.582]} zoom={4} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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

      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Schedule Visit</h2>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>

            <form onSubmit={handleScheduleVisit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visit Title</label>
                <input required type="text" value={newVisit.title} onChange={(e) => setNewVisit({ ...newVisit, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="e.g. Q1 Business Review" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <input required type="text" value={newVisit.company} onChange={(e) => setNewVisit({ ...newVisit, company: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input required type="text" value={newVisit.location} onChange={(e) => setNewVisit({ ...newVisit, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="e.g. London, UK" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input required type="date" value={newVisit.date} onChange={(e) => setNewVisit({ ...newVisit, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                  <input required type="text" value={newVisit.time} onChange={(e) => setNewVisit({ ...newVisit, time: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="09:00 - 10:00" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visit Type</label>
                <select value={newVisit.type} onChange={(e) => setNewVisit({ ...newVisit, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm">
                  <option>Meeting</option><option>Audit</option><option>Workshop</option><option>Review</option><option>Tour</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Attendees (comma-separated)</label>
                <input required type="text" value={newVisit.attendees} onChange={(e) => setNewVisit({ ...newVisit, attendees: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="John Doe, Jane Smith" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save Visit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isMinutesModalOpen && selectedVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><FileText className="w-5 h-5 text-blue-600" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Add Meeting Minutes</h2>
                  <p className="text-sm text-slate-500">Document the outcomes of this visit</p>
                </div>
              </div>
              <button onClick={() => { setIsMinutesModalOpen(false); setSelectedVisit(null); setMinutesContent(''); setMinutesFile(null); }} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddMinutes} className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{selectedVisit.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{selectedVisit.company}</div>
                  <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400" />{selectedVisit.date}</div>
                  <div className="flex items-center gap-2 col-span-2"><Users className="w-4 h-4 text-slate-400" />{selectedVisit.attendees.join(', ')}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 border-b border-slate-200">
                  <button type="button" onClick={() => setMinutesType('text')} className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors', minutesType === 'text' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700')}>Write Text</button>
                  <button type="button" onClick={() => setMinutesType('file')} className={cn('px-4 py-2 text-sm font-medium border-b-2 transition-colors', minutesType === 'file' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700')}>Upload File</button>
                </div>

                {minutesType === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Meeting Summary & Notes</label>
                    <textarea required value={minutesContent} onChange={(e) => setMinutesContent(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm min-h-[150px]" placeholder="Enter meeting minutes, decisions, and action items..." />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors">
                    <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files && e.target.files[0]) setMinutesFile(e.target.files[0]); }} />
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4"><Upload className="w-6 h-6 text-blue-600" /></div>
                      <p className="text-sm font-medium text-slate-900 mb-1">{minutesFile ? minutesFile.name : 'Click to upload or drag and drop'}</p>
                      <p className="text-xs text-slate-500 mb-4">{minutesFile ? `${(minutesFile.size / 1024 / 1024).toFixed(2)} MB` : 'PDF, DOCX, or TXT (max. 10MB)'}</p>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Select File</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => { setIsMinutesModalOpen(false); setSelectedVisit(null); setMinutesContent(''); setMinutesFile(null); }} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={minutesType === 'text' ? !minutesContent : !minutesFile} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">Save Minutes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
